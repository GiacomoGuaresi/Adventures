// Trekking d'esempio per i test: si scrivono solo i campi che contano alla prova.

import type { Attivita } from './tipi'

let prossimo = 1

export function esempio(campi: Partial<Attivita> = {}): Attivita {
  const id = String(prossimo++)
  return {
    id,
    tipo: 'trekking',
    nome: `Trekking ${id}`,
    link: [],
    note: null,
    dislivello: null,
    durata_ore: null,
    luogo_nome: null,
    lat: null,
    lon: null,
    viaggio_minuti: null,
    viaggio_manuale: false,
    completato: false,
    creato_il: '2026-09-23T10:00:00Z',
    modificato_il: '2026-09-23T10:00:00Z',
    ...campi,
  }
}
