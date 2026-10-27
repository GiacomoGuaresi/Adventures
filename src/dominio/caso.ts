/**
 * Il caso fisso, come in Projects (`src/dominio/caso.ts`): da uno stesso seme
 * escono sempre gli stessi numeri, così una montagna o un timbro restano
 * uguali a ogni apertura senza salvarne la forma.
 */

/** Numeri in [0, 1) da un seme: mulberry32. */
export function generatore(seed: number): () => number {
  let stato = seed >>> 0
  return () => {
    stato = (stato + 0x6d2b79f5) >>> 0
    let t = stato
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Il seme di un testo, di solito l'id di una riga: FNV-1a a 32 bit. */
export function seme(testo: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
