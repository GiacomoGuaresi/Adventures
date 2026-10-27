# 02 · Funzionalità

## Il caso d'uso principale

1. Trovo un trekking interessante sui social, su un sito o su Komoot.
2. Apro l'app e il **form di inserimento rapido**.
3. Inserisco i dettagli che ho in quel momento (spesso solo il nome) e salvo.

Poi, quando si decide dove andare, si apre l'**elenco** o la **mappa** e si filtra.

## Trekking e avventure

Ogni voce ha un **tipo**:

- **Trekking**: una camminata, con dislivello e durata.
- **Avventura**: qualunque altra cosa da fare fuori casa in coppia ("fare rafting", una ferrata, un giro in kayak). Niente data e niente numeri: nome, luogo se c'è, link e note.

I due tipi hanno **un elenco ciascuno** nel menu e stanno **insieme sulla mappa**. Tutto il resto (luogo, link, note, tempo di viaggio, completato, ricerca) funziona allo stesso modo; dove qui sotto si legge "trekking" vale anche per le avventure, salvo dislivello e durata.

Il tipo si sceglie in cima al form, già impostato sull'elenco da cui lo si apre (dalla mappa: trekking), e si può cambiare anche dopo: un trekking che diventa avventura perde dislivello e durata.

## Inserimento rapido

Un wizard in quattro passi, pensato per il telefono: **Dove** (tipo, nome e luogo), **Quanto** (dislivello, durata, viaggio), **Link**, **Note**. Per un'avventura i passi sono tre: **Quanto** non c'è, e il tempo di viaggio si calcola da solo. Solo il nome è obbligatorio. Un trekking nuovo si salva all'ultimo passo; in modifica lo stesso wizard ha "Salva" a ogni passo e dall'indicatore in alto si salta al passo che serve.

