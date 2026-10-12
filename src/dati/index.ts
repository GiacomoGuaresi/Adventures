// Punto d'ingresso dei dati: un solo client Supabase, sullo schema `adventures`
// del progetto di produzione di Grocery (docs/03-architettura.md).

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { AccessoSupabase, type Accesso } from './accesso'
import { ImpostazioniSupabase } from './impostazioni'
import { LinkMappeSupabase, type AperturaLink } from './linkMappe'
import { PhotonLuoghi, type RicercaLuoghi } from './luoghi'
import { fetchPaziente } from './orologio'
import { OpenRouteService, type CalcoloPercorsi } from './percorsi'
import { AttivitaSupabase } from './attivita'

export type { Accesso, EsitoAccesso } from './accesso'
export type { ImpostazioniSupabase } from './impostazioni'
export type { AperturaLink } from './linkMappe'
export type { RicercaLuoghi } from './luoghi'
export type { CalcoloPercorsi } from './percorsi'
export type { AttivitaSupabase } from './attivita'

let connessione: {
  accesso: Accesso
  attivita: AttivitaSupabase
  impostazioni: ImpostazioniSupabase
  linkMappe: AperturaLink
} | null = null

/**
 * Il client è uno solo: accesso e query condividono la sessione.
 *
 * La sessione sta nei cookie con percorso `/`: Grocery e Projects stanno sulla
 * stessa origine e sullo stesso progetto Supabase, quindi con lo stesso percorso
 * le tre app condividono la sessione (docs/04-sicurezza.md).
 */
function connetti() {
  if (connessione) return connessione
  const url = import.meta.env.VITE_SUPABASE_URL
  const chiave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const email = import.meta.env.VITE_SUPABASE_EMAIL
  if (!url || !chiave || !email) {
    throw new Error(
      'Mancano VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY o VITE_SUPABASE_EMAIL: vedi .env.example',
    )
  }
  const client = createBrowserClient(url, chiave, {
    cookieOptions: { path: '/' },
    global: { fetch: fetchPaziente() },
    db: { schema: 'adventures' },
  }) as unknown as SupabaseClient
  connessione = {
    accesso: new AccessoSupabase(client, email),
    attivita: new AttivitaSupabase(client),
    impostazioni: new ImpostazioniSupabase(client),
    linkMappe: new LinkMappeSupabase(client),
  }
  return connessione
}

/** Chi può entrare: serve la sessione aperta dalla passphrase. */
export function accesso(): Accesso {
  return connetti().accesso
}

/** Le query sui trekking. */
export function attivita(): AttivitaSupabase {
  return connetti().attivita
}

/** Le impostazioni: per ora la sola posizione di casa. */
export function impostazioni(): ImpostazioniSupabase {
  return connetti().impostazioni
}

/** I link brevi di Google Maps, aperti dalla Edge Function con la sessione. */
export function linkMappe(): AperturaLink {
  return connetti().linkMappe
}

const ricercaLuoghi = new PhotonLuoghi()

/** La ricerca dei luoghi per nome: Photon, senza chiave e senza sessione. */
export function luoghi(): RicercaLuoghi {
  return ricercaLuoghi
}

const chiavePercorsi = import.meta.env.VITE_OPENROUTESERVICE_KEY
const calcoloPercorsi = chiavePercorsi ? new OpenRouteService(chiavePercorsi) : null

/**
 * Il tempo di viaggio automatico: openrouteservice, se la chiave c'è. Senza
 * chiave è `null` e il tempo si scrive solo a mano, come prima dello step 15.
 */
export function percorsi(): CalcoloPercorsi | null {
  return calcoloPercorsi
}
