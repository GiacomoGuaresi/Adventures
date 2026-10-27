import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, ChevronsRight, Hand, X } from 'lucide-react'
import { DURATA_SORGE, montagne, passoComparsa, puntoDiVista, type Montagna } from '../../dominio/catena'
import { giorno, km, metri, ore } from '../../dominio/completamento'
import { numeri } from '../../dominio/statistiche'
import type { Attivita } from '../../dominio/tipi'
import { VISTE_CATENA, useNuovi } from '../visti'
import { Catena, centroCima, type Misure } from './Catena'

interface Props {
  attivita: readonly Attivita[]
  onDettagli: (a: Attivita) => void
}

/** Sopra la cima più alta: il riquadro coi totali e la bandierina. */
const CIELO = 118
/** Il prato sotto, con gli anni. */
const TERRA = 44

/** Le misure del riquadro della pagina, che cambiano girando il telefono. */
function useMisure() {
  const riquadro = useRef<HTMLDivElement>(null)
  const [misure, setMisure] = useState<{ larga: number; alta: number } | null>(null)
  useLayoutEffect(() => {
    const r = riquadro.current
    if (!r) return
    // Solo se cambiano davvero: una misura uguale non deve ridisegnare la scena né fermare l'inquadratura.
    const misura = () =>
      setMisure((prima) =>
        prima && prima.larga === r.clientWidth && prima.alta === r.clientHeight ? prima : { larga: r.clientWidth, alta: r.clientHeight },
      )
    misura()
    const osserva = new ResizeObserver(misura)
    osserva.observe(r)
    return () => osserva.disconnect()
  }, [])
  return { riquadro, misure }
}

/**
 * La pagina della catena (docs/09-interfaccia.md, "Catena"), pensata per il
 * telefono: la scena prende tutto lo schermo sotto l'intestazione e scorre in
 * orizzontale partendo dall'ultima cima. Le cime nuove sorgono una dopo
 * l'altra in ordine di giro e l'inquadratura le segue fino alla fine; un tocco
 * o uno scorrimento la ferma. Sopra galleggiano i totali; un tocco
 * su una cima la porta al centro e apre sotto la sua scheda, da cui si va ai
 * dettagli.
 */
