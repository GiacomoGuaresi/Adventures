/**
 * Le attività completate in ordine di giro (docs/02-funzionalita.md): prima
 * quelle senza data, completate prima che l'app la chiedesse ("prima di
 * Adventures"), poi le altre dal giorno più vecchio. A parità decide quando
 * sono state aggiunte, così l'ordine non cambia da un'apertura all'altra.
 */

import type { Attivita, Tipo } from './tipi'

export function completate(attivita: readonly Attivita[], tipo?: Tipo): Attivita[] {
  return attivita
    .filter((a) => a.completato && (tipo === undefined || a.tipo === tipo))
    .sort((a, b) => {
      if (a.completato_il !== b.completato_il) {
        if (a.completato_il === null) return -1
        if (b.completato_il === null) return 1
        return a.completato_il < b.completato_il ? -1 : 1
      }
      if (a.creato_il !== b.creato_il) return a.creato_il < b.creato_il ? -1 : 1
      return a.id < b.id ? -1 : 1
    })
}

/** L'anno del giro; `null` per quelli senza data. */
export function anno(a: Attivita): number | null {
  return a.completato_il === null ? null : Number(a.completato_il.slice(0, 4))
}
