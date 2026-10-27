/**
 * Il pallino rosso col numero (docs/09-interfaccia.md): quante cime o timbri
 * compariranno aprendo la pagina. Pulsa piano per farsi notare, finché la
 * pagina non si apre. Il bordo stacca il pallino dal fondo: blu sull'intestazione, bianco nel menu.
 */
export function Pallino({ numero, su = 'blu', className = '' }: { numero: number; su?: 'blu' | 'bianco'; className?: string }) {
  return (
    <span
      className={`animate-richiamo grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#d93a2f] px-1 text-[11px] leading-none font-bold text-white tabular-nums ${su === 'blu' ? 'shadow-[0_0_0_2px_var(--color-montagna)]' : 'shadow-[0_0_0_2px_white]'} ${className}`}
      aria-hidden="true"
    >
      {numero > 99 ? '99+' : numero}
    </span>
  )
}
