# 07 · Decisioni

| Data | Decisione | Esito |
|---|---|---|
| 2026-09-15 | Nuova app di casa chiamata **Trekking**, repository pubblico, licenza **MIT** | deciso |
| 2026-09-15 | **Stessa struttura, tecnologia e database** di Grocery e Projects | deciso |
| 2026-09-15 | Hosting **GitHub Pages** su `giacomoguaresi.github.io/Trekking` | deciso |
| 2026-09-15 | Stack **Vite + React + TypeScript**, PWA, test con Vitest | deciso |
| 2026-09-15 | **Progetto Supabase di produzione di Grocery**, schema dedicato `trekking`, script SQL numerati applicati a mano | deciso |
| 2026-09-15 | Accesso con **lo stesso account e la sola passphrase**, sessione condivisa con le altre app | deciso |
| 2026-09-15 | Scopo: **piccolo database dei trekking da fare**, salvati al volo da social, siti, Komoot | deciso |
| 2026-09-15 | L'app **sostituisce il file di note**; il contenuto del file non entra nel repository | deciso |
| 2026-09-15 | **Inserimento rapido**: solo il nome è obbligatorio | deciso |
| 2026-09-15 | ~~Luogo suggerito a partire dal nome del trekking~~ | superata |
| 2026-09-15 | Luogo **indipendente dal nome**, con interruttore **Nome / Coordinate**; nel database si salvano nome del luogo e coordinate | deciso |
| 2026-09-15 | Ricerca dei luoghi con **Photon**, dietro un'interfaccia per passare eventualmente a **Google Places** | deciso |
| 2026-09-15 | **Un solo luogo** per trekking: le mete diverse sono trekking diversi | deciso |
| 2026-09-15 | **Più link** per trekking | deciso |
| 2026-09-15 | **Dislivello** in metri, intero positivo, un solo valore (niente dislivello con impianti) | deciso |
| 2026-09-15 | **Durata** di andata e ritorno in ore, a passi di mezz'ora, solo manuale | deciso |
| 2026-09-15 | **Note** in Markdown con la sola formattazione di base, niente diario | deciso |
| 2026-09-15 | **Elenco** con ricerca per nome e filtri su dislivello e durata (min/max), distanza e tempo di viaggio (max) | deciso |
| 2026-09-15 | I trekking **senza il dato filtrato** restano visibili | deciso |
| 2026-09-15 | **Completato** reversibile; completati nascosti, interruttore **Mostra completati** | deciso |
| 2026-09-15 | Modifica di tutti i campi ed **eliminazione con conferma** | deciso |
| 2026-09-15 | Niente filtro per zona, niente tag o raggruppamenti: per la zona c'è la mappa | deciso |
| 2026-09-15 | **Avviso dei doppioni** mentre si scrive il nome, senza bloccare il salvataggio | deciso |
| 2026-09-15 | ~~Distanza anche dalla posizione GPS~~ | superata |
| 2026-09-15 | **Niente GPS**, per ora | deciso |
| 2026-09-15 | **Distanza in linea d'aria da casa**, calcolata nel browser | deciso |
| 2026-09-15 | **Tempo di viaggio in auto da casa** con **openrouteservice**, calcolato al salvataggio o scritto a mano; un valore manuale non si sovrascrive | deciso |
| 2026-09-15 | ~~Tempi di viaggio mancanti ricalcolati ogni giorno~~ | superata |
| 2026-09-15 | Tempi di viaggio mancanti recuperati **a ogni salvataggio** e con il popup **Ricalcola percorsi mancanti** all'apertura; nessun job programmato | deciso |
| 2026-09-15 | **Percorso impossibile** (risposta di openrouteservice, non servizio irraggiungibile): l'app **toglie il luogo** dal trekking, così non si ricalcola più; il popup compare a ogni apertura con tempi mancanti | deciso |
| 2026-09-15 | Tempo di viaggio calcolato fino alla **strada più vicina** al luogo (`radiuses: -1`) | deciso |
| 2026-09-15 | Luogo per nome senza suggerimento scelto: si usa **il primo risultato** di Photon | deciso |
| 2026-09-15 | Elenco come **tabella semplice** anche su telefono; card eventualmente dopo | deciso |
| 2026-09-15 | Ordinamento di default per **tempo di viaggio crescente**, ordinabile per **ogni colonna**, valori mancanti in fondo | deciso |
| 2026-09-15 | Colore **blu montagna**, icona Lucide `mountain-snow`, **sfondo doodle** a tema montagna, stessa struttura delle altre app | deciso |
| 2026-09-15 | Posizione di casa **nel database dietro RLS**, inserita a mano, mai nel bundle né nel repository | deciso |
| 2026-09-15 | **Mappa** in pagina a sé con gli stessi filtri dell'elenco, **Leaflet** con OpenStreetMap e OpenTopoMap, popup con i dettagli, casa segnata | deciso |
| 2026-09-15 | Komoot si salva **solo come link**; nessun dato letto dai siti | deciso |
| 2026-09-15 | **Importazione** del file di note rimandata | deciso |
| 2026-09-15 | Sviluppo **a piccoli incrementi stabili**: ogni step porta una funzione completa dal database all'interfaccia, pubblicata e utilizzabile; le colonne del database arrivano con lo step che le usa | deciso |
| 2026-10-12 | Le **avventure** (cose da fare fuori casa in coppia, senza data) stanno in questa app e non in Projects né in un'app nuova | deciso |
| 2026-10-12 | L'app si chiama **Adventures**: rinomina completa di repository, indirizzo, schema (`adventures`), tabella (`attivita`) ed Edge Function; l'app si reinstalla sui telefoni | deciso |
| 2026-10-12 | Trekking e avventure nella **stessa tabella**, distinti dalla colonna `tipo`; la riga generica si chiama **attività** | deciso |
| 2026-10-12 | Per le avventure bastano **note e link**: niente diario a voci datate come in Projects | deciso |
| 2026-10-12 | Nel menu **due elenchi separati**, Trekking e Avventure, più la Mappa comune | deciso |
| 2026-10-12 | Icona Lucide `compass` al posto di `mountain-snow`; palette e sfondo restano | deciso |
| 2026-10-12 | **Accento color sole** (`#f0b556`, scuro `#9a6a12`), l'oro delle altre app di casa: ago dell'icona, bussola dell'intestazione, barretta del menu, icona dell'accesso ([09](09-interfaccia.md)) | deciso |
| 2026-10-27 | **Premi dei giri fatti**, come la Foresta di Projects: i trekking diventano cime di una **catena**, le avventure **timbri** di un passaporto, e tutti e due sbloccano **traguardi**; poi **statistiche**. Tutto calcolato, niente punti salvati | deciso |
| 2026-10-27 | Il completato ha una **data** (il giorno del giro) e, per i trekking, i **numeri veri** da Garmin o Komoot scritti a mano: dislivello, km, quota massima, durata in minuti. I previsti della scheda restano | deciso |
| 2026-10-27 | Un giro **conta una volta sola**: niente tabella delle uscite ripetute, per ora | deciso |
| 2026-10-27 | L'altezza delle cime segue il **dislivello** (vero, o previsto se manca), non la quota | deciso |
| 2026-10-27 | Niente GPX; i numeri dallo **screenshot di Komoot** con OCR nel browser più avanti. Niente libro di vetta né mappa che si svela | deciso |
| 2026-10-27 | **Togli completato** chiede conferma: perde la data e i numeri veri | deciso |
| 2026-10-27 | **Passaporto e traguardi uniti**: ogni traguardo raggiunto è un sigillo d'oro del passaporto; quelli da raggiungere sono nascosti e si leggono, con l'avanzamento, nel foglio **Da sbloccare** | deciso |
| 2026-10-27 | Le **avventure hanno una o più stagioni** (nessuna = tutto l'anno); il filtro **Stagione** parte da quella corrente e include chi le ha tutte o nessuna. I trekking no | deciso |
| 2026-10-27 | **Mappa più leggibile**: segnaposto a goccia da 22 px con l'icona del tipo, spunta sui completati, nomi da zoom 13, legenda; sfondo **Stadia Maps Outdoors** (CARTO ora chiede una chiave), OpenStreetMap e OpenTopoMap restano fra le scelte | deciso |
