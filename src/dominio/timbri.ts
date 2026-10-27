/**
 * I timbri del passaporto (docs/02-funzionalita.md): ogni avventura completata
 * ha il suo, come quelli di frontiera, e ogni traguardo raggiunto è un sigillo
 * dorato. Forma, inchiostro, inclinazione e icona nascono dall'id, quindi
 * restano gli stessi a ogni apertura.
 */

import { generatore, seme } from './caso'
import type { Coordinate } from './coordinate'
import { anno, completate } from './cronologia'
import type { Attivita } from './tipi'
import { traguardi, type IconaTraguardo, type Sblocco } from './traguardi'

/** Le forme delle avventure; il sigillo è solo dei traguardi. */
export type Forma = 'tondo' | 'ottagono' | 'francobollo' | 'ovale' | 'sigillo'

/** Gli inchiostri delle avventure: il terracotta della mappa e qualche colore di casa. L'oro resta ai traguardi. */
export const INCHIOSTRI = ['#8a4a22', '#32516c', '#2f6f73', '#3d6b4a', '#7a3b5e'] as const
export const ORO = '#8a5b06'

/** Le icone dentro il timbro di un'avventura, scelte dall'interfaccia. */
export const ICONE_TIMBRO = 6

export interface Timbro {
  id: string
  /** Il giro da aprire toccando il timbro: l'avventura, o il giro che ha sbloccato il traguardo. */
  giro: string
  nome: string
  data: string | null
  anno: number | null
  forma: Forma
  inchiostro: string
  /** Gradi, fra -14 e 14: nessun timbro esce dritto. */
  rotazione: number
  /** Per le avventure, in [0, ICONE_TIMBRO); per i traguardi, la loro icona. */
  icona: number | IconaTraguardo
}

const FORME: readonly Forma[] = ['tondo', 'ottagono', 'francobollo', 'ovale']

export function timbro(a: Attivita): Timbro {
  const caso = generatore(seme(a.id))
  return {
    id: a.id,
    giro: a.id,
    nome: a.nome,
    data: a.completato_il,
    anno: anno(a),
    forma: FORME[Math.floor(caso() * FORME.length)],
    inchiostro: INCHIOSTRI[Math.floor(caso() * INCHIOSTRI.length)],
    rotazione: Math.round((caso() * 2 - 1) * 14),
    icona: Math.floor(caso() * ICONE_TIMBRO),
  }
}

/** Il sigillo di un traguardo raggiunto, col giorno del giro che l'ha sbloccato. */
export function sigillo({ traguardo, da }: Sblocco & { da: Attivita }): Timbro {
  const caso = generatore(seme(traguardo.id))
  return {
    id: `traguardo-${traguardo.id}`,
    giro: da.id,
    nome: traguardo.titolo,
    data: da.completato_il,
    anno: anno(da),
    forma: 'sigillo',
    inchiostro: ORO,
    rotazione: Math.round((caso() * 2 - 1) * 10),
    icona: traguardo.icona,
  }
}

/** I sigilli dei traguardi raggiunti. */
export function sigilli(attivita: readonly Attivita[], casa: Coordinate | null = null): Timbro[] {
  return traguardi(attivita, casa)
    .filter((s): s is Sblocco & { da: Attivita } => s.da !== null)
    .map(sigillo)
}

/**
 * Le pagine del passaporto: una per anno, dal più recente, con quelli senza
 * data in fondo. Dentro, timbri delle avventure e sigilli dei traguardi in
 * ordine di giorno; a parità il sigillo viene dopo il giro che l'ha dato.
 */
export function pagine(attivita: readonly Attivita[], casa: Coordinate | null = null): { anno: number | null; timbri: Timbro[] }[] {
  const tutti = [...completate(attivita, 'avventura').map(timbro), ...sigilli(attivita, casa)].sort((a, b) => {
    if (a.data !== b.data) return (a.data ?? '') < (b.data ?? '') ? -1 : 1
    return (a.forma === 'sigillo' ? 1 : 0) - (b.forma === 'sigillo' ? 1 : 0)
  })
  const perAnno = new Map<number | null, Timbro[]>()
  for (const t of tutti) perAnno.set(t.anno, [...(perAnno.get(t.anno) ?? []), t])
  return [...perAnno.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : b - a))
    .map(([anno, timbri]) => ({ anno, timbri }))
}
