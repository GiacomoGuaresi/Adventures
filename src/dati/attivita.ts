// Le query su trekking e avventure, tabella `adventures.attivita` (docs/08-modello-dati.md).
// Le colonne arrivano con gli step della roadmap: ricerca, ordinamento e filtri
// stanno nel browser, qui si leggono e si scrivono le righe.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { CampiAttivita, Attivita, DatiCompletamento } from '../dominio/tipi'
import { fallita } from './errore'

export class AttivitaSupabase {
  constructor(private readonly client: SupabaseClient) {}

  /** Tutte le attività, dalla più recente: ricerca, ordinamento e filtri li fa il browser. */
  async elenco(): Promise<Attivita[]> {
    const { data, error } = await this.client.from('attivita').select('*').order('creato_il', { ascending: false })
    if (error) throw fallita('Elenco non caricato', error)
    return data as Attivita[]
  }

  async crea(campi: CampiAttivita): Promise<Attivita> {
    const { data, error } = await this.client.from('attivita').insert(campi).select().single()
    if (error) throw fallita('Salvataggio non riuscito', error)
    return data as Attivita
  }

  /** Salva i campi del form; `modificato_il` lo aggiorna il trigger. */
  async aggiorna(id: string, campi: CampiAttivita): Promise<Attivita> {
    const { data, error } = await this.client.from('attivita').update(campi).eq('id', id).select().single()
    if (error) throw fallita('Modifica non salvata', error)
    return data as Attivita
  }

  /**
   * Segna il completato con la data, i numeri veri e la relazione, o lo toglie
   * (`null`) azzerando tutto quello che il completamento aveva scritto, note a
   * parte (docs/02-funzionalita.md): è reversibile.
   */
  async segnaCompletato(id: string, dati: DatiCompletamento | null): Promise<Attivita> {
    const campi = dati
      ? { completato: true, ...dati }
      : {
          completato: false,
          completato_il: null,
          fatto_dislivello: null,
          fatto_km: null,
          fatto_quota_max: null,
          fatto_durata_minuti: null,
        }
    const { data, error } = await this.client.from('attivita').update(campi).eq('id', id).select().single()
    if (error) throw fallita('Completato non cambiato', error)
    return data as Attivita
  }

  /**
   * Salva il tempo calcolato, solo se nel frattempo nessuno ne ha scritto uno a
   * mano o l'ha già calcolato: `null` se la riga non lo aspettava più.
   */
  async salvaViaggio(id: string, minuti: number): Promise<Attivita | null> {
    const { data, error } = await this.client
      .from('attivita')
      .update({ viaggio_minuti: minuti })
      .eq('id', id)
      .is('viaggio_minuti', null)
      .eq('viaggio_manuale', false)
      .select()
      .maybeSingle()
    if (error) throw fallita('Tempo di viaggio non salvato', error)
    return data as Attivita | null
  }

  /**
   * Toglie il luogo quando il percorso non esiste (docs/02-funzionalita.md): il
   * trekking esce dalla mappa e non si ricalcola più. Come sopra, solo se il
   * tempo era ancora da calcolare.
   */
  async togliLuogo(id: string): Promise<Attivita | null> {
    const { data, error } = await this.client
      .from('attivita')
      .update({ luogo_nome: null, lat: null, lon: null })
      .eq('id', id)
      .is('viaggio_minuti', null)
      .eq('viaggio_manuale', false)
      .select()
      .maybeSingle()
    if (error) throw fallita('Luogo non tolto', error)
    return data as Attivita | null
  }

  async elimina(id: string): Promise<void> {
    const { error } = await this.client.from('attivita').delete().eq('id', id)
    if (error) throw fallita('Eliminazione non riuscita', error)
  }
}
