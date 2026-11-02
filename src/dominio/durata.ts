/**
 * La durata del trekking (docs/02-funzionalita.md): ore di andata e ritorno, a
 * passi di mezz'ora (3.5 = 3 ore e 30 minuti), facoltativa. Non si calcola: si
 * scrive a mano, in ore e minuti, o arriva da un link di Komoot (`komoot.ts`).
 */

import { pulisciTempo, testoTempo, type TestoTempo } from './tempo'

/** Le ore scritte nei campi; vuote o storte vogliono dire "niente durata". */
export function pulisciDurata(tempo: TestoTempo): number | null {
  const minuti = pulisciTempo(tempo)
  if (minuti === null || minuti <= 0 || minuti % 30 !== 0) return null
  return minuti / 60
}

/** Vale se i campi sono vuoti o contengono una durata buona: se è storta il salvataggio si ferma. */
export function durataValida(tempo: TestoTempo): boolean {
  return (tempo.ore.trim() === '' && tempo.minuti.trim() === '') || pulisciDurata(tempo) !== null
}

/** Quello che si scrive nei campi partendo dal valore salvato. */
export function testoDurata(durata: number | null): TestoTempo {
  return testoTempo(durata === null ? null : Math.round(durata * 60))
}

/** Come si legge nell'elenco: `3.5` diventa "3 h 30". */
export function formattaDurata(durata: number | null): string {
  if (durata === null) return '—'
  const ore = Math.floor(durata)
  const minuti = Math.round((durata - ore) * 60)
  if (minuti === 0) return `${ore} h`
  if (ore === 0) return `${minuti} min`
  return `${ore} h ${minuti}`
}
