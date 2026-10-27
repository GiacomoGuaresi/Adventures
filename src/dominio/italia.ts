/**
 * Dov'è l'Italia, per il traguardo "Oltre confine" (docs/02-funzionalita.md):
 * un contorno a grandi linee, giusto lungo le Alpi e largo in mare, con
 * Sicilia e Sardegna a parte. Sbaglia di qualche chilometro sul confine, mai
 * di un paese: Ticino, Val Poschiavo, Val Müstair, Istria e Corsica restano
 * fuori, San Marino e il Vaticano dentro.
 */

import type { Coordinate } from './coordinate'

/** [lat, lon], da Ventimiglia lungo le Alpi, poi l'Adriatico e il Tirreno. */
const PENISOLA: readonly [number, number][] = [
  [43.78, 7.53], [44.15, 7.56], [44.35, 6.9], [44.93, 6.72], [45.25, 6.93], [45.5, 7.05], [45.83, 6.86],
  [45.87, 7.17], [45.98, 7.66], [45.93, 7.87], [46.25, 8.1], [46.46, 8.44], [46.12, 8.71], [45.82, 9.03],
  [46.05, 9.17], [46.5, 9.33], [46.33, 9.52], [46.2, 10.1], [46.63, 10.13], [46.55, 10.45], [46.85, 10.47],
  [46.8, 10.8], [46.9, 11.1], [47.0, 11.5], [47.09, 12.2], [46.72, 12.45], [46.62, 13.0], [46.52, 13.71],
  [46.3, 13.45], [46.1, 13.62], [45.95, 13.63], [45.6, 13.85], [45.58, 13.75], [45.6, 13.6], [45.4, 13.0],
  [44.4, 12.6], [43.62, 13.7], [42.46, 14.4], [42.0, 15.2], [41.95, 16.3], [41.12, 17.0], [40.63, 18.1],
  [40.1, 18.6], [39.75, 18.4], [40.45, 17.25], [39.1, 17.25], [38.4, 16.65], [37.9, 16.1], [38.1, 15.6],
  [38.7, 15.75], [40.0, 15.5], [40.55, 14.2], [41.2, 13.3], [41.75, 12.1], [42.4, 11.0], [42.7, 10.0],
  [43.9, 10.05], [44.05, 9.75], [44.35, 9.0], [43.95, 8.15], [43.75, 7.6],
]

const SICILIA: readonly [number, number][] = [
  [38.35, 12.25], [38.35, 15.75], [37.5, 15.35], [36.6, 15.2], [36.6, 14.4], [37.05, 14.1], [37.5, 12.4],
]

const SARDEGNA: readonly [number, number][] = [
  [41.3, 8.1], [41.3, 9.85], [38.8, 9.85], [38.8, 8.1],
]

/** Il punto dentro il poligono, contando quante volte un raggio verso est ne passa il bordo. */
function dentro({ lat, lon }: Coordinate, poligono: readonly [number, number][]): boolean {
  let fuori = true
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [latA, lonA] = poligono[i]
    const [latB, lonB] = poligono[j]
    if (latA > lat !== latB > lat && lon < lonA + ((lat - latA) / (latB - latA)) * (lonB - lonA)) fuori = !fuori
  }
  return !fuori
}

export function inItalia(punto: Coordinate): boolean {
  return [PENISOLA, SICILIA, SARDEGNA].some((poligono) => dentro(punto, poligono))
}
