import { useId } from 'react'
import { anni, crinale, estensione, lineaNeve, profilo, type Montagna, type Stagione } from '../../dominio/catena'
import { generatore } from '../../dominio/caso'
import { oggi } from '../../dominio/completamento'

/** L'altezza in pixel di una cima piena (altezza 1), quando non la decide lo schermo. */
const PIENA = 200
/** Il margine ai due lati. */
const BORDO = 16

/**
 * I colori di una vista alpina. Ogni cima ha la sua roccia; i boschi prendono
 * il colore della stagione del giro. La foschia azzurrina schiarisce le cime
 * lontane: le più alte stanno dietro, quindi più una cima è alta più ne prende.
 */
const ROCCE: readonly (readonly number[])[] = [
  [122, 114, 108], // granito
  [178, 152, 132], // dolomia rosata
  [152, 128, 94], // calcare ocra
  [96, 96, 104], // ardesia
  [142, 100, 86], // porfido
]
const BOSCHI: Record<Stagione, readonly number[]> = {
  primavera: [112, 156, 78],
  estate: [74, 112, 58],
  autunno: [170, 124, 56],
  inverno: [78, 98, 88],
}
const FOSCHIA = [184, 199, 212]
/** La terra sotto la catena: il prato del fondovalle, e i suoi abeti. */
const PRATO = '#4f6a3c'
const ABETE = '#2f4a2c'

function mescola(colore: readonly number[], foschia: number, scarto = 0): string {
  const [r, g, b] = colore.map((c, i) => Math.round(c + scarto + (FOSCHIA[i] - c - scarto) * foschia))
  return `rgb(${r} ${g} ${b})`
}

/** Quanta foschia prende una cima: poca davanti, quasi metà in fondo. */
function foschia(altezza: number): number {
  return 0.06 + 0.42 * ((altezza - 0.2) / 0.8)
}

/** Fin dove salgono prati e boschi, in frazione dell'altezza: quasi in cima alle colline, a un terzo sulle alte. */
function boscoFinoA(altezza: number): number {
  return 0.32 + 0.5 * (1 - altezza)
}

