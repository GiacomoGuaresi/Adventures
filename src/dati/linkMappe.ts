// I link brevi di Google Maps (docs/03-architettura.md): il browser non vede
// dove portano, quindi li apre la Edge Function `adventures-link-mappe`, con la
// sessione di chi è dentro. Il link lungo che torna si legge nel dominio.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface AperturaLink {
  /** Il link lungo a cui porta un link breve; lancia se non si riesce ad aprirlo. */
  apri(breve: string): Promise<string>
}

export class LinkMappeSupabase implements AperturaLink {
  constructor(private readonly client: SupabaseClient) {}

  async apri(breve: string): Promise<string> {
    const { data, error } = await this.client.functions.invoke<{ url?: unknown }>('adventures-link-mappe', {
      body: { url: breve.trim() },
    })
    if (error) throw new Error(`Link non aperto: ${error.message}`)
    if (typeof data?.url !== 'string') throw new Error('Link non aperto: risposta senza link')
    return data.url
  }
}
