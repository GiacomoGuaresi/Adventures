# 08 · Modello dati

> Prima stesura: è il modello **di arrivo**. Le tabelle e le colonne si aggiungono un po' alla volta, con uno script `supabase/sql/NNN_*.sql` per ogni step della [roadmap](06-roadmap.md) che ne ha bisogno.

Tutto sta nello schema Postgres `adventures`, con nomi in italiano come nelle altre app.

## `adventures.attivita`

| Colonna | Tipo | Vincoli e note |
|---|---|---|
| `id` | `uuid` | chiave, `gen_random_uuid()` |
| `tipo` | `text` | `trekking` (default) o `avventura` |
| `nome` | `text` | obbligatorio, non vuoto |
| `luogo_nome` | `text` | facoltativo; vuoto se il luogo è inserito come coordinate |
| `lat` | `double precision` | facoltativo, tra −90 e 90 |
| `lon` | `double precision` | facoltativo, tra −180 e 180; `lat` e `lon` sono entrambi presenti o entrambi vuoti |
| `link` | `text[]` | uno o più indirizzi, default `{}` |
| `dislivello` | `integer` | metri, `> 0`, facoltativo; sempre vuoto per le avventure |
| `durata_ore` | `numeric(3,1)` | `> 0`, solo multipli di 0.5, facoltativo; sempre vuoto per le avventure |
| `viaggio_minuti` | `integer` | tempo di viaggio in auto da casa, `>= 0`, facoltativo |
| `viaggio_manuale` | `boolean` | `true` se il tempo di viaggio è stato scritto a mano: il ricalcolo non lo tocca |
| `note` | `text` | Markdown, facoltativo |
| `completato` | `boolean` | default `false` |
| `creato_il` | `timestamptz` | default `now()` |
| `modificato_il` | `timestamptz` | aggiornato da trigger |

Regole nel database:
- un'avventura non ha `dislivello` né `durata_ore` (vincolo `attivita_avventura_senza_numeri`);
- se cambiano `lat` o `lon` e `viaggio_manuale` è `false`, un trigger svuota `viaggio_minuti`, così il tempo verrà ricalcolato;
- se si svuota `viaggio_minuti`, `viaggio_manuale` torna `false`.

Il ricalcolo usa questa condizione: `lat` presente, `viaggio_minuti` vuoto, `viaggio_manuale` falso.

Se il percorso risulta impossibile, l'app svuota `luogo_nome`, `lat` e `lon`: il trekking esce così dalla condizione di ricalcolo, senza bisogno di colonne in più.

La **distanza in linea d'aria** non si salva: si calcola nel browser.

## `adventures.impostazioni`

Una sola riga.

| Colonna | Tipo | Note |
|---|---|---|
| `id` | `boolean` | chiave, sempre `true`: impedisce una seconda riga |
| `casa_lat` | `double precision` | inserita a mano dal SQL Editor |
| `casa_lon` | `double precision` | inserita a mano dal SQL Editor |

Lo script crea la tabella vuota; i valori non vanno nel repository ([04](04-sicurezza.md)).
