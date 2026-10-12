/** Cosa si salva (docs/02-funzionalita.md): un trekking, con i suoi numeri, o
 *  un'avventura, qualunque altra cosa da fare fuori casa. */
export type Tipo = 'trekking' | 'avventura'

/** Le righe di `adventures.attivita` (docs/08-modello-dati.md). Le colonne
 *  arrivano con gli step della roadmap che le usano: per ora il tipo, il nome,
 *  i link, le note, il dislivello, la durata, il luogo, il tempo di viaggio e
 *  il segno "completato". */
export interface Attivita {
  id: string
  tipo: Tipo
  nome: string
  link: string[]
  note: string | null
  /** Metri di salita, intero positivo; `null` quando non si sa, e sempre per le avventure. */
  dislivello: number | null
  /** Ore di andata e ritorno, a passi di mezz'ora; `null` quando non si sa, e sempre per le avventure. */
  durata_ore: number | null
  /** Il nome del luogo; vuoto quando il luogo è stato messo come coordinate. */
  luogo_nome: string | null
  /** Le coordinate: o ci sono tutte e due o non c'è il punto. */
  lat: number | null
  lon: number | null
  /** Minuti in auto da casa; `null` finché non si sa. */
  viaggio_minuti: number | null
  /** `true` se il tempo è stato scritto a mano: il ricalcolo non lo tocca. */
  viaggio_manuale: boolean
  completato: boolean
  creato_il: string
  modificato_il: string
}

/** Quello che si scrive nel form: le colonne che l'app salva (docs/02-funzionalita.md). */
export interface CampiAttivita {
  tipo: Tipo
  nome: string
  link: string[]
  /** Markdown; vuoto vuol dire `null`. */
  note: string | null
  dislivello: number | null
  durata_ore: number | null
  luogo_nome: string | null
  lat: number | null
  lon: number | null
  viaggio_minuti: number | null
  viaggio_manuale: boolean
}
