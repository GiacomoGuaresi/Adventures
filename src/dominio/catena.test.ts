import { describe, expect, it } from 'vitest'
import { altezza, anni, estensione, montagne, profilo } from './catena'
import { esempio } from './esempi'

const fatto = (campi: Parameters<typeof esempio>[0]) => esempio({ completato: true, ...campi })

describe('altezza', () => {
  it('cresce col dislivello ma con la radice, e si ferma', () => {
    expect(altezza(null)).toBeCloseTo(0.2)
    expect(altezza(2500)).toBe(1)
    expect(altezza(5000)).toBe(1)
    expect(altezza(300)).toBeGreaterThan(0.2 + 0.8 * (300 / 2500))
    expect(altezza(1000)).toBeLessThan(altezza(1500))
  })
})

describe('montagne', () => {
  it('solo i trekking completati, prima quelli senza data e poi dal giro più vecchio', () => {
    const fila = montagne([
      fatto({ id: 'b', completato_il: '2026-08-01' }),
      esempio({ id: 'x' }),
      fatto({ id: 'a', completato_il: '2026-06-01' }),
      fatto({ id: 'v', tipo: 'avventura', completato_il: '2026-07-01' }),
      fatto({ id: 'z', completato_il: null }),
    ])
    expect(fila.map((m) => m.id)).toEqual(['z', 'a', 'b'])
  })

  it('usa il dislivello vero, o il previsto se manca, e mette la neve sulle alte', () => {
    const [prima, seconda] = montagne([
      fatto({ id: '1', completato_il: '2026-07-01', dislivello: 800, fatto_dislivello: 1400 }),
      fatto({ id: '2', completato_il: '2026-07-02', dislivello: 600 }),
    ])
    expect(prima.dislivello).toBe(1400)
    expect(prima.neve).toBe(true)
    expect(seconda.dislivello).toBe(600)
    expect(seconda.neve).toBe(false)
  })

  it('le cime vanno da sinistra a destra accavallandosi', () => {
    const fila = montagne([
      fatto({ completato_il: '2026-01-01', dislivello: 1000 }),
      fatto({ completato_il: '2026-01-02', dislivello: 1000 }),
    ])
    expect(fila[1].x).toBeGreaterThan(fila[0].x)
    expect(fila[1].x - fila[1].larghezza / 2).toBeLessThan(fila[0].x + fila[0].larghezza / 2)
    expect(estensione(fila)).toBeCloseTo(fila[1].x + fila[1].larghezza / 2)
  })

  it('segna dove comincia ogni anno', () => {
    const fila = montagne([
      fatto({ completato_il: null }),
      fatto({ completato_il: '2025-05-01' }),
      fatto({ completato_il: '2025-09-01' }),
      fatto({ completato_il: '2026-03-01' }),
    ])
    expect(anni(fila).map((a) => a.anno)).toEqual([null, 2025, 2026])
  })
})

describe('profilo', () => {
  it('è sempre lo stesso per lo stesso seme, parte e finisce alla base e ha la vetta in cima', () => {
    const punti = profilo(42)
    expect(profilo(42)).toEqual(punti)
    expect(punti[0]).toEqual([0, 1])
    expect(punti[punti.length - 1]).toEqual([1, 1])
    expect(Math.min(...punti.map(([, y]) => y))).toBe(0)
    expect(profilo(43)).not.toEqual(punti)
  })
})

describe('stagioni e sfondo', () => {
  it('la stagione segue il mese del giro, e d’inverno anche le basse hanno la neve', async () => {
    const { stagioneDi, lineaNeve, crinale } = await import('./catena')
    expect(stagioneDi('2026-10-12')).toBe('autunno')
    expect(stagioneDi('2026-12-01')).toBe('inverno')
    expect(stagioneDi(null)).toBe('estate')
    const [bassa] = montagne([fatto({ completato_il: '2026-01-15', dislivello: 400 })])
    expect(bassa.neve).toBe(true)
    expect(lineaNeve(bassa)).toBeGreaterThanOrEqual(0.42)
    const c = crinale(7, 30)
    expect(c).toHaveLength(30)
    expect(crinale(7, 30)).toEqual(c)
    expect(c.every((v) => v >= 0 && v <= 1)).toBe(true)
  })
})

describe('comparsa in sequenza', () => {
  it('ogni cima parte all’80% della precedente, e con tante si stringe', async () => {
    const { passoComparsa, DURATA_SORGE } = await import('./catena')
    expect(passoComparsa(1)).toBe(0)
    expect(passoComparsa(3)).toBe(DURATA_SORGE * 0.8)
    expect(passoComparsa(41)).toBe(200)
  })

  it('l’inquadratura va da una cima all’altra e si ferma sull’ultima', async () => {
    const { puntoDiVista } = await import('./catena')
    const centri = [100, 300, 700]
    expect(puntoDiVista(centri, 720, 0)).toBe(100)
    expect(puntoDiVista(centri, 720, 360)).toBe(200)
    expect(puntoDiVista(centri, 720, 720)).toBe(300)
    expect(puntoDiVista(centri, 720, 99999)).toBe(700)
    expect(puntoDiVista([50], 0, 10)).toBe(50)
  })
})
