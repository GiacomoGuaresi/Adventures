import { describe, expect, it } from 'vitest'
import { inItalia } from './italia'

describe('inItalia', () => {
  it.each([
    ['Milano', 45.46, 9.19],
    ['Parma', 44.8, 10.33],
    ['Roma', 41.9, 12.5],
    ['Bolzano', 46.5, 11.35],
    ['Trieste', 45.65, 13.78],
    ['Como', 45.81, 9.08],
    ['Livigno', 46.54, 10.14],
    ['Courmayeur', 45.79, 6.97],
    ['Lecce', 40.35, 18.17],
    ['Reggio Calabria', 38.11, 15.65],
    ['Palermo', 38.12, 13.36],
    ['Cagliari', 39.22, 9.11],
    ['Isola d’Elba', 42.78, 10.25],
  ])('%s è in Italia', (_, lat, lon) => {
    expect(inItalia({ lat, lon })).toBe(true)
  })

  it.each([
    ['Lugano', 46.0, 8.95],
    ['Zurigo', 47.37, 8.54],
    ['Poschiavo', 46.32, 10.06],
    ['Santa Maria Val Müstair', 46.6, 10.42],
    ['Innsbruck', 47.27, 11.39],
    ['Nizza', 43.7, 7.27],
    ['Mentone', 43.77, 7.5],
    ['Chamonix', 45.92, 6.87],
    ['Lubiana', 46.06, 14.51],
    ['Pola', 44.87, 13.85],
    ['Bastia', 42.7, 9.45],
    ['Malta', 35.9, 14.5],
    ['Tunisi', 36.8, 10.18],
  ])('%s non è in Italia', (_, lat, lon) => {
    expect(inItalia({ lat, lon })).toBe(false)
  })
})
