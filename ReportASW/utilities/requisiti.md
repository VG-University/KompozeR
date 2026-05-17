# Requisiti KompozeR - base per la sezione di analisi

Questo documento raccoglie il materiale preliminare utile per costruire la sezione requisiti della relazione di ASW. In questa fase vengono definiti gli stakeholder principali, alcune personas rappresentative e i principali scenari d'uso. L'obiettivo e' derivare successivamente user stories, use case e requisiti di business, funzionali e non funzionali in modo coerente con un approccio User Centered Design.

## 1. Stakeholder

L'identificazione degli stakeholder serve a chiarire chi trae valore dal sistema, chi lo utilizza direttamente e chi influenza i vincoli progettuali.

### 1.1 Stakeholder primari

| Stakeholder | Descrizione | Obiettivi principali | Bisogni critici |
| --- | --- | --- | --- |
| Cliente finale | Utente che desidera progettare e acquistare una scaffalatura personalizzata | Configurare rapidamente il prodotto corretto, capire prezzo e compatibilita', completare l'acquisto senza errori | Configuratore chiaro, anteprima affidabile, salvataggio configurazioni |
| Cliente registrato ricorrente | Utente che torna sul sito per modificare o riordinare una configurazione | Riutilizzare/ modificare configurazioni salvate | Storico configurazioni, accesso rapido|
| Amministratore catalogo | Operatore che gestisce prodotti, componenti, disponibilita' e prezzi | Mantenere coerente il catalogo e rendere acquistabili solo combinazioni valide | Interfacce di gestione chiare, aggiornamenti rapidi, controllo consistenza dati |

### 1.2 Stakeholder secondari

| Stakeholder | Ruolo nel progetto | Interesse principale |
| --- | --- | --- |
| Azienda Kompo | Committente del prodotto | Aumentare conversione, ridurre abbandono, migliorare esperienza d'acquisto |
| Team di sviluppo | Realizza e mantiene il sistema | Requisiti chiari, comportamento verificabile, architettura evolvibile |
| Servizio clienti | Supporta utenti con dubbi o problemi | Ridurre richieste ripetitive grazie a configuratore e assistenza automatizzata |
| Responsabile business/reportistica | Analizza andamento vendite e utilizzo del sistema | Ottenere insight utili su trend di vendita e utilizzo delle funzionalita' |

## 2. Personas

Le personas rappresentano classi di utenti rilevanti per il sistema. Sono state costruite a partire dal contesto del progetto, non da osservazioni empiriche reali; vanno quindi considerate come archetipi iniziali da affinare nelle fasi successive.

### 2.1 Persona 1 - Marta, cliente orientata alla praticita'

- Eta': 34 anni
- Professione: architetta freelance
- Contesto: deve arredare uno studio domestico con una soluzione modulare esteticamente coerente e compatibile con uno spazio limitato
- Competenze digitali: medio-alte
- Obiettivi:
	- configurare rapidamente una scaffalatura compatibile con lo spazio disponibile;
	- vedere subito una resa visiva credibile del risultato;
	- conoscere il prezzo finale senza dover interpretare manualmente decine di componenti.
- Frustrazioni:
	- cataloghi troppo tecnici o dispersivi;
	- dubbi sulla compatibilita' tra componenti;
	- perdita del lavoro svolto durante la configurazione.
- Aspettative verso KompozeR:
	- configuratore guidato;
	- anteprima chiara;
	- supporto immediato in caso di dubbi.

### 2.2 Persona 2 - Luca, cliente indeciso ma motivato all'acquisto

- Eta': 28 anni
- Professione: impiegato
- Contesto: vuole arredare il soggiorno ma non conosce il dominio dei mobili componibili e teme di acquistare elementi incompatibili
- Competenze digitali: medie
- Obiettivi:
	- esplorare poche opzioni ben comprensibili;
	- ricevere suggerimenti su misure, compatibilita' e costo;
	- salvare una soluzione per confrontarla con altre prima dell'acquisto.
- Frustrazioni:
	- gergo troppo specialistico;
	- interfacce complesse o con troppi passaggi;
	- mancanza di conferme su cio' che sta costruendo.
- Aspettative verso KompozeR:
	- chatbot contestuale;
	- messaggi semplici e orientati all'azione;
	- notifiche se la configurazione salvata cambia di prezzo o disponibilita'.

### 2.3 Persona 3 - Giulia, amministratrice del catalogo

