import { describe, expect, it } from 'vitest'
import { delTipo, quantiCompletati, rimuovi, sostituisci, visibili } from './elenco'
import { esempio } from './esempi'
import type { Attivita } from './tipi'

function attivita(id: string, nome: string, completato = false): Attivita {
  return esempio({ id, nome, completato })
}

const elenco = [attivita('1', 'Cima Tosa'), attivita('2', 'Monte Baldo'), attivita('3', 'Città Morta')]

describe('sostituisci', () => {
  it('cambia solo il trekking con quel codice e lascia l’ordine com’è', () => {
    const dopo = sostituisci(elenco, attivita('2', 'Monte Baldo dalla Ferrara'))
    expect(dopo.map((t) => t.nome)).toEqual(['Cima Tosa', 'Monte Baldo dalla Ferrara', 'Città Morta'])
  })

  it('non cambia nulla se quel codice non c’è', () => {
    expect(sostituisci(elenco, attivita('9', 'Sconosciuto'))).toEqual(elenco)
  })
})

describe('rimuovi', () => {
  it('toglie il trekking eliminato', () => {
    expect(rimuovi(elenco, '1').map((t) => t.id)).toEqual(['2', '3'])
  })

  it('non cambia nulla se quel codice non c’è', () => {
    expect(rimuovi(elenco, '9')).toEqual(elenco)
  })
})

const conCompletati = [attivita('1', 'Cima Tosa'), attivita('2', 'Monte Baldo', true), attivita('3', 'Città Morta')]

describe('visibili', () => {
  it('nasconde i completati', () => {
    expect(visibili(conCompletati, false).map((t) => t.id)).toEqual(['1', '3'])
  })

  it('con "Mostra completati" li tiene tutti, nello stesso ordine', () => {
    expect(visibili(conCompletati, true).map((t) => t.id)).toEqual(['1', '2', '3'])
  })
})

describe('quantiCompletati', () => {
  it('conta i completati', () => {
    expect(quantiCompletati(conCompletati)).toBe(1)
    expect(quantiCompletati(elenco)).toBe(0)
  })
})

describe('delTipo', () => {
  const misti = [
    attivita('1', 'Cima Tosa'),
    esempio({ id: '2', nome: 'Fare rafting', tipo: 'avventura' }),
    attivita('3', 'Città Morta'),
  ]

  it('tiene solo i trekking o solo le avventure, nello stesso ordine', () => {
    expect(delTipo(misti, 'trekking').map((t) => t.id)).toEqual(['1', '3'])
    expect(delTipo(misti, 'avventura').map((t) => t.id)).toEqual(['2'])
  })
})
