import { describe, expect, it } from 'vitest'
import { daKomoot, type TourKomoot } from './komoot'

const VERZASCA: TourKomoot = {
  nome: 'Lungo il fiume Verzasca da Brione a Lavertezzo',
  sport: 'hike',
  distanza_m: 11792.780032831855,
  salita_m: 210.16081283007713,
  discesa_m: 210.16081283007713,
  durata_s: 11767,
  grado: 'MODERATE',
  tecnica: 'dh#t1',
  anello: true,
  inizio: { lat: 46.294532, lon: 8.792679 },
  quota_max: 739.4,
  regione: 'Brione (Verzasca)',
  link: 'https://www.komoot.com/smarttour/e1407415219',
}

describe('daKomoot', () => {
  it('riempie il form del trekking', () => {
    expect(daKomoot(VERZASCA)).toEqual({
      tipo: 'trekking',
      nome: 'Lungo il fiume Verzasca da Brione a Lavertezzo',
      link: ['https://www.komoot.com/smarttour/e1407415219'],
      note: 'Da Komoot: 11,8 km · ad anello · difficoltà media (T1) · quota massima 739 m',
      dislivello: 210,
      // 3 h 16 → 3 h 30
      durata_ore: 3.5,
      luogo_nome: 'Brione (Verzasca)',
      lat: 46.294532,
      lon: 8.792679,
    })
  })

  it('la durata va a mezz\'ore, almeno mezz\'ora', () => {
    expect(daKomoot({ ...VERZASCA, durata_s: 3 * 3600 + 14 * 60 }).durata_ore).toBe(3)
    expect(daKomoot({ ...VERZASCA, durata_s: 600 }).durata_ore).toBe(0.5)
    expect(daKomoot({ ...VERZASCA, durata_s: null }).durata_ore).toBeNull()
  })

  it('senza comune il luogo sono le sole coordinate; senza partenza niente luogo', () => {
    expect(daKomoot({ ...VERZASCA, regione: null })).toMatchObject({ luogo_nome: null, lat: 46.294532, lon: 8.792679 })
    expect(daKomoot({ ...VERZASCA, inizio: null })).toMatchObject({ luogo_nome: null, lat: null, lon: null })
  })

  it('avvisa nelle note se il giro è di sola andata', () => {
    expect(daKomoot({ ...VERZASCA, anello: false, tecnica: null, quota_max: null }).note).toBe(
      'Da Komoot: 11,8 km · solo andata: durata e dislivello sono della sola andata · difficoltà media',
    )
  })

  it('un giro in piano non ha dislivello', () => {
    expect(daKomoot({ ...VERZASCA, salita_m: 0.4 }).dislivello).toBeNull()
  })
})
