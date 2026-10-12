import { describe, expect, it } from 'vitest'
import { ORDINAMENTO_INIZIALE, ordina, tocca } from './ordinamento'
import { esempio } from './esempi'
import type { Attivita } from './tipi'

function attivita(id: string, nome: string, creato_il: string): Attivita {
  return esempio({ id, nome, creato_il, modificato_il: creato_il })
}

const elenco = [
  attivita('1', 'Monte Baldo', '2026-09-01T08:00:00Z'),
  attivita('2', 'cima Tosa', '2026-09-03T08:00:00Z'),
  attivita('3', 'Àlbero', '2026-09-02T08:00:00Z'),
]

describe('ordina', () => {
  it('per nome A→Z, senza badare ad accenti e maiuscole', () => {
    expect(ordina(elenco, { colonna: 'nome', verso: 'crescente' }).map((t) => t.id)).toEqual(['3', '2', '1'])
  })

  it('per nome al contrario', () => {
    expect(ordina(elenco, { colonna: 'nome', verso: 'decrescente' }).map((t) => t.id)).toEqual(['1', '2', '3'])
  })

  it('di default i più vicini in auto in cima, chi non ha il tempo in fondo', () => {
    const conViaggio = [
      esempio({ id: 'a', nome: 'A', viaggio_minuti: 90 }),
      esempio({ id: 'b', nome: 'B' }),
      esempio({ id: 'c', nome: 'C', viaggio_minuti: 30 }),
    ]
    expect(ordina(conViaggio, ORDINAMENTO_INIZIALE).map((t) => t.id)).toEqual(['c', 'a', 'b'])
  })

  it('non tocca l’elenco di partenza', () => {
    ordina(elenco, { colonna: 'nome', verso: 'crescente' })
    expect(elenco.map((t) => t.id)).toEqual(['1', '2', '3'])
  })
})

describe('ordina per dislivello', () => {
  const conDislivello = [
    esempio({ id: '1', nome: 'Media', dislivello: 800 }),
    esempio({ id: '2', nome: 'Senza dettagli' }),
    esempio({ id: '3', nome: 'Corta', dislivello: 200 }),
  ]

  it('dal più basso al più alto', () => {
    expect(ordina(conDislivello, { colonna: 'dislivello', verso: 'crescente' }).map((t) => t.id)).toEqual([
      '3',
      '1',
      '2',
    ])
  })

  it('chi non ce l’ha resta in fondo anche al contrario', () => {
    expect(ordina(conDislivello, { colonna: 'dislivello', verso: 'decrescente' }).map((t) => t.id)).toEqual([
      '1',
      '3',
      '2',
    ])
  })
})

describe('ordina per durata', () => {
  const conDurata = [
    esempio({ id: '1', nome: 'Giornata', durata_ore: 7 }),
    esempio({ id: '2', nome: 'Senza dettagli' }),
    esempio({ id: '3', nome: 'Due passi', durata_ore: 1.5 }),
  ]

  it('dalla più corta, con chi non ce l’ha in fondo', () => {
    expect(ordina(conDurata, { colonna: 'durata_ore', verso: 'crescente' }).map((t) => t.id)).toEqual(['3', '1', '2'])
  })
})

describe('tocca', () => {
  it('sulla stessa colonna inverte il verso', () => {
    expect(tocca({ colonna: 'nome', verso: 'crescente' }, 'nome')).toEqual({ colonna: 'nome', verso: 'decrescente' })
  })

  it('su una colonna nuova parte dal suo verso naturale', () => {
    expect(tocca(ORDINAMENTO_INIZIALE, 'nome')).toEqual({ colonna: 'nome', verso: 'crescente' })
    expect(tocca({ colonna: 'nome', verso: 'crescente' }, 'creato_il')).toEqual({
      colonna: 'creato_il',
      verso: 'decrescente',
    })
  })
})
