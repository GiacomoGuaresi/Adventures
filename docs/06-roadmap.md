# 06 · Roadmap

## Come si procede

Sviluppo a **piccoli incrementi stabili**. Ogni step:

- aggiunge **una sola cosa** utilizzabile, dal database all'interfaccia;
- se tocca il database, porta il suo script `supabase/sql/NNN_*.sql`: le colonne arrivano quando servono, non tutte all'inizio;
- è **finito** quando:
  1. i test sono verdi e la build riesce;
  2. c'è un commit su `main` e il deploy online è riuscito;
  3. l'app online si può usare davvero, senza pezzi a metà.

Le **prove a mano da telefono e da PC** non fermano più uno step: si raccolgono tutte
nello step [22](#fase-4--rifinitura), da fare in un giro solo alla fine.

Si passa allo step successivo solo quando il precedente è finito. L'ordine porta prima possibile a un'app che **sostituisce il file di note**, poi aggiunge filtri, luoghi e mappa.

Accanto a uno step è indicata la domanda del [Q&A](../Q&A.md) da chiudere prima di iniziarlo, se ce n'è una.

## Fase 0 · Progettazione ✅
- [x] Documentazione di base, scopo e funzionalità
- [x] Giri di Q&A 1–7
- [x] Scelta dei servizi: Photon, openrouteservice, Leaflet con OpenStreetMap e OpenTopoMap
- [x] Prima stesura del modello dati ([08](08-modello-dati.md)) e dell'interfaccia ([09](09-interfaccia.md))
- [x] Documentazione senza punti aperti

## Fase 1 · Un'app online che sostituisce il file di note ✅

- [x] **1 · Scheletro pubblicato**: `git init`, LICENSE, repository pubblico, scaffold Vite + React + TS + Tailwind + Vitest, workflow `pubblica.yml`, una pagina vuota "Trekking" online su GitHub Pages
- [x] **2 · Accesso**: schermata della passphrase, sessione condivisa con Grocery e Projects, schema `trekking` vuoto ed esposto nell'API. *Finito anche quando*: da Grocery si entra senza passphrase
  - [x] Schermata della passphrase e cancello davanti all'app (`src/ui/Accesso.tsx`, `src/ui/ConAccesso.tsx`)
  - [x] Client Supabase sullo schema `trekking`, sessione nei cookie con percorso `/` come Grocery e Projects (`src/dati/`)
  - [x] Test della logica d'accesso (`src/dati/accesso.test.ts`)
  - [x] Script `supabase/sql/001_schema.sql` e variabili di Supabase nel workflow `pubblica.yml`
  - [x] `001_schema.sql` applicato in produzione il 2026-09-16 (`supabase db query --linked` dalla cartella di Grocery): schema `trekking` con gli stessi permessi di `projects`
  - [x] `trekking` esposto nell'API il 2026-09-16 con la Management API ([05](05-deploy.md)): l'API risponde sullo schema, `public` e `projects` invariati
  - [x] `https://giacomoguaresi.github.io/Trekking/` negli URL di redirect di Auth (2026-09-16); registrazioni pubbliche ancora spente
  - [x] Variabili `VITE_SUPABASE_*` nel repository GitHub, GitHub Pages attivo, deploy riuscito il 2026-09-16
  - [x] Provato da telefono e da PC il 2026-09-23: entrati in Grocery, Trekking si apre senza passphrase
- [x] **3 · Salvare un trekking**: tabella `trekking` con il solo nome, RLS, pulsante **+** con form di un campo, tabella semplice con i nomi, guscio con intestazione blu e menu. *Finito anche quando*: senza sessione una query non restituisce righe
  - [x] `002_trekking.sql` applicato in produzione il 2026-09-23: tabella con `nome`, `creato_il`, `modificato_il` da trigger, RLS e grant solo per `authenticated`
  - [x] Verifica: senza sessione la query è respinta ("permission denied for schema trekking"), con la sessione risponde
  - [x] Guscio con intestazione blu, menu laterale, rotta `#/` (`src/ui/App.tsx`, `MenuLaterale.tsx`, `rotta.ts`)
  - [x] Pulsante **+** con il modale di un campo ed elenco dei nomi (`ModaleNome.tsx`, `Elenco.tsx`)
  - [x] Test del nome ripulito e validato (`src/dominio/nome.test.ts`)
- [x] **4 · Modificare ed eliminare**: modifica del nome, eliminazione con conferma
  - [x] `rinomina` ed `elimina` sulla tabella (`src/dati/trekking.ts`)
  - [x] Matita e cestino in fondo a ogni riga dell'elenco (`src/ui/Elenco.tsx`)
  - [x] "Cambia nome" riusa il modale del nome; eliminazione dietro una conferma (`ModaleNome.tsx`, `Conferma.tsx`)
  - [x] Test dell'elenco aggiornato senza rileggere il database (`src/dominio/elenco.test.ts`)
- [x] **5 · Completato**: segno reversibile, completati nascosti, interruttore "Mostra completati"
  - [x] `003_completato.sql` applicato in produzione il 2026-09-23: colonna `completato` con default `false`
  - [x] Segno rotondo a inizio riga, reversibile, con il nome barrato (`src/ui/Elenco.tsx`)
  - [x] Interruttore "Mostra completati" con il conto, salvato in un cookie dell'app (`MostraCompletati.tsx`, `preferenze.ts`)
  - [x] Test del filtro, del conto e della lettura del cookie (`src/dominio/elenco.test.ts`, `src/ui/preferenze.test.ts`)
- [x] **6 · Ricerca, ordinamento e doppioni**: ricerca per nome, ordinamento cliccando sulle colonne, avviso mentre si scrive un nome già presente
  - [x] Ricerca per nome che non bada ad accenti e maiuscole (`src/dominio/ricerca.ts`, `src/ui/Ricerca.tsx`)
  - [x] Intestazioni Nome e Aggiunto ordinabili, secondo tocco al contrario (`src/dominio/ordinamento.ts`, `Elenco.tsx`)
  - [x] Avviso del nome già presente nel modale, che non blocca il salvataggio (`ModaleNome.tsx`)
  - [x] Test di ricerca, doppioni e ordinamento (`ricerca.test.ts`, `ordinamento.test.ts`)
  - Nota: l'ordinamento di default resta "i più recenti in cima"; diventerà il tempo di viaggio crescente allo step 15, quando quella colonna esisterà
- [x] **7 · Link**: uno o più link per trekking, apribili dall'elenco
  - [x] `004_link.sql` applicato in produzione il 2026-09-23: colonna `link text[]` con default `{}`
  - [x] Campo "Link (uno per riga)" nel form, che ora salva più campi (`ModaleTrekking.tsx`, prima `ModaleNome.tsx`)
  - [x] Link sotto il nome nell'elenco, con il sito come etichetta, che si aprono in una scheda nuova (`Elenco.tsx`)
  - [x] Test di ripulitura, apertura ed etichetta (`src/dominio/link.test.ts`); trekking d'esempio comuni ai test (`esempi.ts`)
- [x] **8 · Note**: campo Markdown con la formattazione di base
  - [x] `005_note.sql` applicato in produzione il 2026-09-23: colonna `note text`, vuota vuol dire `null`
  - [x] Campo Note con "Scrivi" / "Anteprima" e l'aiuto sulla sintassi (`EditorMarkdown.tsx`, `Markdown.tsx`, portati da Projects)
  - [x] Freccia nell'elenco che apre le note sotto la riga (`Elenco.tsx`)
  - [x] Test delle checklist scritte di fretta (`src/dominio/markdown.test.ts`)

➜ **Da qui l'app può già sostituire il file di note.** (Fase 1 finita il 2026-09-23.)

## Fase 2 · Scegliere un trekking ✅

- [x] **9 · Dislivello**: campo nel form, filtro min/max (i trekking senza dislivello restano visibili)
  - [x] `006_dislivello.sql` applicato in produzione il 2026-09-23: colonna `dislivello integer` con il vincolo `> 0`
  - [x] Campo "Dislivello (m)" nel form, che si rifiuta di salvare un numero storto (`ModaleTrekking.tsx`, `src/dominio/dislivello.ts`)
  - [x] Colonna Dislivello nell'elenco, ordinabile, con chi non ce l'ha sempre in fondo (`Elenco.tsx`, `ordinamento.ts`)
  - [x] Pannello "Filtri" con dislivello minimo e massimo e il pulsante "Azzera" (`Filtri.tsx`, `src/dominio/filtri.ts`)
  - [x] Test del dislivello, dei filtri e dell'ordinamento con i valori mancanti (`dislivello.test.ts`, `filtri.test.ts`, `ordinamento.test.ts`)
- [x] **10 · Durata**: campo a passi di mezz'ora, filtro min/max
  - [x] `007_durata.sql` applicato in produzione il 2026-09-23: colonna `durata_ore numeric(3,1)`, positiva e a mezz'ore
  - [x] Campo "Durata (ore, andata e ritorno)" nel form, che accetta anche la virgola (`ModaleTrekking.tsx`, `src/dominio/durata.ts`)
  - [x] Colonna Durata nell'elenco, scritta "3 h 30" e ordinabile, con chi non ce l'ha in fondo (`Elenco.tsx`, `ordinamento.ts`)
  - [x] Durata minima e massima nel pannello dei filtri, insieme al dislivello (`Filtri.tsx`, `src/dominio/filtri.ts`)
  - [x] Test della durata, del filtro doppio e dell'ordinamento (`durata.test.ts`, `filtri.test.ts`, `ordinamento.test.ts`)
- [x] **11 · Luogo per coordinate**: interruttore Nome / Coordinate con la sola parte Coordinate, `lat` e `lon` nel database
  - [x] `008_luogo.sql` applicato in produzione il 2026-09-23: `lat` e `lon`, sempre insieme e dentro i limiti del mondo
  - [x] Campo "Luogo (coordinate)" nel form, che legge quello che si copia da Google Maps (`ModaleTrekking.tsx`, `src/dominio/coordinate.ts`)
  - [x] Coordinate sotto il nome nell'elenco, che aprono il punto su OpenStreetMap finché non c'è la mappa dell'app (`Elenco.tsx`)
  - [x] Test delle coordinate incollate, comprese quelle fuori dal mondo (`src/dominio/coordinate.test.ts`)
  - Nota: l'interruttore Nome / Coordinate non c'è ancora: con la sola parte Coordinate sarebbe un pezzo a metà. Arriva allo step 12 insieme ai suggerimenti di Photon, con `luogo_nome`
- [x] **12 · Luogo per nome**: suggerimenti di Photon, conversione in coordinate, primo risultato se non se ne sceglie uno
  - [x] `009_luogo_nome.sql` applicato in produzione il 2026-09-23: colonna `luogo_nome text`
  - [x] Ricerca dei luoghi dietro la sua interfaccia, con Photon come prima implementazione (`src/dati/luoghi.ts`)
  - [x] Interruttore Nome / Coordinate con i suggerimenti mentre si scrive (`CampoLuogo.tsx`, `src/ui/luogo.ts`)
  - [x] Senza scegliere un suggerimento vale il primo risultato; se Photon non risponde si salva il solo nome (`src/dominio/luoghi.ts`)
  - [x] Nome del luogo nell'elenco, che apre il punto sulla mappa quando le coordinate ci sono (`Elenco.tsx`)
  - [x] Test della lettura delle risposte di Photon e della scelta di che cosa salvare (`src/dominio/luoghi.test.ts`)
  - Nota: Photon accetta solo `lang` default, de, en e fr; con "default" i nomi tornano già in italiano dove OpenStreetMap li ha
- [x] **13 · Casa e distanza**: tabella `impostazioni` con le coordinate di casa inserite a mano, distanza in linea d'aria nell'elenco, filtro "distanza massima"
  - [x] `010_impostazioni.sql` applicato in produzione il 2026-09-23: tabella di una riga sola, vuota, in sola lettura per `authenticated`
  - [x] Coordinate di casa inserite a mano dal SQL Editor il 2026-10-03: non stanno in nessun file ([04](04-sicurezza.md))
  - [x] Distanza in linea d'aria con l'emisenoverso, calcolata nel browser (`src/dominio/distanza.ts`)
  - [x] Colonna "Da casa" nell'elenco, ordinabile, che compare solo quando la posizione di casa c'è (`Elenco.tsx`, `useCasa.ts`)
  - [x] Filtro "Distanza da casa (km)", col solo massimo (`Filtri.tsx`, `src/dominio/filtri.ts`)
  - [x] Test della distanza, del filtro e del caso "senza casa non si nasconde nessuno" (`distanza.test.ts`, `filtri.test.ts`)
- [x] **14 · Tempo di viaggio a mano**: campo, filtro "tempo massimo"
  - [x] `011_viaggio.sql` applicato in produzione il 2026-09-23: `viaggio_minuti` e `viaggio_manuale`, con le due regole nel trigger
  - [x] Trigger provato in produzione su una riga finta, poi cancellata: il tempo manuale resta quando cambia il luogo, quello automatico si svuota
  - [x] Campo "Tempo di viaggio (minuti)" nel form, che legge anche `1:30` (`ModaleTrekking.tsx`, `src/dominio/viaggio.ts`)
  - [x] Chi scrive o cambia il tempo se lo tiene; chi non tocca il campo non rende manuale un tempo calcolato (`viaggioManuale`)
  - [x] Colonna Viaggio nell'elenco, scritta "1 h 25" e ordinabile (`Elenco.tsx`, `ordinamento.ts`)
  - [x] Filtro "Viaggio (minuti)", col solo massimo (`Filtri.tsx`, `src/dominio/filtri.ts`)
  - [x] Test della lettura, del formato e di quando il tempo resta manuale (`src/dominio/viaggio.test.ts`)
- [x] **15 · Tempo di viaggio automatico**: chiave openrouteservice, calcolo al salvataggio e al cambio del luogo (fino alla strada più vicina), valore manuale non sovrascritto; ordinamento di default per tempo di viaggio
  - [x] Calcolo dietro un'interfaccia, con openrouteservice come prima implementazione e `radiuses: [-1, -1]` (`src/dati/percorsi.ts`); senza `VITE_OPENROUTESERVICE_KEY` il calcolo è spento e il tempo resta solo a mano
  - [x] Lettura delle risposte: minuti, percorso impossibile (2004, 2009, 2010), servizio irraggiungibile (`src/dominio/percorsi.ts`)
  - [x] Calcolo in sottofondo dopo ogni salvataggio; il tempo si scrive solo se la riga lo aspetta ancora, così uno scritto a mano nel frattempo non si perde (`salvaViaggio` in `src/dati/trekking.ts`, `useTrekking.ts`)
  - [x] Ordinamento di default per tempo di viaggio crescente (`ORDINAMENTO_INIZIALE`)
  - [x] Attribuzione di openrouteservice nei dettagli, quando il tempo è calcolato (`ModaleDettagli.tsx`)
  - [x] `VITE_OPENROUTESERVICE_KEY` in `.env.example` e nel workflow, con un avviso se manca
  - [x] Chiave creata il 2026-10-03, in `.env.local` e nelle variabili del repository GitHub; verificata nel bundle pubblicato
  - [x] Provato il 2026-10-03: un trekking nuovo con luogo riceve il tempo, uno scritto a mano resta
- [x] **16 · Tempi mancanti**: recupero dei mancanti a ogni salvataggio, popup "Ricalcola percorsi mancanti" all'apertura, luogo tolto quando il percorso è impossibile
  - [x] A ogni salvataggio si calcolano anche gli altri mancanti, uno alla volta; ci si ferma al primo "irraggiungibile" (`calcolaViaggi` in `useTrekking.ts`)
  - [x] Popup "Ricalcola percorsi mancanti" con il numero, una volta per apertura (`App.tsx`)
  - [x] Percorso impossibile: luogo tolto e avviso in basso (`togliLuogo` in `src/dati/trekking.ts`, `App.tsx`)
  - [x] Test di chi va calcolato e della lettura delle risposte (`src/dominio/percorsi.test.ts`)
  - [x] Provato il 2026-10-03: popup all'apertura e un luogo irraggiungibile (per esempio New York, `40.7, -74.0`: con il raggio illimitato un punto in mare si aggancia comunque a una strada, anche col traghetto)

## Fase 3 · Mappa ✅

- [x] **17 · Mappa essenziale**: pagina Mappa nel menu, Leaflet con OpenStreetMap, un puntino per trekking con coordinate, popup con i dettagli
  - [x] Rotta `#/mappa` e voce Mappa nel menu (`rotta.ts`, `MenuLaterale.tsx`)
  - [x] Leaflet con le tessere di OpenStreetMap e l'attribuzione visibile (`Mappa.tsx`)
  - [x] Un puntino per trekking con coordinate, più chiaro se completato; la mappa si apre sul nord Italia e sud Svizzera
  - [x] Popup con nome, luogo, dislivello, durata, viaggio, distanza e il pulsante "Modifica"
  - [x] Leaflet caricato solo aprendo la Mappa: l'Elenco resta a 655 kB invece di 809
- [x] **18 · Mappa con i filtri**: stessa ricerca e stessi filtri dell'elenco, condivisi tra le due pagine
  - [x] Ricerca, "Mostra completati" e pannello dei filtri sopra tutte e due le pagine (`App.tsx`)
  - [x] Un solo calcolo di che cosa mostrare (`daMostrare`), usato dall'elenco e dalla mappa: passando da una pagina all'altra i filtri restano
  - Nota: 17 e 18 sono in un commit solo. Tenendo ricerca e filtri in `App`, la mappa li ha ereditati senza codice in più: dividerli avrebbe voluto dire scrivere una mappa senza filtri per poi toglierla subito
- [x] **19 · Casa e OpenTopoMap**: icona di casa, scelta della mappa topografica
  - [x] Casa segnata con la sua icona, disegnata nel codice: nessun file da caricare (`Mappa.tsx`)
  - [x] Scelta fra "Mappa" (OpenStreetMap) e "Sentieri" (OpenTopoMap), con le due attribuzioni
  - [x] L'inquadratura resta fissa: filtri e salvataggi non spostano la mappa
  - Nota: l'icona di casa compare quando le coordinate di casa sono nel database (step 13)

## Fase 4 · Rifinitura ✅

- [x] **20 · Installabile**: icona, PWA, voce "Installa l'app" come nelle altre app
  - [x] Icona della montagna su blu (`public/icona.svg`), con le versioni generate da `npm run icone`
  - [x] `vite-plugin-pwa` con manifest, service worker e shell in cache; i dati non passano dal service worker
  - [x] Voce "Installa l'app" in fondo al menu: dove il browser dà il prompt basta un tocco, altrove si aprono le istruzioni (`Installa.tsx`, `installazione.ts`, portati da Projects)
  - [x] Pagina `#/installa` con le istruzioni per iOS, Android e PC
- [x] **21 · Aspetto**: palette blu montagna rifinita, sfondo doodle a tema montagna, animazioni brevi ([09](09-interfaccia.md))
  - [x] Sfondo doodle con cime, abeti, scarponi, bussola, zaino e sentiero, seed fisso (`scripts/genera-sfondo.ts`, `npm run sfondo`)
  - [x] Animazioni brevi dove qualcosa compare: pannello dei filtri, suggerimenti dei luoghi, note aperte
  - [x] Palette confermata: i quattro colori di [09](09-interfaccia.md) reggono all'uso, nessuna correzione
  - Nota: le icone dello sfondo sono `#e0eaf3` invece del bianco delle altre app: sul ghiaccio `#f1f5f9` il bianco non si vedrebbe
- [x] **22 · Prove da telefono e da PC**: un giro solo sull'app online, con il telefono e con il PC (2026-10-03)
  - [x] Si entra senza passphrase venendo da Grocery o da Projects
  - [x] Salvare un trekking e rivederlo nell'elenco dopo aver ricaricato
  - [x] Cambiare il nome di un trekking ed eliminarne uno
  - [x] Segnare e togliere il completato, con l'interruttore "Mostra completati"
  - [x] Ricerca, ordinamento, avviso dei doppioni, link e note
  - [x] Filtri di dislivello, durata, distanza e tempo di viaggio
  - [x] Mappa: puntini, popup, filtri condivisi con l'elenco
- [x] **23 · Chiusura**: checklist di sicurezza completa ([04](04-sicurezza.md)), README aggiornato
  - [x] Checklist di sicurezza verificata il 2026-09-23: niente `.env` committati, niente segreti nella storia, coordinate di casa fuori dal bundle
  - [x] README aggiornato: stato, cosa fa davvero l'app oggi
  - Nota: gli screenshot nel README non si fanno: la mappa mostrerebbe casa in un repository pubblico, e non servono (2026-10-03)
  - [x] Ultimo giro della checklist il 2026-10-03, con la chiave di openrouteservice: solo `.env.example` su git, coordinate di casa e segreti assenti dalla storia e dal bundle

## Fase 5 · Ritocchi dopo l'uso ✅

- [x] **24 · Mappa a tutta pagina**: la mappa è la pagina principale (`#/`, l'elenco passa a `#/elenco`) e prende tutto lo spazio sotto l'intestazione
  - [x] Ricerca e pulsante Filtri in una barra flottante sopra la mappa; il pannello dei filtri, con "Mostra completati", si apre sotto la barra (`BarraMappa.tsx`, `PannelloFiltri` in `Filtri.tsx`)
  - [x] Zoom e scelta della mappa in basso a destra; inquadratura e popup lasciano libera la fascia della barra (`Mappa.tsx`)
  - [x] Mappa prima dell'Elenco nel menu; i vecchi link `#/mappa` portano ancora alla mappa
- [x] **25 · Dettagli e form più comodi da telefono**
  - [x] Nel popup della mappa "Dettagli" al posto di "Modifica": apre la scheda in sola lettura (`ModaleDettagli.tsx`), da cui si passa alla modifica; anche toccando il nome nell'elenco
  - [x] Il modale ha tre aspetti sul telefono: centrato, schermo intero, foglio dal basso (`Modale.tsx`)
  - [x] Form a gruppi, dislivello / durata / viaggio affiancati con l'unità nel campo e tastiera numerica (la virgola di iOS ora passa), un campo per ogni link, tastiera che si apre da sola solo per un trekking nuovo, "Elimina trekking" in fondo al form (`ModaleTrekking.tsx`)

- [x] **27 · Wizard per inserire e modificare**: il form diventa quattro passi (Dove, Quanto, Link, Note) con "Indietro" e "Avanti" in fondo e l'indicatore in alto (`ModaleTrekking.tsx`)
  - [x] Un passo con un campo storto ferma "Avanti" e i passi dopo; Invio in un campo porta al passo dopo
  - [x] Nuovo trekking: "Salva" all'ultimo passo. Modifica: "Salva" a ogni passo, e dall'indicatore si salta dove serve

- [x] **28 · Luogo da un link di Google Maps**: nel campo del luogo si incolla il link di "Condividi"
  - [x] Lettura dei link lunghi: segnaposto `!3d…!4d…`, `?q=`, centro `@lat,lon`, nome dopo `/place/` senza CAP (`src/dominio/mappeGoogle.ts`, con i test)
  - [x] Edge Function `trekking-link-mappe` che apre i link brevi, solo con la sessione e solo verso Google Maps (`supabase/functions/`)
  - [x] Campo del luogo: il link incollato diventa nome e coordinate, o solo coordinate; "Avanti" resta fermo finché il link non è letto (`CampoLuogo.tsx`, `luogo.ts`)
  - [x] Edge Function pubblicata sul progetto Supabase (2026-10-03, `supabase functions deploy --use-api`)

- [x] **29 · Filtri più comodi**: barra dell'elenco come quella della mappa, scelte rapide, filtri accesi in vista (`Filtri.tsx`, `src/dominio/filtri.ts`)
  - [x] Ricerca e pulsante Filtri sulla stessa riga; "Mostra completati" nel pannello, come sulla mappa
  - [x] Scelte rapide per ogni filtro e "Altro…" per l'intervallo a mano; il conteggio del pulsante conta i filtri, non i limiti
  - [x] Filtri accesi come etichette con la X, "Azzera" e "N di M"

- [x] **26 · Apri in Google Maps**: "Apri in Maps" e il luogo nell'elenco aprono il punto su Google Maps invece che su OpenStreetMap, così sul telefono si parte col navigatore (`mappaEsterna` in `coordinate.ts`)

## Fase 6 · Da Trekking ad Adventures

L'app smette di essere solo trekking: prima cambia nome senza cambiare cosa fa, poi arrivano le avventure ([07](07-decisioni.md), 2026-10-12).

- [ ] **30 · Rinomina in Adventures**: repository, indirizzo, nome della PWA, schema e tabella del database, Edge Function; nessuna funzione nuova
  - [x] Codice: `base: '/Adventures/'`, manifest, schema `adventures`, tabella `attivita` (`src/dati/attivita.ts`), tipi `Attivita` e `CampiAttivita`, `useAttivita.ts`, `ModaleAttivita.tsx`, Edge Function `adventures-link-mappe`
  - [x] Icona Lucide `compass` al posto di `mountain-snow` (`public/icona.svg`, `npm run icone`); palette e sfondo restano
  - [x] `012_adventures.sql` applicato in produzione il 2026-10-12: schema, tabella, policy e vincoli rinominati, le 116 righe al loro posto
  - [x] `adventures` al posto di `trekking` negli Exposed schemas; nuovo indirizzo negli URL di redirect di Auth al posto del vecchio (2026-10-12)
  - [x] Edge Function `adventures-link-mappe` pubblicata, la vecchia eliminata (2026-10-12)
  - [x] Repository rinominato in `Adventures`, deploy su `giacomoguaresi.github.io/Adventures/` (2026-10-12); il vecchio indirizzo non risponde più
  - [ ] App reinstallata sui telefoni dal nuovo indirizzo
- [ ] **31 · Avventure**: colonna `tipo` (`trekking` · `avventura`), due elenchi nel menu, form senza "Quanto" per le avventure, tipo sulla mappa
  - [x] `tipo` nei tipi, `delTipo` e filtri per tipo con i loro test (`src/dominio/tipi.ts`, `tipo.ts`, `elenco.ts`, `filtri.ts`)
  - [x] Rotte `#/trekking` e `#/avventure` (il vecchio `#/elenco` porta ai trekking), menu con le due voci (`rotta.ts`, `MenuLaterale.tsx`)
  - [x] Form con la scelta del tipo e senza "Quanto" per le avventure (`ModaleAttivita.tsx`); elenco, dettagli e popup senza dislivello e durata
  - [x] Mappa comune con i puntini terracotta per le avventure e la scelta Tutti / Trekking / Avventure (`Mappa.tsx`, `BarraMappa.tsx`)
  - [x] `013_tipo.sql` applicato in produzione il 2026-10-12: le righe esistenti sono trekking, un'avventura con il dislivello viene rifiutata
  - [ ] Provato sull'app online: una "Fare rafting" creata, vista sul suo elenco e sulla mappa, completata

## Fase 7 · I premi dei giri fatti

Ogni giro completato deve dare una soddisfazione, come la Foresta in Projects ([07](07-decisioni.md), 2026-10-27).

- [ ] **32 · Completamento e premi**: data e numeri veri del giro, cerimonia, catena, passaporto, traguardi, statistiche
  - [x] `014_completamento.sql`: `completato_il` e i numeri `fatto_*`, con i vincoli
  - [x] Logica con i test: `completamento.ts`, `cronologia.ts`, `catena.ts`, `statistiche.ts`, `traguardi.ts`, `timbri.ts`, `caso.ts`
  - [x] Flusso di completamento e cerimonia (`ModaleCompletamento.tsx`); "Togli completato" con conferma; numeri veri nei dettagli
  - [x] Pagine Catena, Passaporto e Statistiche, con le voci nel menu
  - [x] `014_completamento.sql` applicato in produzione il 2026-10-27
  - [ ] Provato sull'app online: un trekking e un'avventura completati, cerimonia vista, "Togli completato"
- [ ] **33 · Sfide e obiettivo annuale**: da definire insieme
- [ ] **34 · Numeri dallo screenshot di Komoot**: OCR nel browser, caricato solo quando serve

## Ritocchi

- [ ] **35 · Mappa più leggibile** (`Mappa.tsx`, `index.css`)
  - [x] Segnaposto a goccia con l'icona del menu (montagna, tenda), spunta sui completati, quelli da fare sopra
  - [x] Segnaposto da 22 px, più piccoli dei primi, per non coprire la mappa; nome sotto il segnaposto da zoom 13; legenda in basso a sinistra
  - [x] Sfondo Stadia Maps Outdoors, con OpenStreetMap e Sentieri fra le scelte
  - [ ] Account gratuito Stadia Maps con il dominio `giacomoguaresi.github.io` registrato, prima del deploy

- [x] **35 · Stagioni delle avventure**: colonna `stagioni` (`015_stagioni.sql`, applicato il 2026-10-27), passo Stagioni nel form, filtro Stagione che parte da quella corrente (`src/dominio/stagioni.ts`)

## Più avanti, se servirà
- [ ] Posizione GPS: distanza dalla posizione attuale e puntino sulla mappa
- [ ] Google Places al posto di Photon
- [ ] Importazione delle voci dal vecchio file di note
