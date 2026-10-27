-- Adventures · 015 · Le stagioni delle avventure
-- (docs/08-modello-dati.md, docs/06-roadmap.md step 35).
--
-- Quando ha senso fare un'avventura: una o più stagioni, o nessuna se va
-- bene tutto l'anno. Il filtro dell'elenco parte dalla stagione corrente. I
-- trekking non ne hanno.
--
-- Si applica a mano, dalla cartella di Grocery già collegata:
--   supabase db query --linked -f ../Adventures/supabase/sql/015_stagioni.sql
-- Rilanciabile.

alter table adventures.attivita
  add column if not exists stagioni text[] not null default '{}';

alter table adventures.attivita
  drop constraint if exists attivita_stagioni_valide;

alter table adventures.attivita
  add constraint attivita_stagioni_valide
  check (stagioni <@ array['primavera', 'estate', 'autunno', 'inverno']::text[]);

alter table adventures.attivita
  drop constraint if exists attivita_stagioni_solo_avventure;

alter table adventures.attivita
  add constraint attivita_stagioni_solo_avventure
  check (tipo = 'avventura' or stagioni = '{}');
