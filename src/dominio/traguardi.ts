/**
 * I traguardi (docs/02-funzionalita.md): premi che si sbloccano coi giri fatti,
 * per i trekking, per le avventure o per tutti e due, e diventano timbri del
 * passaporto. Come i numeri della Foresta di Projects si calcolano dall'elenco
 * e non si salvano: il giorno di sblocco è quello del giro che ha fatto
 * superare la soglia. Quelli che guardano dove sta il giro rispetto a casa
 * restano da sbloccare finché la posizione di casa non c'è.
 */

import { dislivelloFatto, minutiFatti } from './completamento'
import type { Coordinate } from './coordinate'
import { completate } from './cronologia'
import { distanza } from './distanza'
import { inItalia } from './italia'
import { stagioneDi } from './stagioni'
import type { Attivita } from './tipi'

/** L'icona, scelta dall'interfaccia: qui resta solo il nome. */
export type IconaTraguardo = 'bandiera' | 'vetta' | 'neve' | 'scarpone' | 'stella' | 'razzo' | 'timbro' | 'bussola' | 'foglia' | 'fiamma'

/** A che punto si è di un traguardo non ancora raggiunto: `fatto` di `serve`, nell'unità detta. */
export interface Avanzamento {
  fatto: number
  serve: number
  unita: 'm' | 'km' | 'h' | 'min' | 'm/h' | ''
}

type Casa = Coordinate | null

export interface Traguardo {
  id: string
  titolo: string
  /** Cosa serve: si legge nell'elenco di quelli da sbloccare. */
  descrizione: string
  icona: IconaTraguardo
  /** Il giro che lo sblocca, fra i completati in ordine di giro; `null` se non è ancora raggiunto. */
  raggiunto: (cronologia: readonly Attivita[], casa: Casa) => Attivita | null
  /** A che punto si è; manca dove non ha senso contare (un mese con trekking e avventura). */
  avanzamento?: (cronologia: readonly Attivita[], casa: Casa) => Avanzamento
}

type Righe = readonly Attivita[]
type Filtro = (righe: Righe) => Attivita[]
type Valore = (a: Attivita, casa: Casa) => number | null

const tutti: Filtro = (righe) => [...righe]
const trekking: Filtro = (righe) => righe.filter((a) => a.tipo === 'trekking')
const avventure: Filtro = (righe) => righe.filter((a) => a.tipo === 'avventura')
const lontane: Filtro = (righe) => avventure(righe).filter((a) => (a.viaggio_minuti ?? 0) >= 120)
/** I giri con la data: solo loro dicono quando, e contano per mesi, settimane e anni. */
const datati: Filtro = (righe) => righe.filter((a) => a.completato_il !== null)
const trekkingDatati: Filtro = (righe) => datati(trekking(righe))

type Base = Pick<Traguardo, 'id' | 'titolo' | 'descrizione' | 'icona'>

/** Raggiunto all'n-esimo giro della lista. */
function conta(base: Base, n: number, filtro: Filtro): Traguardo {
  return {
    ...base,
    raggiunto: (r) => filtro(r)[n - 1] ?? null,
    avanzamento: (r) => ({ fatto: Math.min(filtro(r).length, n), serve: n, unita: '' }),
  }
}

/** Raggiunto col trekking con cui la somma arriva alla soglia. */
function somma(base: Base, soglia: number, valore: Valore, unita: Avanzamento['unita']): Traguardo {
  return {
    ...base,
    raggiunto: (r, casa) => {
      let totale = 0
      for (const a of trekking(r)) {
        totale += valore(a, casa) ?? 0
        if (totale >= soglia) return a
      }
      return null
    },
    avanzamento: (r, casa) => ({
      fatto: Math.min(soglia, Math.round(trekking(r).reduce((t, a) => t + (valore(a, casa) ?? 0), 0) * 10) / 10),
      serve: soglia,
      unita,
    }),
  }
}

/** Raggiunto col primo giro che arriva alla soglia, di solito un trekking; l'avanzamento è il migliore finora. */
function migliore(base: Base, soglia: number, valore: Valore, unita: Avanzamento['unita'], filtro: Filtro = trekking): Traguardo {
  return {
    ...base,
    raggiunto: (r, casa) => filtro(r).find((a) => (valore(a, casa) ?? 0) >= soglia) ?? null,
    avanzamento: (r, casa) => ({
      fatto: Math.min(soglia, Math.max(0, ...filtro(r).map((a) => valore(a, casa) ?? 0))),
      serve: soglia,
      unita,
    }),
  }
}

