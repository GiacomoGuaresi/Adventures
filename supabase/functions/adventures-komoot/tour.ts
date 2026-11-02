// Il giro di Komoot letto dalla sua pagina (docs/03-architettura.md). Modulo
// puro, senza Deno né DOM: lo usa la Edge Function per leggere la pagina e il
// browser per riconoscere i link; i test stanno accanto (`tour.test.ts`).
//
// Komoot non ha un'API pubblica per i giri condivisi, ma la pagina, aperta
// senza accesso, porta tutti i dati in `kmtBoot.setProps("…")`: una stringa
// JSON con dentro il JSON della pagina. Se Komoot cambia la pagina, `leggiTour`
// restituisce `null` e i dati si scrivono a mano come prima.

/** Il giro in un link di Komoot: tour pianificato o smarttour, con il token se è privato. */
export interface RiferimentoKomoot {
  tipo: 'tour' | 'smarttour'
  /** Numerico per i tour, `e` + numero per gli smarttour. */
  id: string
  share_token: string | null
}

export interface Punto {
  lat: number
  lon: number
}

/** Quello che la Edge Function restituisce: i numeri come li dà Komoot, da interpretare nel browser. */
export interface TourKomoot {
  nome: string
  /** `hike`, `mountaineering`, `mtb`, `touringbicycle`… */
  sport: string | null
  distanza_m: number | null
  salita_m: number | null
  discesa_m: number | null
  /** La durata stimata da Komoot per tutto il giro, in secondi. */
  durata_s: number | null
  /** `EASY`, `MODERATE`, `DIFFICULT`. */
  grado: string | null
  /** La scala tecnica, per l'escursionismo `dh#t1`…`dh#t6` (SAC). */
  tecnica: string | null
  /** `true` se finisce dove inizia. */
  anello: boolean | null
  inizio: Punto | null
  quota_max: number | null
  /** Il comune, solo per gli smarttour. */
  regione: string | null
  /** Il link da salvare, senza i parametri di tracciamento. */
  link: string
}

const HOST = /^(?:www\.)?komoot\.(?:com|it|de)$/

/**
 * Il primo link di Komoot nel testo: anche dentro il messaggio che l'app di
 * Komoot mette in "Condividi" ("Guarda questo giro… https://…").
 */
export function riferimentoKomoot(testo: string): RiferimentoKomoot | null {
  for (const parola of testo.match(/https?:\/\/\S+/g) ?? []) {
    let url: URL
    try {
      url = new URL(parola)
    } catch {
      continue
    }
    if (url.protocol !== 'https:' || !HOST.test(url.hostname)) continue
    // Il percorso può avere la lingua davanti e il nome del giro dopo:
    // /it-it/smarttour/e1407415219/lungo-il-fiume…
    const trovato = url.pathname.match(/^(?:\/[a-z]{2}-[a-z]{2})?\/(tour|smarttour)\/(e?\d+)(?:\/|$)/)
    if (!trovato) continue
    const [, tipo, id] = trovato
    if (tipo === 'tour' && id.startsWith('e')) continue
    return { tipo: tipo as RiferimentoKomoot['tipo'], id, share_token: url.searchParams.get('share_token') }
  }
  return null
}

/** Il link da salvare: quello canonico, col token se il giro è privato. */
export function linkKomoot(rif: RiferimentoKomoot): string {
  const link = `https://www.komoot.com/${rif.tipo}/${rif.id}`
  return rif.share_token ? `${link}?share_token=${encodeURIComponent(rif.share_token)}` : link
}

/** La pagina da scaricare: in italiano, così il nome arriva tradotto quando Komoot lo traduce. */
export function paginaKomoot(rif: RiferimentoKomoot): string {
  const pagina = `https://www.komoot.com/it-it/${rif.tipo}/${rif.id}`
  return rif.share_token ? `${pagina}?share_token=${encodeURIComponent(rif.share_token)}` : pagina
}

type Oggetto = Record<string, unknown>

function oggetto(valore: unknown): Oggetto | null {
  return typeof valore === 'object' && valore !== null && !Array.isArray(valore) ? (valore as Oggetto) : null
}

