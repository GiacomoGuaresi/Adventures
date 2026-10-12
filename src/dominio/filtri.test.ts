import { describe, expect, it } from 'vitest'
import { esempio } from './esempi'
import {
  CHIAVI_PER_TIPO,
  FILTRI_VUOTI,
  conChiavi,
  dentro,
  filtra,
  limite,
  personalizzato,
  quantiFiltri,
  soloChiavi,
  testoIntervallo,
  testoLimite,
} from './filtri'

const elenco = [
  esempio({ id: '1', nome: 'Passeggiata', dislivello: 200, durata_ore: 1.5 }),
  esempio({ id: '2', nome: 'Cima lunga', dislivello: 1400, durata_ore: 7 }),
  esempio({ id: '3', nome: 'Senza dettagli' }),
]

describe('filtra', () => {
  it('senza limiti li tiene tutti', () => {
    expect(filtra(elenco, FILTRI_VUOTI).map((t) => t.id)).toEqual(['1', '2', '3'])
  })

  it('tiene chi sta nell’intervallo', () => {
    expect(filtra(elenco, { ...FILTRI_VUOTI, dislivello: { min: 500, max: null } }).map((t) => t.id)).toEqual(['2', '3'])
    expect(filtra(elenco, { ...FILTRI_VUOTI, dislivello: { min: null, max: 500 } }).map((t) => t.id)).toEqual(['1', '3'])
    expect(filtra(elenco, { ...FILTRI_VUOTI, dislivello: { min: 100, max: 300 } }).map((t) => t.id)).toEqual(['1', '3'])
  })

  it('filtra anche sulla durata, e i due filtri valgono insieme', () => {
    expect(filtra(elenco, { ...FILTRI_VUOTI, durata: { min: null, max: 3 } }).map((t) => t.id)).toEqual(['1', '3'])
    expect(
      filtra(elenco, { ...FILTRI_VUOTI, dislivello: { min: 1000, max: null }, durata: { min: null, max: 3 } }).map(
        (t) => t.id,
      ),
    ).toEqual(['3'])
  })

  it('chi non ha il dislivello resta sempre visibile', () => {
    expect(filtra(elenco, { ...FILTRI_VUOTI, dislivello: { min: 3000, max: 4000 } }).map((t) => t.id)).toEqual(['3'])
  })

  it('i limiti sono compresi', () => {
    expect(dentro(200, { min: 200, max: 200 })).toBe(true)
    expect(dentro(null, { min: 200, max: 300 })).toBe(true)
  })
})

describe('filtra sulla distanza da casa', () => {
  const casa = { lat: 45.6983, lon: 9.6773 }
  const vicini = [
    esempio({ id: 'a', nome: 'Dietro casa', lat: 45.72, lon: 9.7 }),
    esempio({ id: 'b', nome: 'Rifugio Curò', lat: 46.0618, lon: 10.0477 }),
    esempio({ id: 'c', nome: 'Senza luogo' }),
  ]

  it('tiene chi sta entro i chilometri chiesti, e chi non ha il luogo', () => {
    expect(filtra(vicini, { ...FILTRI_VUOTI, distanza: { min: null, max: 10 } }, casa).map((t) => t.id)).toEqual([
      'a',
      'c',
    ])
  })

  it('senza la posizione di casa non nasconde nessuno', () => {
    expect(filtra(vicini, { ...FILTRI_VUOTI, distanza: { min: null, max: 10 } }, null).map((t) => t.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })
})

describe('limite', () => {
  it('legge il numero scritto nel campo', () => {
    expect(limite('500')).toBe(500)
    expect(limite('0')).toBe(0)
  })

  it('vuoto o storto vuol dire nessun limite', () => {
    expect(limite('')).toBeNull()
    expect(limite('poco')).toBeNull()
    expect(limite('-100')).toBeNull()
  })

  it('riporta nel campo il limite acceso', () => {
    expect(testoLimite(500)).toBe('500')
    expect(testoLimite(null)).toBe('')
  })
})

describe('quantiFiltri', () => {
  it('conta i filtri accesi, non i limiti', () => {
    expect(quantiFiltri(FILTRI_VUOTI)).toBe(0)
    expect(quantiFiltri({ ...FILTRI_VUOTI, dislivello: { min: 500, max: null } })).toBe(1)
    expect(quantiFiltri({ ...FILTRI_VUOTI, dislivello: { min: 500, max: 900 } })).toBe(1)
    expect(
      quantiFiltri({ ...FILTRI_VUOTI, dislivello: { min: 500, max: 900 }, durata: { min: 2, max: null } }),
    ).toBe(2)
  })
})

describe('testoIntervallo', () => {
  it('scrive gli intervalli da leggere', () => {
    expect(testoIntervallo('dislivello', { min: 500, max: 1000 })).toBe('500–1000 m')
    expect(testoIntervallo('dislivello', { min: 1500, max: null })).toBe('≥ 1500 m')
    expect(testoIntervallo('durata', { min: null, max: 3.5 })).toBe('≤ 3 h 30')
    expect(testoIntervallo('distanza', { min: null, max: 50 })).toBe('≤ 50 km')
    expect(testoIntervallo('viaggio', { min: null, max: 90 })).toBe('≤ 1 h 30')
    expect(testoIntervallo('viaggio', { min: 30, max: 60 })).toBe('30 min – 1 h')
  })

  it('un filtro spento non ha testo', () => {
    expect(testoIntervallo('durata', { min: null, max: null })).toBeNull()
  })
})

describe('personalizzato', () => {
  it('è scritto a mano solo se non è una scelta rapida', () => {
    expect(personalizzato('dislivello', { min: 500, max: 1000 })).toBe(false)
    expect(personalizzato('dislivello', { min: 600, max: 1000 })).toBe(true)
    expect(personalizzato('viaggio', { min: null, max: null })).toBe(false)
  })
})

describe('i filtri per tipo', () => {
  const accesi = { ...FILTRI_VUOTI, dislivello: { min: 500, max: null }, viaggio: { min: null, max: 60 } }

  it('per le avventure contano solo distanza e viaggio', () => {
    const solo = soloChiavi(accesi, CHIAVI_PER_TIPO.avventura)
    expect(solo.dislivello).toEqual(FILTRI_VUOTI.dislivello)
    expect(solo.viaggio).toEqual({ min: null, max: 60 })
    expect(quantiFiltri(solo)).toBe(1)
  })

  it('per i trekking contano tutti', () => {
    expect(soloChiavi(accesi, CHIAVI_PER_TIPO.trekking)).toEqual(accesi)
  })

  it('azzerare i filtri delle avventure lascia quelli dei soli trekking', () => {
    const dopo = conChiavi(accesi, FILTRI_VUOTI, CHIAVI_PER_TIPO.avventura)
    expect(dopo.dislivello).toEqual({ min: 500, max: null })
    expect(dopo.viaggio).toEqual(FILTRI_VUOTI.viaggio)
  })
})