/** Raggiunto col primo giro che va bene, guardando anche quelli fatti prima di lui. */
function uno(base: Base, filtro: Filtro, vale: (a: Attivita, prima: Attivita[], casa: Casa) => boolean): Traguardo {
  return {
    ...base,
    raggiunto: (r, casa) => {
      const righe = filtro(r)
      return righe.find((a, i) => vale(a, righe.slice(0, i), casa)) ?? null
    },
  }
}

/**
 * Raggiunto col giro che porta un gruppo (lo stesso mese, la stessa settimana,
 * lo stesso anno...) alla misura che serve; i giri con chiave `null` non
 * contano. L'avanzamento, se c'è, è il gruppo migliore finora.
 */
function gruppi(
  base: Base,
  filtro: Filtro,
  chiave: (a: Attivita, casa: Casa) => string | null,
  misura: (gruppo: Attivita[], casa: Casa) => number,
  serve: number,
  conAvanzamento = true,
): Traguardo {
  const raccogli = (r: Righe, casa: Casa, fino?: (gruppo: Attivita[]) => boolean) => {
    const visti = new Map<string, Attivita[]>()
    for (const a of filtro(r)) {
      const k = chiave(a, casa)
      if (k === null) continue
      const gruppo = [...(visti.get(k) ?? []), a]
      visti.set(k, gruppo)
      if (fino?.(gruppo)) return { visti, ultimo: a }
    }
    return { visti, ultimo: null }
  }
  return {
    ...base,
    raggiunto: (r, casa) => raccogli(r, casa, (g) => misura(g, casa) >= serve).ultimo,
    avanzamento: conAvanzamento
      ? (r, casa) => ({
          fatto: Math.min(serve, Math.max(0, ...[...raccogli(r, casa).visti.values()].map((g) => misura(g, casa)))),
          serve,
          unita: '',
        })
      : undefined,
  }
}

/** Quanti valori diversi ha il gruppo: stagioni, mesi, tipi. */
const diversi =
  <T>(valore: (a: Attivita) => T) =>
  (gruppo: Attivita[]) =>
    new Set(gruppo.map(valore)).size

const STAGIONI = ['inverno', 'inverno', 'primavera', 'primavera', 'primavera', 'estate', 'estate', 'estate', 'autunno', 'autunno', 'autunno', 'inverno']

/** La stagione del giro, a mesi interi (dicembre è già inverno). */
export function stagione(a: Attivita): string | null {
  return a.completato_il === null ? null : STAGIONI[Number(a.completato_il.slice(5, 7)) - 1]
}

/** Il giorno del giro contato dal 1970, per le distanze in giorni. */
const numeroGiorno = (data: string) => Date.parse(`${data}T00:00:00Z`) / 86_400_000
/** Il giorno della settimana, domenica 0. */
const giornoSettimana = (data: string) => new Date(`${data}T00:00:00Z`).getUTCDay()
/** Il mese contato dall'anno zero, così due mesi di fila distano uno anche a capodanno. */
const numeroMese = (data: string) => Number(data.slice(0, 4)) * 12 + Number(data.slice(5, 7)) - 1

const data = (a: Attivita) => a.completato_il!
const mese = (a: Attivita) => data(a).slice(5, 7)
const meseAnno = (a: Attivita) => data(a).slice(0, 7)
const anno = (a: Attivita) => data(a).slice(0, 4)
/** Il lunedì della settimana del giro. */
const settimana = (a: Attivita) => String(numeroGiorno(data(a)) - ((giornoSettimana(data(a)) + 6) % 7))
/** Il sabato del weekend del giro; `null` dal lunedì al venerdì. */
function weekend(a: Attivita): string | null {
  const g = giornoSettimana(data(a))
  if (g === 6) return String(numeroGiorno(data(a)))
  if (g === 0) return String(numeroGiorno(data(a)) - 1)
  return null
}

const quanti = (tipo: Attivita['tipo']) => (gruppo: Attivita[]) => gruppo.filter((a) => a.tipo === tipo).length

