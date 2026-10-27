import { useId } from 'react'
import { Binoculars, Camera, Compass, Sailboat, Sun, Tent, type LucideIcon } from 'lucide-react'
import type { Timbro as DatiTimbro } from '../../dominio/timbri'
import { ICONE_TRAGUARDI } from './icone'

/** Le icone dentro i timbri delle avventure, nell'ordine di `ICONE_TIMBRO`. */
const ICONE: readonly LucideIcon[] = [Compass, Tent, Sailboat, Binoculars, Sun, Camera]

const MESI = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']

/** "12 OTT 2026", come sui timbri veri. */
function dataTimbro(data: string | null): string {
  if (data === null) return 'ADVENTURES'
  const [a, m, g] = data.split('-')
  return `${Number(g)} ${MESI[Number(m) - 1]} ${a}`
}

/** Il bordo a rosetta del sigillo: 28 petali fra due raggi. */
const ROSETTA = Array.from({ length: 56 }, (_, i) => {
  const r = i % 2 === 0 ? 57 : 51.5
  const a = (i / 56) * Math.PI * 2
  return `${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`
}).join(' ')

function accorcia(testo: string, quanto: number): string {
  return testo.length <= quanto ? testo : `${testo.slice(0, quanto - 1).trimEnd()}…`
}

/**
 * Il carattere del nome: pieno finché ci sta, poi si stringe perché stia nei
 * `spazio` pixel dell'arco o della riga (una maiuscola in grassetto è larga
 * circa 0,7 volte il suo corpo).
 */
function corpo(testo: string, pieno: number, spazio: number): number {
  return Math.max(6, Math.min(pieno, spazio / (testo.length * 0.72)))
}

/**
 * Gli archi delle scritte nei timbri tondi e ovali: il nome sta sopra l'arco
 * alto e va verso il bordo, la data sta sopra l'arco basso e va verso il
 * centro; tutti e due fra l'anello esterno e quello interno.
 */
function arco(rx: number, ry: number, sotto: boolean): string {
  return sotto ? `M ${60 - rx} 60 A ${rx} ${ry} 0 0 0 ${60 + rx} 60` : `M ${60 - rx} 60 A ${rx} ${ry} 0 0 1 ${60 + rx} 60`
}

interface Props {
  timbro: DatiTimbro
  /** Il timbro appena dato: cade sulla pagina e lascia lo schizzo d'inchiostro. */
  cade?: boolean
  /** Il ritardo della caduta, per farli cadere uno dopo l'altro. */
  attesa?: number
  className?: string
}

/**
 * Un timbro del passaporto (docs/09-interfaccia.md, "Passaporto"): inchiostro
 * un po' consumato, nome in alto, data in basso, un'icona in mezzo. Forma,
 * colore e inclinazione li decide l'id. I traguardi sono sigilli d'oro a
 * rosetta, con la loro icona.
 */
