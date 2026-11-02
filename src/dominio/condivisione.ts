/**
 * Quello che arriva da "Condividi" sul telefono (docs/02-funzionalita.md): con
 * la PWA installata su Android, il menu apre l'app con titolo, testo e link
 * nell'URL. Diventa il form di un'attività nuova già in parte scritto.
 */

import { riferimentoKomoot } from './komoot'
import { pulisciLink } from './link'

/** Nome e link del form dal testo condiviso. */
export function daCondivisione(testo: string): { nome: string; link: string[] } {
  const scritto = testo.trim()
  // Un link di Komoot va nel nome: il form lo riconosce e legge il giro.
  if (riferimentoKomoot(scritto)) return { nome: scritto, link: [] }
  const link = pulisciLink((scritto.match(/https?:\/\/\S+/g) ?? []).join('\n'))
  // Gli altri link vanno fra i link; senza link il testo è il nome.
  return link.length > 0 ? { nome: '', link } : { nome: scritto, link: [] }
}

/** Il link aggiunto in fondo, senza doppioni né righe vuote; almeno un campo. */
export function conLink(prima: readonly string[], nuovo: string): string[] {
  const link = pulisciLink([...prima, nuovo].join('\n'))
  return link.length > 0 ? link : ['']
}
