import { useId, useMemo, useState, type FormEvent } from 'react'
import { ChevronLeft, MountainSnow, PartyPopper, Stamp } from 'lucide-react'
import { montagne } from '../dominio/catena'
import {
  dataValida,
  giorno,
  km,
  kmValidi,
  metri,
  oggi,
  ore,
  pulisciKm,
  pulisciQuota,
  quotaValida,
  testoKm,
} from '../dominio/completamento'
import type { Coordinate } from '../dominio/coordinate'
import { completate } from '../dominio/cronologia'
import { dislivelloValido, pulisciDislivello, testoDislivello } from '../dominio/dislivello'
import { confronti } from '../dominio/statistiche'
import { pulisciTempo, testoTempo, tempoValido, type TestoTempo } from '../dominio/tempo'
import { sigillo, timbro } from '../dominio/timbri'
import { sbloccatiDa } from '../dominio/traguardi'
import type { Attivita, DatiCompletamento } from '../dominio/tipi'
import { CAMPO, CampoNumero } from './CampoNumero'
import { CampoTempo } from './CampoTempo'
import { Catena } from './catena/Catena'
import { EditorMarkdown } from './EditorMarkdown'
import { Modale } from './Modale'
import { Timbro } from './passaporto/Timbro'
import { indirizzi } from './rotta'

interface Props {
  attivita: Attivita
  /** Tutte, per la cerimonia: dopo il salvataggio arrivano già con il giro completato. */
  tutte: readonly Attivita[]
  /** Per i traguardi che guardano dove sta il giro rispetto a casa. */
  casa: Coordinate | null
  onSalva: (dati: DatiCompletamento) => Promise<unknown>
  /** Chiuso prima di salvare: si torna da dove si era partiti. */
  onChiudi: () => void
  /** Chiusa la cerimonia: il giro è fatto, i dettagli si chiudono anche loro. */
  onFine: () => void
}

type Fase = 'giro' | 'relazione' | 'cerimonia'

/** Quante cime vicine si vedono nella cerimonia, per lato. */
const VICINE = 3

/**
 * Il completamento (docs/02-funzionalita.md): il giorno del giro e, per i
 * trekking, i numeri presi da Garmin o Komoot, tutti facoltativi; poi, se si
 * vuole, la relazione del percorso fatto davvero. Salvato, parte la cerimonia:
 * la cima nuova che sorge nella catena o il timbro che cade sul passaporto,
 * con i confronti e i traguardi appena sbloccati.
 */
