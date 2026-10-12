/**
 * L'ordinamento dell'elenco (docs/02-funzionalita.md): si tocca l'intestazione
 * di una colonna per ordinare, un secondo tocco inverte. Le colonne su cui si
 * può ordinare arrivano con gli step che le aggiungono. All'apertura i più
 * vicini in auto stanno in cima.
 */

import type { Coordinate } from './coordinate'
import { distanzaDaCasa } from './distanza'
import type { Attivita } from './tipi'

export type Colonna = 'nome' | 'creato_il' | 'dislivello' | 'durata_ore' | 'distanza' | 'viaggio_minuti'
export type Verso = 'crescente' | 'decrescente'

export interface Ordinamento {
  colonna: Colonna
  verso: Verso
}

/** All'apertura: il tempo di viaggio crescente, chi non ce l'ha in fondo (docs/02-funzionalita.md). */
export const ORDINAMENTO_INIZIALE: Ordinamento = { colonna: 'viaggio_minuti', verso: 'crescente' }

/** Il verso con cui si parte quando si tocca una colonna nuova: le date dalla più recente, il resto dal più piccolo. */
export function versoIniziale(colonna: Colonna): Verso {
  return colonna === 'creato_il' ? 'decrescente' : 'crescente'
}

/** Tocco sull'intestazione: se è già quella si inverte, altrimenti si cambia colonna. */
export function tocca(ordinamento: Ordinamento, colonna: Colonna): Ordinamento {
  if (ordinamento.colonna !== colonna) return { colonna, verso: versoIniziale(colonna) }
  return { colonna, verso: ordinamento.verso === 'crescente' ? 'decrescente' : 'crescente' }
}

function perNome(a: Attivita, b: Attivita): number {
  return a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' })
}

function confronta(a: Attivita, b: Attivita, colonna: Colonna, casa: Coordinate | null): number {
  if (colonna === 'nome') return perNome(a, b)
  if (colonna === 'dislivello') return (a.dislivello ?? 0) - (b.dislivello ?? 0)
  if (colonna === 'durata_ore') return (a.durata_ore ?? 0) - (b.durata_ore ?? 0)
  if (colonna === 'distanza') return (distanzaDaCasa(a, casa) ?? 0) - (distanzaDaCasa(b, casa) ?? 0)
  if (colonna === 'viaggio_minuti') return (a.viaggio_minuti ?? 0) - (b.viaggio_minuti ?? 0)
  return a.creato_il.localeCompare(b.creato_il)
}

/** Chi non ha il valore va in fondo in tutti e due i versi (docs/02-funzionalita.md). */
function senzaValore(attivita: Attivita, colonna: Colonna, casa: Coordinate | null): boolean {
  if (colonna === 'dislivello') return attivita.dislivello === null
  if (colonna === 'durata_ore') return attivita.durata_ore === null
  if (colonna === 'distanza') return distanzaDaCasa(attivita, casa) === null
  if (colonna === 'viaggio_minuti') return attivita.viaggio_minuti === null
  return false
}

/** L'elenco ordinato; a parità vale il nome, così l'ordine non balla. */
export function ordina(
  elenco: readonly Attivita[],
  { colonna, verso }: Ordinamento,
  casa: Coordinate | null = null,
): Attivita[] {
  const segno = verso === 'crescente' ? 1 : -1
  return [...elenco].sort((a, b) => {
    const mancaA = senzaValore(a, colonna, casa)
    const mancaB = senzaValore(b, colonna, casa)
    if (mancaA !== mancaB) return mancaA ? 1 : -1
    return segno * confronta(a, b, colonna, casa) || perNome(a, b)
  })
}
