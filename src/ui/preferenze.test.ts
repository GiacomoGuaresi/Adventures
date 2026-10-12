import { describe, expect, it } from 'vitest'
import { leggiCookie } from './preferenze'

describe('leggiCookie', () => {
  it('trova il cookie per nome, tra gli altri', () => {
    expect(leggiCookie('sb-auth=abc; completati=0; altro=1', 'completati')).toBe('0')
  })

  it('non confonde nomi che si somigliano, e senza cookie dà null', () => {
    expect(leggiCookie('x_completati=1', 'completati')).toBeNull()
    expect(leggiCookie('', 'completati')).toBeNull()
  })

  it('decodifica il valore', () => {
    expect(leggiCookie('nome=a%20b', 'nome')).toBe('a b')
  })
})
