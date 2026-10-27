/**
 * I traguardi (docs/02-funzionalita.md): premi che si sbloccano coi giri fatti,
 * per i trekking, per le avventure o per tutti e due, e diventano timbri del
 * passaporto. Come i numeri della Foresta di Projects si calcolano dall'elenco
 * e non si salvano: il giorno di sblocco è quello del giro che ha fatto
 * superare la soglia.
 */

import { dislivelloFatto } from './completamento'
import { completate } from './cronologia'
import type { Attivita } from './tipi'

/** L'icona, scelta dall'interfaccia: qui resta solo il nome. */
export type IconaTraguardo = 'bandiera' | 'vetta' | 'neve' | 'scarpone' | 'stella' | 'razzo' | 'timbro' | 'bussola' | 'foglia' | 'fiamma'

/** A che punto si è di un traguardo non ancora raggiunto: `fatto` di `serve`, nell'unità detta. */
export interface Avanzamento {
  fatto: number
  serve: number
  unita: 'm' | 'km' | ''
}

export interface Traguardo {
  id: string
  titolo: string
  /** Cosa serve: si legge nell'elenco di quelli da sbloccare. */
  descrizione: string
  icona: IconaTraguardo
  /** Il giro che lo sblocca, fra i completati in ordine di giro; `null` se non è ancora raggiunto. */
  raggiunto: (cronologia: readonly Attivita[]) => Attivita | null
  /** A che punto si è; manca dove non ha senso contare (un mese con trekking e avventura). */
  avanzamento?: (cronologia: readonly Attivita[]) => Avanzamento
}

type Righe = readonly Attivita[]
type Filtro = (righe: Righe) => Attivita[]
type Valore = (a: Attivita) => number | null

const trekking: Filtro = (righe) => righe.filter((a) => a.tipo === 'trekking')
const avventure: Filtro = (righe) => righe.filter((a) => a.tipo === 'avventura')
const lontane: Filtro = (righe) => avventure(righe).filter((a) => (a.viaggio_minuti ?? 0) >= 120)

type Base = Pick<Traguardo, 'id' | 'titolo' | 'descrizione' | 'icona'>

/** Raggiunto all'n-esimo giro della lista. */
function conta(base: Base, n: number, filtro: Filtro): Traguardo {
  return {
    ...base,
    raggiunto: (r) => filtro(r)[n - 1] ?? null,
    avanzamento: (r) => ({ fatto: Math.min(filtro(r).length, n), serve: n, unita: '' }),
  }
}

/** Raggiunto col giro con cui la somma arriva alla soglia. */
function somma(base: Base, soglia: number, valore: Valore, unita: Avanzamento['unita']): Traguardo {
  return {
    ...base,
    raggiunto: (r) => {
      let totale = 0
      for (const a of trekking(r)) {
        totale += valore(a) ?? 0
        if (totale >= soglia) return a
      }
      return null
    },
    avanzamento: (r) => ({
      fatto: Math.min(soglia, Math.round(trekking(r).reduce((t, a) => t + (valore(a) ?? 0), 0) * 10) / 10),
      serve: soglia,
      unita,
    }),
  }
}

/** Raggiunto col primo trekking che arriva alla soglia; l'avanzamento è il migliore finora. */
function migliore(base: Base, soglia: number, valore: Valore, unita: Avanzamento['unita']): Traguardo {
  return {
    ...base,
    raggiunto: (r) => trekking(r).find((a) => (valore(a) ?? 0) >= soglia) ?? null,
    avanzamento: (r) => ({ fatto: Math.min(soglia, Math.max(0, ...trekking(r).map((a) => valore(a) ?? 0))), serve: soglia, unita }),
  }
}

const STAGIONI = ['inverno', 'inverno', 'primavera', 'primavera', 'primavera', 'estate', 'estate', 'estate', 'autunno', 'autunno', 'autunno', 'inverno']

/** La stagione del giro, a mesi interi (dicembre è già inverno). */
export function stagione(a: Attivita): string | null {
  return a.completato_il === null ? null : STAGIONI[Number(a.completato_il.slice(5, 7)) - 1]
}

const quattroStagioni: Traguardo = {
  id: 'quattro-stagioni',
  titolo: 'Quattro stagioni',
  descrizione: 'Un trekking in ogni stagione',
  icona: 'foglia',
  raggiunto: (r) => {
    const viste = new Set<string>()
    for (const a of trekking(r)) {
      const s = stagione(a)
      if (s) viste.add(s)
      if (viste.size === 4) return a
    }
    return null
  },
  avanzamento: (r) => ({ fatto: new Set(trekking(r).map(stagione).filter(Boolean)).size, serve: 4, unita: '' }),
}