| Campo | Obbligatorio | Formato |
|---|---|---|
| **Nome** | sì | testo libero |
| **Luogo** | no | nome del luogo **oppure** coordinate, vedi [Luogo](#luogo) |
| **Link** | no | uno o più indirizzi (post, articolo, Komoot…), salvati così come sono |
| **Dislivello** | no | solo trekking: metri, intero positivo |
| **Durata** | no | solo trekking: ore di andata e ritorno, a passi di mezz'ora, in due campi collegati [ore \| minuti] |
| **Tempo di viaggio** | no | calcolato in automatico da casa; si può anche scrivere a mano in ore e minuti, vedi [Tempo di viaggio](#tempo-di-viaggio-e-distanza-da-casa) |
| **Note** | no | Markdown con la formattazione di base: grassetto, corsivo, elenchi, link |

- **Doppioni**: mentre si scrive il nome, se esiste già un trekking o un'avventura con un nome simile (senza distinguere maiuscole, minuscole e accenti) compare un avviso con il nome trovato. L'avviso non blocca il salvataggio.
- **Komoot e altri siti**: i dati non si leggono dal link. Dislivello e durata si scrivono a mano.

## Luogo

Un interruttore **Nome / Coordinate** sceglie come si indica il luogo:

- **Nome**: si scrive il nome del luogo, l'app propone i luoghi trovati da **Photon** e lo converte in coordinate. Si salvano nome e coordinate. Se si salva **senza scegliere un suggerimento**, l'app usa **il primo risultato** di Photon: un luogo impreciso è accettabile, e si corregge in modifica. Se Photon non trova nulla, si salva solo il nome del luogo, senza coordinate.
- **Coordinate**: si incollano latitudine e longitudine, come si copiano da Google Maps (`45.9876, 9.8765`). Si salvano solo le coordinate; il nome del luogo resta vuoto.
- **Link di Google Maps**: in tutti e due i campi si può incollare il link di "Condividi" (`https://maps.app.goo.gl/...`) o un link lungo `google.com/maps/...`. L'app ne legge il punto del segnaposto e, se c'è, il nome del posto senza il CAP: con il nome passa a **Nome** con il luogo già trovato, senza nome alle **Coordinate**. I link brevi li apre la Edge Function ([03](03-architettura.md)); se il link non si legge, compare un messaggio e il luogo va scritto a mano.

Regole:
- il luogo è **indipendente dal nome del trekking**: nessun suggerimento automatico a partire dal nome;
- un trekking ha **un solo luogo**: mete diverse sono trekking diversi;
- la ricerca dei luoghi sta dietro un'interfaccia propria, per poter passare a Google Places in futuro senza toccare il resto dell'app.

## Tempo di viaggio e distanza da casa

La posizione di **casa** è un punto fisso salvato nel database ([04](04-sicurezza.md)). Non si modifica dall'app.

| Dato | Come si ottiene | Quando | Salvato |
|---|---|---|---|
| **Distanza in linea d'aria** | calcolata nel browser dalle coordinate di casa e del luogo | ogni volta che si apre l'elenco o la mappa | no |
| **Tempo di viaggio in auto** | chiesto a **openrouteservice**, con partenza da casa | al salvataggio e quando cambia il luogo | sì |

- Il tempo di viaggio si può **scrivere a mano**: da quel momento il calcolo non lo sovrascrive più. Svuotando il campo torna automatico.
- Se openrouteservice non risponde, il trekking si salva lo stesso senza tempo di viaggio.
- I **tempi mancanti** (trekking con coordinate, senza tempo e non manuali) si recuperano in due modi:
  - a ogni **inserimento o modifica** di un trekking, l'app prova a calcolare anche quelli mancanti;
  - all'**apertura dell'app**, se ce ne sono, compare un popup con il numero dei trekking da calcolare e il pulsante **Ricalcola percorsi mancanti**.
- Quando il luogo è lontano dalle strade (cime, laghi, rifugi), il tempo è calcolato fino alla **strada più vicina**.
- Il popup compare a ogni apertura in cui ci sono tempi mancanti; con la regola qui sotto succede solo dopo che openrouteservice era irraggiungibile.
- **Percorso non calcolabile**: se openrouteservice risponde che il percorso **non esiste** (luogo irraggiungibile in auto, troppo lontano, punto sbagliato), l'app **toglie il luogo** dal trekking (nome del luogo e coordinate) e lo segnala con un breve messaggio. Il trekking resta nell'elenco, non compare più sulla mappa e non viene più ricalcolato; il luogo si può reinserire in modifica. Se invece il servizio è **irraggiungibile** (rete assente, server fuori servizio, quota esaurita), il luogo resta e il tempo si riprova più tardi.
- Senza luogo, distanza e tempo di viaggio restano vuoti.
- La **durata** del trekking non si può calcolare: si scrive solo a mano.

## Elenco

- **Tabella semplice**, sia su PC sia su telefono (su telefono scorre in orizzontale). Le card su telefono si valuteranno dopo l'uso.
- **Ordinamento**: di default per **tempo di viaggio crescente**, i più vicini in cima. Toccando l'intestazione di una colonna si ordina per quella colonna; un secondo tocco inverte l'ordine. I trekking senza il valore vanno sempre in fondo.
- **Ricerca per nome** e pulsante **Filtri** sulla stessa riga, come sulla mappa; il pulsante mostra quanti filtri sono accesi.
- **Filtri**, ognuno con le **scelte rapide** da toccare (toccare quella accesa la spegne) e **Altro…** per scrivere un intervallo a mano:
  - dislivello: ≤ 500, 500–1000, 1000–1500, ≥ 1500 m;
  - durata: ≤ 3, 3–5, 5–7, ≥ 7 h;
  - distanza da casa in linea d'aria: ≤ 25, 50, 100, 150 km;
  - tempo di viaggio da casa: ≤ 30 min, 1 h, 1 h 30, 2 h.
- I filtri accesi restano **in vista sotto la barra** come etichette ("Dislivello 500–1000 m ×") da togliere con un tocco, con **Azzera** e quanti trekking passano ("12 di 40"). Nel pannello c'è anche **Mostra completati**.
- Un trekking a cui **manca il dato** su cui si filtra (niente luogo, niente tempo di viaggio, niente dislivello…) **resta visibile**: i filtri nascondono solo i trekking con un valore fuori dall'intervallo.
- **Completato**: segnarlo apre il **completamento** (sotto); toglierlo chiede conferma. I completati spariscono dall'elenco; l'interruttore **Mostra completati** li fa ricomparire.
- **Modifica** di tutti i campi ed **eliminazione** con conferma.
- **Stagioni delle avventure**: nel form, al posto di "Quanto", il passo **Stagioni** con quattro scelte da accendere (una o più, o nessuna per "tutto l'anno"); nei dettagli si leggono come "Primavera ed estate". Il filtro **Stagione** (Qualsiasi, Primavera, Estate, Autunno, Inverno) parte sulla **stagione corrente** a ogni apertura e lascia passare anche le avventure con tutte le stagioni o senza nessuna; i trekking non ne hanno e passano sempre. Compare negli elenchi delle avventure e sulla mappa, non nell'elenco dei trekking.
- Nell'elenco delle **avventure** non ci sono le colonne e i filtri di dislivello e durata; quelli accesi sui trekking restano accesi per quando ci si torna.
- Niente raggruppamenti per zona o tag.

## Mappa

- **Pagina principale** dell'app: la mappa occupa tutta la pagina, con la **stessa ricerca e gli stessi filtri** dell'elenco in una barra flottante sopra la mappa.
- Mappa base **Stadia Maps Outdoors** (dati OpenStreetMap, colori tenui, cime con la quota), con **OpenStreetMap** e **OpenTopoMap** (curve di livello e sentieri) come alternative selezionabili.
- Un **segnaposto** per ogni trekking e per ogni avventura con le coordinate, con la stessa icona del menu: **montagna blu** i trekking, **tenda terracotta** le avventure; i completati sono chiari e hanno una **spunta**, e stanno sotto quelli da fare. Chi non ha il luogo non compare sulla mappa, ma resta nel suo elenco.
- Da **zoom 13** in su il **nome** sta sotto ogni segnaposto; più lontano si legge passandoci sopra e nel popup.
- In basso a sinistra una piccola **legenda**: Trekking, Avventura, Completato, Casa.
- Nel pannello dei filtri la scelta **Tutti / Trekking / Avventure**: serve perché i filtri numerici lasciano passare chi non ha il dato.
- Toccando un segnaposto si apre un **popup riassuntivo** (nome, luogo, dislivello, durata, tempo di viaggio, distanza) con il pulsante **Dettagli**.
- **Dettagli** apre la scheda in **sola lettura** (sul telefono un foglio che sale dal basso): luogo apribile in Google Maps, numeri, link, note, data di aggiunta. Da lì **Modifica** apre il form e **Trekking completato / Togli completato** cambia il completato; chiuso il form si torna ai dettagli aggiornati. La stessa scheda si apre toccando il nome nell'elenco.
- **Casa** è segnata con un'icona propria.

## Completamento e premi

Ogni giro fatto deve dare una piccola soddisfazione: i trekking diventano **montagne**, le avventure **timbri**, e tutti e due sbloccano **traguardi**. Tutto si calcola dall'elenco: si salvano solo la data e i numeri veri del giro.

- **Completamento**: segnare il completato (dai dettagli o dalla casella dell'elenco) apre un piccolo flusso.
  1. **Quando**: il giorno del giro, oggi di default, mai nel futuro.
  2. Solo per i trekking, **i numeri veri** da Garmin o Komoot, tutti facoltativi: dislivello (proposto quello previsto), lunghezza in km, quota massima, durata. Si scrivono a mano.
  3. **Relazione**, facoltativa: le note della scheda, da sistemare col percorso fatto davvero. **Salta** le lascia come sono.
  4. **Cerimonia**: la cima nuova sorge nella catena fra le vicine e pianta la bandierina, o il timbro cade sul passaporto; sotto i numeri, al massimo tre confronti ("Il tuo 3° dislivello più alto", "Nuovo record di quota", "+1.240 m: nel 2026 sei a 8.430 m") e i traguardi appena sbloccati, che cadono come sigilli.
- **Togli completato** chiede conferma e azzera la data e i numeri veri; le note restano.
- I giri completati prima del completamento non hanno data: stanno all'inizio della catena e in fondo al passaporto come **Prima di Adventures**.
- **Catena** (`#/catena`): una cima per trekking completato, da sinistra a destra in ordine di giro, con gli anni sotto. L'altezza segue il **dislivello vero** (o il previsto, se manca) con una radice, così anche i giri corti si vedono; la base si allarga con i km; la neve arriva dai 1.200 m. Le cime nuove sorgono la prima volta che si vedono, quelle di oggi brillano. Un tocco su una cima ne mostra i numeri e apre i dettagli.
- **Passaporto** (`#/passaporto`): una pagina per anno con un timbro per ogni avventura completata (forma, inchiostro e inclinazione nascono dall'avventura) e un **sigillo d'oro** per ogni traguardo raggiunto, di trekking o di avventure, in ordine di giorno. Toccando un timbro si apre il giro che l'ha dato. I traguardi da raggiungere **non si vedono**: il pulsante **Da sbloccare** li elenca in un foglio, con cosa serve e, dove si può contare, a che punto si è ("7.350 m di 8.849 m"), i più vicini prima.
- **Traguardi** (75), il giorno di sblocco è quello del giro che ha superato la soglia:
  - **trekking fatti**: 1, 5, 10, 25, 50, 100;
  - **dislivello in tutto**: 1.000 m, Gran Paradiso (4.061 m), Cervino (4.478 m), Monte Rosa (4.634 m), Monte Bianco (4.808 m), Aconcagua (6.961 m), Everest (8.849 m), 2, 5 e 10 Everest, 100 km; **in un giro**: 1.000, 1.500 e 2.000 m, o sotto i 300 m;
  - **quota**: 2.000, 2.500, 3.000 e 4.000 m;
  - **km**: un giro da 20 e da 30 km; in tutto 21,1, 42,2, 100, 1.000 (Via Francigena) e 3.500 km;
  - **ore**: un giro da 8 ore; 100 e 1.000 ore in tutto; un trekking a 500 m di salita all'ora, solo coi numeri veri;
  - **avventure fatte**: 1, 3, 5, 10, 25, 50;
  - **lontano da casa**: un'avventura a meno di mezz'ora d'auto; un giro ad almeno 1 e 4 ore d'auto; una e tre avventure ad almeno 2 ore; un giro fuori dall'Italia (un contorno a grandi linee in `italia.ts`); 5 posti lontani almeno 20 km fra loro; con la posizione di casa, un giro verso ognuno dei quattro punti cardinali (ad almeno 10 km) e uno almeno 100 km più a nord o più a sud;
  - **calendario**: un trekking e un'avventura in ogni stagione; un trekking d'inverno, d'inverno sopra i 1.500 m, a Ferragosto; un giro a Capodanno, di martedì, mercoledì o giovedì, sabato e domenica dello stesso weekend; tutti i 12 mesi, in anni diversi o nello stesso; un'avventura fuori dalle sue stagioni;
  - **costanza**: 3 e 6 mesi di fila, 3 giri in una settimana, un giro dopo 6 mesi di pausa, uno a un anno dal primo (± 7 giorni), 10 e 20 giri in un anno;
  - **insieme**: un trekking e un'avventura nello stesso mese, due trekking e un'avventura nello stesso mese, tutti e due nello stesso giorno o nello stesso weekend, 10 trekking e 10 avventure.
- **Statistiche** (`#/statistiche`): di sempre o di un anno, trekking, avventure, dislivello, km, ore, dislivello medio, i record col loro giro, l'ultimo giro, i giri per mese (con l'anno) e quanta parte della lista è fatta.
- **Sfide e obiettivo annuale** di dislivello: da definire.
- Più avanti: leggere i numeri dallo **screenshot di Komoot** (OCR nel browser) per non scriverli a mano.