function numero(valore: unknown): number | null {
  return typeof valore === 'number' && Number.isFinite(valore) ? valore : null
}

function testo(valore: unknown): string | null {
  return typeof valore === 'string' && valore.trim() !== '' ? valore.trim() : null
}

/** Segue un percorso di chiavi; `null` appena una manca. */
function dentro(valore: unknown, ...chiavi: string[]): unknown {
  let corrente = valore
  for (const chiave of chiavi) {
    const o = oggetto(corrente)
    if (!o) return null
    corrente = o[chiave]
  }
  return corrente
}

/** Il JSON passato a `kmtBoot.setProps("…")`, o `null` se la pagina non ce l'ha. */
function proprieta(html: string): Oggetto | null {
  const inizio = html.indexOf('kmtBoot.setProps("')
  if (inizio < 0) return null
  const apertura = inizio + 'kmtBoot.setProps('.length
  // Fino alla virgoletta che chiude la stringa, saltando quelle con la barra.
  let fine = apertura + 1
  while (fine < html.length && html[fine] !== '"') fine += html[fine] === '\\' ? 2 : 1
  try {
    return oggetto(JSON.parse(JSON.parse(html.slice(apertura, fine + 1))))
  } catch {
    return null
  }
}

/** Il primo oggetto con quell'id e una distanza: il giro, dovunque Komoot lo metta. */
function cerca(valore: unknown, id: string, profondita = 0): Oggetto | null {
  if (profondita > 12) return null
  if (Array.isArray(valore)) {
    for (const v of valore) {
      const trovato = cerca(v, id, profondita + 1)
      if (trovato) return trovato
    }
    return null
  }
  const o = oggetto(valore)
  if (!o) return null
  if (String(o.id) === id && numero(o.distance) !== null) return o
  for (const v of Object.values(o)) {
    const trovato = cerca(v, id, profondita + 1)
    if (trovato) return trovato
  }
  return null
}

function punto(valore: unknown): Punto | null {
  const lat = numero(dentro(valore, 'lat'))
  const lon = numero(dentro(valore, 'lng'))
  return lat === null || lon === null ? null : { lat, lon }
}

/** La quota più alta del tracciato, se ci sono le coordinate con la quota. */
function quotaMassima(tour: Oggetto): number | null {
  const punti = dentro(tour, '_embedded', 'coordinates', 'items')
  if (!Array.isArray(punti)) return null
  let massima: number | null = null
  for (const p of punti) {
    const quota = numero(dentro(p, 'alt'))
    if (quota !== null && (massima === null || quota > massima)) massima = quota
  }
  return massima
}

/** Il comune degli smarttour: l'ultima delle regioni, dal paese al comune. */
function regione(proprieta: Oggetto): string | null {
  const regioni = dentro(proprieta, 'discoverTour', 'seoRegions')
  if (!Array.isArray(regioni) || regioni.length === 0) return null
  return testo(dentro(regioni[regioni.length - 1], 'regionName'))
}

/** I dati del giro dalla pagina di Komoot; `null` se la pagina non li ha (o non più). */
export function leggiTour(html: string, rif: RiferimentoKomoot): TourKomoot | null {
  const props = proprieta(html)
  if (!props) return null
  const sulla = oggetto(dentro(props, 'page', '_embedded', 'tour'))
  const tour = sulla && String(sulla.id) === rif.id ? sulla : cerca(props, rif.id)
  const nome = testo(tour?.name)
  if (!tour || !nome) return null
  return {
    nome,
    sport: testo(tour.sport),
    distanza_m: numero(tour.distance),
    salita_m: numero(tour.elevation_up),
    discesa_m: numero(tour.elevation_down),
    durata_s: numero(tour.duration),
    grado: testo(dentro(tour, 'difficulty', 'grade'))?.toUpperCase() ?? null,
    tecnica: testo(dentro(tour, 'difficulty', 'explanation_technical')),
    anello: typeof tour.roundtrip === 'boolean' ? tour.roundtrip : null,
    inizio: punto(tour.start_point),
    quota_max: quotaMassima(tour),
    regione: regione(props),
    link: linkKomoot(rif),
  }
}
