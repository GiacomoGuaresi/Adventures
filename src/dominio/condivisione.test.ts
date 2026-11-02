import { describe, expect, it } from 'vitest'
import { conLink, daCondivisione } from './condivisione'

describe('daCondivisione', () => {
  it('un link di Komoot va nel nome, col testo intorno', () => {
    const testo = 'Guarda questo giro: https://www.komoot.com/tour/123?ref=wtd'
    expect(daCondivisione(testo)).toEqual({ nome: testo, link: [] })
  })

  it('gli altri link vanno fra i link', () => {
    expect(daCondivisione('Bel posto https://www.instagram.com/p/abc https://www.instagram.com/p/abc')).toEqual({
      nome: '',
      link: ['https://www.instagram.com/p/abc'],
    })
  })

  it('senza link il testo è il nome', () => {
    expect(daCondivisione('  Rifugio Curò ')).toEqual({ nome: 'Rifugio Curò', link: [] })
  })
})

describe('conLink', () => {
  it('aggiunge in fondo senza doppioni né campi vuoti', () => {
    expect(conLink([''], 'https://a.it')).toEqual(['https://a.it'])
    expect(conLink(['https://a.it', ''], 'https://a.it')).toEqual(['https://a.it'])
    expect(conLink(['https://b.it'], 'https://a.it')).toEqual(['https://b.it', 'https://a.it'])
  })
})
