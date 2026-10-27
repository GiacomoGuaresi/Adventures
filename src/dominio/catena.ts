/**
 * La catena montuosa (docs/02-funzionalita.md): ogni trekking completato è una
 * cima, da sinistra a destra in ordine di giro. L'altezza segue il dislivello
 * con una radice, così un giro da 300 m si vede accanto a uno da 2000 m; la
 * base si allarga con i km. Il profilo nasce dall'id e non cambia mai.
 */

import { generatore, seme } from './caso'
import { dislivelloFatto } from './completamento'
import { anno, completate } from './cronologia'
import { stagioneDi, type Stagione } from './stagioni'
import type { Attivita } from './tipi'

export type { Stagione } from './stagioni'
export { stagioneDi } from './stagioni'

/** Quante rocce diverse ci sono: l'interfaccia ne sceglie i colori. */
export const ROCCE = 5

/** Oltre questo dislivello le cime non crescono più. */
const DISLIVELLO_MASSIMO = 2500
/** La più bassa, anche senza dislivello: una collina, ma si vede. */
const ALTEZZA_MINIMA = 0.2
/** Da questo dislivello in su la cima ha la neve. */
export const NEVE = 1200
/** Quanto si sovrappongono due cime vicine: 1 si toccano, meno si accavallano. */
const PASSO = 0.62

export interface Montagna {
  id: string
  nome: string
  /** Il giorno del giro; `null` per quelli "prima di Adventures". */
  data: string | null
  anno: number | null
  dislivello: number | null
  /** In [ALTEZZA_MINIMA, 1]: la frazione dell'altezza della scena. */
  altezza: number
  /** La base, in unità di altezza piena. */
  larghezza: number
  /** Il centro della base, nelle stesse unità. */
  x: number
  neve: boolean
  /** La stagione del giro: colora i boschi, e d'inverno la neve scende anche sulle basse. */
  stagione: Stagione
  /** Quale roccia, in [0, ROCCE): fissa per la cima. */
  roccia: number
  seme: number
}

export function altezza(dislivello: number | null): number {
  if (dislivello === null || dislivello <= 0) return ALTEZZA_MINIMA
  const quota = Math.sqrt(Math.min(dislivello, DISLIVELLO_MASSIMO) / DISLIVELLO_MASSIMO)
  return ALTEZZA_MINIMA + (1 - ALTEZZA_MINIMA) * quota
}

/** La base: più larga coi km, ma sempre in proporzione all'altezza perché resti una montagna. */
export function larghezza(alta: number, km: number | null): number {
  const allarga = km === null ? 1 : 0.85 + Math.min(km, 30) / 30 * 0.6
  return Math.max(0.6, alta * 1.5 * allarga)
}

export function montagne(attivita: readonly Attivita[]): Montagna[] {
  const fila: Montagna[] = []
  let destra = 0
  for (const a of completate(attivita, 'trekking')) {
    const d = dislivelloFatto(a)
    const alta = altezza(d)
    const larga = larghezza(alta, a.fatto_km)
    const x = fila.length === 0 ? larga / 2 : destra - larga * (1 - PASSO) + larga / 2
    const stagione = stagioneDi(a.completato_il)
    const semeCima = seme(a.id)
    fila.push({
      id: a.id,
      nome: a.nome,
      data: a.completato_il,
      anno: anno(a),
      dislivello: d,
      altezza: alta,
      larghezza: larga,
      x,
      neve: stagione === 'inverno' || (d !== null && d >= NEVE),
      stagione,
      roccia: generatore(semeCima ^ 0x5bd1e995)() * ROCCE | 0,
      seme: semeCima,
    })
    destra = x + larga / 2
  }
  return fila
}

/** Quanto è larga tutta la catena. */
export function estensione(fila: readonly Montagna[]): number {
  return fila.reduce((fine, m) => Math.max(fine, m.x + m.larghezza / 2), 0)
}

