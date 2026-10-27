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
    expect(sbloccatiDa(elenco, 'v').map((s) => s.traguardo.id)).toEqual(['prima-avventura', 'mezza-giornata', 'fuori-porta', 'infrasettimanale', 'doppietta'])
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

  it('la casa serve ai traguardi che guardano dove sta il giro', () => {
    const casa = { lat: 44.8, lon: 10.33 }
    const elenco = [
      fatto({ id: 'n', completato_il: '2026-06-06', lat: 46.0, lon: 10.33 }),
      fatto({ id: 's', completato_il: '2026-06-07', lat: 43.0, lon: 10.5 }),
      fatto({ id: 'e', completato_il: '2026-06-13', lat: 44.8, lon: 12.0 }),
      fatto({ id: 'o', completato_il: '2026-06-14', lat: 44.8, lon: 9.0 }),
      fatto({ id: 'ch', completato_il: '2026-06-20', lat: 46.0, lon: 8.95 }),
    ]
    const senza = sbloccati(elenco)
    expect(senza['rosa-dei-venti']).toBeNull()
    expect(senza['verso-nord']).toBeNull()
    expect(senza['oltre-confine']).toBe('ch')
    expect(senza['cinque-posti']).toBe('ch')
    const con = Object.fromEntries(traguardi(elenco, casa).map((s) => [s.traguardo.id, s.da?.id ?? null]))
    expect(con['verso-nord']).toBe('n')
    expect(con['verso-sud']).toBe('s')
    expect(con['rosa-dei-venti']).toBe('o')
  })

  it('il calendario: weekend, settimane, mesi di fila e anni', () => {
    const elenco = [
      fatto({ id: 'sab', completato_il: '2026-01-03' }),
      fatto({ id: 'dom', tipo: 'avventura', completato_il: '2026-01-04' }),
      fatto({ id: 'mer', completato_il: '2026-01-07' }),
      fatto({ id: 'feb', completato_il: '2026-02-14' }),
      fatto({ id: 'mar', completato_il: '2026-03-14' }),
      fatto({ id: 'pausa', completato_il: '2026-10-03' }),
      fatto({ id: 'anno', completato_il: '2027-01-02' }),
    ]
    const s = sbloccati(elenco)
    expect(s['weekend-lungo']).toBe('dom')
    expect(s['weekend-completo']).toBe('dom')
    expect(s['stesso-giorno']).toBeNull()
    expect(s['settimana-d-oro']).toBeNull()
    expect(s['infrasettimanale']).toBe('mer')
    expect(s['invernale']).toBe('sab')
    expect(s['tre-di-fila']).toBe('mar')
    expect(s['ritorno']).toBe('pausa')
    expect(s['anniversario']).toBe('anno')
    expect(s['capodanno']).toBeNull()
    const a = Object.fromEntries(traguardi(elenco).map((s) => [s.traguardo.id, s.avanzamento]))
    expect(a['sei-di-fila']).toEqual({ fatto: 3, serve: 6, unita: '' })
    expect(a['dieci-in-un-anno']).toEqual({ fatto: 6, serve: 10, unita: '' })
  })

  it('il passo svelto vuole i numeri veri, e le ore si contano in ore', () => {
    const elenco = [
      fatto({ id: 'previsto', completato_il: '2026-05-02', dislivello: 1200, durata_ore: 2 }),
      fatto({ id: 'vero', completato_il: '2026-05-09', fatto_dislivello: 1100, fatto_durata_minuti: 120 }),
    ]
    const s = sbloccati(elenco)
    expect(s['passo-svelto']).toBe('vero')
    expect(s['passeggiata']).toBeNull()
    const a = Object.fromEntries(traguardi(elenco).map((s) => [s.traguardo.id, s.avanzamento]))
    expect(a['cento-ore']).toEqual({ fatto: 4, serve: 100, unita: 'h' })
  })

  it("le avventure fuori dalle loro stagioni e l'equilibrio fra i due tipi", () => {
    const elenco = [
      fatto({ id: 'mare', tipo: 'avventura', completato_il: '2026-01-10', stagioni: ['estate'] }),
      fatto({ id: 'ovunque', tipo: 'avventura', completato_il: '2026-02-10', stagioni: [] }),
    ]
    const s = sbloccati(elenco)
    expect(s['fuori-stagione']).toBe('mare')
    const a = Object.fromEntries(traguardi(elenco).map((s) => [s.traguardo.id, s.avanzamento]))
    expect(a['equilibrio']).toEqual({ fatto: 2, serve: 20, unita: '' })
  })
})
