import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Compass, Menu, Plus, X } from 'lucide-react'
import { percorsi } from '../dati'
import { quantiCompletati, visibili } from '../dominio/elenco'
import { FILTRI_VUOTI, type Filtri as ValoriFiltri, filtra, quantiFiltri } from '../dominio/filtri'
import { ORDINAMENTO_INIZIALE, ordina, tocca, type Ordinamento } from '../dominio/ordinamento'
import { mancanti } from '../dominio/percorsi'
import { cerca } from '../dominio/ricerca'
import type { CampiAttivita, Attivita } from '../dominio/tipi'
import { BarraMappa } from './BarraMappa'
import { Conferma } from './Conferma'
import { ModaleDettagli } from './ModaleDettagli'
import { Elenco } from './Elenco'
import { Installa } from './Installa'
import { BarraElenco } from './Filtri'
import { MenuLaterale } from './MenuLaterale'
import { ModaleAttivita } from './ModaleAttivita'
import { useInterruttore } from './preferenze'
import { useCasa } from './useCasa'
import { indirizzi, useRotta } from './rotta'
import { installa, useInstallazione } from './installazione'
import { useAttivita } from './useAttivita'

// Leaflet pesa: si carica a parte, così l'intestazione compare subito anche
// con la rete del telefono in montagna, e chi apre l'Elenco non lo scarica.
const Mappa = lazy(async () => ({ default: (await import('./Mappa')).Mappa }))

/**
 * Il guscio dell'app, come Grocery e Projects (docs/09-interfaccia.md):
 * intestazione blu montagna da bordo a bordo con ☰ a sinistra e + a destra,
 * menu laterale, contenuto largo al massimo 1200px. Da 1024px il menu è una
 * colonna fissa e ☰ sparisce.
 */