export function Timbro({ timbro: t, cade, attesa = 0, className = '' }: Props) {
  const id = useId()
  const Icona = typeof t.icona === 'number' ? ICONE[t.icona] : ICONE_TRAGUARDI[t.icona]
  const nome = t.nome.toUpperCase()
  const colore = t.inchiostro
  const ovale = t.forma === 'ovale'
  const sigillo = t.forma === 'sigillo'
  const adArco = t.forma === 'tondo' || ovale || sigillo
  const semeRumore = typeof t.icona === 'number' ? t.icona + 3 : t.nome.length
  const nomeArco = accorcia(nome, 22)
  const nomeRiga = accorcia(nome, 18)

  return (
    <div className={`relative ${className}`}>
      {cade && (
        <span
          className="animate-inchiostro absolute inset-[10%] rounded-full"
          style={{ background: colore, animationDelay: `${attesa + 450}ms` }}
          aria-hidden="true"
        />
      )}
      <svg
        viewBox="0 0 120 120"
        className={`relative block h-full w-full ${cade ? 'animate-timbra' : ''}`}
        style={{ rotate: `${t.rotazione}deg`, animationDelay: cade ? `${attesa}ms` : undefined }}
        role="img"
        aria-label={`${sigillo ? 'Traguardo' : 'Timbro'}: ${t.nome}${t.data ? `, ${dataTimbro(t.data).toLowerCase()}` : ''}`}
      >
        <defs>
          {/* L'inchiostro non prende mai tutto: un rumore che buca il tratto qua e là. */}
          <filter id={`${id}-consumato`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={semeRumore} result="rumore" />
            <feColorMatrix in="rumore" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="buchi" />
            <feComposite in="SourceGraphic" in2="buchi" operator="in" />
          </filter>
          <path id={`${id}-sopra`} d={ovale ? arco(41, 31, false) : sigillo ? arco(35, 35, false) : arco(38, 38, false)} />
          <path id={`${id}-sotto`} d={ovale ? arco(47, 38, true) : sigillo ? arco(42, 42, true) : arco(46, 46, true)} />
        </defs>
        <g filter={`url(#${id}-consumato)`} fill="none" stroke={colore} opacity={sigillo ? 0.95 : 0.88}>
          {t.forma === 'tondo' && (
            <>
              <circle cx="60" cy="60" r="55" strokeWidth="3.5" />
              <circle cx="60" cy="60" r="28" strokeWidth="1.8" />
            </>
          )}
          {t.forma === 'ovale' && (
            <>
              <ellipse cx="60" cy="60" rx="56" ry="46" strokeWidth="3.5" />
              <ellipse cx="60" cy="60" rx="30" ry="24" strokeWidth="1.8" />
            </>
          )}
          {t.forma === 'ottagono' && (
            <>
              <polygon points="38,5 82,5 115,38 115,82 82,115 38,115 5,82 5,38" strokeWidth="3.5" strokeLinejoin="round" />
              <polygon points="41,12 79,12 108,41 108,79 79,108 41,108 12,79 12,41" strokeWidth="1.4" strokeLinejoin="round" />
            </>
          )}
          {sigillo && (
            <>
              <polygon points={ROSETTA} fill="#f0b556" fillOpacity="0.28" strokeWidth="2.8" strokeLinejoin="round" />
              <circle cx="60" cy="60" r="46" strokeWidth="1.4" />
              <circle cx="60" cy="60" r="23" fill={colore} fillOpacity="0.14" strokeWidth="2" />
              <path d="M14.5 60 l2 -2 2 2 -2 2z M101.5 60 l2 -2 2 2 -2 2z" fill={colore} stroke="none" />
            </>
          )}
          {t.forma === 'francobollo' && (
            <>
              <rect x="6" y="6" width="108" height="108" rx="2" strokeWidth="5" strokeDasharray="0.1 7" strokeLinecap="round" />
              <rect x="14" y="14" width="92" height="92" strokeWidth="2.5" />
            </>
          )}

          {adArco ? (
            <text fill={colore} stroke="none" fontSize={corpo(nomeArco, 10.5, ovale ? 125 : sigillo ? 100 : 112)} fontWeight="700" letterSpacing="0.8" textAnchor="middle">
              <textPath href={`#${id}-sopra`} startOffset="50%">
                {nomeArco}
              </textPath>
            </text>
          ) : (
            <text x="60" y="35" fill={colore} stroke="none" fontSize={corpo(nomeRiga, 9.5, t.forma === 'francobollo' ? 80 : 74)} fontWeight="700" letterSpacing="0.4" textAnchor="middle">
              {nomeRiga}
            </text>
          )}
 {adArco ? (
            <text fill={colore} stroke="none" fontSize="9" fontWeight="600" letterSpacing="1.2" textAnchor="middle">
              <textPath href={`#${id}-sotto`} startOffset="50%">
                {dataTimbro(t.data)}
              </textPath>
            </text>
          ) : (
            <text x="60" y="92" fill={colore} stroke="none" fontSize="9.5" fontWeight="600" letterSpacing="1" textAnchor="middle">
              {dataTimbro(t.data)}
            </text>
          )}
          {sigillo ? (
            <Icona x="47" y="47" width="26" height="26" color={colore} strokeWidth={2.2} />
          ) : (
            <Icona x="46" y="46" width="28" height="28" color={colore} strokeWidth={2} />
          )}
        </g>
      </svg>
    </div>
  )
}
