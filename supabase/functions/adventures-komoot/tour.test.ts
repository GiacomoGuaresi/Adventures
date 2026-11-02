import { describe, expect, it } from 'vitest'
import { leggiTour, linkKomoot, paginaKomoot, riferimentoKomoot } from './tour'

/** Una pagina come quella di Komoot: il JSON della pagina, in una stringa JSON, dentro `setProps`. */
function pagina(props: unknown): string {
  return `<html><script type="text/javascript">(function(){kmtBoot.setProps(${JSON.stringify(JSON.stringify(props))});})()</script></html>`
}

/** Lo smarttour "Lungo il fiume Verzasca", ridotto a quello che serve (scaricato il 2026-11-02). */
const VERZASCA = {
  page: {
    _embedded: {
      tour: {
        id: 'e1407415219',
        name: 'Lungo il fiume Verzasca da Brione a Lavertezzo',
        sport: 'hike',
        roundtrip: true,
        distance: 11792.780032831855,
        duration: 11767,
        difficulty: { grade: 'MODERATE', explanation_technical: 'dh#t1', explanation_fitness: 'd#c2' },
        start_point: { lat: 46.294532, lng: 8.792679, alt: 739.4 },
        elevation_up: 210.16081283007713,
        elevation_down: 210.16081283007713,
        _embedded: {
          coordinates: {
            items: [
              { lat: 46.294532, lng: 8.792679, alt: 739.4, t: 0 },
              { lat: 46.26, lng: 8.83, alt: 545.1, t: 6000000 },
              { lat: 46.294532, lng: 8.792679, alt: 739.4, t: 11767182 },
            ],
          },
        },
      },
    },
  },
  discoverTour: {
    seoRegions: [
      { regionName: 'Svizzera', regionType: 'country' },
      { regionName: 'Ticino', regionType: 'admin_region' },
      { regionName: 'Brione (Verzasca)', regionType: 'municipality' },
    ],
  },
}

const SMARTTOUR = { tipo: 'smarttour', id: 'e1407415219', share_token: null } as const

describe('riferimentoKomoot', () => {
  it('legge il link di "Condividi", anche dentro un messaggio', () => {
    expect(
      riferimentoKomoot('https://www.komoot.it/smarttour/e1407415219?ref=atd&t_s=referral&t_cid=route_share'),
    ).toEqual(SMARTTOUR)
    expect(riferimentoKomoot('Guarda questo giro su komoot: https://www.komoot.com/tour/1407415219?ref=wtd')).toEqual({
      tipo: 'tour',
      id: '1407415219',
      share_token: null,
    })
  })

  it('accetta la lingua e il nome nel percorso, e tiene il token dei giri privati', () => {
    expect(
      riferimentoKomoot('https://www.komoot.com/it-it/smarttour/e1407415219/lungo-il-fiume-verzasca-da-brione-a-lavertezzo'),
    ).toEqual(SMARTTOUR)
    expect(riferimentoKomoot('https://komoot.de/tour/123?share_token=abc&ref=wtd')).toEqual({
      tipo: 'tour',
      id: '123',
      share_token: 'abc',
    })
  })

  it('ignora gli altri siti e le altre pagine di Komoot', () => {
    expect(riferimentoKomoot('Rifugio Curò')).toBeNull()
    expect(riferimentoKomoot('https://maps.app.goo.gl/vn45qW5SUNBQR4nv7')).toBeNull()
    expect(riferimentoKomoot('https://www.komoot.com/it-it/guide/373/ticino')).toBeNull()
    expect(riferimentoKomoot('https://komoot.com.esempio.it/tour/123')).toBeNull()
    expect(riferimentoKomoot('http://www.komoot.com/tour/123')).toBeNull()
  })
})

describe('linkKomoot e paginaKomoot', () => {
  it('senza i parametri di tracciamento; la pagina in italiano', () => {
    expect(linkKomoot(SMARTTOUR)).toBe('https://www.komoot.com/smarttour/e1407415219')
    expect(paginaKomoot(SMARTTOUR)).toBe('https://www.komoot.com/it-it/smarttour/e1407415219')
    expect(linkKomoot({ tipo: 'tour', id: '123', share_token: 'a b' })).toBe(
      'https://www.komoot.com/tour/123?share_token=a%20b',
    )
  })
})

describe('leggiTour', () => {
  it('legge i numeri dello smarttour', () => {
    expect(leggiTour(pagina(VERZASCA), SMARTTOUR)).toEqual({
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
    })
  })

  it('trova il giro anche se non sta dove ce lo si aspetta', () => {
    const altrove = { page: {}, dehydrated: { queries: [{ data: VERZASCA.page._embedded.tour }] } }
    expect(leggiTour(pagina(altrove), SMARTTOUR)?.nome).toBe('Lungo il fiume Verzasca da Brione a Lavertezzo')
  })

  it('i campi che mancano sono null', () => {
    const tour = { page: { _embedded: { tour: { id: '9', name: 'Giro', distance: 1000 } } } }
    expect(leggiTour(pagina(tour), { tipo: 'tour', id: '9', share_token: null })).toMatchObject({
      nome: 'Giro',
      salita_m: null,
      durata_s: null,
      anello: null,
      inizio: null,
      quota_max: null,
      regione: null,
    })
  })

  it('null se la pagina non ha il giro', () => {
    expect(leggiTour('<html>Pagina non trovata</html>', SMARTTOUR)).toBeNull()
    expect(leggiTour('kmtBoot.setProps("{rotto")', SMARTTOUR)).toBeNull()
    expect(leggiTour(pagina(VERZASCA), { tipo: 'tour', id: '1', share_token: null })).toBeNull()
  })
})
