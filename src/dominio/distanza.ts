/**
 * La distanza in linea d'aria da casa (docs/03-architettura.md): si calcola nel
 * browser con la formula dell'emisenoverso (haversine), non si salva.
 */

import type { Coordinate } from './coordinate'

/** Il raggio medio della Terra, in chilometri. */
const RAGGIO = 6371

function inRadianti(gradi: number): number {
  return (gradi * Math.PI) / 180
}

/** I chilometri in linea d'aria fra due punti. */
export function distanza(da: Coordinate, a: Coordinate): number {
  const dLat = inRadianti(a.lat - da.lat)
  const dLon = inRadianti(a.lon - da.lon)
  const seno =
    Math.sin(dLat / 2) ** 2 + Math.cos(inRadianti(da.lat)) * Math.cos(inRadianti(a.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * RAGGIO * Math.asin(Math.min(1, Math.sqrt(seno)))
}

/** La distanza da casa di un trekking: `null` se manca il luogo o la posizione di casa. */
export function distanzaDaCasa(
  attivita: { lat: number | null; lon: number | null },
  casa: Coordinate | null,
): number | null {
  if (casa === null || attivita.lat === null || attivita.lon === null) return null
  return distanza(casa, { lat: attivita.lat, lon: attivita.lon })
}

/** Come si legge nell'elenco: i decimali solo quando è vicino. */
export function formattaDistanza(km: number | null): string {
  if (km === null) return '—'
  return km < 10 ? `${km.toFixed(1).replace('.', ',')} km` : `${Math.round(km)} km`
}
