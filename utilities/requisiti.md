# Requisiti KompozeR - base per la sezione di analisi

Questo documento raccoglie il materiale preliminare utile per costruire la sezione requisiti della relazione di ASW. In questa fase vengono definiti gli stakeholder principali, alcune personas rappresentative e i principali scenari d'uso. L'obiettivo e' derivare successivamente user stories, use case e requisiti di business, funzionali e non funzionali in modo coerente con un approccio User Centered Design.

Nel dominio di KompozeR il catalogo e' organizzato in tre categorie di prodotto, Tondo, Quuadro e Qube. Le tre categorie condividono finalita' simili ma non sono compatibili tra loro; questo vincolo di dominio deve quindi riflettersi nelle funzionalita' di consultazione del catalogo e di composizione della scaffalatura.

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

Marta accede a KompozeR con l'intenzione di arredare il proprio studio. Dopo aver selezionato la categoria di prodotto piu' adatta alle proprie esigenze tra quelle disponibili, inserisce alcune preferenze iniziali, come dimensioni desiderate o tipologia di struttura, e inizia a comporre la scaffalatura tramite il configuratore visuale. Il sistema limita i componenti selezionabili a quelli compatibili con la categoria scelta e aggiorna in tempo reale l'anteprima e il prezzo stimato mentre Marta aggiunge, rimuove o sostituisce componenti. Al termine, Marta ottiene una configurazione coerente e pronta per essere aggiunta al carrello.

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
- Si assume che il catalogo sia articolato nelle tre categorie di prodotto Tondo, Quuadro e Qube.
- Si assume che componenti appartenenti a categorie diverse non possano essere combinati all'interno della stessa configurazione.
- Si assume che il chatbot fornisca supporto informativo e orientativo, non consulenza tecnica vincolante o generazione autonoma completa della configurazione.
- Si assume che le notifiche real-time riguardino almeno variazioni di disponibilita' e prezzo dei componenti coinvolti nelle configurazioni attive o salvate.
- Si assume che la reportistica lato amministratore sia sintetica e orientata ai trend, non un sistema di business intelligence completo.

## 5. Come usare questo materiale nel capitolo requisiti

Da questi elementi si possono derivare nei prossimi passi:

1. user stories, partendo dagli obiettivi delle personas;
2. use case, partendo dagli scenari d'uso principali;
3. requisiti di business, funzionali e non funzionali, formalizzati con identificativi univoci e formulazione verificabile.

## 6. User stories derivate

Le seguenti user stories traducono personas e scenari in bisogni espressi dal punto di vista dell'utente. Sono formulate in modo da poter essere successivamente collegate sia ai casi d'uso sia ai requisiti formali.

| ID | User story |
| --- | --- |
| US1 | Come cliente finale, voglio configurare una scaffalatura tramite un'interazione visuale all'interno di una categoria di prodotto coerente, cosi' da comporre il prodotto in modo intuitivo e senza errori di compatibilita'. |
| US2 | Come cliente finale, voglio vedere l'anteprima e il prezzo aggiornati durante la configurazione, cosi' da valutare subito il risultato delle mie scelte. |
| US3 | Come cliente finale, voglio ricevere supporto contestuale dal chatbot sui prezzi dei componenti, cosi' da continuare la configurazione senza interrompere il flusso operativo. |
| US4 | Come utente autenticato, voglio salvare una configurazione, cosi' da poterla riprendere in un secondo momento. |
| US5 | Come utente autenticato, voglio modificare una configurazione salvata, cosi' da confrontare piu' alternative prima dell'acquisto. |
| US6 | Come utente autenticato, voglio essere informato se un componente della mia configurazione cambia prezzo o disponibilita', cosi' da poter decidere rapidamente come procedere. |
| US7 | Come amministratore del catalogo, voglio aggiornare prezzi e disponibilita' dei componenti, cosi' da mantenere allineato il catalogo con lo stato reale del magazzino. |
| US8 | Come amministratore, voglio consultare ordini e trend di vendita, cosi' da monitorare l'andamento operativo e commerciale del sistema. |

## 7. Use case principali

I casi d'uso descrivono in forma piu' strutturata le interazioni fondamentali tra attori e sistema. In questa fase sono volutamente sintetici ma gia' adatti a supportare la stesura della relazione.


### UC1 - Configurazione di una scaffalatura

