import { SlidersHorizontal, X } from 'lucide-react'
import { useId, useState } from 'react'
import {
  CHIAVI_FILTRI,
  FILTRI_VUOTI,
  NOMI_FILTRI,
  SCORCIATOIE,
  type ChiaveFiltro,
  type Filtri as Valori,
  type Intervallo as ValoreIntervallo,
  acceso,
  limite,
  personalizzato,
  quantiFiltri,
  stessoIntervallo,
  testoIntervallo,
  testoLimite,
} from '../dominio/filtri'
import { NOMI_STAGIONI, STAGIONI, stagioneCorrente, type Stagione } from '../dominio/stagioni'
import { CampoTempoMinuti } from './CampoTempo'
import { MostraCompletati } from './MostraCompletati'
import { Ricerca } from './Ricerca'

interface PropsBarra {
  ricerca: string
  onRicerca: (testo: string) => void
  filtri: Valori
  onFiltri: (valori: Valori) => void
  /** La distanza si filtra solo se la posizione di casa è stata inserita. */
  conDistanza: boolean
  mostraCompletati: boolean
  quantiCompletati: number
  onMostraCompletati: (acceso: boolean) => void
  /** Quanti se ne vedono e quanti sono in tutto, per "12 di 40". */
  mostrati: number
  totali: number
  /** I filtri che hanno senso in questo elenco: gli altri non compaiono. */
  chiavi: readonly ChiaveFiltro[]
  /** Il filtro della stagione, solo dove ci sono avventure. */
  stagione?: FiltroStagione
}

/** La stagione scelta nel filtro: `null` è "Qualsiasi". Parte dalla stagione corrente. */
export interface FiltroStagione {
  valore: Stagione | null
  onCambia: (stagione: Stagione | null) => void
}

/**
 * La barra dell'elenco (docs/02-funzionalita.md), come quella della mappa:
 * ricerca e pulsante Filtri sulla stessa riga. Il pannello si apre sotto; i
 * filtri accesi restano in vista come etichette da togliere con un tocco, con
 * quanti ne passano.
 */
export function BarraElenco({
  ricerca,
  onRicerca,
  filtri,
  onFiltri,
  conDistanza,
  mostraCompletati,
  quantiCompletati,
  onMostraCompletati,
  mostrati,
  totali,
  chiavi,
  stagione,
}: PropsBarra) {
  const [aperto, setAperto] = useState(false)
  const id = useId()
  const completatiAccesi = mostraCompletati && quantiCompletati > 0
  const conStagione = stagione !== undefined && stagione.valore !== null
  const quanti = quantiFiltri(filtri) + (completatiAccesi ? 1 : 0) + (conStagione ? 1 : 0)
  const qualcosa = quanti > 0 || ricerca.trim() !== ''

  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Ricerca testo={ricerca} onCambia={onRicerca} />
        <PulsanteFiltri quanti={quanti} aperto={aperto} pannello={id} onClick={() => setAperto(!aperto)} />
      </div>
      {aperto && (
        <div id={id} className="animate-entra rounded-[14px] border border-bordo bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <MostraCompletati acceso={mostraCompletati} quanti={quantiCompletati} onCambia={onMostraCompletati} />
            <button
              type="button"
              className="ml-auto grid size-11 place-items-center rounded-[11px] text-testo-tenue hover:bg-fondo"
              aria-label="Chiudi i filtri"
              onClick={() => setAperto(false)}
            >
              <X className="size-[18px]" aria-hidden="true" />
            </button>
          </div>
          <PannelloFiltri valori={filtri} onCambia={onFiltri} conDistanza={conDistanza} chiavi={chiavi} stagione={stagione} />
        </div>
      )}
      {qualcosa && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Filtri attivi">
          {CHIAVI_FILTRI.map((chiave) => {
            const testo = testoIntervallo(chiave, filtri[chiave])
            if (testo === null) return null
            return (
              <Etichetta
                key={chiave}
                testo={`${NOMI_FILTRI[chiave]} ${testo}`}
                onTogli={() => onFiltri({ ...filtri, [chiave]: FILTRI_VUOTI[chiave] })}
              />
            )
          })}
          {stagione && stagione.valore !== null && (
            <Etichetta testo={NOMI_STAGIONI[stagione.valore]} onTogli={() => stagione.onCambia(null)} />
          )}
          {completatiAccesi && <Etichetta testo="Con i completati" onTogli={() => onMostraCompletati(false)} />}
          {quantiFiltri(filtri) + (conStagione ? 1 : 0) > 1 && (
            <button
              type="button"
              className="min-h-9 rounded-full px-2 text-sm text-montagna-scura underline"
              onClick={() => {
                onFiltri(FILTRI_VUOTI)
                stagione?.onCambia(null)
              }}
            >
              Azzera
            </button>
          )}
          <span className="ml-auto text-sm text-testo-tenue" role="status">
            {mostrati} di {totali}
          </span>
        </div>
      )}
    </div>
  )
}

