-- Adventures · 013 · Il tipo: trekking o avventura
-- (docs/08-modello-dati.md, docs/06-roadmap.md step 31).
--
-- Le righe che ci sono già restano trekking. Un'avventura è qualunque altra
-- cosa da fare fuori casa: non ha dislivello né durata, e il database lo
-- garantisce.
--
-- Si applica a mano, dalla cartella di Grocery già collegata:
--   supabase db query --linked -f ../Adventures/supabase/sql/013_tipo.sql
-- Rilanciabile.

alter table adventures.attivita
  add column if not exists tipo text not null default 'trekking';

alter table adventures.attivita
  drop constraint if exists attivita_tipo_valido;

alter table adventures.attivita
  add constraint attivita_tipo_valido check (tipo in ('trekking', 'avventura'));

alter table adventures.attivita
  drop constraint if exists attivita_avventura_senza_numeri;

alter table adventures.attivita
  add constraint attivita_avventura_senza_numeri
  check (tipo = 'trekking' or (dislivello is null and durata_ore is null));