const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`

/** Le misure della scena a tutta pagina: le usa anche la pagina per far scorrere una cima al centro. */
export interface Misure {
  /** L'altezza dello schermo: le cime crescono fino a riempirla. */
  altezza: number
  /** La scena è larga almeno lo schermo, con le cime al centro se sono poche. */
  larghezzaMinima: number
  /** Lo spazio sopra la cima più alta: ci sta il riquadro coi totali. */
  cielo: number
  /** La striscia di prato sotto, con gli anni. */
  terra: number
}

/** In orizzontale una cima piena non va oltre questi pixel: sugli schermi alti le cime diventano ripide invece che larghe. */
const PASSO_MASSIMO = 310

const MISURE_FISSE = { cielo: 34, terra: 30 }
const MISURE_RIDOTTE = { cielo: 34, terra: 6 }

function conti(fila: readonly Montagna[], misure?: Misure, ridotta?: boolean) {
  const { cielo, terra } = misure ?? (ridotta ? MISURE_RIDOTTE : MISURE_FISSE)
  const piena = misure ? Math.max(140, misure.altezza - cielo - terra) : PIENA
  const passo = Math.min(piena, PASSO_MASSIMO)
  const contenuto = estensione(fila) * passo + BORDO * 2
  const larga = Math.max(contenuto, misure?.larghezzaMinima ?? 0)
  return { cielo, terra, piena, passo, larga, scosta: BORDO + (larga - contenuto) / 2 }
}

/** Il centro di una cima in pixel, per farla scorrere al centro dello schermo. */
export function centroCima(m: Montagna, fila: readonly Montagna[], misure: Misure): number {
  const { passo, scosta } = conti(fila, misure)
  return scosta + m.x * passo
}

interface Props {
  montagne: readonly Montagna[]
  /** Quelle da far sorgere: le nuove da quando si è guardato l'ultima volta, o quella appena completata. */
  nuove?: ReadonlySet<string>
  /** La cima scelta, con il bordo color sole. */
  scelta?: string | null
  onScegli?: (m: Montagna) => void
  /** Nella cerimonia: senza anni né abeti, larga quanto il riquadro invece che a pixel fissi. */
  ridotta?: boolean
  /** A tutta pagina: le misure dello schermo. */
  misure?: Misure
  /** Ogni quanti millisecondi sorge la cima nuova successiva, in ordine di giro. */
  passo?: number
}

/**
 * La catena in SVG (docs/09-interfaccia.md, "Catena"): cime da sinistra a
 * destra in ordine di giro, le più alte dipinte prima così restano dietro,
 * davanti a due crinali lontani, con nuvole, sole e abeti sul prato. Neve dai
 * 1200 m di dislivello o d'inverno, una bandierina su ogni vetta. Le cime di
 * oggi hanno l'alone e le scintille, come le piante nuove della Foresta.
 */
export function Catena({ montagne, nuove, scelta, onScegli, ridotta, misure, passo: passoComparsa = 120 }: Props) {
  const prefisso = useId()
  const { cielo, terra, piena, passo, larga, scosta } = conti(montagne, misure, ridotta)
  const base = cielo + piena
  const alta = base + terra
  const di = oggi()
  const xPx = (x: number) => scosta + x * passo
  // Prima le alte, dietro; a parità quella a sinistra.
  const inPittura = [...montagne].sort((a, b) => b.altezza - a.altezza || a.x - b.x)
  // Le nuove sorgono in ordine di giro, da sinistra, anche se si dipingono in un altro ordine.
  const ordine = new Map(montagne.filter((m) => nuove?.has(m.id)).map((m, i) => [m.id, i]))

  return (
    <svg
      viewBox={`0 0 ${larga} ${alta}`}
      width={ridotta ? undefined : larga}
      height={ridotta ? undefined : alta}
      className={ridotta ? 'block h-auto max-h-64 w-full' : 'block max-w-none select-none'}
      role="img"
      aria-label={`Catena di ${montagne.length} ${montagne.length === 1 ? 'cima' : 'cime'}`}
    >
      <defs>
        <linearGradient id={`${prefisso}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9d3ea" />
          <stop offset="0.65" stopColor="#e3edf2" />
          <stop offset="1" stopColor="#f7eedc" />
        </linearGradient>
        <radialGradient id={`${prefisso}-alone`}>
          <stop offset="0" stopColor="#f0b556" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f0b556" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${prefisso}-sole`}>
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.35" stopColor="#ffe9b0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${prefisso}-prato`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d7a45" />
          <stop offset="1" stopColor={PRATO} />
        </linearGradient>
        <clipPath id={`${prefisso}-sopra`}>
          <rect x="0" y="0" width={larga} height={base} />
        </clipPath>
      </defs>
      <rect x="0" y="0" width={larga} height={base} fill={`url(#${prefisso}-cielo)`} />
      <Sfondo larga={larga} base={base} piena={piena} cielo={cielo} sole={`url(#${prefisso}-sole)`} ridotta={ridotta} />
      <g clipPath={`url(#${prefisso}-sopra)`}>
        {inPittura.map((m) => {
          const sorge = ordine.has(m.id)
          const attesa = sorge ? ordine.get(m.id)! * passoComparsa : 0
          return (
            <Cima
              key={m.id}
              montagna={m}
              idClip={`${prefisso}-${m.id}`}
              alone={`url(#${prefisso}-alone)`}
              sinistra={xPx(m.x - m.larghezza / 2)}
              larghezza={m.larghezza * passo}
              altezza={m.altezza * piena}
              base={base}
              sorge={sorge}
              attesa={attesa}
              diOggi={m.data === di}
              scelta={m.id === scelta}
              onScegli={onScegli}
            />
          )
        })}
      </g>
      <rect x="0" y={base} width={larga} height={alta - base} fill={`url(#${prefisso}-prato)`} />
      {!ridotta && <Abeti larga={larga} base={base} />}
      {!ridotta &&
        etichette(anni(montagne).map(({ anno, x }) => ({ testo: anno === null ? 'Prima' : String(anno), x: xPx(x) }))).map(({ testo, x, scritta }) => (
          <g key={testo} className="pointer-events-none">
            <line x1={x} x2={x} y1={base} y2={base + 10} stroke="#fbf8f1" strokeOpacity="0.6" />
            <text x={scritta} y={base + 23} fill="#fbf8f1" fontSize="13" fontWeight="700" letterSpacing="0.3">
              {testo}
            </text>
          </g>
        ))}
    </svg>
  )
}

interface PropsSfondo {
  larga: number
  base: number
  piena: number
  cielo: number
  sole: string
  ridotta?: boolean
}

