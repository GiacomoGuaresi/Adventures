/**
 * I filtri dell'elenco (docs/02-funzionalita.md). Un trekking a cui **manca il
 * dato** su cui si filtra resta visibile: i filtri nascondono solo chi ha un
 * valore fuori dall'intervallo. Gli altri filtri si aggiungono qui con gli step
 * della roadmap.
 */

import type { Coordinate } from './coordinate'
import { distanzaDaCasa } from './distanza'
import type { Attivita, Tipo } from './tipi'
import { formattaDurata } from './durata'
import { formattaViaggio } from './viaggio'

export interface Intervallo {
  min: number | null
  max: number | null
}

export interface Filtri {
  dislivello: Intervallo
  durata: Intervallo
  /** Chilometri in linea d'aria da casa: si usa il solo massimo. */
  distanza: Intervallo
  /** Minuti in auto da casa: si usa il solo massimo. */
  viaggio: Intervallo
}

export const FILTRI_VUOTI: Filtri = {
  dislivello: { min: null, max: null },
  durata: { min: null, max: null },
  distanza: { min: null, max: null },
  viaggio: { min: null, max: null },
}

/** Il numero scritto in un campo del filtro: vuoto o storto vuol dire "nessun limite". */
export function limite(testo: string): number | null {
  const scritto = testo.trim()
  if (scritto === '') return null
  const numero = Number(scritto)
  if (!Number.isFinite(numero) || numero < 0) return null
  return numero
}

/** Quello che si scrive in un campo del filtro partendo dal limite. */
export function testoLimite(valore: number | null): string {
  return valore === null ? '' : String(valore)
}

export type ChiaveFiltro = keyof Filtri

/** L'ordine in cui compaiono nel pannello e fra i filtri attivi. */
export const CHIAVI_FILTRI: readonly ChiaveFiltro[] = ['dislivello', 'durata', 'distanza', 'viaggio']

/**
 * I filtri che hanno senso per ogni tipo: un'avventura non ha dislivello né
 * durata, quindi si sceglie solo per quanto è lontana.
 */
export const CHIAVI_PER_TIPO: Record<Tipo, readonly ChiaveFiltro[]> = {
  trekking: CHIAVI_FILTRI,
  avventura: ['distanza', 'viaggio'],
}

/** I filtri con accese solo le chiavi date: le altre non contano e non si vedono. */
export function soloChiavi(filtri: Filtri, chiavi: readonly ChiaveFiltro[]): Filtri {
  const solo = { ...FILTRI_VUOTI }
  for (const chiave of chiavi) solo[chiave] = filtri[chiave]
  return solo
}

/** Riporta in `filtri` le chiavi date di `nuovi`, lasciando le altre come stavano. */
export function conChiavi(filtri: Filtri, nuovi: Filtri, chiavi: readonly ChiaveFiltro[]): Filtri {
  const uniti = { ...filtri }
  for (const chiave of chiavi) uniti[chiave] = nuovi[chiave]
  return uniti
}

export const NOMI_FILTRI: Record<ChiaveFiltro, string> = {
  dislivello: 'Dislivello',
  durata: 'Durata',
  distanza: 'Distanza da casa',
  viaggio: 'Viaggio',
}

/** Un filtro è acceso se ha almeno un limite. */
export function acceso({ min, max }: Intervallo): boolean {
  return min !== null || max !== null
}

/** Quanti filtri sono accesi: il pulsante dei filtri lo mostra. "500–1000 m" conta uno. */
export function quantiFiltri(filtri: Filtri): number {
  return CHIAVI_FILTRI.filter((chiave) => acceso(filtri[chiave])).length
}

export function stessoIntervallo(a: Intervallo, b: Intervallo): boolean {
  return a.min === b.min && a.max === b.max
}

const numero = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 })

/** Un intervallo da leggere: "500–1000 m", "≤ 3 h 30", "≥ 1500 m", "≤ 1 h 30"; `null` se è spento. */
export function testoIntervallo(chiave: ChiaveFiltro, { min, max }: Intervallo): string | null {
  if (min === null && max === null) return null
  if (chiave === 'durata' || chiave === 'viaggio') {
    const formatta = chiave === 'durata' ? formattaDurata : formattaViaggio
    if (min === null) return `≤ ${formatta(max)}`
    if (max === null) return `≥ ${formatta(min)}`
    return `${formatta(min)} – ${formatta(max)}`
  }
  const unita = { dislivello: 'm', distanza: 'km' }[chiave]
  if (min === null) return `≤ ${numero.format(max as number)} ${unita}`
  if (max === null) return `≥ ${numero.format(min)} ${unita}`
  return `${numero.format(min)}–${numero.format(max)} ${unita}`
}

/**
 * Le scelte rapide del pannello, da toccare invece di scrivere. Distanza e
 * viaggio hanno solo il massimo: conta quanto lontano si è disposti ad andare.
 */
export const SCORCIATOIE: Record<ChiaveFiltro, readonly Intervallo[]> = {
  dislivello: [
    { min: null, max: 500 },
    { min: 500, max: 1000 },
    { min: 1000, max: 1500 },
    { min: 1500, max: null },
  ],
  durata: [
    { min: null, max: 3 },
    { min: 3, max: 5 },
    { min: 5, max: 7 },
    { min: 7, max: null },
  ],
  distanza: [
    { min: null, max: 25 },
    { min: null, max: 50 },
    { min: null, max: 100 },
    { min: null, max: 150 },
  ],
  viaggio: [
    { min: null, max: 30 },
    { min: null, max: 60 },
    { min: null, max: 90 },
    { min: null, max: 120 },
  ],
}

/** Se l'intervallo è stato scritto a mano: allora il pannello mostra i campi da / a. */
export function personalizzato(chiave: ChiaveFiltro, intervallo: Intervallo): boolean {
  return acceso(intervallo) && !SCORCIATOIE[chiave].some((s) => stessoIntervallo(s, intervallo))
}

/** Se il valore sta nell'intervallo; chi non ha il dato passa sempre. */
export function dentro(valore: number | null, { min, max }: Intervallo): boolean {
  if (valore === null) return true
  if (min !== null && valore < min) return false
  if (max !== null && valore > max) return false
  return true
}

/** La distanza non è una colonna: si calcola qui, con la posizione di casa. */
export function filtra(elenco: readonly Attivita[], filtri: Filtri, casa: Coordinate | null = null): Attivita[] {
  return elenco.filter(
    (t) =>
      dentro(t.dislivello, filtri.dislivello) &&
      dentro(t.durata_ore, filtri.durata) &&
      dentro(distanzaDaCasa(t, casa), filtri.distanza) &&
      dentro(t.viaggio_minuti, filtri.viaggio),
  )
}
