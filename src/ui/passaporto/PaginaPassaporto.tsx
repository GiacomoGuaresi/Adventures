import { useMemo, useState } from 'react'
import { LockKeyhole, Stamp } from 'lucide-react'
import { pagine } from '../../dominio/timbri'
import { traguardi } from '../../dominio/traguardi'
import type { Coordinate } from '../../dominio/coordinate'
import type { Attivita } from '../../dominio/tipi'
import { Modale } from '../Modale'
import { VISTI_TIMBRI, useNuovi } from '../visti'
import { Timbro } from './Timbro'
import { DaSbloccare } from './Traguardo'

interface Props {
  attivita: readonly Attivita[]
  /** Per i traguardi che guardano dove sta il giro rispetto a casa. */
  casa: Coordinate | null
  onDettagli: (a: Attivita) => void
}

/**
 * Il passaporto (docs/09-interfaccia.md, "Passaporto"): una pagina per anno con
 * un timbro per ogni avventura completata e un sigillo d'oro per ogni
 * traguardo raggiunto, in ordine di giorno. I traguardi da raggiungere non si
 * vedono: "Da sbloccare" li elenca in un popup, con a che punto si è. I timbri
 * nuovi cadono sulla pagina; toccandone uno si apre il giro che l'ha dato.
 */
export function PaginaPassaporto({ attivita, casa, onDettagli }: Props) {
  const fogli = useMemo(() => pagine(attivita, casa), [attivita, casa])
  const nuovi = useNuovi(VISTI_TIMBRI, fogli.flatMap((p) => p.timbri.map((t) => t.id)))
  const bacheca = useMemo(() => traguardi(attivita, casa), [attivita, casa])
  const daSbloccare = bacheca.filter((s) => s.da === null)
  const [elenco, setElenco] = useState(false)
  const timbri = fogli.reduce((n, p) => n + p.timbri.filter((t) => t.forma !== 'sigillo').length, 0)
  const sigilli = bacheca.length - daSbloccare.length
  let caduti = 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-lg font-semibold">Passaporto</h2>
          <p className="m-0 text-sm text-testo-tenue">
            {fogli.length === 0
              ? "Ancora nuovo: completa un'avventura o un trekking per i primi timbri."
              : `${timbri} ${timbri === 1 ? 'timbro' : 'timbri'} · ${sigilli} ${sigilli === 1 ? 'traguardo' : 'traguardi'}`}
          </p>
        </div>
        {daSbloccare.length > 0 && (
          <button
            type="button"
            onClick={() => setElenco(true)}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-sole/70 bg-panna px-3.5 text-sm font-semibold text-sole-scuro hover:bg-white"
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
            Da sbloccare
            <span className="rounded-full bg-sole px-1.5 text-xs text-montagna-scura tabular-nums">{daSbloccare.length}</span>
          </button>
        )}
      </div>

      {fogli.length === 0 && (
        <div className="grid place-items-center rounded-[11px] border border-dashed border-bordo bg-panna p-8 text-testo-tenue">
          <Stamp className="size-10" aria-hidden="true" />
        </div>
      )}
      {fogli.map(({ anno, timbri }) => (
        <section
          key={anno ?? 'prima'}
          className="rounded-[14px] border border-[#e8dfcc] bg-panna p-2 shadow-[inset_0_0_0_5px_#fbf8f1,inset_0_0_0_6px_#ece3d0]"
        >
          <h3 className="px-3 pt-2 text-sm font-semibold tracking-[0.1em] text-sole-scuro uppercase">{anno ?? 'Prima di Adventures'}</h3>
          <ul className="grid grid-cols-3 gap-1 sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
            {timbri.map((t) => {
              const giro = attivita.find((a) => a.id === t.giro)
              const cade = nuovi.has(t.id)
              return (
                <li key={t.id}>
                  <button type="button" className="block w-full rounded-[11px] p-1 active:bg-white/70" onClick={() => giro && onDettagli(giro)}>
                    <Timbro timbro={t} cade={cade} attesa={cade ? Math.min(caduti++, 10) * 180 : 0} className="mx-auto aspect-square w-full max-w-32" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {elenco && (
        <Modale titolo={`Da sbloccare · ${daSbloccare.length}`} onChiudi={() => setElenco(false)} mobile="foglio">
          <ul className="flex flex-col divide-y divide-bordo">
            {/* Prima quelli più vicini: chi è più avanti in percentuale. */}
            {[...daSbloccare]
              .sort((a, b) => (b.avanzamento ? b.avanzamento.fatto / b.avanzamento.serve : -1) - (a.avanzamento ? a.avanzamento.fatto / a.avanzamento.serve : -1))
              .map((s) => (
                <li key={s.traguardo.id}>
                  <DaSbloccare sblocco={s} />
                </li>
              ))}
          </ul>
        </Modale>
      )}
    </div>
  )
}
