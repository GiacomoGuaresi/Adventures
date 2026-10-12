import { X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { FILTRI_VUOTI, type ChiaveFiltro, type Filtri as Valori, quantiFiltri } from '../dominio/filtri'
import { TESTI, TIPI } from '../dominio/tipo'
import type { Tipo } from '../dominio/tipi'
import { PannelloFiltri, PulsanteFiltri } from './Filtri'
import { MostraCompletati } from './MostraCompletati'
import { Ricerca } from './Ricerca'

interface Props {
  ricerca: string
  onRicerca: (testo: string) => void
  filtri: Valori
  onFiltri: (valori: Valori) => void
  /** La distanza si filtra solo se la posizione di casa è stata inserita. */
  conDistanza: boolean
  mostraCompletati: boolean
  quantiCompletati: number
  onMostraCompletati: (acceso: boolean) => void
  /** Quali puntini si vedono: tutti, solo i trekking o solo le avventure. */
  tipo: Tipo | null
  onTipo: (tipo: Tipo | null) => void
  /** I filtri che hanno senso per il tipo scelto. */
  chiavi: readonly ChiaveFiltro[]
}

const SCELTA_TIPO =
  'min-h-11 rounded-full border border-bordo px-3 text-sm font-semibold aria-pressed:border-montagna aria-pressed:bg-montagna aria-pressed:text-panna'

/**
 * La barra che galleggia sopra la mappa (docs/09-interfaccia.md): la ricerca e
 * un pulsante Filtri che apre, sotto la barra, lo stesso pannello dell'elenco
 * con in più "Mostra completati" e la scelta fra trekking e avventure, che
 * sulla mappa stanno insieme. Così la mappa prende tutta la pagina.
 */
export function BarraMappa({
  ricerca,
  onRicerca,
  filtri,
  onFiltri,
  conDistanza,
  mostraCompletati,
  quantiCompletati,
  onMostraCompletati,
  tipo,
  onTipo,
  chiavi,
}: Props) {
  const [aperto, setAperto] = useState(false)
  const id = useId()
  const quanti = quantiFiltri(filtri) + (mostraCompletati && quantiCompletati > 0 ? 1 : 0) + (tipo === null ? 0 : 1)

  useEffect(() => {
    if (!aperto) return
    const esc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAperto(false)
    }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [aperto])

  return (
    // Sopra i riquadri di Leaflet, che arrivano a z-index 1000. I tocchi fuori
    // dalla barra e dal pannello passano alla mappa.
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1001] flex flex-col gap-2 p-2 sm:max-w-[560px]">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-[14px] border border-bordo bg-white/95 p-1.5 shadow-[0_2px_10px_rgb(37_50_62/0.18)] backdrop-blur-sm">
        <Ricerca testo={ricerca} onCambia={onRicerca} />
        <PulsanteFiltri quanti={quanti} aperto={aperto} pannello={id} onClick={() => setAperto(!aperto)} />
      </div>
      {aperto && (
        <div
          id={id}
          className="pointer-events-auto max-h-[calc(100dvh-180px)] animate-entra overflow-y-auto rounded-[14px] border border-bordo bg-white p-3 shadow-[0_2px_10px_rgb(37_50_62/0.18)]"
        >
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
          <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Tipo">
            <button type="button" className={SCELTA_TIPO} aria-pressed={tipo === null} onClick={() => onTipo(null)}>
              Tutti
            </button>
            {TIPI.map((scelta) => (
              <button
                key={scelta}
                type="button"
                className={SCELTA_TIPO}
                aria-pressed={scelta === tipo}
                onClick={() => onTipo(scelta)}
              >
                {TESTI[scelta].elenco}
              </button>
            ))}
          </div>
          <PannelloFiltri valori={filtri} onCambia={onFiltri} conDistanza={conDistanza} chiavi={chiavi} />
          {quantiFiltri(filtri) > 0 && (
            <button
              type="button"
              className="mt-2 min-h-11 rounded-[11px] px-2 text-montagna-scura underline"
              onClick={() => onFiltri(FILTRI_VUOTI)}
            >
              Azzera i filtri
            </button>
          )}
        </div>
      )}
    </div>
  )
}
