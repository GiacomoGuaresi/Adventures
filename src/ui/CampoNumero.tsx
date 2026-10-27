export const CAMPO =
  'min-h-11 w-full rounded-[11px] border border-bordo bg-white px-3 focus:outline-2 focus:-outline-offset-1 focus:outline-montagna'

interface PropsNumero {
  id: string
  etichetta: string
  /** L'unità scritta dentro il campo, a destra. */
  unita: string
  placeholder: string
  valore: string
  onCambia: (testo: string) => void
  storto: boolean
  /** `decimal` per i km, che hanno la virgola. */
  tastiera?: 'numeric' | 'decimal'
}

/**
 * Un numero con la sua unità. È un campo di testo con la tastiera numerica: con
 * `type="number"` la virgola italiana di iOS si perderebbe.
 */
export function CampoNumero({ id, etichetta, unita, placeholder, valore, onCambia, storto, tastiera = 'numeric' }: PropsNumero) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="truncate text-sm font-semibold" htmlFor={id}>
        {etichetta}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={tastiera}
          enterKeyHint="next"
          aria-invalid={storto}
          className={`${CAMPO} pr-10 ${storto ? 'border-pericolo' : ''}`}
          placeholder={placeholder}
          value={valore}
          onChange={(evento) => onCambia(evento.target.value)}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-testo-tenue">
          {unita}
        </span>
      </div>
    </div>
  )
}