/** Un filtro acceso, da togliere con la X. */
function Etichetta({ testo, onTogli }: { testo: string; onTogli: () => void }) {
  return (
    <span className="flex min-h-9 items-center gap-0.5 rounded-full bg-ghiaccio pl-3 text-sm font-semibold text-montagna-scura">
      {testo}
      <button
        type="button"
        className="grid size-9 place-items-center rounded-full hover:bg-white/60"
        aria-label={`Togli il filtro ${testo}`}
        onClick={onTogli}
      >
        <X className="size-[15px]" aria-hidden="true" />
      </button>
    </span>
  )
}

interface PropsPulsante {
  quanti: number
  aperto: boolean
  /** L'id del pannello che apre. */
  pannello: string
  onClick: () => void
}

/** Il pulsante Filtri, con il numero dei filtri accesi: lo usano l'elenco e la mappa. */
export function PulsanteFiltri({ quanti, aperto, pannello, onClick }: PropsPulsante) {
  return (
    <button
      type="button"
      className={`relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-[11px] px-2.5 font-semibold ${
        aperto || quanti > 0 ? 'bg-ghiaccio text-montagna-scura' : 'text-testo-tenue hover:bg-fondo'
      }`}
      aria-label={quanti > 0 ? `Filtri, ${quanti} attivi` : 'Filtri'}
      aria-expanded={aperto}
      aria-controls={pannello}
      onClick={onClick}
    >
      <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
      <span className="hidden sm:inline">Filtri</span>
      {quanti > 0 && (
        <span className="grid min-w-5 place-items-center rounded-full bg-montagna px-1 text-xs leading-5 text-panna">
          {quanti}
        </span>
      )}
    </button>
  )
}

interface PropsPannello {
  valori: Valori
  onCambia: (valori: Valori) => void
  conDistanza: boolean
  /** I filtri da mostrare; senza, tutti. */
  chiavi?: readonly ChiaveFiltro[]
  /** La stagione, in cima: solo dove ci sono avventure. */
  stagione?: FiltroStagione
}

/**
 * I campi dei filtri, senza il pulsante che li apre: li usano sia l'elenco sia
 * la barra flottante della mappa. Per ogni filtro le scelte rapide; "Altro…"
 * apre i campi per scrivere un intervallo a mano.
 */
export function PannelloFiltri({ valori, onCambia, conDistanza, chiavi = CHIAVI_FILTRI, stagione }: PropsPannello) {
  return (
    <div className="flex flex-col gap-4">
      {stagione && <SceltaStagione {...stagione} />}
      {chiavi.filter((chiave) => chiave !== 'distanza' || conDistanza).map((chiave) => (
        <Filtro
          key={chiave}
          chiave={chiave}
          valore={valori[chiave]}
          onCambia={(intervallo) => onCambia({ ...valori, [chiave]: intervallo })}
        />
      ))}
      <p className="m-0 text-xs text-testo-tenue">
        Chi non ha il dato resta visibile: i filtri nascondono solo chi è fuori dall'intervallo.
      </p>
    </div>
  )
}

const SCELTA =
  'min-h-11 rounded-full border px-3 text-sm font-semibold aria-pressed:border-montagna aria-pressed:bg-montagna aria-pressed:text-panna'

/**
 * La stagione delle avventure (docs/02-funzionalita.md): una sola alla volta,
 * "Qualsiasi" per vederle tutte. Passano anche quelle senza stagioni o con
 * tutte e quattro; i trekking non ne hanno e passano sempre.
 */