/** Il sole, qualche nuvola e due crinali lontani nella foschia: la quinta dietro le cime. */
function Sfondo({ larga, base, piena, cielo, sole, ridotta }: PropsSfondo) {
  const passo = 24
  const punti = Math.ceil(larga / passo) + 2
  const linea = (semeCrinale: number, alto: number, basso: number) =>
    [
      pt(0, base),
      ...crinale(semeCrinale, punti).map((q, i) => pt(i * passo, base - piena * (basso + (alto - basso) * q))),
      pt(larga, base),
    ].join(' ')
  const caso = generatore(91)
  const quante = Math.max(2, Math.round(larga / 260))
  const nuvole = Array.from({ length: quante }, (_, i) => ({
    x: (i + 0.2 + caso() * 0.6) * (larga / quante),
    y: cielo * 0.6 + caso() * piena * 0.28,
    r: 10 + caso() * 9,
  }))

  return (
    <g className="pointer-events-none" aria-hidden="true">
      <circle cx={larga - Math.min(90, larga * 0.15)} cy={cielo * 0.7 + piena * 0.08} r={ridotta ? 34 : 56} fill={sole} />
      {nuvole.map((n, i) => (
        <g key={i} fill="#ffffff" fillOpacity="0.78">
          <ellipse cx={n.x} cy={n.y} rx={n.r * 2.6} ry={n.r * 0.8} />
          <circle cx={n.x - n.r * 0.9} cy={n.y - n.r * 0.35} r={n.r * 0.75} />
          <circle cx={n.x + n.r * 0.4} cy={n.y - n.r * 0.55} r={n.r} />
        </g>
      ))}
      <polygon points={linea(17, 0.62, 0.34)} fill="#c4d2de" />
      <polygon points={linea(29, 0.4, 0.16)} fill="#a9bccb" />
    </g>
  )
}

/** Gli abeti sul prato, davanti alle cime: piccoli, scuri, a gruppi. Non si toccano. */
function Abeti({ larga, base }: { larga: number; base: number }) {
  const caso = generatore(1234)
  const abeti: { x: number; h: number }[] = []
  for (let x = 6; x < larga; x += 9 + caso() * 30) {
    if (caso() < 0.35) continue
    abeti.push({ x, h: 9 + caso() * 13 })
  }
  return (
    <g className="pointer-events-none" fill={ABETE} aria-hidden="true">
      {abeti.map(({ x, h }) => (
        <polygon key={x} points={`${pt(x, base - h)} ${pt(x + h * 0.32, base + 1)} ${pt(x - h * 0.32, base + 1)}`} />
      ))}
    </g>
  )
}

/** Le scritte degli anni, spostate a destra quanto basta per non accavallarsi (circa 8px a lettera). */
function etichette(inizi: { testo: string; x: number }[]): { testo: string; x: number; scritta: number }[] {
  let libero = 0
  return inizi.map(({ testo, x }) => {
    const scritta = Math.max(x + 6, libero)
    libero = scritta + testo.length * 8 + 12
    return { testo, x, scritta }
  })
}

interface PropsCima {
  montagna: Montagna
  idClip: string
  alone: string
  sinistra: number
  larghezza: number
  altezza: number
  base: number
  sorge: boolean
  attesa: number
  diOggi: boolean
  scelta: boolean
  onScegli?: (m: Montagna) => void
}

