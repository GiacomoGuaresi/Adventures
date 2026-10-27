-- Adventures · 014 · Il completamento: la data e i numeri veri del giro
-- (docs/08-modello-dati.md, docs/06-roadmap.md step 32).
--
-- Quando si segna il completato l'app chiede la data e, per i trekking, i
-- numeri presi da Garmin o Komoot: dislivello, km, quota massima e durata.
-- Dislivello e durata della scheda restano quelli previsti. Le righe già
-- completate restano senza data: nella catena stanno "prima di Adventures".
--
-- Si applica a mano, dalla cartella di Grocery già collegata:
--   supabase db query --linked -f ../Adventures/supabase/sql/014_completamento.sql
-- Rilanciabile.

alter table adventures.attivita
  add column if not exists completato_il date,
  add column if not exists fatto_dislivello integer,
  add column if not exists fatto_km numeric(5, 1),
  add column if not exists fatto_quota_max integer,
  add column if not exists fatto_durata_minuti integer;

alter table adventures.attivita
  drop constraint if exists attivita_fatto_positivo;

alter table adventures.attivita
  add constraint attivita_fatto_positivo check (
    (fatto_dislivello is null or fatto_dislivello > 0)
    and (fatto_km is null or fatto_km > 0)
    and (fatto_quota_max is null or fatto_quota_max > 0)
    and (fatto_durata_minuti is null or fatto_durata_minuti > 0)
  );

-- I numeri veri sono solo dei trekking, come quelli previsti (013_tipo.sql).
alter table adventures.attivita
  drop constraint if exists attivita_avventura_senza_fatto;

alter table adventures.attivita
  add constraint attivita_avventura_senza_fatto check (
    tipo = 'trekking'
    or (fatto_dislivello is null and fatto_km is null and fatto_quota_max is null and fatto_durata_minuti is null)
  );

-- Data e numeri veri ci sono solo da completato: "Togli completato" li azzera.
alter table adventures.attivita
  drop constraint if exists attivita_fatto_solo_completato;

alter table adventures.attivita
  add constraint attivita_fatto_solo_completato check (
    completato
    or (
      completato_il is null and fatto_dislivello is null and fatto_km is null
      and fatto_quota_max is null and fatto_durata_minuti is null
    )
  );
