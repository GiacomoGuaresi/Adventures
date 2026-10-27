# 01 · Visione

## Scopo

**Adventures** (fino a ottobre 2026 **Trekking**) è un piccolo database delle **cose da fare fuori casa**: i **trekking** e le **avventure**, cioè tutto il resto che si vuole provare in coppia (rafting, ferrate, kayak…), senza una data. È nata per i trekking, e di quelli parla quasi tutto qui sotto: Serve a salvare al volo un trekking trovato sui social, su un sito o su Komoot, con i dettagli disponibili in quel momento, e a sceglierne uno quando si decide dove andare: per dislivello, durata, distanza da casa, o guardando la mappa.

Le funzionalità sono descritte in [02](02-funzionalita.md).

## Origine

Trekking sostituisce un **file di note** in cui oggi si accumulano i trekking da fare. Com'è fatto quel file aiuta a capire cosa serve all'app:

- **circa 120 voci**, quasi tutte con **solo il nome**: per questo il nome è l'unico campo obbligatorio;
- poche voci hanno dettagli: tempo di viaggio in auto, dislivello, link Komoot;
- alcune righe mettono insieme più mete: nell'app diventano trekking separati;
- ci sono doppioni: l'app avvisa quando un nome esiste già.

L'importazione di queste voci non è prevista per ora, e il contenuto del file non entra nel repository.

## Volumi attesi

- Trekking salvati: **centinaia**, nel tempo
- Completati: una piccola parte, nascosti dall'elenco

## Principi

Gli stessi di Grocery e Projects:

1. **Semplice e rapido**: un trekking si salva in pochi secondi, da telefono o da PC.
2. **Generico**: solo il nome è obbligatorio; il resto si inserisce se lo si ha.
3. **Gratuito**: nessun costo di hosting, database o servizi di mappe (tutti basati su OpenStreetMap; Stadia Maps nel piano gratuito).
4. **Privato**: il codice è pubblico, i dati (compresa la posizione di casa) li vede solo chi accede.
5. **Zero manutenzione**: nessun server, stesso progetto Supabase delle altre app.

## Utenti

Il proprietario e la partner, **allo stesso livello**, con l'account condiviso delle altre app.

## Cosa NON è (per ora)

- Un navigatore o un'app per registrare le tracce: niente GPS e niente posizione del telefono
- Un catalogo organizzato: due soli tipi (trekking e avventura), niente tag o raggruppamenti per zona (la zona si vede sulla mappa)
- Un lettore di Komoot o di altri siti: i dati si scrivono a mano, il link si salva e basta
- Un diario delle uscite né un calendario: ci sono solo le note. Una data c'è solo per i giri **completati**, il giorno in cui si sono fatti, e serve ai premi (catena, passaporto, statistiche)