- Eta': 41 anni
- Professione: responsabile operativa e-commerce
- Contesto: aggiorna catalogo, prezzi e disponibilita', e deve assicurare coerenza tra dati commerciali e configurazioni acquistabili
- Competenze digitali: alte sul dominio applicativo, non necessariamente tecniche
- Obiettivi:
	- aggiornare rapidamente dati di catalogo;
	- ridurre gli errori causati da disponibilita' non allineate;
	- monitorare come le modifiche influenzano configurazioni e ordini.
- Frustrazioni:
	- strumenti amministrativi poco chiari;
	- necessità di aggiornamenti manuali ripetitivi;
	- mancanza di visibilita' sugli effetti di una variazione di prezzo o stock.
- Aspettative verso KompozeR:
	- pannello amministrativo leggibile;
	- stato dei componenti sempre aggiornato;
	- reportistica sintetica ma utile alle decisioni.

## 3. Scenari d'uso principali

Gli scenari descrivono come una specifica persona cerca di raggiungere un obiettivo concreto tramite il sistema. In questa fase servono a far emergere in modo narrativo i futuri requisiti.

### Scenario 1 - Configurazione iniziale di una scaffalatura

Marta accede a KompozeR con l'intenzione di arredare il proprio studio. Inserisce alcune preferenze iniziali, come dimensioni desiderate o tipologia di struttura, e inizia a comporre la scaffalatura tramite il configuratore visuale. Il sistema aggiorna in tempo reale l'anteprima e il prezzo stimato mentre Marta aggiunge, rimuove o sostituisce componenti. Al termine, Marta ottiene una configurazione coerente e pronta per essere aggiunta al carrello.

### Scenario 2 - Richiesta di supporto durante la configurazione

Durante la composizione, Luca ha dubbi sul costo di alcuni componenti. Apre quindi il chatbot integrato e chiede un chiarimento. Il sistema restituisce una risposta contestuale sul prezzo attuale. Luca prosegue cosi' la configurazione senza abbandonare il flusso principale.

### Scenario 3 - Salvataggio e ripresa di una configurazione

Luca completa una prima bozza della propria scaffalatura ma non vuole acquistare subito. Dopo essersi autenticato, salva la configurazione nel proprio profilo. Nei giorni successivi torna sulla piattaforma, recupera la bozza salvata e la modifica confrontando nuove alternative prima di confermare l'acquisto.

### Scenario 4 - Notifica di variazione prezzo o disponibilita'

Una configurazione precedentemente salvata da Marta contiene un componente che subisce una variazione di prezzo o diventa temporaneamente indisponibile. KompozeR rileva l'evento e informa l'utente in tempo reale quando la configurazione e' attiva o al successivo accesso utile. Marta comprende subito quale elemento e' coinvolto e puo' decidere se attendere, sostituirlo oppure procedere con una variante.

### Scenario 5 - Aggiornamento del catalogo da parte dell'amministratore

Giulia accede all'area amministrativa per aggiornare disponibilita' e prezzo di alcuni componenti. Dopo la modifica, il sistema rende visibili i nuovi dati nel catalogo e li propaga ai moduli che dipendono da tali informazioni, incluse le notifiche relative alle configurazioni potenzialmente impattate. In questo modo l'allineamento tra catalogo, configurazioni e acquisti resta consistente.

### Scenario 6 - Monitoraggio ordini e analisi sintetica delle vendite

Un operatore amministrativo consulta il pannello gestionale per verificare gli ordini effettuati in un determinato periodo.  Successivamente accede alla sezione di reportistica per osservare trend di vendita utili a capire quali configurazioni o componenti risultano piu' richiesti.

## 4. Assunzioni esplicite

- Si assume che il progetto preveda almeno due macro-ruoli applicativi: cliente e amministratore.
- Si assume che il chatbot fornisca supporto informativo e orientativo, non consulenza tecnica vincolante o generazione autonoma completa della configurazione.
- Si assume che le notifiche real-time riguardino almeno variazioni di disponibilita' e prezzo dei componenti coinvolti nelle configurazioni attive o salvate.
- Si assume che la reportistica lato amministratore sia sintetica e orientata ai trend, non un sistema di business intelligence completo.

## 5. Come usare questo materiale nel capitolo requisiti

Da questi elementi si possono derivare nei prossimi passi:

1. user stories, partendo dagli obiettivi delle personas;
2. use case, partendo dagli scenari d'uso principali;
3. requisiti di business, funzionali e non funzionali, formalizzati con identificativi univoci e formulazione verificabile.