function SceltaStagione({ valore, onCambia }: FiltroStagione) {
  const ora = stagioneCorrente()
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-semibold">Stagione</legend>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={`${SCELTA} border-bordo bg-white text-testo hover:bg-fondo`} aria-pressed={valore === null} onClick={() => onCambia(null)}>
          Qualsiasi
        </button>
        {STAGIONI.map((s) => (
          <button
            key={s}
            type="button"
            className={`${SCELTA} border-bordo bg-white text-testo hover:bg-fondo`}
            aria-pressed={valore === s}
            onClick={() => onCambia(valore === s ? null : s)}
          >
            {NOMI_STAGIONI[s]}
            {s === ora && <span className="ml-1 font-normal opacity-75">· ora</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

interface PropsFiltro {
  chiave: ChiaveFiltro
  valore: ValoreIntervallo
  onCambia: (intervallo: ValoreIntervallo) => void
}

/** Un filtro: le scelte rapide (toccare quella accesa la spegne) e i campi da / a. */
function Filtro({ chiave, valore, onCambia }: PropsFiltro) {
  const [aMano, setAMano] = useState(() => personalizzato(chiave, valore))
  const campi = aMano || personalizzato(chiave, valore)

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-sm font-semibold">{NOMI_FILTRI[chiave]}</legend>
      <div className="flex flex-wrap gap-1.5">
        {SCORCIATOIE[chiave].map((scelta) => {
          const scelto = stessoIntervallo(scelta, valore)
          return (
            <button
              key={testoIntervallo(chiave, scelta)}
              type="button"
              className={`${SCELTA} border-bordo bg-white text-testo hover:bg-fondo`}
              aria-pressed={scelto}
              onClick={() => {
                setAMano(false)
                onCambia(scelto ? FILTRI_VUOTI[chiave] : scelta)
              }}
            >
              {testoIntervallo(chiave, scelta)}
            </button>
          )
        })}
        <button
          type="button"
          className={`${SCELTA} border-dashed border-bordo bg-white text-testo-tenue hover:bg-fondo`}
          aria-pressed={campi}
          onClick={() => {
            if (campi && acceso(valore)) onCambia(FILTRI_VUOTI[chiave])
            setAMano(!campi)
          }}
        >
          Altro…
        </button>
      </div>
      {campi && <Intervallo chiave={chiave} valore={valore} onCambia={onCambia} />}
    </fieldset>
  )
}

const UNITA = { dislivello: 'm', distanza: 'km' } as const
const PASSI = { dislivello: 50, distanza: 5 } as const

/** Durata (in ore) e viaggio (in minuti) si scrivono in ore e minuti: qui le conversioni. */
const TEMPI = {
  durata: { inMinuti: (ore: number) => Math.round(ore * 60), daMinuti: (minuti: number) => minuti / 60 },
  viaggio: { inMinuti: (minuti: number) => minuti, daMinuti: (minuti: number) => minuti },
} as const

/** Una coppia da / a, scritta a mano: il campo vuoto vuol dire "nessun limite". */
function Intervallo({ chiave, valore: { min, max }, onCambia }: PropsFiltro) {
  const id = useId()
  const nome = NOMI_FILTRI[chiave]
  if (chiave === 'durata' || chiave === 'viaggio') {
    const { inMinuti, daMinuti } = TEMPI[chiave]
    const limiteTempo = (minuti: number | null) => (minuti === null ? null : daMinuti(minuti))
    return (
      <div className="mt-2 flex animate-entra items-center gap-2">
        <div className="w-36">
          <CampoTempoMinuti
            id={`${id}-min`}
            etichetta={`${nome}, da`}
            minuti={min === null ? null : inMinuti(min)}
            onCambia={(minuti) => onCambia({ min: limiteTempo(minuti), max })}
          />
        </div>
        <span className="text-testo-tenue">–</span>
        <div className="w-36">
          <CampoTempoMinuti
            id={`${id}-max`}
            etichetta={`${nome}, a`}
            minuti={max === null ? null : inMinuti(max)}
            onCambia={(minuti) => onCambia({ min, max: limiteTempo(minuti) })}
          />
        </div>
      </div>
    )
  }
  const campo =
    'min-h-11 w-24 rounded-[11px] border border-bordo bg-white px-3 focus:outline-2 focus:-outline-offset-1 focus:outline-montagna'

  return (
    <div className="mt-2 flex animate-entra items-center gap-2">
      <label className="sr-only" htmlFor={`${id}-min`}>
        {nome}, da
      </label>
      <input
        id={`${id}-min`}
        type="number"
        inputMode="decimal"
        min={0}
        step={PASSI[chiave]}
        className={campo}
        placeholder="da"
        value={testoLimite(min)}
        onChange={(evento) => onCambia({ min: limite(evento.target.value), max })}
      />
      <span className="text-testo-tenue">–</span>
      <label className="sr-only" htmlFor={`${id}-max`}>
        {nome}, a
      </label>
      <input
        id={`${id}-max`}
        type="number"
        inputMode="decimal"
        min={0}
        step={PASSI[chiave]}
        className={campo}
        placeholder="a"
        value={testoLimite(max)}
        onChange={(evento) => onCambia({ min, max: limite(evento.target.value) })}
      />
      <span className="text-sm text-testo-tenue">{UNITA[chiave]}</span>
    </div>
  )
}
