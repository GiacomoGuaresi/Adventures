# 05 · Deploy e manutenzione

## Repository

- Pubblico, `github.com/GiacomoGuaresi/Adventures`, licenza **MIT**
- Branch principale `main`

## Frontend → GitHub Pages

Workflow `.github/workflows/pubblica.yml`, sul modello di Projects. A ogni push su `main`:
1. `npm ci`
2. controllo che le variabili siano presenti
3. `npm test`
4. `npm run build`
5. pubblicazione di `dist/` con `actions/upload-pages-artifact` + `actions/deploy-pages`

Variabili del repository (Settings → Secrets and variables → Actions → **Variables**, perché finiscono nel bundle pubblico):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_EMAIL`: stessi valori di produzione di Grocery e Projects
- `VITE_OPENROUTESERVICE_KEY`: la chiave del piano gratuito di openrouteservice

URL: `https://giacomoguaresi.github.io/Adventures/`. Vite ha `base: '/Adventures/'`; il routing usa l'hash, quindi non serve `404.html`.

## Sviluppo locale

`.env.local` con le stesse quattro variabili. Le tre di Supabase sono quelle di Projects (produzione di Grocery): `npm run dev` lavora sui dati veri.

## Database → Supabase

| Aspetto | Decisione |
|---|---|
| Progetto | **produzione di Grocery** |
| Schema | `adventures`, esposto nell'API |
| Script SQL | `supabase/sql/NNN_*.sql`, applicati a mano |
| Keep-alive | non serve |
| Tipi TypeScript | `supabase gen types typescript --schema adventures` |

## Configurazioni una tantum

Sulla dashboard Supabase:
1. Settings → Data API → aggiungere `trekking` agli *Exposed schemas*. Fatto il 2026-09-16 con la Management API (`PATCH /v1/projects/{ref}/postgrest`, `db_schema: "public,graphql_public,projects,trekking"`): la lista si manda sempre intera. Con la rinomina ([06](06-roadmap.md), step 30) nella lista `adventures` ha preso il posto di `trekking` (2026-10-12: `public,graphql_public,projects,adventures,logger,space`)
2. Authentication → URL Configuration → aggiungere `https://giacomoguaresi.github.io/Adventures/` (fino alla rinomina era `…/Trekking/`, aggiunto il 2026-09-16 con la Management API: `PATCH /v1/projects/{ref}/config/auth`, `uri_allow_list`)
3. Eseguire gli script di `supabase/sql/` in ordine: dalla cartella di Grocery, già collegata al progetto, `supabase db query --linked -f ../Adventures/supabase/sql/NNN_*.sql`
4. Inserire le coordinate di casa in `adventures.impostazioni` dal SQL Editor, **senza salvarle in un file** ([04](04-sicurezza.md))

Su openrouteservice:
5. Creare l'account gratuito su `openrouteservice.org` e generare la chiave

Per la Management API serve un token personale (Account → Access Tokens), che sta in `credenziali.local` nella cartella sopra i repository, mai nel repo.

⚠️ Il progetto è quello di produzione di Grocery: ogni modifica alla configurazione va fatta senza toccare le impostazioni usate da Grocery e Projects.

## Servizi esterni

| Servizio | Uso | Limiti da rispettare |
|---|---|---|
| Photon (`photon.komoot.io`) | ricerca luoghi | server pubblico senza garanzie: richieste solo mentre si scrive, con un breve ritardo tra una battuta e l'altra |
| openrouteservice | tempo di viaggio | quota giornaliera del piano gratuito; attribuzione |
| Tessere Stadia Maps (`outdoors`) | mappa base | piano gratuito per uso personale; **dominio `giacomoguaresi.github.io` registrato** nel pannello di Stadia (autenticazione per dominio, nessuna chiave nel bundle; `localhost` funziona senza); attribuzione visibile |
| Tessere OpenStreetMap | mappa alternativa | uso leggero, attribuzione visibile |
| Tessere OpenTopoMap | mappa topografica | attribuzione visibile; server a volte lento |

Se Photon smette di funzionare, il piano B è Google Places ([03](03-architettura.md)).
