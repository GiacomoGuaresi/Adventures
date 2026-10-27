import { describe, expect, it } from 'vitest'
import { esempio } from './esempi'
import { sbloccatiDa, stagione, traguardi } from './traguardi'

const fatto = (campi: Parameters<typeof esempio>[0]) => esempio({ completato: true, ...campi })
const sbloccati = (elenco: Parameters<typeof traguardi>[0]) =>
  Object.fromEntries(traguardi(elenco).map((s) => [s.traguardo.id, s.da?.id ?? null]))

describe('traguardi', () => {
  it('niente giri, niente traguardi', () => {
    expect(Object.values(sbloccati([esempio()])).every((da) => da === null)).toBe(true)
  })

  it('il dislivello si somma fino alla soglia, e il giro che la passa è quello dello sblocco', () => {
    const elenco = [
      fatto({ id: 'a', completato_il: '2026-01-01', fatto_dislivello: 3000 }),
      fatto({ id: 'b', completato_il: '2026-02-01', fatto_dislivello: 2000 }),
      fatto({ id: 'c', completato_il: '2026-03-01', dislivello: 4000 }),
    ]
    const s = sbloccati(elenco)
    expect(s['prima-cima']).toBe('a')
    expect(s['dislivello-1000']).toBe('a')
    expect(s['monte-bianco']).toBe('b')
    expect(s['everest']).toBe('c')
    expect(s['gambe']).toBe('a')
    expect(s['prima-avventura']).toBeNull()
  })

  it('le avventure lontane e la doppietta nello stesso mese', () => {
    const elenco = [
      fatto({ id: 't', completato_il: '2026-05-03' }),
      fatto({ id: 'v', tipo: 'avventura', completato_il: '2026-05-20', viaggio_minuti: 150 }),
    ]
    const s = sbloccati(elenco)
    expect(s['prima-avventura']).toBe('v')
    expect(s['fuori-porta']).toBe('v')
    expect(s['doppietta']).toBe('v')
    expect(sbloccatiDa(elenco, 'v').map((s) => s.traguardo.id)).toEqual(['prima-avventura', 'fuori-porta', 'doppietta'])
  })

  it('quelli da raggiungere dicono a che punto si è', () => {
    const elenco = [fatto({ completato_il: '2026-01-01', fatto_dislivello: 1200, fatto_km: 12.4 }), fatto({ completato_il: '2026-07-01', dislivello: 800 })]
    const a = Object.fromEntries(traguardi(elenco).map((s) => [s.traguardo.id, s.avanzamento]))
    expect(a['monte-bianco']).toEqual({ fatto: 2000, serve: 4808, unita: 'm' })
    expect(a['trekking-10']).toEqual({ fatto: 2, serve: 10, unita: '' })
    expect(a['gambe']).toEqual({ fatto: 1200, serve: 1500, unita: 'm' })
    expect(a['maratona']).toEqual({ fatto: 12.4, serve: 42.2, unita: 'km' })
    expect(a['quattro-stagioni']).toEqual({ fatto: 2, serve: 4, unita: '' })
    expect(a['doppietta']).toBeNull()
    expect(a['prima-cima']).toBeNull()
  })

  it('le quattro stagioni contano i mesi interi', () => {
    expect(stagione(fatto({ completato_il: '2026-12-05' }))).toBe('inverno')
    const elenco = ['2026-01-10', '2026-04-10', '2026-07-10', '2026-10-10'].map((d, i) => fatto({ id: `s${i}`, completato_il: d }))
    expect(sbloccati(elenco)['quattro-stagioni']).toBe('s3')
  })
})