- Attore principale: Cliente finale
- Precondizioni: il sistema dispone dei componenti necessari alla composizione; il configuratore e' disponibile
- Flusso principale:
	1. L'utente avvia il configuratore.
	2. L'utente seleziona o conferma la categoria di prodotto da configurare.
	3. Se necessario, inserisce preferenze iniziali o vincoli dimensionali.
	4. Il sistema rende disponibili solo i componenti compatibili con la categoria selezionata.
	5. L'utente aggiunge, rimuove o sostituisce componenti della scaffalatura.
	6. Il sistema impedisce la combinazione di componenti appartenenti a categorie diverse.
	7. Il sistema aggiorna dinamicamente anteprima e prezzo stimato.
	8. L'utente conferma la configurazione corrente.
- Postcondizioni: esiste una configurazione coerente, visualizzabile e pronta per i passaggi successivi.

### UC2 - Richiesta di assistenza contestuale

- Attore principale: Cliente finale
- Precondizioni: l'utente si trova in una fase di configurazione; il modulo chatbot e' disponibile
- Flusso principale:
	1. L'utente apre il chatbot integrato.
	2. L'utente formula una domanda sul costo di uno o piu' componenti.
	3. Il sistema elabora la richiesta e restituisce una risposta contestuale.
	4. L'utente prosegue la configurazione sulla base dell'informazione ricevuta.
- Postcondizioni: l'utente riceve supporto senza uscire dal configuratore.

### UC3 - Salvataggio e ripresa di una configurazione

- Attore principale: Utente autenticato
- Precondizioni: l'utente ha creato almeno una configurazione; l'utente e' autenticato oppure completa l'autenticazione durante il processo
- Flusso principale:
	1. L'utente richiede il salvataggio della configurazione corrente.
	2. Il sistema associa la configurazione al profilo utente.
	3. In una sessione successiva, l'utente accede alla lista delle configurazioni salvate.
	4. Il sistema mostra le configurazioni disponibili.
	5. L'utente seleziona una configurazione e la riapre per modificarla o completarla.
- Postcondizioni: la configurazione risulta persistita e riutilizzabile in sessioni future.

### UC4 - Notifica di variazione prezzo o disponibilita'

- Attore principale: Utente autenticato
- Attore secondario: Amministratore catalogo
- Precondizioni: esiste almeno una configurazione attiva o salvata; uno dei componenti associati subisce una variazione rilevante
- Flusso principale:
	1. L'amministratore aggiorna prezzo o disponibilita' di un componente.
	2. Il sistema individua le configurazioni impattate dalla modifica.
	3. Il sistema genera una notifica per gli utenti coinvolti.
	4. L'utente visualizza l'avviso e comprende quale componente e' stato modificato.
	5. L'utente decide se mantenere, modificare o rinviare la configurazione.
- Postcondizioni: l'utente e' informato delle variazioni che possono influenzare la sua configurazione.

### UC5 - Gestione amministrativa del catalogo

- Attore principale: Amministratore catalogo
- Precondizioni: l'amministratore e' autenticato nell'area gestionale
- Flusso principale:
	1. L'amministratore apre il pannello di gestione catalogo.
	2. Seleziona un componente o un insieme di componenti.
	3. Aggiorna prezzo, disponibilita' o altre informazioni rilevanti.
	4. Il sistema valida i dati inseriti.
	5. Il sistema salva le modifiche e aggiorna i moduli dipendenti.
- Postcondizioni: il catalogo risulta aggiornato e consistente con i dati amministrativi correnti.

### UC6 - Consultazione ordini e reportistica

- Attore principale: Amministratore
- Precondizioni: l'amministratore e' autenticato; il sistema dispone di dati su ordini e vendite
- Flusso principale:
	1. L'amministratore accede alla sezione ordini.
	2. Il sistema mostra gli ordini nel periodo selezionato.
	3. L'amministratore passa alla sezione reportistica.
	4. Il sistema presenta indicatori sintetici e trend di vendita.
- Postcondizioni: l'amministratore dispone di informazioni utili al monitoraggio operativo e commerciale.

## 8. Requisiti derivati

I requisiti seguenti rappresentano una prima formalizzazione del comportamento e degli obiettivi del sistema. Sono espressi in modo sintetico ma verificabile.

### 8.1 Requisiti di business