export function ModaleCompletamento({ attivita: a, tutte, casa, onSalva, onChiudi, onFine }: Props) {
  const id = useId()
  const trekking = a.tipo === 'trekking'
  const [fase, setFase] = useState<Fase>('giro')
  const [data, setData] = useState(oggi())
  const [dislivello, setDislivello] = useState(testoDislivello(a.dislivello))
  const [chilometri, setChilometri] = useState(testoKm(null))
  const [quota, setQuota] = useState('')
  const [durata, setDurata] = useState<TestoTempo>(testoTempo(a.durata_ore === null ? null : Math.round(a.durata_ore * 60)))
  const [note, setNote] = useState(a.note ?? '')
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const minuti = pulisciTempo(durata)
  const durataBuona = tempoValido(durata) && minuti !== 0
  const giroValido = dataValida(data) && (!trekking || (dislivelloValido(dislivello) && kmValidi(chilometri) && quotaValida(quota) && durataBuona))

  const salva = async (conNote: boolean) => {
    setInCorso(true)
    setErrore(null)
    try {
      await onSalva({
        completato_il: data,
        fatto_dislivello: trekking ? pulisciDislivello(dislivello) : null,
        fatto_km: trekking ? pulisciKm(chilometri) : null,
        fatto_quota_max: trekking ? pulisciQuota(quota) : null,
        fatto_durata_minuti: trekking ? minuti : null,
        note: conNote ? note.trim() || null : a.note,
      })
      setFase('cerimonia')
    } catch (e) {
      setErrore((e as Error).message)
    } finally {
      setInCorso(false)
    }
  }

  const avanti = (evento: FormEvent) => {
    evento.preventDefault()
    if (giroValido) setFase('relazione')
  }

  if (fase === 'cerimonia') return <Cerimonia attivita={a} tutte={tutte} casa={casa} onChiudi={onFine} />

  const secondario = 'min-h-11 rounded-[11px] px-4 font-semibold text-testo-tenue hover:bg-fondo disabled:opacity-50'
  const primario = 'min-h-11 rounded-[11px] bg-montagna px-4 font-semibold text-panna hover:bg-montagna-scura disabled:opacity-50'

  return (
    <Modale
      titolo={trekking ? `Com'è andato ${a.nome}?` : `Com'è andata ${a.nome}?`}
      onChiudi={onChiudi}
      mobile="schermoIntero"
      piede={
        fase === 'giro' ? (
          <>
            <button type="button" className={secondario} onClick={onChiudi}>
              Annulla
            </button>
            <button type="submit" form={`${id}-giro`} className={primario} disabled={!giroValido}>
              Avanti
            </button>
          </>
        ) : (
          <>
            <button type="button" className={`${secondario} mr-auto flex items-center gap-1 pl-2`} onClick={() => setFase('giro')} disabled={inCorso}>
              <ChevronLeft className="size-[18px]" aria-hidden="true" />
              Indietro
            </button>
            <button type="button" className={secondario} onClick={() => void salva(false)} disabled={inCorso}>
              Salta
            </button>
            <button type="button" className={primario} onClick={() => void salva(true)} disabled={inCorso}>
              {inCorso ? 'Salvo…' : 'Completa'}
            </button>
          </>
        )
      }
    >
      {fase === 'giro' && (
        <form id={`${id}-giro`} className="flex flex-col gap-3" onSubmit={avanti} noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor={`${id}-data`}>
              Quando
            </label>
            <input
              id={`${id}-data`}
              type="date"
              max={oggi()}
              className={`${CAMPO} ${dataValida(data) ? '' : 'border-pericolo'}`}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            {!dataValida(data) && <p className="m-0 text-xs text-pericolo">Serve un giorno, oggi o prima.</p>}
          </div>
          {trekking && (
            <>
              <p className="m-0 text-sm text-testo-tenue">I numeri veri, da Garmin o Komoot. Quelli che non hai si possono lasciare vuoti.</p>
              <div className="grid grid-cols-2 gap-2">
                <CampoNumero
                  id={`${id}-dislivello`}
                  etichetta="Dislivello"
                  unita="m"
                  placeholder="1200"
                  valore={dislivello}
                  onCambia={setDislivello}
                  storto={!dislivelloValido(dislivello)}
                />
                <CampoNumero
                  id={`${id}-km`}
                  etichetta="Lunghezza"
                  unita="km"
                  placeholder="12,5"
                  valore={chilometri}
                  onCambia={setChilometri}
                  storto={!kmValidi(chilometri)}
                  tastiera="decimal"
                />
                <CampoNumero
                  id={`${id}-quota`}
                  etichetta="Quota massima"
                  unita="m"
                  placeholder="2450"
                  valore={quota}
                  onCambia={setQuota}
                  storto={!quotaValida(quota)}
                />
                <CampoTempo id={`${id}-durata`} etichetta="Durata" segnaposto={{ ore: '5', minuti: '40' }} valore={durata} onCambia={setDurata} storto={!durataBuona} />
              </div>
              {!(dislivelloValido(dislivello) && kmValidi(chilometri) && quotaValida(quota) && durataBuona) && (
                <p className="m-0 text-xs text-pericolo">
                  Dislivello e quota sono metri interi (la quota fino a 8.849), i km un numero sopra lo zero.
                </p>
              )}
            </>
          )}
        </form>
      )}
      {fase === 'relazione' && (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm text-testo-tenue">
            Facoltativo: sistema la relazione col percorso fatto davvero, varianti e cose da ricordare. "Salta" lascia le note come sono.
          </p>
          <EditorMarkdown valore={note} onCambia={setNote} etichetta="Relazione" righe={10} />
          {errore && (
            <p className="m-0 text-sm text-pericolo" role="alert">
              {errore}
            </p>
          )}
        </div>
      )}
    </Modale>
  )
}

