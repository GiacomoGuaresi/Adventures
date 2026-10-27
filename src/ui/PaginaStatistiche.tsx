import { useState } from 'react'
import { giorno, km, metri, ore } from '../dominio/completamento'
import { anniConGiri, numeri, percentuale, type Numeri, type Primato } from '../dominio/statistiche'
import type { Attivita } from '../dominio/tipi'

/** I colori del grafico per mese, provati col validatore della skill dataviz: blu per i trekking, terracotta per le avventure. */
const COLORE = { trekking: '#3d77b0', avventure: '#c9793f' }
const MESI = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D']
const NOMI_MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

const riquadro = 'rounded-[11px] border border-bordo bg-white p-4'

interface Props {
  attivita: readonly Attivita[]
  onDettagli: (a: Attivita) => void
}

/**
 * Le statistiche (docs/09-interfaccia.md, "Statistiche"): i totali di sempre o
 * di un anno, i record con il loro giro, i giri per mese e quanta parte della
 * lista è fatta.
 */
export function PaginaStatistiche({ attivita, onDettagli }: Props) {
  const anni = anniConGiri(attivita)
  const [anno, setAnno] = useState<number | null>(null)
  const n = numeri(attivita, anno)
  const apri = (p: Primato | null) => {
    const giro = p && attivita.find((a) => a.id === p.id)
    if (giro) onDettagli(giro)
  }
  const scelta = (attiva: boolean) =>
    `min-h-9 rounded-full border px-3.5 text-sm font-semibold ${
      attiva ? 'border-montagna bg-montagna text-panna' : 'border-bordo bg-white text-testo-tenue hover:bg-fondo'
    }`

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Statistiche</h2>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Periodo">
        <button type="button" className={scelta(anno === null)} aria-pressed={anno === null} onClick={() => setAnno(null)}>
          Sempre
        </button>
        {anni.map((a) => (
          <button key={a} type="button" className={scelta(anno === a)} aria-pressed={anno === a} onClick={() => setAnno(a)}>
            {a}
          </button>
        ))}
      </div>

      <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Numero etichetta="Trekking" valore={String(n.trekking)} />
        <Numero etichetta="Avventure" valore={String(n.avventure)} />
        <Numero etichetta="Dislivello" valore={metri(n.dislivello)} />
        <Numero etichetta="Camminati" valore={n.km > 0 ? km(n.km) : '—'} />
        <Numero etichetta="In cammino" valore={n.minuti > 0 ? ore(n.minuti) : '—'} />
        <Numero etichetta="D+ medio" valore={n.mediaDislivello === null ? '—' : metri(n.mediaDislivello)} />
      </dl>

      <section className={riquadro}>
        <h3 className="mb-2 font-semibold">Record</h3>
        <ul className="flex flex-col">
          <Riga etichetta="Più dislivello" primato={n.recordDislivello} valore={metri} onApri={apri} />
          <Riga etichetta="Più in alto" primato={n.recordQuota} valore={metri} onApri={apri} />
          <Riga etichetta="Più lungo" primato={n.recordKm} valore={km} onApri={apri} />
        </ul>
        {n.ultimo && (
          <p className="mt-2 mb-0 text-sm text-testo-tenue">
            Ultimo giro: <strong className="text-testo">{n.ultimo.nome}</strong>, {giorno(n.ultimo.data)}
          </p>
        )}
      </section>

      {n.perMese && anno !== null && <PerMese perMese={n.perMese} anno={anno} />}

      {anno === null && (
        <section className={riquadro}>
          <h3 className="mb-2 font-semibold">La lista dei desideri</h3>
          <Avanzamento etichetta="Trekking fatti" percentuale={percentuale(attivita, 'trekking')} colore={COLORE.trekking} />
          <Avanzamento etichetta="Avventure fatte" percentuale={percentuale(attivita, 'avventura')} colore={COLORE.avventure} />
        </section>
      )}
    </div>
  )
}

function Numero({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[11px] border border-bordo bg-white p-3">
      <dt className="text-xs text-testo-tenue">{etichetta}</dt>
      <dd className="m-0 text-xl font-semibold tabular-nums">{valore}</dd>
    </div>
  )
}

interface PropsRiga {
  etichetta: string
  primato: Primato | null
  valore: (n: number) => string
  onApri: (p: Primato | null) => void
}