export function App() {
  const rotta = useRotta()
  /** La Mappa è la pagina principale e prende tutto lo spazio sotto l'intestazione. */
  const suMappa = rotta === 'mappa'
  const [menuAperto, setMenuAperto] = useState(false)
  const [nuovoAperto, setNuovoAperto] = useState(false)
  /** Il trekking che si sta modificando, e quello che si sta eliminando. */
  const [daModificare, setDaModificare] = useState<Attivita | null>(null)
  const [daEliminare, setDaEliminare] = useState<Attivita | null>(null)
  /**
   * Il trekking di cui si guardano i dettagli, per id: si rilegge dall'elenco,
   * così dopo una modifica o un completato mostra i dati nuovi. Mentre si
   * modifica resta sotto, e alla chiusura del form ricompare.
   */
  const [inDettaglio, setInDettaglio] = useState<string | null>(null)
  const [erroreEliminazione, setErroreEliminazione] = useState<string | null>(null)
  /** L'errore di un tocco sul completato: l'elenco resta com'era. */
  const [erroreCompletato, setErroreCompletato] = useState<string | null>(null)
  const [mostraCompletati, setMostraCompletati] = useInterruttore('completati', false)
  const [ricerca, setRicerca] = useState('')
  const [ordinamento, setOrdinamento] = useState<Ordinamento>(ORDINAMENTO_INIZIALE)
  const [filtri, setFiltri] = useState<ValoriFiltri>(FILTRI_VUOTI)
  const chiudiMenu = useCallback(() => setMenuAperto(false), [])
  const { stato, ricarica, crea, aggiorna, segnaCompletato, elimina, calcolaViaggi, luoghiTolti, chiudiLuoghiTolti } =
    useAttivita()
  const casa = useCasa()
  const statoInstallazione = useInstallazione()
  /** Quanti tempi di viaggio mancano all'apertura: se più di zero compare il popup. */
  const [daRicalcolare, setDaRicalcolare] = useState(0)
  const ricalcoloChiesto = useRef(false)

  // Il popup "Ricalcola percorsi mancanti" (docs/02-funzionalita.md): una volta
  // per apertura, appena ci sono l'elenco e casa, solo se il calcolo è acceso.
  useEffect(() => {
    if (ricalcoloChiesto.current || stato.fase !== 'pronto' || !casa || !percorsi()) return
    ricalcoloChiesto.current = true
    setDaRicalcolare(mancanti(stato.attivita).length)
  }, [stato, casa])

  /**
   * Dopo ogni salvataggio si calcola il tempo del trekking appena salvato e di
   * quelli che ancora mancano, in sottofondo: il form si chiude subito.
   */
  const conViaggi = (salva: (campi: CampiAttivita) => Promise<Attivita>) => async (campi: CampiAttivita) => {
    const salvato = await salva(campi)
    if (casa) void calcolaViaggi(casa)
    return salvato
  }

  /** Quelli da mostrare, uguali per l'elenco e per la mappa (docs/02-funzionalita.md). */
  const daMostrare = (tutti: readonly Attivita[]) =>
    filtra(cerca(visibili(tutti, mostraCompletati), ricerca), filtri, casa)

  /** Per l'avviso dei doppioni contano tutti, completati compresi. */
  const esistenti = stato.fase === 'pronto' ? stato.attivita : []
  const dettaglio = esistenti.find((t) => t.id === inDettaglio) ?? null

  const apriDettagli = (t: Attivita) => setInDettaglio(t.id)

  const cambiaCompletato = async (t: Attivita) => {
    setErroreCompletato(null)
    try {
      await segnaCompletato(t.id, !t.completato)
    } catch (e) {
      setErroreCompletato((e as Error).message)
    }
  }

  const chiudiEliminazione = () => {
    setDaEliminare(null)
    setErroreEliminazione(null)
  }

  const confermaEliminazione = async () => {
    if (!daEliminare) return
    setErroreEliminazione(null)
    try {
      await elimina(daEliminare.id)
      setDaEliminare(null)
    } catch (e) {
      setErroreEliminazione((e as Error).message)
    }
  }

  return (
    <div
      className={`sfondo-montagna flex flex-col lg:grid ${suMappa ? 'h-dvh' : 'min-h-dvh'} lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]`}
    >
      <header className="sticky top-0 z-1 flex items-center gap-1 border-b border-montagna-scura bg-montagna pt-[env(safe-area-inset-top)] pr-2 pl-1 text-panna lg:col-span-full lg:min-h-11 lg:pl-3">
        <button
          className="grid size-11 place-items-center rounded-[11px] active:bg-montagna-scura lg:hidden"
          type="button"
          aria-label="Apri il menu"
          aria-expanded={menuAperto}
          aria-controls="menu"
          onClick={() => setMenuAperto(true)}
        >
          <Menu className="size-[22px]" aria-hidden="true" />
        </button>
        <Compass className="size-[22px] shrink-0" aria-hidden="true" />
        <h1 className="ml-1 text-lg font-semibold tracking-[0.01em]">Adventures</h1>
        <button
          className="ml-auto flex min-h-9 items-center gap-1.5 rounded-[11px] px-2.5 font-semibold hover:bg-montagna-scura active:bg-montagna-scura"
          type="button"
          aria-label="Nuovo trekking"
          onClick={() => setNuovoAperto(true)}
        >
          <Plus className="size-[22px]" aria-hidden="true" />
          <span className="hidden lg:inline">Nuovo trekking</span>
        </button>
      </header>
      <MenuLaterale
        aperto={menuAperto}
        corrente={rotta}
        onChiudi={chiudiMenu}
        onNuovo={() => {
          setMenuAperto(false)
          setNuovoAperto(true)
        }}
        onInstalla={
          statoInstallazione === 'installata'
            ? undefined
            : () => {
                setMenuAperto(false)
                // Dove il browser ha dato il suo prompt basta un tocco; dove no,
                // si aprono le istruzioni.
                if (statoInstallazione === 'pronta') void installa()
                else window.location.hash = indirizzi.installa
              }
        }
      />
      <main
        className={
          // `isolate`: i livelli di Leaflet (z-index fino a 1000) e la barra
          // flottante restano chiusi qui dentro, sotto il menu e l'intestazione.
          suMappa
            ? 'relative isolate min-h-0 flex-1 lg:col-start-2'
            : 'mx-auto w-full max-w-[1200px] flex-1 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] lg:col-start-2'
        }
      >
        {rotta !== 'installa' && stato.fase === 'caricamento' && <p className="mt-8 text-center text-testo-tenue">Carico…</p>}
        {rotta !== 'installa' && stato.fase === 'errore' && (
          <p className="mt-8 px-3 text-center text-testo-tenue" role="alert">
            {stato.messaggio}{' '}
            <button type="button" className="font-semibold text-montagna-scura underline" onClick={() => void ricarica()}>
              Riprova
            </button>
          </p>
        )}
        {rotta === 'installa' && <Installa stato={statoInstallazione} />}
        {suMappa && stato.fase === 'pronto' && (
          <Suspense fallback={<p className="mt-8 text-center text-testo-tenue">Carico la mappa…</p>}>
            <div className="absolute inset-0">
              <Mappa attivita={daMostrare(stato.attivita)} casa={casa} onDettagli={apriDettagli} />
            </div>
            <BarraMappa
              ricerca={ricerca}
              onRicerca={setRicerca}
              filtri={filtri}
              onFiltri={setFiltri}
              conDistanza={casa !== null}
              mostraCompletati={mostraCompletati}
              quantiCompletati={quantiCompletati(stato.attivita)}
              onMostraCompletati={setMostraCompletati}
            />
          </Suspense>
        )}
        {rotta === 'elenco' && stato.fase === 'pronto' && (
          <>
            <BarraElenco
              ricerca={ricerca}
              onRicerca={setRicerca}
              filtri={filtri}
              onFiltri={setFiltri}
              conDistanza={casa !== null}
              mostraCompletati={mostraCompletati}
              quantiCompletati={quantiCompletati(stato.attivita)}
              onMostraCompletati={setMostraCompletati}
              mostrati={daMostrare(stato.attivita).length}
              totali={stato.attivita.length}
            />
            {erroreCompletato && (
              <p className="mb-2 text-sm text-pericolo" role="alert">
                {erroreCompletato}
              </p>
            )}
            <Elenco
              attivita={ordina(daMostrare(stato.attivita), ordinamento, casa)}
              ordinamento={ordinamento}
              onOrdina={(colonna) => setOrdinamento((prima) => tocca(prima, colonna))}
              ricerca={ricerca}
              conFiltri={quantiFiltri(filtri) > 0}
              casa={casa}
              onNuovo={() => setNuovoAperto(true)}
              onDettagli={apriDettagli}
              nascosti={mostraCompletati ? 0 : quantiCompletati(stato.attivita)}
              onCompletato={(t) => void cambiaCompletato(t)}
              onRinomina={setDaModificare}
              onElimina={(t) => {
                setErroreEliminazione(null)
                setDaEliminare(t)
              }}
            />
          </>
        )}
      </main>
      {nuovoAperto && (
        <ModaleAttivita
          titolo="Nuovo trekking"
          esistenti={esistenti}
          onSalva={conViaggi(crea)}
          onChiudi={() => setNuovoAperto(false)}
        />
      )}
      {dettaglio && !daModificare && !daEliminare && (
        <ModaleDettagli
          attivita={dettaglio}
          casa={casa}
          onModifica={() => setDaModificare(dettaglio)}
          onCompletato={() => segnaCompletato(dettaglio.id, !dettaglio.completato)}
          onChiudi={() => setInDettaglio(null)}
        />
      )}
      {daModificare && (
        <ModaleAttivita
          titolo="Modifica trekking"
          iniziale={{
            nome: daModificare.nome,
            link: daModificare.link,
            note: daModificare.note,
            dislivello: daModificare.dislivello,
            durata_ore: daModificare.durata_ore,
            luogo_nome: daModificare.luogo_nome,
            lat: daModificare.lat,
            lon: daModificare.lon,
            viaggio_minuti: daModificare.viaggio_minuti,
            viaggio_manuale: daModificare.viaggio_manuale,
          }}
          esistenti={esistenti}
          escludi={daModificare.id}
          onSalva={conViaggi((campi) => aggiorna(daModificare.id, campi))}
          onChiudi={() => setDaModificare(null)}
          onElimina={() => {
            setErroreEliminazione(null)
            setDaEliminare(daModificare)
            setDaModificare(null)
          }}
        />
      )}
      {daRicalcolare > 0 && (
        <Conferma
          titolo="Percorsi mancanti"
          conferma="Ricalcola percorsi mancanti"
          onConferma={() => {
            setDaRicalcolare(0)
            if (casa) void calcolaViaggi(casa)
          }}
          onAnnulla={() => setDaRicalcolare(0)}
        >
          <p className="m-0">
            {daRicalcolare === 1
              ? 'A un trekking manca il tempo di viaggio da casa.'
              : `A ${daRicalcolare} trekking manca il tempo di viaggio da casa.`}
          </p>
        </Conferma>
      )}
      {luoghiTolti.length > 0 && (
        <div
          className="fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-10 mx-auto flex max-w-md items-start gap-2 rounded-[11px] bg-montagna-scura p-3 text-sm text-panna shadow-lg"
          role="status"
        >
          <p className="m-0 flex-1">
            Nessun percorso in auto per <strong>{luoghiTolti.join(', ')}</strong>: ho tolto il luogo, si può
            reinserire in modifica.
          </p>
          <button type="button" className="grid size-7 shrink-0 place-items-center rounded-lg" aria-label="Chiudi" onClick={chiudiLuoghiTolti}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
      {daEliminare && (
        <Conferma
          titolo="Elimina trekking"
          conferma="Elimina"
          pericolo
          onConferma={() => void confermaEliminazione()}
          onAnnulla={chiudiEliminazione}
        >
          <p className="m-0">
            Elimino <strong>{daEliminare.nome}</strong>? Non si torna indietro.
          </p>
          {erroreEliminazione && (
            <p className="mt-2 mb-0 text-xs text-pericolo" role="alert">
              {erroreEliminazione}
            </p>
          )}
        </Conferma>
      )}
    </div>
  )
}