export function PaginaCatena({ attivita, onDettagli }: Props) {
  const fila = useMemo(() => montagne(attivita), [attivita])
  const nuove = useNuovi(VISTE_CATENA, fila.map((m) => m.id))
  const [scelta, setScelta] = useState<Montagna | null>(null)
  const { riquadro, misure } = useMisure()
  const scorre = useRef<HTMLDivElement>(null)
  const [inFondo, setInFondo] = useState(true)
  const totali = numeri(attivita)

  // Stabile fra un render e l'altro: lo scorrimento ridisegna la pagina, e l'inquadratura automatica non deve ripartire.
  const scena = useMemo<Misure | null>(
    () => misure && { altezza: misure.alta, larghezzaMinima: misure.larga, cielo: CIELO, terra: TERRA },
    [misure],
  )

  // Le cime nuove, in ordine di giro, e ogni quanto ne sorge una.
  const daSorgere = useMemo(() => fila.filter((m) => nuove.has(m.id)), [fila, nuove])
  const passo = passoComparsa(daSorgere.length)
  const inquadrata = useRef(false)

  // La prima volta che la scena ha le misure: se ci sono cime nuove si parte
  // dalla prima e l'inquadratura le segue mentre sorgono, poi va in fondo;
  // altrimenti si parte dalla fine, dall'ultima cima.
  useEffect(() => {
    const s = scorre.current
    if (!s || !scena || inquadrata.current) return
    inquadrata.current = true
    const fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (daSorgere.length === 0 || fermo) {
      s.scrollLeft = s.scrollWidth
      return
    }
    const centri = daSorgere.map((m) => centroCima(m, fila, scena))
    const guarda = (centro: number) => (s.scrollLeft = centro - s.clientWidth / 2)
    guarda(centri[0])
    const fine = (centri.length - 1) * passo + DURATA_SORGE
    const inizio = performance.now()
    let giro = 0
    let fermato = false
    const ferma = () => {
      fermato = true
      cancelAnimationFrame(giro)
    }
    const passa = (adesso: number) => {
      if (fermato) return
      const t = adesso - inizio
      if (t >= fine) {
        s.scrollTo({ left: s.scrollWidth, behavior: 'smooth' })
        return
      }
      guarda(puntoDiVista(centri, passo, t))
      giro = requestAnimationFrame(passa)
    }
    giro = requestAnimationFrame(passa)
    // Chi tocca o scorre prende il comando.
    const eventi = ['pointerdown', 'wheel', 'touchstart'] as const
    for (const e of eventi) s.addEventListener(e, ferma, { passive: true })
    return () => {
      ferma()
      for (const e of eventi) s.removeEventListener(e, ferma)
    }
  }, [scena, daSorgere, fila, passo])

  const guardaFine = () => {
    const s = scorre.current
    if (s) setInFondo(s.scrollLeft + s.clientWidth >= s.scrollWidth - 40)
  }

  const scegli = (m: Montagna) => {
    if (scelta?.id === m.id) {
      setScelta(null)
      return
    }
    setScelta(m)
    const s = scorre.current
    if (s && scena) s.scrollTo({ left: centroCima(m, fila, scena) - s.clientWidth / 2, behavior: 'smooth' })
  }

  const giro = scelta ? attivita.find((a) => a.id === scelta.id) : undefined
  const chip = 'rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-testo tabular-nums'

  return (
    <div ref={riquadro} className="absolute inset-0 overflow-hidden bg-[#b9d3ea]">
      <div ref={scorre} onScroll={guardaFine} className="absolute inset-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none]">
        {scena && <Catena montagne={fila} nuove={nuove} passo={passo} scelta={scelta?.id ?? null} onScegli={scegli} misure={scena} />}
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center">
        <div className="pointer-events-auto w-full max-w-md rounded-[14px] border border-white/60 bg-white/75 px-4 py-2.5 shadow-[0_4px_16px_rgb(37_50_62/0.12)] backdrop-blur-md">
          <h2 className="text-base leading-tight font-semibold">La tua catena</h2>
          {fila.length === 0 ? (
            <p className="m-0 mt-0.5 text-sm text-testo-tenue">Ancora piatta: completa un trekking e qui nasce la prima cima.</p>
          ) : (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              <li className={chip}>
                {fila.length} {fila.length === 1 ? 'cima' : 'cime'}
              </li>
              <li className={chip}>{metri(totali.dislivello)} D+</li>
              {totali.km > 0 && <li className={chip}>{km(totali.km)}</li>}
              {totali.recordQuota && <li className={chip}>vetta più alta {metri(totali.recordQuota.valore)}</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] flex flex-col items-center gap-2">
        {!inFondo && (
          <button
            type="button"
            className="pointer-events-auto flex min-h-10 items-center gap-1 self-end rounded-full bg-white/85 px-3.5 text-sm font-semibold text-montagna-scura shadow-md backdrop-blur-md"
            onClick={() => scorre.current?.scrollTo({ left: scorre.current.scrollWidth, behavior: 'smooth' })}
          >
            Ultima cima
            <ChevronsRight className="size-4" aria-hidden="true" />
          </button>
        )}
        {giro && scelta ? (
          <div className="animate-entra pointer-events-auto flex w-full max-w-md items-center gap-1 rounded-[14px] border border-white/60 bg-white/90 py-1 pr-1 pl-4 shadow-[0_6px_20px_rgb(37_50_62/0.18)] backdrop-blur-md">
            <button type="button" onClick={() => onDettagli(giro)} className="flex min-h-14 min-w-0 flex-1 items-center gap-2 text-left">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{giro.nome}</span>
                <span className="text-xs text-testo-tenue">
                  {giro.completato_il ? `${giorno(giro.completato_il)} · ${scelta.stagione}` : 'Prima di Adventures'}
                </span>
                <span className="text-sm font-semibold text-montagna-scura tabular-nums">
                  {[
                    scelta.dislivello !== null ? `${metri(scelta.dislivello)} D+` : null,
                    giro.fatto_km !== null ? km(giro.fatto_km) : null,
                    giro.fatto_quota_max !== null ? `vetta ${metri(giro.fatto_quota_max)}` : null,
                    giro.fatto_durata_minuti !== null ? ore(giro.fatto_durata_minuti) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Senza numeri'}
                </span>
              </div>
              <ChevronRight className="size-5 shrink-0 text-testo-tenue" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Chiudi" className="grid size-10 shrink-0 place-items-center rounded-[11px] text-testo-tenue" onClick={() => setScelta(null)}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          fila.length > 0 && (
            <p className="m-0 flex items-center gap-1.5 rounded-full bg-montagna-scura/70 px-3 py-1 text-xs font-semibold text-panna backdrop-blur-sm">
              <Hand className="size-3.5" aria-hidden="true" />
              Tocca una cima · scorri per tornare indietro
            </p>
          )
        )}
      </div>
    </div>
  )
}