/** I mesi di fila con almeno un giro che finiscono in quello di `a`. */
function filaFinoA(a: Attivita, mesi: Set<number>): number {
  let n = 0
  while (mesi.has(numeroMese(data(a)) - n)) n++
  return n
}

function mesiDiFila(base: Base, n: number): Traguardo {
  return {
    ...base,
    raggiunto: (r) => {
      const mesi = new Set<number>()
      for (const a of datati(r)) {
        mesi.add(numeroMese(data(a)))
        if (filaFinoA(a, mesi) >= n) return a
      }
      return null
    },
    avanzamento: (r) => {
      const giri = datati(r)
      const mesi = new Set(giri.map((a) => numeroMese(data(a))))
      return { fatto: Math.min(n, Math.max(0, ...giri.map((a) => filaFinoA(a, mesi)))), serve: n, unita: '' }
    },
  }
}

/** Il punto del giro; `null` se non ha il luogo. */
const punto = (a: Attivita): Coordinate | null => (a.lat === null || a.lon === null ? null : { lat: a.lat, lon: a.lon })

/** I chilometri verso nord (positivi) o verso sud (negativi) da casa. */
function versoNord(a: Attivita, casa: Casa): number | null {
  const p = punto(a)
  if (p === null || casa === null) return null
  return Math.round(distanza(casa, { lat: p.lat, lon: casa.lon }) * Math.sign(p.lat - casa.lat))
}

/** Il punto cardinale del giro visto da casa, se è ad almeno 10 km. */
function puntoCardinale(a: Attivita, casa: Casa): string | null {
  const p = punto(a)
  if (p === null || casa === null || distanza(casa, p) < 10) return null
  const nord = p.lat - casa.lat
  const est = (p.lon - casa.lon) * Math.cos((casa.lat * Math.PI) / 180)
  if (Math.abs(nord) >= Math.abs(est)) return nord > 0 ? 'nord' : 'sud'
  return est > 0 ? 'est' : 'ovest'
}

/** I posti lontani almeno 20 km da tutti quelli contati prima, in ordine di giro. */
function postiDiversi(gruppo: Attivita[]): number {
  const posti: Coordinate[] = []
  for (const a of gruppo) {
    const p = punto(a)
    if (p !== null && posti.every((q) => distanza(p, q) >= 20)) posti.push(p)
  }
  return posti.length
}

/** I metri di salita in un'ora, coi numeri veri di Garmin o Komoot e su almeno un'ora di giro. */
function passo(a: Attivita): number | null {
  if (a.fatto_dislivello === null || a.fatto_durata_minuti === null || a.fatto_durata_minuti < 60) return null
  return Math.round(a.fatto_dislivello / (a.fatto_durata_minuti / 60))
}

const km = (a: Attivita) => a.fatto_km
const quota = (a: Attivita) => a.fatto_quota_max
const oreFatte = (a: Attivita) => {
  const m = minutiFatti(a)
  return m === null ? null : Math.round((m / 60) * 10) / 10
}
const viaggio = (a: Attivita) => a.viaggio_minuti

const equilibrio: Traguardo = {
  id: 'equilibrio',
  titolo: 'Equilibrio',
  descrizione: 'Almeno 10 trekking e 10 avventure',
  icona: 'stella',
  raggiunto: (r) => {
    let t = 0
    let v = 0
    for (const a of r) {
      if (a.tipo === 'trekking') t++
      else v++
      if (t >= 10 && v >= 10) return a
    }
    return null
  },
  avanzamento: (r) => ({ fatto: Math.min(10, trekking(r).length) + Math.min(10, avventure(r).length), serve: 20, unita: '' }),
}

