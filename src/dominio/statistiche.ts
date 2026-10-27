/**
 * I numeri dei giri fatti (docs/02-funzionalita.md, pagina Statistiche e
 * cerimonia del completamento): si calcolano dall'elenco, non si salvano. Un
 * anno restringe ai giri di quell'anno; senza anno contano tutti, anche quelli
 * "prima di Adventures".
 */

import { dislivelloFatto, metri, minutiFatti } from './completamento'
import { anno, completate } from './cronologia'
import type { Attivita } from './tipi'

export interface Primato {
  valore: number
  nome: string
  id: string
}

export interface Numeri {
  trekking: number
  avventure: number
  dislivello: number
  km: number
  minuti: number
  /** Il dislivello medio dei trekking che lo hanno; `null` se nessuno. */
  mediaDislivello: number | null
  recordDislivello: Primato | null
  recordQuota: Primato | null
  recordKm: Primato | null
  /** I giri per mese, gennaio primo: trekking e avventure. Solo con l'anno. */
  perMese: { trekking: number; avventure: number }[] | null
  /** L'ultimo giro con la data. */
  ultimo: { nome: string; data: string } | null
}

function record(righe: readonly Attivita[], valore: (a: Attivita) => number | null): Primato | null {
  let migliore: Primato | null = null
  for (const a of righe) {
    const v = valore(a)
    if (v !== null && (migliore === null || v > migliore.valore)) migliore = { valore: v, nome: a.nome, id: a.id }
  }
  return migliore
}

const somma = (righe: readonly Attivita[], valore: (a: Attivita) => number | null) =>
  righe.reduce((tot, a) => tot + (valore(a) ?? 0), 0)

export function numeri(attivita: readonly Attivita[], annoScelto: number | null = null): Numeri {
  const fatte = completate(attivita).filter((a) => annoScelto === null || anno(a) === annoScelto)
  const trekking = fatte.filter((a) => a.tipo === 'trekking')
  const conDislivello = trekking.filter((a) => dislivelloFatto(a) !== null)
  const dislivello = somma(trekking, dislivelloFatto)
  const datate = fatte.filter((a) => a.completato_il !== null)
  const ultima = datate[datate.length - 1]
  let perMese: Numeri['perMese'] = null
  if (annoScelto !== null) {
    perMese = Array.from({ length: 12 }, () => ({ trekking: 0, avventure: 0 }))
    for (const a of datate) {
      const mese = perMese[Number(a.completato_il!.slice(5, 7)) - 1]
      if (a.tipo === 'trekking') mese.trekking++
      else mese.avventure++
    }
  }
  return {
    trekking: trekking.length,
    avventure: fatte.length - trekking.length,
    dislivello,
    km: Math.round(somma(trekking, (a) => a.fatto_km) * 10) / 10,
    minuti: somma(trekking, minutiFatti),
    mediaDislivello: conDislivello.length === 0 ? null : Math.round(dislivello / conDislivello.length),
    recordDislivello: record(trekking, dislivelloFatto),
    recordQuota: record(trekking, (a) => a.fatto_quota_max),
    recordKm: record(trekking, (a) => a.fatto_km),
    perMese,
    ultimo: ultima ? { nome: ultima.nome, data: ultima.completato_il! } : null,
  }
}

/** Gli anni con almeno un giro datato, dal più recente. */
export function anniConGiri(attivita: readonly Attivita[]): number[] {
  const tutti = new Set(completate(attivita).map(anno).filter((a): a is number => a !== null))
  return [...tutti].sort((a, b) => b - a)
}

/** Quanta parte della lista dei desideri è fatta, per tipo, da 0 a 100. */
export function percentuale(attivita: readonly Attivita[], tipo: Attivita['tipo']): number | null {
  const tutte = attivita.filter((a) => a.tipo === tipo)
  if (tutte.length === 0) return null
  return Math.round((tutte.filter((a) => a.completato).length / tutte.length) * 100)
}

const ORDINALI = ['', '', '2°', '3°', '4°', '5°']

/**
 * Le frasi della cerimonia per il giro appena completato: dove sta fra gli
 * altri e cosa ha cambiato nei totali dell'anno. Al massimo tre, le più belle
 * prima.
 */
export function confronti(attivita: readonly Attivita[], id: string): string[] {
  const giro = attivita.find((a) => a.id === id)
  if (!giro || !giro.completato) return []
  const frasi: string[] = []
  const fatte = completate(attivita, giro.tipo)

  if (giro.tipo === 'trekking') {
    const d = dislivelloFatto(giro)
    if (d !== null && fatte.length > 1) {
      const sopra = fatte.filter((a) => a.id !== id && (dislivelloFatto(a) ?? 0) > d).length
      if (sopra === 0) frasi.push('Il tuo dislivello più alto di sempre')
      else if (sopra < 5) frasi.push(`Il tuo ${ORDINALI[sopra + 1]} dislivello più alto`)
    }
    const q = giro.fatto_quota_max
    if (q !== null && fatte.some((a) => a.id !== id && a.fatto_quota_max !== null)) {
      if (fatte.every((a) => a.id === id || (a.fatto_quota_max ?? 0) < q)) frasi.push(`Nuovo record di quota: ${metri(q)}`)
    }
    const k = giro.fatto_km
    if (k !== null && fatte.some((a) => a.id !== id && a.fatto_km !== null)) {
      if (fatte.every((a) => a.id === id || (a.fatto_km ?? 0) < k)) frasi.push('Il giro più lungo che hai fatto')
    }
  }

  const annoGiro = anno(giro)
  if (annoGiro !== null) {
    const dellAnno = fatte.filter((a) => anno(a) === annoGiro)
    if (giro.tipo === 'trekking') {
      const d = dislivelloFatto(giro)
      const totale = somma(dellAnno, dislivelloFatto)
      if (d !== null) frasi.push(`+${metri(d)}: nel ${annoGiro} sei a ${metri(totale)}`)
      else frasi.push(`Il ${dellAnno.length}° trekking del ${annoGiro}`)
    } else {
      frasi.push(`La ${dellAnno.length}ª avventura del ${annoGiro}`)
    }
  }
  if (fatte.length === 1) frasi.unshift(giro.tipo === 'trekking' ? 'La prima cima della tua catena' : 'Il primo timbro del passaporto')
  return frasi.slice(0, 3)
}
