/**
 * Un trekking da un link di Komoot (docs/02-funzionalita.md): la Edge Function
 * legge la pagina del giro (`supabase/functions/adventures-komoot/tour.ts`),
 * qui i suoi numeri diventano i campi del form. Quello che il form non ha
 * (lunghezza, difficoltà, quota) finisce nelle note.
 */

import type { TourKomoot } from '../../supabase/functions/adventures-komoot/tour'
import type { CampiAttivita } from './tipi'

export { linkKomoot, riferimentoKomoot } from '../../supabase/functions/adventures-komoot/tour'
export type { TourKomoot } from '../../supabase/functions/adventures-komoot/tour'

/** I campi del form che Komoot riempie. */
export type CampiKomoot = Pick<
  CampiAttivita,
  'tipo' | 'nome' | 'link' | 'note' | 'dislivello' | 'durata_ore' | 'luogo_nome' | 'lat' | 'lon'
>

const GRADI: Record<string, string> = { EASY: 'facile', MODERATE: 'media', DIFFICULT: 'difficile' }

/** La durata a mezz'ore, come nel form: almeno mezz'ora. */
function mezzore(secondi: number | null): number | null {
  if (secondi === null || secondi <= 0) return null
  return Math.max(1, Math.round(secondi / 1800)) / 2
}

/** "11,8 km · ad anello · difficoltà media (T1) · quota massima 739 m". */
function riassunto(tour: TourKomoot): string {
  const parti: string[] = []
  if (tour.distanza_m !== null) parti.push(`${(tour.distanza_m / 1000).toFixed(1).replace('.', ',')} km`)
  if (tour.anello === true) parti.push('ad anello')
  if (tour.anello === false) parti.push('solo andata: durata e dislivello sono della sola andata')
  const grado = tour.grado ? GRADI[tour.grado] : undefined
  const sac = tour.tecnica?.match(/^dh#t(\d)$/)?.[1]
  if (grado) parti.push(sac ? `difficoltà ${grado} (T${sac})` : `difficoltà ${grado}`)
  if (tour.quota_max !== null) parti.push(`quota massima ${Math.round(tour.quota_max)} m`)
  return `Da Komoot: ${parti.join(' · ')}`
}

/**
 * I campi del form dal giro: sempre un trekking, il luogo è la partenza col
 * nome del comune quando Komoot lo dà, altrimenti le sole coordinate.
 */
export function daKomoot(tour: TourKomoot): CampiKomoot {
  const salita = tour.salita_m === null ? null : Math.round(tour.salita_m)
  return {
    tipo: 'trekking',
    nome: tour.nome,
    link: [tour.link],
    note: riassunto(tour),
    dislivello: salita !== null && salita > 0 ? salita : null,
    durata_ore: mezzore(tour.durata_s),
    luogo_nome: tour.inizio ? tour.regione : null,
    lat: tour.inizio?.lat ?? null,
    lon: tour.inizio?.lon ?? null,
  }
}
