import { describe, expect, it } from 'vitest'
import { esempio } from './esempi'
import { pagine, sigilli, timbro } from './timbri'

const fatta = (campi: Parameters<typeof esempio>[0]) => esempio({ tipo: 'avventura', completato: true, ...campi })

describe('timbro', () => {
  it('è sempre lo stesso per la stessa avventura', () => {
    const a = fatta({ id: 'rafting', nome: 'Rafting', completato_il: '2026-07-01' })
    expect(timbro(a)).toEqual(timbro({ ...a }))
    const t = timbro(a)
    expect(Math.abs(t.rotazione)).toBeLessThanOrEqual(14)
    expect(t.anno).toBe(2026)
  })
})

describe('pagine', () => {
  it('una per anno dal più recente, quelle senza data in fondo, con i sigilli dopo il giro che li ha dati', () => {
    const p = pagine([
      fatta({ id: '1', completato_il: '2025-03-01' }),
      fatta({ id: '2', completato_il: null }),
      fatta({ id: '3', completato_il: '2026-03-01' }),
      fatta({ id: '4', completato_il: '2026-01-01' }),
      esempio({ id: '5', completato: true, completato_il: '2026-02-01' }),
      esempio({ id: '6', tipo: 'avventura' }),
    ])
    expect(p.map((pg) => [pg.anno, pg.timbri.map((t) => t.id)])).toEqual([
      [2026, ['4', 'traguardo-prima-cima', '3']],
      [2025, ['1']],
      [null, ['2', 'traguardo-prima-avventura']],
    ])
  })
})

describe('sigilli', () => {
  it('uno per traguardo raggiunto, d’oro, col giorno e il giro che l’ha dato', () => {
    const [s] = sigilli([esempio({ id: 't', completato: true, completato_il: '2026-06-01', fatto_dislivello: 400 })])
    expect(s).toMatchObject({ id: 'traguardo-prima-cima', giro: 't', nome: 'Prima cima', data: '2026-06-01', forma: 'sigillo', icona: 'bandiera' })
  })
})
