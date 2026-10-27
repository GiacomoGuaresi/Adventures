import { Lock } from 'lucide-react'
import { km, metri } from '../../dominio/completamento'
import type { Sblocco } from '../../dominio/traguardi'
import { ICONE_TRAGUARDI } from './icone'

function misura(n: number, unita: '' | 'm' | 'km'): string {
  if (unita === 'm') return metri(n)
  if (unita === 'km') return km(n)
  return String(n)
}

/**
 * Un traguardo ancora da sbloccare, nell'elenco del passaporto
 * (docs/09-interfaccia.md, "Passaporto"): icona sbiadita col lucchetto, cosa
 * serve e, dove si può contare, a che punto si è.
 */
export function DaSbloccare({ sblocco: { traguardo: t, avanzamento: a } }: { sblocco: Sblocco }) {
  const Icona = ICONE_TRAGUARDI[t.icona]
  const parte = a ? Math.min(100, Math.round((a.fatto / a.serve) * 100)) : null
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-dashed border-bordo text-testo-tenue/60">
        <Icona className="size-5" aria-hidden="true" />
        <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-white text-testo-tenue shadow-sm">
          <Lock className="size-3" aria-hidden="true" />
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{t.titolo}</span>
        <span className="text-xs text-testo-tenue">{t.descrizione}</span>
        {a && parte !== null && (
          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-fondo"
              role="progressbar"
              aria-label={`${t.titolo}: a che punto sei`}
              aria-valuenow={parte}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-sole-scuro" style={{ width: `${parte}%` }} />
            </div>
            <span className="shrink-0 text-xs text-testo-tenue tabular-nums">
              {misura(a.fatto, a.unita)} di {misura(a.serve, a.unita)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
