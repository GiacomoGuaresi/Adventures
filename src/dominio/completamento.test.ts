import { describe, expect, it } from 'vitest'
import { dataValida, dislivelloFatto, kmValidi, minutiFatti, oggi, ore, pulisciKm, pulisciQuota, testoKm } from './completamento'
import { esempio } from './esempi'

describe('oggi', () => {
  it('scrive il giorno nell’ora di casa', () => {
    expect(oggi(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('dataValida', () => {
  const adesso = new Date(2026, 9, 27, 12)
  it('accetta oggi e il passato', () => {
    expect(dataValida('2026-10-27', adesso)).toBe(true)
    expect(dataValida('2024-02-29', adesso)).toBe(true)
  })
  it('rifiuta il futuro e le date storte', () => {
    expect(dataValida('2026-10-28', adesso)).toBe(false)
    expect(dataValida('27/10/2026', adesso)).toBe(false)
    expect(dataValida('', adesso)).toBe(false)
  })
})

describe('pulisciKm', () => {
  it('accetta la virgola e arrotonda a un decimale', () => {
    expect(pulisciKm('12,46')).toBe(12.5)
    expect(pulisciKm(' 8.0 ')).toBe(8)
  })
  it('vuoto o storto vuol dire niente', () => {
    expect(pulisciKm('')).toBeNull()
    expect(pulisciKm('0')).toBeNull()
    expect(pulisciKm('dieci')).toBeNull()
    expect(kmValidi('')).toBe(true)
    expect(kmValidi('-3')).toBe(false)
  })
  it('si riscrive con la virgola', () => {
    expect(testoKm(12.5)).toBe('12,5')
    expect(testoKm(null)).toBe('')
  })
})

describe('pulisciQuota', () => {
  it('metri interi fino all’Everest', () => {
    expect(pulisciQuota('2450')).toBe(2450)
    expect(pulisciQuota('9000')).toBeNull()
    expect(pulisciQuota('2450,5')).toBeNull()
  })
})

describe('numeri che contano', () => {
  it('il vero vince sul previsto, il previsto vale se il vero manca', () => {
    expect(dislivelloFatto(esempio({ dislivello: 900, fatto_dislivello: 1040 }))).toBe(1040)
    expect(dislivelloFatto(esempio({ dislivello: 900 }))).toBe(900)
    expect(minutiFatti(esempio({ durata_ore: 3.5 }))).toBe(210)
    expect(minutiFatti(esempio({ durata_ore: 3.5, fatto_durata_minuti: 247 }))).toBe(247)
  })
  it('le ore si leggono come sull’orologio', () => {
    expect(ore(347)).toBe('5 h 47')
    expect(ore(305)).toBe('5 h 05')
    expect(ore(45)).toBe('45 min')
  })
})
