import { useCallback, useEffect, useRef, useState } from 'react'
import { percorsi, attivita } from '../dati'
import type { Coordinate } from '../dominio/coordinate'
import { rimuovi, sostituisci } from '../dominio/elenco'
import { daCalcolare, mancanti } from '../dominio/percorsi'
import type { CampiAttivita, Attivita, DatiCompletamento } from '../dominio/tipi'

export type StatoElenco =
  | { fase: 'caricamento' }
  | { fase: 'errore'; messaggio: string }
  | { fase: 'pronto'; attivita: Attivita[] }

/** Trekking e avventure, letti all'apertura e ogni volta che l'app torna in primo piano. */
export function useAttivita() {
  const [stato, setStato] = useState<StatoElenco>({ fase: 'caricamento' })
  /** Le attività a cui il ricalcolo ha tolto il luogo, da segnalare. */
  const [luoghiTolti, setLuoghiTolti] = useState<string[]>([])
  /** L'ultimo elenco, per il ricalcolo che gira in sottofondo. */
  const ultimo = useRef<Attivita[]>([])
  const ricalcolo = useRef<{ inCorso: boolean; ancora: Coordinate | null }>({ inCorso: false, ancora: null })

  useEffect(() => {
    if (stato.fase === 'pronto') ultimo.current = stato.attivita
  }, [stato])

  const ricarica = useCallback(async () => {
    setStato((prima) => (prima.fase === 'pronto' ? prima : { fase: 'caricamento' }))
    try {
      setStato({ fase: 'pronto', attivita: await attivita().elenco() })
    } catch (errore) {
      setStato({ fase: 'errore', messaggio: (errore as Error).message })
    }
  }, [])

  useEffect(() => {
    void ricarica()
    const visibile = () => {
      if (document.visibilityState === 'visible') void ricarica()
    }
    document.addEventListener('visibilitychange', visibile)
    return () => document.removeEventListener('visibilitychange', visibile)
  }, [ricarica])

  /** Crea l'attività; se non riesce lancia l'errore, e il modale lo mostra. */
  const crea = useCallback(async (campi: CampiAttivita) => {
    const creato = await attivita().crea(campi)
    setStato((prima) => (prima.fase === 'pronto' ? { ...prima, attivita: [creato, ...prima.attivita] } : prima))
    ultimo.current = [creato, ...ultimo.current]
    return creato
  }, [])

  /** Salva le modifiche; se non riesce lancia l'errore, e il modale lo mostra. */
  const aggiorna = useCallback(async (id: string, campi: CampiAttivita) => {
    const cambiato = await attivita().aggiorna(id, campi)
    setStato((prima) => (prima.fase === 'pronto' ? { ...prima, attivita: sostituisci(prima.attivita, cambiato) } : prima))
    ultimo.current = sostituisci(ultimo.current, cambiato)
    return cambiato
  }, [])

  /** Segna (con i dati del giro) o toglie (`null`) il completato: sparisce dall'elenco se non si mostrano i completati. */
  const segnaCompletato = useCallback(async (id: string, dati: DatiCompletamento | null) => {
    const cambiato = await attivita().segnaCompletato(id, dati)
    setStato((prima) => (prima.fase === 'pronto' ? { ...prima, attivita: sostituisci(prima.attivita, cambiato) } : prima))
    return cambiato
  }, [])

  /** Elimina; la conferma è già stata data dall'interfaccia. */
  const elimina = useCallback(async (id: string) => {
    await attivita().elimina(id)
    setStato((prima) => (prima.fase === 'pronto' ? { ...prima, attivita: rimuovi(prima.attivita, id) } : prima))
  }, [])

  /**
   * Calcola i tempi di viaggio mancanti (docs/02-funzionalita.md, step 15 e 16),
   * uno alla volta per stare nella quota di openrouteservice. Se il servizio non
   * risponde si ferma: i mancanti si riprovano al prossimo salvataggio o alla
   * prossima apertura. Se parte mentre ne gira già uno, riparte alla fine, così
   * prende anche l'attività appena salvata.
   */
  const calcolaViaggi = useCallback(async (casa: Coordinate) => {
    const servizio = percorsi()
    if (!servizio) return
    if (ricalcolo.current.inCorso) {
      ricalcolo.current.ancora = casa
      return
    }
    ricalcolo.current.inCorso = true
    try {
      let partenza: Coordinate | null = casa
      while (partenza) {
        const da: Coordinate = partenza
        ricalcolo.current.ancora = null
        for (const t of mancanti(ultimo.current)) {
          const corrente = ultimo.current.find((u) => u.id === t.id)
          if (!corrente || !daCalcolare(corrente)) continue
          const esito = await servizio.tempo(da, { lat: corrente.lat!, lon: corrente.lon! })
          if (esito.esito === 'irraggiungibile') return
          const cambiato =
            esito.esito === 'minuti'
              ? await attivita().salvaViaggio(corrente.id, esito.minuti)
              : await attivita().togliLuogo(corrente.id)
          if (!cambiato) continue
          setStato((prima) => (prima.fase === 'pronto' ? { ...prima, attivita: sostituisci(prima.attivita, cambiato) } : prima))
          ultimo.current = sostituisci(ultimo.current, cambiato)
          if (esito.esito === 'impossibile') setLuoghiTolti((prima) => [...prima, corrente.nome])
        }
        partenza = ricalcolo.current.ancora
      }
    } catch (errore) {
      console.error('Ricalcolo dei tempi di viaggio interrotto', errore)
    } finally {
      ricalcolo.current = { inCorso: false, ancora: null }
    }
  }, [])

  const chiudiLuoghiTolti = useCallback(() => setLuoghiTolti([]), [])

  return { stato, ricarica, crea, aggiorna, segnaCompletato, elimina, calcolaViaggi, luoghiTolti, chiudiLuoghiTolti }
}
