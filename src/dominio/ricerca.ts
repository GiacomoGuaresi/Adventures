/**
 * Ricerca per nome e avviso dei doppioni (docs/02-funzionalita.md): maiuscole,
 * minuscole e accenti non contano, così "citta morta" trova "Città Morta".
 */

import { pulisciNome } from './nome'
import type { Attivita } from './tipi'

/** Il testo ridotto alla sua forma confrontabile: minuscolo e senza accenti. */
export function normalizza(testo: string): string {
  return pulisciNome(testo)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Quelli il cui nome contiene il testo cercato; con la ricerca vuota, tutti. */
export function cerca(elenco: readonly Attivita[], testo: string): Attivita[] {
  const cercato = normalizza(testo)
  if (cercato === '') return [...elenco]
  return elenco.filter((t) => normalizza(t.nome).includes(cercato))
}

/**
 * Il trekking che si chiama già così, se c'è: serve all'avviso mentre si
 * scrive. `escludi` è il trekking che si sta modificando, che non è doppione
 * di sé stesso. L'avviso non blocca il salvataggio.
 */
export function doppione(elenco: readonly Attivita[], nome: string, escludi?: string): Attivita | null {
  const cercato = normalizza(nome)
  if (cercato === '') return null
  return elenco.find((t) => t.id !== escludi && normalizza(t.nome) === cercato) ?? null
}