/** La festa del giro appena completato: si apre a salvataggio riuscito. */
function Cerimonia({
  attivita: a,
  tutte,
  casa,
  onChiudi,
}: {
  attivita: Attivita
  tutte: readonly Attivita[]
  casa: Coordinate | null
  onChiudi: () => void
}) {
  const giro = tutte.find((t) => t.id === a.id) ?? a
  const trekking = giro.tipo === 'trekking'
  const frasi = confronti(tutte, giro.id)
  const nuovi = sbloccatiDa(tutte, giro.id, casa)

  // Le cime vicine a quella nuova, in ordine di giro: si rifà la fila solo con loro.
  const vicine = useMemo(() => {
    const fila = completate(tutte, 'trekking')
    const dove = fila.findIndex((t) => t.id === giro.id)
    return montagne(fila.slice(Math.max(0, dove - VICINE), dove + VICINE + 1))
  }, [tutte, giro.id])

  const numeri = trekking
    ? [
        giro.fatto_dislivello !== null ? `${metri(giro.fatto_dislivello)} D+` : null,
        giro.fatto_km !== null ? km(giro.fatto_km) : null,
        giro.fatto_quota_max !== null ? `vetta a ${metri(giro.fatto_quota_max)}` : null,
        giro.fatto_durata_minuti !== null ? ore(giro.fatto_durata_minuti) : null,
      ].filter((n): n is string => n !== null)
    : []

  const vai = (dove: string) => {
    onChiudi()
    window.location.hash = dove
  }

  return (
    <Modale
      titolo={trekking ? 'Cima conquistata' : 'Nuovo timbro'}
      onChiudi={onChiudi}
      mobile="foglio"
      piede={
        <>
          <button type="button" className="min-h-11 rounded-[11px] px-4 font-semibold text-testo-tenue hover:bg-fondo" onClick={onChiudi}>
            Chiudi
          </button>
          <button
            type="button"
            autoFocus
            className="flex min-h-11 items-center gap-1.5 rounded-[11px] bg-montagna px-4 font-semibold text-panna hover:bg-montagna-scura"
            onClick={() => vai(trekking ? indirizzi.catena : indirizzi.passaporto)}
          >
            {trekking ? <MountainSnow className="size-[18px]" aria-hidden="true" /> : <Stamp className="size-[18px]" aria-hidden="true" />}
            {trekking ? 'Vedi la catena' : 'Vedi il passaporto'}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {trekking ? (
          <div className="w-full overflow-hidden rounded-[11px] border border-bordo">
            <Catena montagne={vicine} nuove={new Set([giro.id])} scelta={giro.id} ridotta />
          </div>
        ) : (
          <div className="grid w-full place-items-center rounded-[11px] border border-bordo bg-panna py-4">
            <Timbro timbro={timbro(giro)} cade attesa={150} className="size-40" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <h3 className="flex items-center justify-center gap-1.5 text-lg font-semibold">
            <PartyPopper className="size-5 text-sole-scuro" aria-hidden="true" />
            {giro.nome}
          </h3>
          {giro.completato_il && <p className="m-0 text-sm text-testo-tenue">{giorno(giro.completato_il)}</p>}
        </div>
        {numeri.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-1.5">
            {numeri.map((n) => (
              <li key={n} className="rounded-full bg-ghiaccio px-2.5 py-1 text-sm font-semibold text-montagna-scura">
                {n}
              </li>
            ))}
          </ul>
        )}
        {frasi.length > 0 && (
          <ul className="flex flex-col gap-1">
            {frasi.map((f, i) => (
              <li key={f} className="animate-entra" style={{ animationDelay: `${900 + i * 250}ms`, animationFillMode: 'both' }}>
                {f}
              </li>
            ))}
          </ul>
        )}
        {nuovi.length > 0 && (
          <div className="flex w-full flex-col gap-1">
            <h4 className="text-center text-sm font-semibold tracking-[0.06em] text-sole-scuro uppercase">
              {nuovi.length === 1 ? 'Traguardo sbloccato' : 'Traguardi sbloccati'}
            </h4>
            {/* I traguardi nuovi cadono sul passaporto come sigilli d'oro, dopo la cima o il timbro del giro. */}
            <ul className="flex flex-wrap justify-center gap-1">
              {nuovi.map((s, i) => (
                <li key={s.traguardo.id} className="flex w-28 flex-col items-center gap-0.5">
                  <Timbro timbro={sigillo({ ...s, da: giro })} cade attesa={1400 + i * 350} className="size-24" />
                  <span className="text-xs text-testo-tenue">{s.traguardo.descrizione}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modale>
  )
}
