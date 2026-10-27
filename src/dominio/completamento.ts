/**
 * Il completamento di un'attività (docs/02-funzionalita.md): il giorno del giro
 * e, per i trekking, i numeri veri presi da Garmin o Komoot. Sono tutti
 * facoltativi: dove mancano valgono quelli previsti della scheda.
 */

import type { Attivita } from './tipi'

/** La quota più alta della Terra: oltre, il numero è sbagliato. */
export const EVEREST = 8849

/** Il giorno di oggi come lo salva il database, `AAAA-MM-GG`, nell'ora di casa. */
export function oggi(adesso = new Date()): string {
  const due = (n: number) => String(n).padStart(2, '0')
  return `${adesso.getFullYear()}-${due(adesso.getMonth() + 1)}-${due(adesso.getDate())}`
}

/** Vale se è un giorno vero e non nel futuro. */
export function dataValida(data: string, adesso = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
  const giorno = new Date(`${data}T00:00:00`)
  return !Number.isNaN(giorno.getTime()) && data <= oggi(adesso)
}

/** I km scritti nel campo, con la virgola o col punto, a un decimale; vuoto o storto vuol dire `null`. */
export function pulisciKm(testo: string): number | null {
  const scritto = testo.trim().replace(',', '.')
  if (!/^\d+(\.\d*)?$/.test(scritto)) return null
  const km = Math.round(Number(scritto) * 10) / 10
  return km > 0 && km < 10000 ? km : null
}

export function kmValidi(testo: string): boolean {
  return testo.trim() === '' || pulisciKm(testo) !== null
}

export function testoKm(km: number | null): string {
  return km === null ? '' : String(km).replace('.', ',')
}

/** La quota massima: metri interi, non oltre l'Everest. */
export function pulisciQuota(testo: string): number | null {
  const scritto = testo.trim()
  if (!/^\d+$/.test(scritto)) return null
  const metri = Number(scritto)
  return metri > 0 && metri <= EVEREST ? metri : null
}

export function quotaValida(testo: string): boolean {
  return testo.trim() === '' || pulisciQuota(testo) !== null
}

/** Il dislivello che conta per i premi: quello vero, o il previsto se il vero manca. */
export function dislivelloFatto(a: Attivita): number | null {
  return a.fatto_dislivello ?? a.dislivello
}

/** La durata che conta, in minuti: quella vera, o la prevista. */
export function minutiFatti(a: Attivita): number | null {
  if (a.fatto_durata_minuti !== null) return a.fatto_durata_minuti
  return a.durata_ore === null ? null : Math.round(a.durata_ore * 60)
}

/** "1.240 m", "12,5 km": i numeri come si leggono in Italia, col punto anche sulle migliaia. */
const intero = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0, useGrouping: 'always' })
const decimale = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1, useGrouping: 'always' })

export function metri(n: number): string {
  return `${intero.format(n)} m`
}

export function km(n: number): string {
  return `${decimale.format(n)} km`
}

/** I minuti come ore: 347 diventa "5 h 47". */
export function ore(minuti: number): string {
  const h = Math.floor(minuti / 60)
  const m = minuti % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

const lunga = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

/** "12 ottobre 2026". */
export function giorno(data: string): string {
  return lunga.format(new Date(`${data}T00:00:00`))
}
