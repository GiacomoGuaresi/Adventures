import { Search, X } from 'lucide-react'
import { useId } from 'react'

interface Props {
  testo: string
  onCambia: (testo: string) => void
}

/** La ricerca per nome dell'elenco (docs/02-funzionalita.md): filtra mentre si scrive. */
export function Ricerca({ testo, onCambia }: Props) {
  const id = useId()

  return (
    <div className="relative flex-1">
      <label className="sr-only" htmlFor={id}>
        Cerca per nome
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-testo-tenue"
        aria-hidden="true"
      />
      <input
        id={id}
        type="text"
        className="min-h-11 w-full rounded-[11px] border border-bordo bg-white pr-11 pl-10 focus:outline-2 focus:-outline-offset-1 focus:outline-montagna"
        placeholder="Cerca"
        value={testo}
        onChange={(evento) => onCambia(evento.target.value)}
      />
      {testo !== '' && (
        <button
          type="button"
          className="absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center rounded-[11px] text-testo-tenue hover:text-testo"
          aria-label="Cancella la ricerca"
          onClick={() => onCambia('')}
        >
          <X className="size-[18px]" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
