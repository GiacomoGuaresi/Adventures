// I giri di Komoot (docs/03-architettura.md): il browser non può scaricarne la
// pagina, quindi la legge la Edge Function `adventures-komoot`, con la sessione
// di chi è dentro. I numeri che tornano diventano i campi nel dominio.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { TourKomoot } from '../dominio/komoot'

export interface LetturaKomoot {
  /** I numeri del giro nel link; lancia se non si riesce a leggerlo. */
  leggi(link: string): Promise<TourKomoot>
}

export class KomootSupabase implements LetturaKomoot {
  constructor(private readonly client: SupabaseClient) {}

  async leggi(link: string): Promise<TourKomoot> {
    const { data, error } = await this.client.functions.invoke<TourKomoot>('adventures-komoot', {
      body: { url: link.trim() },
    })
    if (error) throw new Error(`Komoot non letto: ${error.message}`)
    if (typeof data?.nome !== 'string') throw new Error('Komoot non letto: risposta senza giro')
    return data
  }
}
