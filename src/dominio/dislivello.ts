/**
 * Il dislivello del trekking (docs/02-funzionalita.md): metri di salita, intero
 * positivo e facoltativo. Si scrive a mano, o arriva da un link di Komoot
 * (`komoot.ts`).
 */

/** Il numero scritto nel campo; vuoto o storto vuol dire "niente dislivello". */
export function pulisciDislivello(testo: string): number | null {
  const scritto = testo.trim()
  if (scritto === '') return null
  const metri = Number(scritto)
  if (!Number.isInteger(metri) || metri <= 0) return null
  return metri
}

/** Vale se il campo è vuoto o contiene un numero buono: se è storto il salvataggio si ferma. */
export function dislivelloValido(testo: string): boolean {
  return testo.trim() === '' || pulisciDislivello(testo) !== null
}

/** Quello che si scrive nel campo partendo dal valore salvato. */
export function testoDislivello(dislivello: number | null): string {
  return dislivello === null ? '' : String(dislivello)
}
