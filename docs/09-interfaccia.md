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
| Segnaposto dei trekking sulla mappa | `#5b87ad` | blu più chiaro, icona panna; completati `#dbe7f1` con icona e spunta `#32516c` |
| Accento sul blu: bussola dell'intestazione, ago dell'icona | `#f0b556` | sole, l'oro delle altre app di casa |
| Accento sui fondi chiari: barretta della voce corrente nel menu, icona dell'accesso | `#9a6a12` | sole scuro |
| Segnaposto delle avventure sulla mappa | `#c9793f` | terracotta; completati `#f1ddcc` con icona e spunta `#8a4a22` |
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
| **Mappa** (`#/`, pagina principale) | mappa a tutta pagina sotto l'intestazione; sopra galleggia una barra con ricerca e pulsante **Filtri** (pannello con "Mostra completati" e gli stessi filtri dell'elenco); zoom e scelta della mappa (Mappa, OpenStreetMap, Sentieri) in basso a destra, legenda in basso a sinistra; segnaposto a goccia da 22 px con l'icona del tipo (`mountain-snow`, `tent`), nomi da zoom 13, casa in un tondo panna, popup con i dettagli |
| **Trekking** (`#/trekking`) e **Avventure** (`#/avventure`) | due elenchi fatti allo stesso modo, quello delle avventure senza dislivello e durata; il **+** apre il form sul tipo dell'elenco |
| **Elenco** (com'è fatto ciascuno) | ricerca e pulsante **Filtri** sulla stessa riga, pannello con scelte rapide, filtri accesi come etichette sotto la barra con "N di M", tabella semplice ordinabile per colonna ([02](02-funzionalita.md#elenco)) |
| **Dettagli** | scheda in sola lettura, foglio dal basso sul telefono, con Modifica e Trekking completato (o Avventura completata) / Togli completato in fondo |
| **Inserimento / modifica** | form a schermo intero sul telefono, con la scelta Trekking / Avventura in cima, a gruppi (Dove, Quanto, Link, Note; senza Quanto per le avventure), tastiere numeriche, un campo per link, Salva sempre in vista, "Elimina trekking" in fondo in modifica ([02](02-funzionalita.md#inserimento-rapido)) |
| **Completamento** | form a schermo intero sul telefono: Quando e i numeri veri, poi la Relazione con Salta; salvato, la cerimonia in un foglio dal basso con "Vedi la catena" o "Vedi il passaporto" ([02](02-funzionalita.md#completamento-e-premi)) |
| **Catena** (`#/catena`) | a tutta pagina come la Mappa, pensata per il telefono: la scena riempie lo schermo e scorre in orizzontale partendo dall'ultima cima; le cime crescono con l'altezza dello schermo ma in larghezza si fermano, così sugli schermi alti diventano ripide. Vista alpina: cielo che si scalda verso l'orizzonte, sole, nuvole, due crinali lontani nella foschia, abeti sul prato con gli anni. Ogni cima ha la sua roccia (granito, dolomia rosata, calcare ocra, ardesia, porfido) e i boschi della **stagione del giro** (verde tenero, verde pieno, oro, scuro con la neve bassa d'inverno); le lontane prendono foschia. Sopra galleggia il riquadro coi totali; un tocco porta la cima al centro e apre sotto la sua scheda (bandierina rossa, bordo color sole); "Ultima cima" riporta alla fine |
| **Passaporto** (`#/passaporto`) | pagine color panna, una per anno, tre timbri per riga sul telefono, a inchiostro consumato (filtro SVG): le avventure in cinque inchiostri e quattro forme, i **traguardi** come sigilli a rosetta d'oro con la loro icona. In alto **Da sbloccare (N)** apre un foglio dal basso con quelli mancanti: icona tratteggiata col lucchetto, cosa serve, barra d'oro con "fatto di serve" |
| **Statistiche** (`#/statistiche`) | scelta Sempre / anni, sei numeri, record, giri per mese a barre impilate (trekking `#3d77b0`, avventure `#c9793f`, provati col validatore della palette) con la tabella da aprire, avanzamento della lista |
| **Accesso** | solo passphrase, come le altre app |
| **Popup dei percorsi mancanti** | all'apertura, se ci sono tempi di viaggio da calcolare |

## Animazioni dei premi

Solo CSS e SVG, come la Foresta di Projects; con "riduci movimento" tutto compare di colpo.
- `sorge`: la cima nuova sale da sotto la terra con una piccola frenata (900 ms); `bandiera` la fa alzare subito dopo. Le cime nuove sorgono **in ordine di giro**, ognuna quando la precedente è all'80% (al massimo circa 8 secondi in tutto), e l'**inquadratura le segue** scorrendo da sola dalla prima fino in fondo; un tocco o uno scorrimento la ferma.
- `timbra`: il timbro cade dall'alto ruotando e rimbalza appena; `inchiostro` è lo schizzo che si allarga e sparisce.
- `alone` e `scintilla`, presi dalla Foresta, per le cime di oggi.
- Le cime e i timbri già visti si ricordano nel browser (`adventures_catena_viste`, `adventures_timbri_visti`): compaiono con l'animazione solo i nuovi.
- Finché ci sono cime o timbri non ancora visti, nel menu accanto a **Catena** e **Passaporto** c'è un **pallino rosso col numero** di quanti ne compariranno, e sul ☰ dell'intestazione (sul telefono) il totale; batte piano ogni tanto. Sparisce aprendo la pagina.