| ID | Requisito |
| --- | --- |
| BR1 | Il progetto deve supportare la vendita di scaffalature personalizzabili semplificando il processo di composizione rispetto a un catalogo tradizionale. |
| BR2 | Il sistema deve aumentare il valore percepito dell'e-commerce Kompo offrendo un configuratore visuale e servizi di assistenza digitale integrati. |
| BR3 | Il sistema deve ridurre il rischio di errori d'acquisto dovuti a scarsa comprensione di prezzi, disponibilita', compatibilita' tra componenti e stato della configurazione. |
| BR4 | Il sistema deve consentire all'azienda di mantenere allineati catalogo, configurazioni utente e informazioni operative. |
| BR5 | Il sistema deve fornire all'area amministrativa una vista sintetica utile al monitoraggio di ordini e trend di vendita. |

### 8.2 Requisiti funzionali

| ID | Requisito |
| --- | --- |
| FR1 | Il sistema deve fornire un configuratore visuale per la composizione della scaffalatura all'interno della categoria di prodotto selezionata. |
| FR2 | Il sistema deve aggiornare l'anteprima della scaffalatura in seguito alle modifiche effettuate nel configuratore. |
| FR3 | Il sistema deve aggiornare il prezzo stimato della configurazione in seguito alle modifiche effettuate nel configuratore. |
| FR4 | Il sistema deve consentire di aggiungere al carrello una configurazione completata. |
| FR5 | Il sistema deve fornire un chatbot integrato per rispondere a richieste contestuali sui prezzi dei componenti. |
| FR6 | Il sistema deve consentire agli utenti autenticati di salvare una configurazione associandola al proprio profilo. |
| FR7 | Il sistema deve consentire agli utenti autenticati di visualizzare e riprendere configurazioni salvate in precedenza. |
| FR8 | Il sistema deve notificare agli utenti autenticati variazioni di prezzo o disponibilita' che impattano configurazioni attive o salvate. |
| FR9 | Il sistema deve impedire la composizione di scaffalature che mescolano componenti appartenenti a categorie di prodotto diverse. |
| FR10 | Il sistema deve consentire agli amministratori di aggiornare dati di catalogo, inclusi prezzo e disponibilita' dei componenti. |
| FR11 | Il sistema deve rendere disponibili agli amministratori una vista ordini e una sezione di reportistica sintetica sui trend di vendita. |

### 8.3 Requisiti non funzionali

| ID | Categoria | Requisito |
| --- | --- | --- |
| NFR1 | Usabilita' | L'interfaccia del configuratore deve permettere a un utente con competenze digitali medie di comprendere le azioni principali senza formazione preventiva. |
| NFR2 | Usabilita' | Il sistema deve mostrare feedback immediato a seguito delle azioni rilevanti dell'utente, in particolare durante configurazione, salvataggio e aggiornamento prezzo. |
| NFR3 | Accessibilita' | Le principali funzionalita' del sistema devono essere progettate in modo coerente con i principi base di accessibilita' web e con l'uso corretto di elementi semantici. |
| NFR4 | Responsive design | L'interfaccia deve risultare fruibile sia da dispositivi desktop sia da dispositivi mobili, preservando l'accesso alle funzionalita' essenziali. |
| NFR5 | Performance | L'aggiornamento di anteprima e prezzo nel configuratore deve essere percepito dall'utente come tempestivo durante l'interazione. |
| NFR6 | Affidabilita' real-time | Le notifiche di variazione prezzo o disponibilita' devono essere recapitate in modo consistente agli utenti interessati quando il contesto applicativo lo consente. |
| NFR7 | Sicurezza | Le funzionalita' amministrative devono essere accessibili solo ad utenti autenticati con ruolo autorizzato. |
| NFR8 | Privacy | Il sistema deve memorizzare soltanto i dati necessari alla gestione di account, configurazioni salvate e operazioni applicative previste. |
| NFR9 | Manutenibilita' | Il sistema deve mantenere separati i moduli relativi a configurazione, gestione catalogo, notifiche e reportistica in modo da facilitare evoluzione e manutenzione. |
| NFR10 | Sostenibilita' | Il sistema deve evitare funzionalita' superflue e privilegiare interazioni essenziali, riducendo complessita', traffico e carico computazionale non necessario. |

## 9. Tracciabilita' sintetica

Per mantenere coerenza nella relazione, si puo' leggere il materiale in questa sequenza:

- stakeholder e personas per identificare bisogni e obiettivi;
- scenari d'uso per contestualizzare le interazioni;
- user stories per esprimere il valore atteso dal punto di vista degli utenti;
- use case per strutturare i flussi principali del sistema;
- requisiti formali per definire cosa il sistema deve fare e con quali vincoli qualitativi.

Questa struttura permette di giustificare ogni requisito mostrando da quale esigenza utente o amministrativa deriva.
