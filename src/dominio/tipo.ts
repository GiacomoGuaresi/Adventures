/**
 * I due tipi di attività (docs/02-funzionalita.md) e come si chiamano
 * nell'interfaccia: trekking è maschile e avventura femminile, quindi le frasi
 * si scrivono intere invece di comporle.
 */

import type { Tipo } from './tipi'

/** Nell'ordine in cui compaiono nel menu e nelle scelte. */
export const TIPI: readonly Tipo[] = ['trekking', 'avventura']

interface Testi {
  /** Sulla scelta del tipo nel form. */
  nome: string
  /** La voce di menu e il titolo dell'elenco. */
  elenco: string
  nuovo: string
  modifica: string
  elimina: string
  completato: string
  nessuno: string
  /** L'inizio dell'avviso dei doppioni: segue "che si chiama …". */
  esisteGia: string
  /** L'esempio nel campo del nome. */
  esempioNome: string
  esempioLink: string
}

export const TESTI: Record<Tipo, Testi> = {
  trekking: {
    nome: 'Trekking',
    elenco: 'Trekking',
    nuovo: 'Nuovo trekking',
    modifica: 'Modifica trekking',
    elimina: 'Elimina trekking',
    completato: 'Trekking completato',
    nessuno: 'Nessun trekking',
    esisteGia: 'Esiste già un trekking',
    esempioNome: 'Pizzo Coca',
    esempioLink: 'https://www.komoot.com/tour/...',
  },
  avventura: {
    nome: 'Avventura',
    elenco: 'Avventure',
    nuovo: 'Nuova avventura',
    modifica: 'Modifica avventura',
    elimina: 'Elimina avventura',
    completato: 'Avventura completata',
    nessuno: 'Nessuna avventura',
    esisteGia: "Esiste già un'avventura",
    esempioNome: 'Fare rafting',
    esempioLink: 'https://...',
  },
}
