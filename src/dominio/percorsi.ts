/**
 * Il tempo di viaggio automatico (docs/02-funzionalita.md, step 15 e 16): si
 * chiede a openrouteservice il percorso in auto da casa. Qui c'è la parte pura:
 * chi va calcolato e come si legge una risposta.
 */

import type { Coordinate } from './coordinate'
import type { Attivita } from './tipi'

/**
 * Come è andata una richiesta:
 * - `minuti`: il tempo c'è e si salva;
 * - `impossibile`: il percorso non esiste, il luogo si toglie dal trekking;
 * - `irraggiungibile`: rete, server o quota; il luogo resta e si riprova più tardi.
 */
export type EsitoPercorso = { esito: 'minuti'; minuti: number } | { esito: 'impossibile' } | { esito: 'irraggiungibile' }

/**
 * Chi aspetta il tempo (docs/08-modello-dati.md): con le coordinate, senza
 * tempo e non scritto a mano.
 */
export function daCalcolare(attivita: Attivita): boolean {
  return attivita.lat !== null && attivita.lon !== null && attivita.viaggio_minuti === null && !attivita.viaggio_manuale
}

/** I tempi mancanti, completati compresi: anche loro compaiono con "Mostra completati". */
export function mancanti(elenco: readonly Attivita[]): Attivita[] {
  return elenco.filter(daCalcolare)
}

/**
 * Gli errori di openrouteservice che vogliono dire "questo percorso non c'è":
 * 2004 distanza oltre il limite, 2009 percorso non trovato, 2010 nessuna strada
 * vicino a un punto. Tutto il resto (chiave, quota, server) si riprova.
 */
const PERCORSO_IMPOSSIBILE = new Set([2004, 2009, 2010])

/** Legge la risposta di `/v2/directions/driving-car/json`. */
export function daOpenRouteService(stato: number, risposta: unknown): EsitoPercorso {
  if (stato >= 200 && stato < 300) {
    const percorso = (risposta as { routes?: { summary?: { duration?: unknown } }[] })?.routes?.[0]
    if (!percorso) return { esito: 'impossibile' }
    // Con partenza e arrivo sulla stessa strada il riassunto non ha la durata.
    const secondi = percorso.summary?.duration ?? 0
    if (typeof secondi !== 'number' || !Number.isFinite(secondi) || secondi < 0) return { esito: 'irraggiungibile' }
    return { esito: 'minuti', minuti: Math.round(secondi / 60) }
  }
  const codice = (risposta as { error?: { code?: unknown } })?.error?.code
  if (stato < 500 && typeof codice === 'number' && PERCORSO_IMPOSSIBILE.has(codice)) return { esito: 'impossibile' }
  return { esito: 'irraggiungibile' }
}

/**
 * Legge la risposta di `/v2/snap/driving-car/json` per un punto solo: la
 * strada più vicina, `null` se entro il raggio non ce n'è nessuna, oppure
 * `irraggiungibile` se il servizio non ha risposto bene.
 */
export function daSnap(stato: number, risposta: unknown): Coordinate | null | 'irraggiungibile' {
  if (stato < 200 || stato >= 300) return 'irraggiungibile'
  const punti = (risposta as { locations?: unknown })?.locations
  if (!Array.isArray(punti) || punti.length === 0) return 'irraggiungibile'
  const punto = (punti[0] as { location?: unknown } | null)?.location
  if (punto === undefined) return null
  if (!Array.isArray(punto) || typeof punto[0] !== 'number' || typeof punto[1] !== 'number') return 'irraggiungibile'
  return { lat: punto[1], lon: punto[0] }
}