/** Dove inizia ogni anno, per le etichette sotto la catena: il primo gruppo può essere senza anno. */
export function anni(fila: readonly Montagna[]): { anno: number | null; x: number }[] {
  const inizi: { anno: number | null; x: number }[] = []
  for (const m of fila) {
    if (inizi.length === 0 || inizi[inizi.length - 1].anno !== m.anno) inizi.push({ anno: m.anno, x: m.x - m.larghezza / 2 })
  }
  return inizi
}

/**
 * Il profilo della cima, da base sinistra a base destra, in unità della
 * montagna: x in [0, 1] sulla base, y in [0, 1] dall'alto (0 è la vetta). Due
 * o tre spalle per lato, un po' storte, e la vetta non sempre in mezzo.
 */
export function profilo(semeMontagna: number): [number, number][] {
  const caso = generatore(semeMontagna)
  const vetta = 0.38 + caso() * 0.24
  const punti: [number, number][] = [[0, 1]]
  const spalle = (da: number, a: number, versoVetta: boolean) => {
    const quante = 2 + Math.floor(caso() * 2)
    for (let i = 1; i <= quante; i++) {
      const t = i / (quante + 1)
      const x = da + (a - da) * t
      const salita = versoVetta ? t : 1 - t
      const y = 1 - salita * (0.85 + caso() * 0.1) + (caso() - 0.5) * 0.12
      punti.push([x, Math.min(1, Math.max(0.08, y))])
    }
  }
  spalle(0, vetta, true)
  punti.push([vetta, 0])
  spalle(vetta, 1, false)
  punti.push([1, 1])
  return punti
}

/** Dove sta il bordo della neve: fino a questa frazione dell'altezza, dall'alto. D'inverno scende di più. */
export function lineaNeve(m: Montagna): number {
  if (!m.neve) return 0
  const alta = 0.18 + Math.max(0, Math.min(1, ((m.dislivello ?? 0) - NEVE) / 1300)) * 0.17
  return m.stagione === 'inverno' ? Math.max(alta, 0.42) : alta
}

/**
 * Un crinale lontano dello sfondo: `punti` quote in [0, 1], morbide e sempre
 * uguali per lo stesso seme. Fa da quinta dietro le cime, anche quando sono poche.
 */
export function crinale(semeCrinale: number, punti: number): number[] {
  const caso = generatore(semeCrinale)
  const nodi = Array.from({ length: Math.ceil(punti / 4) + 2 }, () => caso())
  return Array.from({ length: punti }, (_, i) => {
    const t = i / 4
    const k = Math.floor(t)
    const f = t - k
    const liscia = f * f * (3 - 2 * f)
    const v = nodi[k] + (nodi[k + 1] - nodi[k]) * liscia
    return Math.min(1, Math.max(0, v * 0.85 + caso() * 0.15))
  })
}

/** Quanto dura la salita di una cima nuova: la stessa durata di `animate-sorge` in index.css. */
export const DURATA_SORGE = 900
/** Tutta la sequenza non va oltre: con tante cime nuove i tempi si stringono. */
const SEQUENZA_MASSIMA = 8000

/**
 * Ogni quanto parte la cima nuova successiva, in ordine di giro: quando la
 * precedente è all'80% della salita, o prima se sono tante.
 */
export function passoComparsa(quante: number): number {
  if (quante <= 1) return 0
  return Math.min(DURATA_SORGE * 0.8, SEQUENZA_MASSIMA / (quante - 1))
}

/**
 * Dove guarda l'inquadratura al tempo `t` della sequenza: segue le cime nuove
 * mentre sorgono, scivolando morbida dall'una all'altra; `centri` sono i loro
 * centri in ordine di giro.
 */
export function puntoDiVista(centri: readonly number[], passo: number, t: number): number {
  if (centri.length === 0) return 0
  if (passo <= 0 || centri.length === 1) return centri[centri.length - 1]
  const p = Math.max(0, Math.min(centri.length - 1, t / passo))
  const i = Math.floor(p)
  if (i >= centri.length - 1) return centri[centri.length - 1]
  const f = p - i
  const liscia = f * f * (3 - 2 * f)
  return centri[i] + (centri[i + 1] - centri[i]) * liscia
}
