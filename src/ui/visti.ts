import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

// Le cime e i timbri già visti su questo dispositivo, come le piante della
// Foresta di Projects: quelli nuovi compaiono con l'animazione, gli altri
// sono già al loro posto. La prima volta compaiono tutti. Il menu conta quelli
// non ancora visti e lo segnala col pallino rosso (docs/09-interfaccia.md).

export const VISTE_CATENA = 'adventures_catena_viste'
export const VISTI_TIMBRI = 'adventures_timbri_visti'

const ascoltatori = new Set<() => void>()
/** L'ultima lettura per chiave, così `useSyncExternalStore` riceve sempre lo stesso insieme finché non cambia. */
const letti = new Map<string, { testo: string | null; visti: Set<string> | null }>()

function leggi(chiave: string): Set<string> | null {
  let testo: string | null = null
  try {
    testo = window.localStorage.getItem(chiave)
  } catch {
    testo = null
  }
  const prima = letti.get(chiave)
  if (prima && prima.testo === testo) return prima.visti
  let visti: Set<string> | null = null
  try {
    visti = testo ? new Set((JSON.parse(testo) as unknown[]).map(String)) : null
  } catch {
    visti = null
  }
  letti.set(chiave, { testo, visti })
  return visti
}

function salva(chiave: string, id: readonly string[]) {
  try {
    window.localStorage.setItem(chiave, JSON.stringify(id))
  } catch {
    // Senza memoria del browser compaiono tutti a ogni visita: va bene lo stesso.
  }
  for (const avvisa of ascoltatori) avvisa()
}

function iscriviti(avvisa: () => void) {
  ascoltatori.add(avvisa)
  return () => {
    ascoltatori.delete(avvisa)
  }
}

/** Quanti di questi id non sono ancora stati visti: il numero del pallino nel menu. */
export function useDaVedere(chiave: string, id: readonly string[]): number {
  const visti = useSyncExternalStore(iscriviti, () => leggi(chiave), () => null)
  return id.filter((x) => !visti?.has(x)).length
}

/** Gli id non ancora visti quando si è aperta la pagina; da qui in poi contano come visti. */
export function useNuovi(chiave: string, id: readonly string[]): ReadonlySet<string> {
  const [vistiPrima] = useState(() => leggi(chiave))
  const firma = id.join(',')
  useEffect(() => {
    salva(chiave, firma === '' ? [] : firma.split(','))
  }, [chiave, firma])
  return useMemo(() => new Set(firma === '' ? [] : firma.split(',').filter((x) => !vistiPrima?.has(x))), [firma, vistiPrima])
}
