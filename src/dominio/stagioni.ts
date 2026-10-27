/**
 * Le stagioni (docs/02-funzionalita.md): di un giro fatto, dal mese, e di
 * un'avventura, quando ha senso farla. Un'avventura senza stagioni va bene
 * sempre, come una che le ha tutte e quattro.
 */

import type { Attivita } from './tipi'

export type Stagione = 'primavera' | 'estate' | 'autunno' | 'inverno'

/** Nell'ordine dell'anno che si usa nelle scelte, dalla primavera. */
export const STAGIONI: readonly Stagione[] = ['primavera', 'estate', 'autunno', 'inverno']

export const NOMI_STAGIONI: Record<Stagione, string> = {
  primavera: 'Primavera',
  estate: 'Estate',
  autunno: 'Autunno',
  inverno: 'Inverno',
}

/** Le stagioni a mesi interi, gennaio primo: dicembre è già inverno. */
const PER_MESE: readonly Stagione[] = ['inverno', 'inverno', 'primavera', 'primavera', 'primavera', 'estate', 'estate', 'estate', 'autunno', 'autunno', 'autunno', 'inverno']

/** La stagione del giorno `AAAA-MM-GG`; senza data è estate, la stagione dei trekking. */
export function stagioneDi(data: string | null): Stagione {
  return data === null ? 'estate' : PER_MESE[Number(data.slice(5, 7)) - 1]
}

/** La stagione di oggi: quella scelta all'apertura nel filtro. */
export function stagioneCorrente(adesso = new Date()): Stagione {
  return PER_MESE[adesso.getMonth()]
}

/**
 * Se un'attività va bene nella stagione scelta: senza scelta tutte; i trekking
 * non hanno stagioni e passano sempre; un'avventura senza stagioni va bene
 * tutto l'anno.
 */
export function nellaStagione(a: Pick<Attivita, 'stagioni'>, scelta: Stagione | null): boolean {
  return scelta === null || a.stagioni.length === 0 || a.stagioni.includes(scelta)
}

/** Le stagioni in ordine e senza doppioni, come si salvano. */
export function pulisciStagioni(scelte: readonly Stagione[]): Stagione[] {
  return STAGIONI.filter((s) => scelte.includes(s))
}

/** Come si leggono nei dettagli: "Tutto l'anno" con nessuna o con tutte, altrimenti "Primavera ed estate". */
export function testoStagioni(stagioni: readonly Stagione[]): string {
  const ordinate = pulisciStagioni(stagioni)
  if (ordinate.length === 0 || ordinate.length === 4) return "Tutto l'anno"
  const nomi = ordinate.map((s, i) => (i === 0 ? NOMI_STAGIONI[s] : NOMI_STAGIONI[s].toLowerCase()))
  if (nomi.length === 1) return nomi[0]
  const ultima = nomi[nomi.length - 1]
  return `${nomi.slice(0, -1).join(', ')} ${ultima.startsWith('e') ? 'ed' : 'e'} ${ultima}`
}
