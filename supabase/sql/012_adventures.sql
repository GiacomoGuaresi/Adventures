-- Adventures · 012 · Lo schema e la tabella prendono il nome nuovo
-- (docs/08-modello-dati.md, docs/06-roadmap.md step 30).
--
-- L'app non è più solo trekking: lo schema `trekking` diventa `adventures` e la
-- tabella `trekking` diventa `attivita`. Permessi, RLS, trigger e la riga di
-- `impostazioni` seguono lo schema da soli; le funzioni dei trigger non citano
-- lo schema nel corpo, quindi non vanno ricreate. Gli script 001–011 restano
-- com'erano: raccontano come si è arrivati qui.
--
-- Dopo averlo eseguito: negli Exposed schemas `adventures` al posto di
-- `trekking` (docs/05-deploy.md).
--
-- Si applica a mano, dalla cartella di Grocery già collegata:
--   supabase db query --linked -f ../Adventures/supabase/sql/012_adventures.sql
-- Rilanciabile.

do $$
declare
  vincolo text;
begin
  if exists (select 1 from pg_namespace where nspname = 'trekking')
     and not exists (select 1 from pg_namespace where nspname = 'adventures') then
    alter schema trekking rename to adventures;
  end if;

  if to_regclass('adventures.trekking') is not null and to_regclass('adventures.attivita') is null then
    alter table adventures.trekking rename to attivita;
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'adventures' and tablename = 'attivita' and policyname = 'trekking_authenticated'
  ) then
    alter policy trekking_authenticated on adventures.attivita rename to attivita_authenticated;
  end if;

  -- I vincoli e la chiave portano ancora il vecchio nome della tabella.
  for vincolo in
    select conname from pg_constraint
    where conrelid = 'adventures.attivita'::regclass and conname like 'trekking\_%'
  loop
    execute format(
      'alter table adventures.attivita rename constraint %I to %I',
      vincolo,
      'attivita_' || substr(vincolo, length('trekking_') + 1)
    );
  end loop;
end;
$$;