export const TRAGUARDI: readonly Traguardo[] = [
  // Trekking fatti
  conta({ id: 'prima-cima', titolo: 'Prima cima', descrizione: 'Completa un trekking', icona: 'bandiera' }, 1, trekking),
  conta({ id: 'trekking-5', titolo: 'Cinque cime', descrizione: 'Completa 5 trekking', icona: 'scarpone' }, 5, trekking),
  conta({ id: 'trekking-10', titolo: 'Dieci cime', descrizione: 'Completa 10 trekking', icona: 'scarpone' }, 10, trekking),
  conta({ id: 'trekking-25', titolo: 'Catena lunga', descrizione: 'Completa 25 trekking', icona: 'scarpone' }, 25, trekking),
  conta({ id: 'trekking-50', titolo: 'Cinquanta cime', descrizione: 'Completa 50 trekking', icona: 'stella' }, 50, trekking),
  conta({ id: 'trekking-100', titolo: 'Cento cime', descrizione: 'Completa 100 trekking', icona: 'stella' }, 100, trekking),

  // Dislivello in tutto
  somma({ id: 'dislivello-1000', titolo: 'Mille metri', descrizione: '1.000 m di dislivello in tutto', icona: 'vetta' }, 1000, dislivelloFatto, 'm'),
  somma({ id: 'gran-paradiso', titolo: 'Gran Paradiso', descrizione: '4.061 m di dislivello in tutto, il 4000 tutto italiano', icona: 'neve' }, 4061, dislivelloFatto, 'm'),
  somma({ id: 'cervino', titolo: 'Cervino', descrizione: '4.478 m di dislivello in tutto', icona: 'vetta' }, 4478, dislivelloFatto, 'm'),
  somma({ id: 'monte-rosa', titolo: 'Monte Rosa', descrizione: '4.634 m di dislivello in tutto', icona: 'neve' }, 4634, dislivelloFatto, 'm'),
  somma({ id: 'monte-bianco', titolo: 'Monte Bianco', descrizione: '4.808 m di dislivello in tutto', icona: 'neve' }, 4808, dislivelloFatto, 'm'),
  somma({ id: 'aconcagua', titolo: 'Aconcagua', descrizione: '6.961 m di dislivello in tutto', icona: 'vetta' }, 6961, dislivelloFatto, 'm'),
  somma({ id: 'everest', titolo: 'Everest', descrizione: '8.849 m di dislivello in tutto', icona: 'neve' }, 8849, dislivelloFatto, 'm'),
  somma({ id: 'due-everest', titolo: 'Due Everest', descrizione: '17.698 m di dislivello in tutto', icona: 'stella' }, 17698, dislivelloFatto, 'm'),
  somma({ id: 'cinque-everest', titolo: 'Cinque Everest', descrizione: '44.245 m di dislivello in tutto', icona: 'stella' }, 44245, dislivelloFatto, 'm'),
  somma({ id: 'dieci-everest', titolo: 'Dieci Everest', descrizione: '88.490 m di dislivello in tutto', icona: 'stella' }, 88490, dislivelloFatto, 'm'),
  somma(
    { id: 'spazio', titolo: 'Fino allo spazio', descrizione: '100 km di dislivello in tutto: la linea di Kármán', icona: 'razzo' },
    100_000,
    dislivelloFatto,
    'm',
  ),

  // Dislivello in un giro
  migliore({ id: 'mille-in-un-colpo', titolo: 'Mille in un colpo', descrizione: 'Un trekking da almeno 1.000 m di dislivello', icona: 'fiamma' }, 1000, dislivelloFatto, 'm'),
  migliore({ id: 'gambe', titolo: "Gambe d'acciaio", descrizione: 'Un trekking da almeno 1.500 m di dislivello', icona: 'fiamma' }, 1500, dislivelloFatto, 'm'),
  migliore({ id: 'duemila', titolo: 'Duemila', descrizione: 'Un trekking da almeno 2.000 m di dislivello', icona: 'fiamma' }, 2000, dislivelloFatto, 'm'),
  uno({ id: 'passeggiata', titolo: 'Passeggiata', descrizione: 'Un trekking sotto i 300 m di dislivello: anche i giri corti contano', icona: 'foglia' }, trekking, (a) => {
    const d = dislivelloFatto(a)
    return d !== null && d < 300
  }),

  // Quota
  migliore({ id: 'quota-2000', titolo: 'Duemila metri', descrizione: 'Arriva sopra i 2.000 m di quota', icona: 'vetta' }, 2000, quota, 'm'),
  migliore({ id: 'quota-2500', titolo: 'Duemilacinquecento', descrizione: 'Arriva sopra i 2.500 m di quota', icona: 'vetta' }, 2500, quota, 'm'),
  migliore({ id: 'tremila', titolo: 'Tremila', descrizione: 'Arriva sopra i 3.000 m di quota', icona: 'neve' }, 3000, quota, 'm'),
  migliore({ id: 'quattromila', titolo: 'Quattromila', descrizione: 'Arriva sopra i 4.000 m di quota', icona: 'neve' }, 4000, quota, 'm'),

  // Chilometri
  migliore({ id: 'lunga-distanza', titolo: 'Lunga distanza', descrizione: 'Un trekking da almeno 20 km', icona: 'scarpone' }, 20, km, 'km'),
  migliore({ id: 'trenta-km', titolo: 'Trenta km', descrizione: 'Un trekking da almeno 30 km', icona: 'fiamma' }, 30, km, 'km'),
  somma({ id: 'mezza-maratona', titolo: 'Mezza maratona', descrizione: '21,1 km camminati in tutto', icona: 'scarpone' }, 21.1, km, 'km'),
  somma({ id: 'maratona', titolo: 'Maratona', descrizione: '42,2 km camminati in tutto', icona: 'scarpone' }, 42.2, km, 'km'),
  somma({ id: 'cento-km', titolo: 'Cento km', descrizione: '100 km camminati in tutto', icona: 'scarpone' }, 100, km, 'km'),
  somma({ id: 'via-francigena', titolo: 'Via Francigena', descrizione: '1.000 km camminati in tutto, quanti dal Gran San Bernardo a Roma', icona: 'bussola' }, 1000, km, 'km'),
  somma({ id: 'giro-d-italia', titolo: "Lungo il Giro d'Italia", descrizione: '3.500 km camminati in tutto', icona: 'stella' }, 3500, km, 'km'),

  // Tempo in cammino
  migliore({ id: 'una-giornata', titolo: 'Una giornata', descrizione: 'Un trekking da almeno 8 ore', icona: 'fiamma' }, 8, oreFatte, 'h'),
  somma({ id: 'cento-ore', titolo: 'Cento ore', descrizione: '100 ore di cammino in tutto', icona: 'scarpone' }, 100, oreFatte, 'h'),
  somma({ id: 'mille-ore', titolo: 'Mille ore', descrizione: '1.000 ore di cammino in tutto', icona: 'stella' }, 1000, oreFatte, 'h'),
  migliore({ id: 'passo-svelto', titolo: 'Passo svelto', descrizione: 'Un trekking a 500 m di salita all’ora, coi numeri veri del giro', icona: 'razzo' }, 500, passo, 'm/h'),

  // Avventure fatte
  conta({ id: 'prima-avventura', titolo: 'Primo timbro', descrizione: "Completa un'avventura", icona: 'timbro' }, 1, avventure),
  conta({ id: 'avventure-3', titolo: 'Tre timbri', descrizione: 'Completa 3 avventure', icona: 'timbro' }, 3, avventure),
  conta({ id: 'avventure-5', titolo: 'Passaporto in uso', descrizione: 'Completa 5 avventure', icona: 'timbro' }, 5, avventure),
  conta({ id: 'avventure-10', titolo: 'Giramondo', descrizione: 'Completa 10 avventure', icona: 'stella' }, 10, avventure),
  conta({ id: 'avventure-25', titolo: 'Venticinque timbri', descrizione: 'Completa 25 avventure', icona: 'timbro' }, 25, avventure),
  conta({ id: 'avventure-50', titolo: 'Passaporto pieno', descrizione: 'Completa 50 avventure', icona: 'stella' }, 50, avventure),

  // Lontano da casa
  uno({ id: 'dietro-l-angolo', titolo: "Dietro l'angolo", descrizione: "Un'avventura a meno di mezz'ora d'auto da casa", icona: 'bussola' }, avventure, (a) => a.viaggio_minuti !== null && a.viaggio_minuti < 30),
  migliore({ id: 'mezza-giornata', titolo: 'Mezza giornata', descrizione: "Un giro ad almeno un'ora d'auto da casa", icona: 'bussola' }, 60, viaggio, 'min', tutti),
  conta({ id: 'fuori-porta', titolo: 'Fuori porta', descrizione: "Un'avventura ad almeno 2 ore d'auto da casa", icona: 'bussola' }, 1, lontane),
  conta({ id: 'esploratore', titolo: 'Esploratore', descrizione: "Tre avventure ad almeno 2 ore d'auto da casa", icona: 'bussola' }, 3, lontane),
  migliore({ id: 'lontano-lontano', titolo: 'Lontano lontano', descrizione: "Un giro ad almeno 4 ore d'auto da casa", icona: 'bussola' }, 240, viaggio, 'min', tutti),
  uno({ id: 'oltre-confine', titolo: 'Oltre confine', descrizione: "Un giro fuori dall'Italia", icona: 'bussola' }, tutti, (a) => {
    const p = punto(a)
    return p !== null && !inItalia(p)
  }),
  gruppi(
    { id: 'cinque-posti', titolo: 'Cinque province', descrizione: 'Giri in 5 posti lontani almeno 20 km l’uno dall’altro', icona: 'bussola' },
    tutti,
    (a) => (punto(a) === null ? null : ''),
    postiDiversi,
    5,
  ),
  gruppi(
    { id: 'rosa-dei-venti', titolo: 'Rosa dei venti', descrizione: 'Un giro a nord, a sud, a est e a ovest di casa, ad almeno 10 km', icona: 'bussola' },
    tutti,
    (a, casa) => (puntoCardinale(a, casa) === null ? null : ''),
    (g, casa) => new Set(g.map((a) => puntoCardinale(a, casa))).size,
    4,
  ),
  migliore({ id: 'verso-nord', titolo: 'Verso nord', descrizione: 'Un giro almeno 100 km più a nord di casa', icona: 'bussola' }, 100, versoNord, 'km', tutti),
  migliore(
    { id: 'verso-sud', titolo: 'Verso sud', descrizione: 'Un giro almeno 100 km più a sud di casa', icona: 'bussola' },
    100,
    (a, casa) => {
      const n = versoNord(a, casa)
      return n === null ? null : -n
    },
    'km',
    tutti,
  ),

  // Stagioni e calendario
  gruppi({ id: 'quattro-stagioni', titolo: 'Quattro stagioni', descrizione: 'Un trekking in ogni stagione', icona: 'foglia' }, trekkingDatati, () => '', diversi(stagione), 4),
  gruppi(
    { id: 'quattro-stagioni-avventura', titolo: "Quattro stagioni d'avventura", descrizione: "Un'avventura in ogni stagione", icona: 'foglia' },
    (r) => datati(avventure(r)),
    () => '',
    diversi(stagione),
    4,
  ),
  uno({ id: 'invernale', titolo: 'Invernale', descrizione: 'Un trekking a dicembre, gennaio o febbraio', icona: 'neve' }, trekkingDatati, (a) => stagione(a) === 'inverno'),
  uno({ id: 'sopra-la-neve', titolo: 'Sopra la neve', descrizione: "Un trekking d'inverno sopra i 1.500 m di quota", icona: 'neve' }, trekkingDatati, (a) => stagione(a) === 'inverno' && (a.fatto_quota_max ?? 0) >= 1500),
  uno({ id: 'ferragosto', titolo: 'Ferragosto in quota', descrizione: 'Un trekking il 15 agosto', icona: 'vetta' }, trekkingDatati, (a) => data(a).endsWith('-08-15')),
  uno({ id: 'capodanno', titolo: 'Capodanno', descrizione: 'Un giro il 1° gennaio', icona: 'stella' }, datati, (a) => data(a).endsWith('-01-01')),
  gruppi({ id: 'dodici-mesi', titolo: 'Dodici mesi', descrizione: 'Un giro in ognuno dei 12 mesi, anche in anni diversi', icona: 'stella' }, datati, () => '', diversi(mese), 12),
  gruppi({ id: 'anno-pieno', titolo: 'Anno pieno', descrizione: 'Un giro in tutti i 12 mesi dello stesso anno', icona: 'stella' }, datati, anno, diversi(mese), 12),
  uno({ id: 'infrasettimanale', titolo: 'Infrasettimanale', descrizione: 'Un giro di martedì, mercoledì o giovedì', icona: 'foglia' }, datati, (a) => [2, 3, 4].includes(giornoSettimana(data(a)))),
  gruppi({ id: 'weekend-lungo', titolo: 'Weekend lungo', descrizione: 'Un giro il sabato e uno la domenica dello stesso weekend', icona: 'fiamma' }, datati, weekend, diversi(data), 2, false),
  uno({ id: 'fuori-stagione', titolo: 'Fuori stagione', descrizione: "Un'avventura fatta in una stagione che non è fra le sue", icona: 'foglia' }, (r) => datati(avventure(r)), (a) => a.stagioni.length > 0 && !a.stagioni.includes(stagioneDi(a.completato_il))),

  // Costanza
  mesiDiFila({ id: 'tre-di-fila', titolo: 'Tre di fila', descrizione: 'Un giro in 3 mesi di fila', icona: 'fiamma' }, 3),
  mesiDiFila({ id: 'sei-di-fila', titolo: 'Sei di fila', descrizione: 'Un giro in 6 mesi di fila', icona: 'fiamma' }, 6),
  gruppi({ id: 'settimana-d-oro', titolo: "Settimana d'oro", descrizione: 'Tre giri nella stessa settimana', icona: 'fiamma' }, datati, settimana, (g) => g.length, 3),
  uno({ id: 'ritorno', titolo: 'Ritorno', descrizione: 'Un giro dopo almeno sei mesi di pausa', icona: 'foglia' }, datati, (a, prima) => {
    const ultimo = prima[prima.length - 1]
    return ultimo !== undefined && numeroGiorno(data(a)) - numeroGiorno(data(ultimo)) >= 182
  }),
  uno({ id: 'anniversario', titolo: 'Anniversario', descrizione: 'Un giro a un anno giusto dal primo, una settimana più o meno', icona: 'timbro' }, datati, (a, prima) => {
    if (prima.length === 0) return false
    const giorni = numeroGiorno(data(a)) - numeroGiorno(data(prima[0]))
    const anni = Math.round(giorni / 365.25)
    return anni >= 1 && Math.abs(giorni - anni * 365.25) <= 7
  }),
  gruppi({ id: 'dieci-in-un-anno', titolo: 'Dieci in un anno', descrizione: '10 giri nello stesso anno', icona: 'stella' }, datati, anno, (g) => g.length, 10),
  gruppi({ id: 'venti-in-un-anno', titolo: 'Venti in un anno', descrizione: '20 giri nello stesso anno', icona: 'stella' }, datati, anno, (g) => g.length, 20),

  // Trekking e avventure insieme
  gruppi({ id: 'doppietta', titolo: 'Doppietta', descrizione: "Un trekking e un'avventura nello stesso mese", icona: 'stella' }, datati, meseAnno, diversi((a) => a.tipo), 2, false),
  gruppi(
    { id: 'tris', titolo: 'Tris', descrizione: "Due trekking e un'avventura nello stesso mese", icona: 'stella' },
    datati,
    meseAnno,
    (g) => Math.min(2, quanti('trekking')(g)) + Math.min(1, quanti('avventura')(g)),
    3,
    false,
  ),
  gruppi({ id: 'stesso-giorno', titolo: 'Stesso giorno', descrizione: "Un trekking e un'avventura nello stesso giorno", icona: 'razzo' }, datati, data, diversi((a) => a.tipo), 2, false),
  gruppi(
    { id: 'weekend-completo', titolo: 'Weekend completo', descrizione: "Un trekking e un'avventura in giorni diversi dello stesso weekend", icona: 'stella' },
    datati,
    weekend,
    (g) => (g.some((t) => t.tipo === 'trekking' && g.some((v) => v.tipo === 'avventura' && data(v) !== data(t))) ? 1 : 0),
    1,
    false,
  ),
  equilibrio,
]

export interface Sblocco {
  traguardo: Traguardo
  /** Il giro che l'ha sbloccato; `null` se è ancora da raggiungere. */
  da: Attivita | null
  /** A che punto si è, solo per quelli da raggiungere che si possono contare. */
  avanzamento: Avanzamento | null
}

/** Tutti i traguardi, ognuno col giro che l'ha sbloccato o `null`. */
export function traguardi(attivita: readonly Attivita[], casa: Casa = null): Sblocco[] {
  const cronologia = completate(attivita)
  return TRAGUARDI.map((traguardo) => {
    const da = traguardo.raggiunto(cronologia, casa)
    return { traguardo, da, avanzamento: da === null && traguardo.avanzamento ? traguardo.avanzamento(cronologia, casa) : null }
  })
}

/** I traguardi sbloccati da questo giro: quelli da festeggiare nella cerimonia. */
export function sbloccatiDa(attivita: readonly Attivita[], id: string, casa: Casa = null): Sblocco[] {
  return traguardi(attivita, casa).filter((s) => s.da?.id === id)
}