function Riga({ etichetta, primato, valore, onApri }: PropsRiga) {
  return (
    <li className="border-b border-bordo last:border-0">
      <button
        type="button"
        disabled={!primato}
        onClick={() => onApri(primato)}
        className="flex min-h-11 w-full items-center gap-2 text-left enabled:hover:bg-fondo"
      >
        <span className="w-28 shrink-0 text-sm text-testo-tenue">{etichetta}</span>
        <span className="min-w-0 flex-1 truncate">{primato?.nome ?? '—'}</span>
        {primato && <span className="shrink-0 font-semibold tabular-nums">{valore(primato.valore)}</span>}
      </button>
    </li>
  )
}

function Avanzamento({ etichetta, percentuale: p, colore }: { etichetta: string; percentuale: number | null; colore: string }) {
  return (
    <div className="mb-2 flex flex-col gap-1 last:mb-0">
      <div className="flex justify-between text-sm">
        <span>{etichetta}</span>
        <span className="font-semibold tabular-nums">{p === null ? '—' : `${p}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fondo" role="progressbar" aria-label={etichetta} aria-valuenow={p ?? 0} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full" style={{ width: `${p ?? 0}%`, background: colore }} />
      </div>
    </div>
  )
}

/** I giri per mese, trekking e avventure impilati: un passaggio sopra una barra mostra i numeri. */
function PerMese({ perMese, anno }: { perMese: NonNullable<Numeri['perMese']>; anno: number }) {
  const [sopra, setSopra] = useState<number | null>(null)
  const massimo = Math.max(1, ...perMese.map((m) => m.trekking + m.avventure))
  const ALTA = 120
  const colonna = 24
  const passo = 30
  const larga = passo * 12
  const unita = ALTA / massimo
  const mese = sopra === null ? null : perMese[sopra]

  return (
    <section className={riquadro}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Giri per mese nel {anno}</h3>
        <ul className="flex gap-3 text-xs text-testo-tenue" aria-label="Legenda">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: COLORE.trekking }} />
            Trekking
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: COLORE.avventure }} />
            Avventure
          </li>
        </ul>
      </div>
      <p className="m-0 h-5 text-sm text-testo-tenue" aria-live="polite">
        {mese && sopra !== null
          ? `${NOMI_MESI[sopra]}: ${mese.trekking} trekking, ${mese.avventure} ${mese.avventure === 1 ? 'avventura' : 'avventure'}`
          : ''}
      </p>
      <svg viewBox={`0 0 ${larga} ${ALTA + 22}`} className="block h-auto w-full max-w-xl" role="img" aria-label={`Giri per mese nel ${anno}`}>
        <line x1="0" x2={larga} y1={ALTA} y2={ALTA} stroke="#d6e0e8" />
        {perMese.map((m, i) => {
          const x = i * passo + (passo - colonna) / 2
          const hT = m.trekking * unita
          const hA = m.avventure * unita
          return (
            <g
              key={i}
              onPointerEnter={() => setSopra(i)}
              onPointerLeave={() => setSopra((s) => (s === i ? null : s))}
              onClick={() => setSopra(i)}
            >
              <rect x={i * passo} y="0" width={passo} height={ALTA + 22} fill={sopra === i ? '#f1f5f9' : 'transparent'} />
              {hT > 0 && <rect x={x} y={ALTA - hT} width={colonna} height={hT} rx="3" fill={COLORE.trekking} />}
              {hA > 0 && <rect x={x} y={ALTA - hT - hA} width={colonna} height={Math.max(0, hA - (hT > 0 ? 2 : 0))} rx="3" fill={COLORE.avventure} />}
              <text x={i * passo + passo / 2} y={ALTA + 15} fontSize="10" fill="#5c6b78" textAnchor="middle">
                {MESI[i]}
              </text>
            </g>
          )
        })}
      </svg>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-testo-tenue select-none">Vedi come tabella</summary>
        <table className="mt-2 w-full max-w-sm text-left tabular-nums">
          <thead>
            <tr className="text-testo-tenue">
              <th className="font-normal">Mese</th>
              <th className="font-normal">Trekking</th>
              <th className="font-normal">Avventure</th>
            </tr>
          </thead>
          <tbody>
            {perMese.map((m, i) => (
              <tr key={i}>
                <td>{NOMI_MESI[i]}</td>
                <td>{m.trekking}</td>
                <td>{m.avventure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
