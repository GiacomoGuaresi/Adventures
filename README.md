# Adventures

Piccolo database delle cose da fare fuori casa, **trekking** e **avventure** (rafting, ferrate, kayak…): si salvano al volo, con i dettagli disponibili, quando se ne trova uno interessante sui social, su un sito o su Komoot, e si sceglie dove andare dall'elenco o dalla mappa. Terza app di casa dopo **Grocery** e **Projects**; fino a ottobre 2026 si chiamava Trekking. Si usa da smartphone e da PC.

> **Stato: completa e in uso.** In corso la [fase 6](docs/06-roadmap.md): il nuovo nome e le avventure accanto ai trekking. Online su [giacomoguaresi.github.io/Adventures](https://giacomoguaresi.github.io/Adventures/).

## Cosa fa

- **Due tipi**: trekking, con dislivello e durata, e avventure, con solo nome, luogo, link e note; un elenco ciascuno e la mappa in comune
- **Inserimento rapido**: nome (unico obbligatorio), luogo, link, dislivello, durata, tempo di viaggio, note; avviso se il nome esiste già
- **Luogo** per nome, con i suggerimenti di Photon, oppure per coordinate
- **Tempo di viaggio in auto da casa** calcolato con openrouteservice al salvataggio, oppure scritto a mano; i mancanti si ricalcolano dal popup all'apertura. **Distanza in linea d'aria** da casa, calcolata nel browser
- **Elenco** con ricerca per nome e filtri su dislivello, durata, distanza e tempo di viaggio; i completati si nascondono
- **Mappa** con un segnaposto con l'icona per trekking (montagna blu) e per avventura (tenda terracotta), nomi da vicino, legenda, casa, le tessere di Stadia Maps, OpenStreetMap o OpenTopoMap e i dettagli in un popup; stessa ricerca e stessi filtri dell'elenco
- **Installabile** sulla schermata Home, come Grocery e Projects

## Per iniziare

Serve Node 22.12 o più recente (Vite 8 e Vitest 5 con Node 18 non partono); la CI usa Node 24, indicato in [`.nvmrc`](.nvmrc).

```sh
nvm use                      # o `nvm install` la prima volta
cp .env.example .env.local   # e riempi le variabili (docs/05)
npm install
npm run dev                  # http://localhost:5173/Adventures/
npm test
npm run build
```

Script di supporto: `npm run icone` rigenera le icone della PWA da `public/icona.svg`, `npm run sfondo` rigenera lo sfondo doodle. Il risultato di entrambi è versionato.

A ogni push su `main` il workflow [`pubblica.yml`](.github/workflows/pubblica.yml) esegue i test e pubblica su GitHub Pages.

## In breve

- **Frontend**: Vite + React + TypeScript + Tailwind, sito statico installabile come PWA
- **Dati e accesso**: [Supabase](https://supabase.com) (Postgres + Auth), sullo stesso progetto e con lo stesso account di Grocery e Projects
- **Mappe**: Leaflet con Stadia Maps, OpenStreetMap e OpenTopoMap, Photon, openrouteservice
- **Hosting**: GitHub Pages → `giacomoguaresi.github.io/Adventures/`
- **Lingua**: italiano · **Costo**: 0 € · **Licenza**: MIT

## Documentazione

| Documento | Contenuto |
|---|---|
| [docs/01-visione.md](docs/01-visione.md) | Scopo, origine, utenti, principi, cosa non è |
| [docs/02-funzionalita.md](docs/02-funzionalita.md) | Funzionalità previste |
| [docs/03-architettura.md](docs/03-architettura.md) | Stack, servizi esterni, convivenza con Grocery e Projects, struttura cartelle |
| [docs/04-sicurezza.md](docs/04-sicurezza.md) | Passphrase, posizione di casa, permessi, chiavi |
| [docs/05-deploy.md](docs/05-deploy.md) | Pubblicazione, configurazione e servizi esterni |
| [docs/06-roadmap.md](docs/06-roadmap.md) | Fasi di sviluppo |
| [docs/07-decisioni.md](docs/07-decisioni.md) | Registro delle decisioni |
| [docs/08-modello-dati.md](docs/08-modello-dati.md) | Tabelle e regole nel database |
| [docs/09-interfaccia.md](docs/09-interfaccia.md) | Struttura, palette, icona, schermate |
| [Q&A.md](Q&A.md) | Domande ancora aperte |
