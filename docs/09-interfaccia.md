# 09 · Interfaccia

## Coerenza con le altre app

Stessa struttura di Grocery e Projects, con un colore diverso:
- **intestazione piena** nel colore dell'app, con ☰ a sinistra e **+** (inserimento rapido) a destra. Accanto al **+**, e nel menu, la scritta si alterna ogni 5 secondi fra "Nuovo trekking" e "Nuova avventura", con quella nuova che sale dal basso: toccando si apre il form sul tipo che si legge in quel momento;
- **menu laterale** a scomparsa, sempre aperto su schermi larghi: **Mappa**, **Trekking**, **Avventure**, **Installa l'app**;
- stesso font e stesse icone Lucide;
- solo **italiano** e solo **tema chiaro**.

## Palette · blu montagna

| Uso | Colore | Note |
|---|---|---|
| Intestazione, pulsanti principali, `theme_color` della PWA | `#3f6485` | blu montagna |
| Puntini dei trekking sulla mappa | `#5b87ad` | blu più chiaro |
| Accento sul blu: bussola dell'intestazione, ago dell'icona | `#f0b556` | sole, l'oro delle altre app di casa |
| Accento sui fondi chiari: barretta della voce corrente nel menu, icona dell'accesso | `#9a6a12` | sole scuro |
| Puntini delle avventure sulla mappa | `#c9793f` | terracotta, bordo `#8a4a22` |
| Sfondo, `background_color` della PWA | `#f1f5f9` | azzurro ghiaccio molto chiaro |
| Testo e icone sull'intestazione | `#fbf8f1` | panna, come nelle altre app |

Valori di partenza, da rifinire allo step "Aspetto" della [roadmap](06-roadmap.md).

## Icona

Stesso sistema delle altre app: disegno Lucide **`compass`** (la bussola: prima della rinomina era `mountain-snow`) su blu montagna `#3f6485`, col cerchio panna e l'ago color sole `#f0b556`, in `public/icona.svg`, da cui `npm run icone` genera le icone della PWA.

## Sfondo

**Sfondo doodle a tema montagna** (cime, abeti, scarponi, bussola, zaino, sentiero tratteggiato), generato da `scripts/genera-sfondo.ts` con un seed fisso, come nelle altre app.

## Schermate

| Schermata | Contenuto |
|---|---|
| **Mappa** (`#/`, pagina principale) | mappa a tutta pagina sotto l'intestazione; sopra galleggia una barra con ricerca e pulsante **Filtri** (pannello con "Mostra completati" e gli stessi filtri dell'elenco); zoom e scelta della mappa in basso a destra; puntini, casa, popup con i dettagli |
| **Trekking** (`#/trekking`) e **Avventure** (`#/avventure`) | due elenchi fatti allo stesso modo, quello delle avventure senza dislivello e durata; il **+** apre il form sul tipo dell'elenco |
| **Elenco** (com'è fatto ciascuno) | ricerca e pulsante **Filtri** sulla stessa riga, pannello con scelte rapide, filtri accesi come etichette sotto la barra con "N di M", tabella semplice ordinabile per colonna ([02](02-funzionalita.md#elenco)) |
| **Dettagli** | scheda in sola lettura, foglio dal basso sul telefono, con Modifica e Trekking completato (o Avventura completata) / Togli completato in fondo |
| **Inserimento / modifica** | form a schermo intero sul telefono, con la scelta Trekking / Avventura in cima, a gruppi (Dove, Quanto, Link, Note; senza Quanto per le avventure), tastiere numeriche, un campo per link, Salva sempre in vista, "Elimina trekking" in fondo in modifica ([02](02-funzionalita.md#inserimento-rapido)) |
| **Accesso** | solo passphrase, come le altre app |
| **Popup dei percorsi mancanti** | all'apertura, se ci sono tempi di viaggio da calcolare |
