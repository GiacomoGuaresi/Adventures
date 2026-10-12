# 04 · Sicurezza

## Contesto

Il repository e il sito sono **pubblici**. I dati devono essere visibili solo a chi ha fatto accesso. Progetto Supabase, account e modo di accesso sono **gli stessi di Grocery e Projects**.

## Chiavi e variabili

| Variabile | Dove sta | Pubblica? |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` in locale, *Variables* del repo GitHub in CI | sì, finisce nel bundle |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | stessa gestione | sì, per design: da sola non concede nulla con RLS attiva |
| `VITE_SUPABASE_EMAIL` | stessa gestione | sì: senza passphrase non basta |
| `VITE_OPENROUTESERVICE_KEY` | stessa gestione | sì, finisce nel bundle. Il piano è gratuito: chi la copiasse potrebbe al massimo esaurire la quota del giorno, e i tempi mancanti si ricalcolerebbero il giorno dopo. Se succede, si rigenera |
| Secret / service role key | **mai nel repo, né nel frontend, né nelle variabili di Actions** | no |
| Password del database | solo in locale, per applicare gli script SQL | no |

Photon, OpenStreetMap e OpenTopoMap non richiedono chiavi.

## Posizione di casa

Un'app statica **non ha segreti**: ogni variabile `VITE_*`, anche se sta nei *Secrets* di GitHub, finisce nel JavaScript pubblicato, leggibile da chiunque apra il sito senza passphrase. Per questo le coordinate di casa **non stanno nella build**.

- Stanno nella tabella `adventures.impostazioni` ([08](08-modello-dati.md)), protetta da RLS come il resto: si leggono solo dopo l'accesso.
- Si inseriscono **una volta, a mano, dal SQL Editor**. Lo script `supabase/sql/` crea solo la tabella: i valori **non vanno mai in un file del repository**.
- I servizi esterni vedono le coordinate di casa solo nelle richieste a openrouteservice per il tempo di viaggio.

## Autenticazione

- Un solo utente Supabase Auth, condiviso con le altre app.
- L'email è fissata nella build; chi entra scrive solo la **passphrase** (`signInWithPassword`).
- Niente pulsante "Esci", come le altre app.
- **Sessione condivisa**: stessa origine (`giacomoguaresi.github.io`), stesso progetto Supabase e cookie con percorso `/`, quindi chi è dentro Grocery o Projects è dentro anche in Adventures.

## Autorizzazione (RLS)

- RLS attiva su ogni tabella dello schema `adventures`.
- Policy: `for all to authenticated using (true) with check (true)`; su `impostazioni` basta la sola lettura.
- `revoke all … from anon`; `grant usage on schema adventures to authenticated` e grant sugli oggetti dello schema.
- Viste con `security_invoker = true`; funzioni `security invoker` con `search_path = ''`.

⚠️ Con un progetto condiviso, **qualunque utente autenticato vede tutte le app**. Oggi l'utente è uno solo, quindi va bene.

## Checklist prima di pubblicare

- [x] Registrazioni pubbliche spente sul progetto (`disable_signup: true`, verificato il 2026-09-16)
- [x] RLS attiva su ogni tabella dello schema `trekking` (verificato il 2026-09-23 su `trekking.trekking`)
- [x] Una query con la sola publishable key e senza sessione non restituisce righe, nemmeno da `impostazioni` (2026-09-23: "permission denied for schema trekking"; `impostazioni` non esiste ancora)
- [x] Nessun file `.env*` committato (solo `.env.example`) (2026-10-03)
- [x] Coordinate di casa assenti dal repo, dalla storia git e dal `dist/` pubblicato (2026-10-03)
- [x] Secret key e password del DB assenti dal repo e dalla storia git (2026-10-03)
- [x] URL di redirect di Auth: aggiunto `https://giacomoguaresi.github.io/Trekking/`
- [x] Sessione condivisa verificata: accesso a Grocery → Trekking aperto senza passphrase (2026-10-03)
- [x] Edge Function `trekking-link-mappe`: senza sessione risponde `401`, anche con la sola publishable key (2026-10-03)

Dopo la rinomina in Adventures ([06](06-roadmap.md), step 30):

- [x] RLS ancora attiva su `adventures.attivita` e `adventures.impostazioni`; senza sessione nessuna riga (2026-10-12: "permission denied for schema adventures")
- [x] URL di redirect di Auth: aggiunto `https://giacomoguaresi.github.io/Adventures/`, tolto quello vecchio (2026-10-12)
- [ ] Sessione condivisa: accesso a Projects → Adventures aperto senza passphrase
- [x] Edge Function `adventures-link-mappe`: senza sessione risponde `401`, anche con la sola publishable key; la vecchia `trekking-link-mappe` eliminata (2026-10-12)