function Cima({ montagna: m, idClip, alone, sinistra, larghezza, altezza, base, sorge, attesa, diOggi, scelta, onScegli }: PropsCima) {
  const punti = profilo(m.seme).map(([x, y]) => [sinistra + x * larghezza, base - altezza * (1 - y)] as const)
  const vetta = punti.reduce((alto, p) => (p[1] < alto[1] ? p : alto))
  const iVetta = punti.indexOf(vetta)
  const contorno = punti.map(([x, y]) => pt(x, y)).join(' ')
  // Il versante destro in ombra: dalla vetta giù per il profilo, poi in diagonale fino sotto la vetta.
  const ombra = [...punti.slice(iVetta), [vetta[0] + larghezza * 0.08, base] as const].map(([x, y]) => pt(x, y)).join(' ')
  // Una lingua di luce sul versante sinistro, appena sotto la vetta.
  const luce = [vetta, [vetta[0] - larghezza * 0.12, vetta[1] + altezza * 0.55] as const, [vetta[0] - larghezza * 0.02, vetta[1] + altezza * 0.5] as const]
    .map(([x, y]) => pt(x, y))
    .join(' ')
  const yNeve = base - altezza + altezza * lineaNeve(m)
  // Il bordo della neve a zig-zag, da un lato all'altro della cima.
  const denti = 9
  const bordoNeve = Array.from({ length: denti + 1 }, (_, i) => pt(sinistra + (larghezza * i) / denti, yNeve + (i % 2 === 0 ? 0 : 8)))
    .reverse()
    .join(' ')
  // Il limite del bosco, mosso: un'onda leggera da un lato all'altro.
  const yBosco = base - altezza * boscoFinoA(m.altezza)
  const onde = 9
  const bordoBosco = Array.from({ length: onde + 1 }, (_, i) =>
    pt(sinistra + (larghezza * i) / onde, yBosco + Math.sin(i * 2.1 + (m.seme % 7)) * 5),
  ).join(' ')
  const velo = foschia(m.altezza)
  // Ogni bosco un po' diverso dall'altro, anche nella stessa stagione.
  const scarto = ((m.seme >>> 8) % 17) - 8
  const etichetta = `${m.nome}${m.dislivello === null ? '' : `, ${m.dislivello} m di dislivello`}`

  return (
    <g
      className={onScegli ? 'cursor-pointer focus:outline-none' : undefined}
      role={onScegli ? 'button' : undefined}
      tabIndex={onScegli ? 0 : undefined}
      aria-label={onScegli ? etichetta : undefined}
      aria-pressed={onScegli ? scelta : undefined}
      onClick={() => onScegli?.(m)}
      onKeyDown={(e) => {
        if (onScegli && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onScegli(m)
        }
      }}
    >
      <title>{etichetta}</title>
      <g className={sorge ? 'animate-sorge [transform-box:fill-box]' : undefined} style={sorge ? { animationDelay: `${attesa}ms` } : undefined}>
        {diOggi && (
          <ellipse
            cx={vetta[0]}
            cy={vetta[1] + 6}
            rx={larghezza * 0.45}
            ry={altezza * 0.5}
            fill={alone}
            className="animate-alone origin-center [transform-box:fill-box]"
          />
        )}
        <clipPath id={idClip}>
          <polygon points={contorno} />
        </clipPath>
        <polygon points={contorno} fill={mescola(ROCCE[m.roccia], velo)} />
        <g clipPath={`url(#${idClip})`}>
          <polygon points={luce} fill="#fff8ea" fillOpacity={0.14} />
          <polygon points={`${bordoBosco} ${pt(sinistra + larghezza, base)} ${pt(sinistra, base)}`} fill={mescola(BOSCHI[m.stagione], velo, scarto)} />
          {m.neve && <polygon points={`${pt(sinistra, base - altezza - 2)} ${pt(sinistra + larghezza, base - altezza - 2)} ${bordoNeve}`} fill="#fbfbf8" />}
          {/* Il sole da sinistra: il versante destro in ombra, neve compresa. */}
          <polygon points={ombra} fill="#2a2620" fillOpacity={0.22 - velo * 0.1} />
        </g>
        <polygon
          points={contorno}
          fill="none"
          stroke={scelta ? '#f0b556' : mescola([70, 62, 55], velo)}
          strokeOpacity={scelta ? 1 : 0.4}
          strokeWidth={scelta ? 3.5 : 1}
          strokeLinejoin="round"
        />
        <g
          className={sorge ? 'animate-bandiera origin-bottom [transform-box:fill-box]' : undefined}
          style={sorge ? { animationDelay: `${attesa + 700}ms` } : undefined}
        >
          <line x1={vetta[0]} x2={vetta[0]} y1={vetta[1]} y2={vetta[1] - 22} stroke="#25323e" strokeWidth="1.5" />
          <polygon points={`${pt(vetta[0], vetta[1] - 22)} ${pt(vetta[0] + 13, vetta[1] - 17.5)} ${pt(vetta[0], vetta[1] - 13)}`} fill={scelta ? '#e0473a' : '#f0b556'} />
        </g>
        {diOggi &&
          [
            [-0.22, 0.05],
            [0.2, 0.18],
            [-0.08, 0.32],
          ].map(([dx, dy], i) => (
            <path
              key={i}
              d="M0,-5 L1.4,-1.4 L5,0 L1.4,1.4 L0,5 L-1.4,1.4 L-5,0 L-1.4,-1.4 Z"
              transform={`translate(${vetta[0] + dx * larghezza},${vetta[1] + dy * altezza})`}
              fill="#f0b556"
              className="animate-scintilla [transform-box:fill-box] origin-center"
              style={{ animationDelay: `${i * 0.8}s` }}
            />
          ))}
      </g>
    </g>
  )
}