const doppietta: Traguardo = {
  id: 'doppietta',
  titolo: 'Doppietta',
  descrizione: "Un trekking e un'avventura nello stesso mese",
  icona: 'stella',
  raggiunto: (r) => {
    const mesi = new Map<string, Set<string>>()
    for (const a of r) {
      if (a.completato_il === null) continue
      const mese = a.completato_il.slice(0, 7)
      const tipi = mesi.get(mese) ?? new Set<string>()
      tipi.add(a.tipo)
      mesi.set(mese, tipi)
      if (tipi.size === 2) return a
    }
    return null
  },
}

const km = (a: Attivita) => a.fatto_km
const quota = (a: Attivita) => a.fatto_quota_max

export const TRAGUARDI: readonly Traguardo[] = [
  conta({ id: 'prima-cima', titolo: 'Prima cima', descrizione: 'Completa un trekking', icona: 'bandiera' }, 1, trekking),
  conta({ id: 'trekking-10', titolo: 'Dieci cime', descrizione: 'Completa 10 trekking', icona: 'scarpone' }, 10, trekking),
  conta({ id: 'trekking-25', titolo: 'Catena lunga', descrizione: 'Completa 25 trekking', icona: 'scarpone' }, 25, trekking),
  somma({ id: 'dislivello-1000', titolo: 'Mille metri', descrizione: '1.000 m di dislivello in tutto', icona: 'vetta' }, 1000, dislivelloFatto, 'm'),
  somma({ id: 'monte-bianco', titolo: 'Monte Bianco', descrizione: '4.808 m di dislivello in tutto', icona: 'neve' }, 4808, dislivelloFatto, 'm'),
  somma({ id: 'everest', titolo: 'Everest', descrizione: '8.849 m di dislivello in tutto', icona: 'neve' }, 8849, dislivelloFatto, 'm'),
  somma({ id: 'due-everest', titolo: 'Due Everest', descrizione: '17.698 m di dislivello in tutto', icona: 'stella' }, 17698, dislivelloFatto, 'm'),
  somma(
    { id: 'spazio', titolo: 'Fino allo spazio', descrizione: '100 km di dislivello in tutto: la linea di Kármán', icona: 'razzo' },
    100_000,
    dislivelloFatto,
    'm',
  ),
  migliore({ id: 'gambe', titolo: "Gambe d'acciaio", descrizione: 'Un trekking da almeno 1.500 m di dislivello', icona: 'fiamma' }, 1500, dislivelloFatto, 'm'),
  migliore({ id: 'tremila', titolo: 'Tremila', descrizione: 'Arriva sopra i 3.000 m di quota', icona: 'neve' }, 3000, quota, 'm'),
  migliore({ id: 'lunga-distanza', titolo: 'Lunga distanza', descrizione: 'Un trekking da almeno 20 km', icona: 'scarpone' }, 20, km, 'km'),
  somma({ id: 'maratona', titolo: 'Maratona', descrizione: '42,2 km camminati in tutto', icona: 'scarpone' }, 42.2, km, 'km'),
  quattroStagioni,
  conta({ id: 'prima-avventura', titolo: 'Primo timbro', descrizione: "Completa un'avventura", icona: 'timbro' }, 1, avventure),
  conta({ id: 'avventure-5', titolo: 'Passaporto in uso', descrizione: 'Completa 5 avventure', icona: 'timbro' }, 5, avventure),
  conta({ id: 'avventure-10', titolo: 'Giramondo', descrizione: 'Completa 10 avventure', icona: 'stella' }, 10, avventure),
  conta({ id: 'fuori-porta', titolo: 'Fuori porta', descrizione: "Un'avventura ad almeno 2 ore d'auto da casa", icona: 'bussola' }, 1, lontane),
  conta({ id: 'esploratore', titolo: 'Esploratore', descrizione: "Tre avventure ad almeno 2 ore d'auto da casa", icona: 'bussola' }, 3, lontane),
  doppietta,
]

export interface Sblocco {
  traguardo: Traguardo
  /** Il giro che l'ha sbloccato; `null` se è ancora da raggiungere. */
  da: Attivita | null
  /** A che punto si è, solo per quelli da raggiungere che si possono contare. */
  avanzamento: Avanzamento | null
}

/** Tutti i traguardi, ognuno col giro che l'ha sbloccato o `null`. */
export function traguardi(attivita: readonly Attivita[]): Sblocco[] {
  const cronologia = completate(attivita)
  return TRAGUARDI.map((traguardo) => {
    const da = traguardo.raggiunto(cronologia)
    return { traguardo, da, avanzamento: da === null && traguardo.avanzamento ? traguardo.avanzamento(cronologia) : null }
  })
}

/** I traguardi sbloccati da questo giro: quelli da festeggiare nella cerimonia. */
export function sbloccatiDa(attivita: readonly Attivita[], id: string): Sblocco[] {
  return traguardi(attivita).filter((s) => s.da?.id === id)
}
