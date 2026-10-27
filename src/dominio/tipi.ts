import type { Stagione } from './stagioni'

/** Cosa si salva (docs/02-funzionalita.md): un trekking, con i suoi numeri, o
 *  un'avventura, qualunque altra cosa da fare fuori casa. */
export type Tipo = 'trekking' | 'avventura'

/** Le righe di `adventures.attivita` (docs/08-modello-dati.md). Le colonne
 *  arrivano con gli step della roadmap che le usano: per ora il tipo, il nome,
 *  i link, le note, il dislivello, la durata, il luogo, il tempo di viaggio, il
 *  segno "completato" e i numeri veri del giro. */
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
  /** Quando ha senso farla: solo avventure; vuoto vuol dire tutto l'anno. */
  stagioni: Stagione[]
  completato: boolean
  /** Il giorno del giro, `AAAA-MM-GG`; `null` per i completati di prima che si chiedesse. */
  completato_il: string | null
  /** I numeri veri del giro, da Garmin o Komoot: solo trekking completati, tutti facoltativi. */
  fatto_dislivello: number | null
  fatto_km: number | null
  fatto_quota_max: number | null
  fatto_durata_minuti: number | null
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
  /** Sempre vuoto per i trekking. */
  stagioni: Stagione[]
}

/** Quello che si scrive quando si segna il completato (docs/02-funzionalita.md). */
export interface DatiCompletamento {
  completato_il: string
  fatto_dislivello: number | null
  fatto_km: number | null
  fatto_quota_max: number | null
  fatto_durata_minuti: number | null
  /** La relazione: le note della scheda, sistemate col giro fatto davvero. */
  note: string | null
}
