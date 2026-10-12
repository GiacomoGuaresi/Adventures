/**
 * Le piccole modifiche all'elenco già in mano, senza rileggere tutto dal
 * database: l'app resta reattiva anche con la rete lenta.
 */

import type { Attivita, Tipo } from './tipi'

/** Rimette al suo posto il trekking cambiato, lasciando l'ordine com'è. */
export function sostituisci(elenco: readonly Attivita[], cambiato: Attivita): Attivita[] {
  return elenco.map((t) => (t.id === cambiato.id ? cambiato : t))
}

/** Toglie il trekking eliminato. */
export function rimuovi(elenco: readonly Attivita[], id: string): Attivita[] {
  return elenco.filter((t) => t.id !== id)
}

/**
 * Quelli da mostrare: i completati spariscono, a meno che non si accenda
 * "Mostra completati" (docs/02-funzionalita.md).
 */
export function visibili(elenco: readonly Attivita[], mostraCompletati: boolean): Attivita[] {
  return mostraCompletati ? [...elenco] : elenco.filter((t) => !t.completato)
}

/** Quanti sono nascosti perché completati: l'interruttore lo dice. */
export function quantiCompletati(elenco: readonly Attivita[]): number {
  return elenco.filter((t) => t.completato).length
}

/** Solo i trekking o solo le avventure: ognuno ha il suo elenco (docs/09-interfaccia.md). */
export function delTipo(elenco: readonly Attivita[], tipo: Tipo): Attivita[] {
  return elenco.filter((t) => t.tipo === tipo)
}
