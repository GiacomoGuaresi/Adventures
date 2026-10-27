import { describe, expect, it } from 'vitest'
import { esempio } from './esempi'
import { nellaStagione, pulisciStagioni, stagioneCorrente, stagioneDi, testoStagioni } from './stagioni'

describe('stagione corrente', () => {
  it('a mesi interi: dicembre è già inverno, settembre già autunno', () => {
    expect(stagioneCorrente(new Date(2026, 11, 3))).toBe('inverno')
    expect(stagioneCorrente(new Date(2026, 8, 1))).toBe('autunno')
    expect(stagioneCorrente(new Date(2026, 4, 31))).toBe('primavera')
    expect(stagioneDi('2026-07-10')).toBe('estate')
  })
})

describe('nellaStagione', () => {
  const avventura = (stagioni: Parameters<typeof pulisciStagioni>[0]) => esempio({ tipo: 'avventura', stagioni: [...stagioni] })

  it('passa chi ha la stagione scelta, chi non ne ha nessuna e chi le ha tutte', () => {
    expect(nellaStagione(avventura(['inverno']), 'inverno')).toBe(true)
    expect(nellaStagione(avventura(['estate']), 'inverno')).toBe(false)
    expect(nellaStagione(avventura([]), 'inverno')).toBe(true)
    expect(nellaStagione(avventura(['primavera', 'estate', 'autunno', 'inverno']), 'inverno')).toBe(true)
  })

  it('senza scelta passano tutte, e i trekking passano sempre', () => {
    expect(nellaStagione(avventura(['estate']), null)).toBe(true)
    expect(nellaStagione(esempio(), 'inverno')).toBe(true)
  })
})

describe('testo e pulizia', () => {
  it('in ordine e senza doppioni', () => {
    expect(pulisciStagioni(['inverno', 'estate', 'inverno'])).toEqual(['estate', 'inverno'])
  })

  it('si legge come una frase', () => {
    expect(testoStagioni([])).toBe("Tutto l'anno")
    expect(testoStagioni(['primavera', 'estate', 'autunno', 'inverno'])).toBe("Tutto l'anno")
    expect(testoStagioni(['inverno'])).toBe('Inverno')
    expect(testoStagioni(['estate', 'primavera'])).toBe('Primavera ed estate')
    expect(testoStagioni(['primavera', 'autunno', 'inverno'])).toBe('Primavera, autunno e inverno')
  })
})
