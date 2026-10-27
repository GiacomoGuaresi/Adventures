import { useSyncExternalStore } from 'react'
import type { Tipo } from '../dominio/tipi'

/**
 * Le pagine, raggiunte con l'hash (docs/03-architettura.md): `#/` è la Mappa,
 * la pagina principale, `#/trekking` e `#/avventure` sono i due elenchi,
 * `#/catena`, `#/passaporto` e `#/statistiche` sono i premi dei giri fatti,
 * `#/installa` sono le istruzioni per installare l'app.
 * Con l'hash GitHub Pages non vede mai le rotte, quindi non serve un 404.html.
 */
export type Rotta = 'mappa' | 'trekking' | 'avventure' | 'catena' | 'passaporto' | 'statistiche' | 'installa'

export const indirizzi: Record<Rotta, string> = {
  mappa: '#/',
  trekking: '#/trekking',
  avventure: '#/avventure',
  catena: '#/catena',
  passaporto: '#/passaporto',
  statistiche: '#/statistiche',
  installa: '#/installa',
}

/** Il tipo che si vede nella pagina: `null` sulla Mappa, che li mostra tutti e due. */
export function tipoDellaRotta(rotta: Rotta): Tipo | null {
  if (rotta === 'trekking') return 'trekking'
  if (rotta === 'avventure') return 'avventura'
  return null
}

/**
 * Qualunque hash sconosciuto porta alla Mappa, anche il vecchio `#/mappa`; il
 * vecchio `#/elenco` porta ai trekking, che era quello che mostrava.
 */
function leggi(): Rotta {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (hash === 'trekking' || hash === 'elenco') return 'trekking'
  if (hash === 'avventure') return 'avventure'
  if (hash === 'catena' || hash === 'passaporto' || hash === 'statistiche' || hash === 'installa') return hash
  return 'mappa'
}

function iscriviti(avvisa: () => void) {
  window.addEventListener('hashchange', avvisa)
  return () => window.removeEventListener('hashchange', avvisa)
}

export function useRotta(): Rotta {
  return useSyncExternalStore(iscriviti, leggi, () => 'mappa' as Rotta)
}
