import { describe, expect, it } from 'vitest'
import { esempio } from './esempi'
import { anniConGiri, confronti, numeri, percentuale } from './statistiche'

const fatto = (campi: Parameters<typeof esempio>[0]) => esempio({ completato: true, ...campi })

const elenco = [
  fatto({ id: 'a', nome: 'Grignetta', completato_il: '2025-06-10', fatto_dislivello: 1100, fatto_km: 9, fatto_quota_max: 2177 }),
  fatto({ id: 'b', nome: 'Pizzo Coca', completato_il: '2026-07-20', fatto_dislivello: 1900, fatto_km: 18.5, fatto_quota_max: 3050, fatto_durata_minuti: 540 }),
  fatto({ id: 'c', nome: 'Resegone', completato_il: '2026-09-02', dislivello: 900, durata_ore: 4 }),
  fatto({ id: 'v', tipo: 'avventura', nome: 'Rafting', completato_il: '2026-07-01' }),
  fatto({ id: 'n', nome: 'Vecchio', completato_il: null, dislivello: 500 }),
  esempio({ id: 'x', nome: 'Da fare' }),
]

describe('numeri', () => {
  it('somma tutti i giri, anche quelli senza data', () => {
    const n = numeri(elenco)
    expect(n.trekking).toBe(4)
    expect(n.avventure).toBe(1)
    expect(n.dislivello).toBe(1100 + 1900 + 900 + 500)
    expect(n.km).toBe(27.5)
    expect(n.minuti).toBe(540 + 240)
    expect(n.mediaDislivello).toBe(1100)
    expect(n.recordDislivello?.nome).toBe('Pizzo Coca')
    expect(n.recordQuota?.valore).toBe(3050)
    expect(n.perMese).toBeNull()
    expect(n.ultimo).toEqual({ nome: 'Resegone', data: '2026-09-02' })
  })

  it('con l’anno conta solo quell’anno e divide per mese', () => {
    const n = numeri(elenco, 2026)
    expect(n.trekking).toBe(2)
    expect(n.dislivello).toBe(2800)
    expect(n.perMese?.[6]).toEqual({ trekking: 1, avventure: 1 })
    expect(n.perMese?.[8]).toEqual({ trekking: 1, avventure: 0 })
  })

  it('senza giri non ci sono record né medie', () => {
    const n = numeri([])
    expect(n.mediaDislivello).toBeNull()
    expect(n.recordKm).toBeNull()
    expect(n.ultimo).toBeNull()
  })
})

describe('anniConGiri e percentuale', () => {
  it('gli anni dal più recente, senza quelli senza data', () => {
    expect(anniConGiri(elenco)).toEqual([2026, 2025])
  })
  it('la parte fatta della lista', () => {
    expect(percentuale(elenco, 'trekking')).toBe(80)
    expect(percentuale(elenco, 'avventura')).toBe(100)
    expect(percentuale([], 'avventura')).toBeNull()
  })
})

describe('confronti', () => {
  it('festeggia il record e il totale dell’anno', () => {
    expect(confronti(elenco, 'b')).toEqual([
      'Il tuo dislivello più alto di sempre',
      'Nuovo record di quota: 3.050 m',
      'Il giro più lungo che hai fatto',
    ])
  })

  it('dice la posizione e il totale dell’anno', () => {
    expect(confronti(elenco, 'c')).toEqual(['Il tuo 3° dislivello più alto', '+900 m: nel 2026 sei a 2.800 m'])
  })

  it('il primo giro di un tipo è la prima cima o il primo timbro', () => {
    expect(confronti(elenco, 'v')).toEqual(['Il primo timbro del passaporto', 'La 1ª avventura del 2026'])
    expect(confronti([fatto({ id: 'u', completato_il: '2026-01-01' })], 'u')[0]).toBe('La prima cima della tua catena')
  })

  it('niente per un giro non completato', () => {
    expect(confronti(elenco, 'x')).toEqual([])
  })
})
