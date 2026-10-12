// Le impostazioni dell'app, tabella `adventures.impostazioni` (docs/08-modello-dati.md):
// una riga sola, con la posizione di casa inserita a mano dal SQL Editor.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Coordinate } from '../dominio/coordinate'
import { fallita } from './errore'

export class ImpostazioniSupabase {
  constructor(private readonly client: SupabaseClient) {}

  /** La posizione di casa; `null` se non è ancora stata inserita. */
  async casa(): Promise<Coordinate | null> {
    const { data, error } = await this.client.from('impostazioni').select('casa_lat, casa_lon').maybeSingle()
    if (error) throw fallita('Posizione di casa non letta', error)
    if (!data || data.casa_lat === null || data.casa_lon === null) return null
    return { lat: data.casa_lat, lon: data.casa_lon }
  }
}
