## Capitolo 5 — Stack MEAN e Sue Varianti

### 5.1 Limiti dello Stack LAMP e della Programmazione PHP

Per comprendere la ragion d'essere dello stack MEAN, è utile esaminare criticamente i limiti dello stack tradizionale LAMP con PHP:

- **Performance del server**: Apache HTTP Server non è il web server più performante disponibile, soprattutto per applicazioni ad alta concorrenza.
- **Difficoltà di riuso del codice PHP**: scrivere PHP ben strutturato e riusabile è difficile; il linguaggio incoraggia pattern che mescolano presentazione e logica.
- **Frammentazione dei linguaggi**: lo sviluppatore web LAMP utilizza PHP (backend), SQL (database), JavaScript (frontend) — tre linguaggi diversi, con conseguente aumento della complessità cognitiva.
- **Molte conversioni di dati**: i dati viaggiano attraverso conversioni ripetute: XML/JSON → PHP → HTML, con potenziale perdita di struttura e overhead computazionale.
- **Scarsa separazione client/server**: le applicazioni LAMP tradizionali tendono a mescolare la generazione del contenuto con la logica di presentazione, rendendo difficile la separazione delle responsabilità.

Le applicazioni web moderne richiedono caratteristiche che LAMP gestisce con difficoltà:

- **Velocità e scalabilità**: gestione di migliaia di richieste concorrenti.
- **Nessun reload di pagina**: esperienza utente fluida alla maniera delle applicazioni native.
- **Richieste concorrenti**: elaborazione parallela di più operazioni.
- **Caricamento condizionale**: caricamento di risorse solo quando necessario.
- **Interfaccia mobile/responsive**: adattamento a diversi dispositivi e risoluzioni.

### 5.2 Lo Stack MEAN

Lo stack **MEAN** (*MongoDB + Express.js + Angular + Node.js*) nasce per rispondere alle esigenze delle applicazioni web moderne. Le sue caratteristiche distintive sono:

- **100% open source**: nessuna licenza commerciale richiesta.
- **100% JavaScript + JSON + HTML**: un unico linguaggio di programmazione per tutta la stack, sia lato client che lato server. Questo paradigma è noto come *"JavaScript Everywhere"*.
- **100% standard web**: basato esclusivamente su tecnologie web standard.
- **Multipiattaforma**: funziona su Linux, Windows, macOS senza configurazioni specifiche per il sistema operativo.
- **Modello dati consistente**: i dati sono rappresentati in formato JSON dall'interfaccia utente al database, senza conversioni intermedie.
- **Basso overhead di memoria**: Node.js gestisce molte connessioni concorrenti con un singolo thread, riducendo il consumo di risorse.
- **Sviluppo iniziabile dal frontend**: la natura JavaScript-first consente ai team di iniziare lo sviluppo dall'interfaccia utente, senza dover configurare immediatamente il backend.

#### 5.2.1 Varianti dello Stack MEAN

- **MEVN**: MongoDB + Express.js + **Vue.js** + Node.js — variante studiata in questo corso, preferita per la minore curva di apprendimento di Vue.js rispetto ad Angular.
- **MERN**: MongoDB + Express.js + **React** + Node.js — variante adottata da molte aziende che usano React (Facebook, Instagram, Airbnb).

### 5.3 Node.js

#### 5.3.1 Definizione e Caratteristiche

**Node.js** non è un linguaggio di programmazione, né un web server nel senso tradizionale. È una **piattaforma software cross-platform** (*runtime*) che consente di eseguire JavaScript lato server, al di fuori del browser.

Node.js si basa sul motore JavaScript **V8** di Google Chrome — lo stesso motore che esegue JavaScript nel browser Chrome. Questa scelta garantisce prestazioni elevate e conformità agli standard ECMAScript più recenti.

Le caratteristiche fondamentali di Node.js sono:

- **Single-threaded**: opera con un singolo thread principale, evitando la complessità del multithreading e i problemi di race condition.
- **Event-driven**: il flusso di controllo è guidato dagli eventi, non dalla sequenza lineare delle istruzioni.
- **Asincrono e non-bloccante**: le operazioni I/O (lettura di file, query al database, richieste HTTP) non bloccano il thread principale; quando completano, notificano il sistema tramite callback.
- **Connessioni bidirezionali**: abilita connessioni in tempo reale in cui sia il client che il server possono iniziare la comunicazione (importante per WebSocket, chat, giochi multiplayer).

#### 5.3.2 Modello Thread-Based Tradizionale vs Modello Event-Driven

**Modello Thread-Based (tradizionale — es. Apache):**

Nel modello basato su thread, ogni richiesta HTTP viene assegnata a un *worker thread* dedicato da un *dispatcher*. Il thread rimane occupato per tutta la durata della gestione della richiesta:

```
Richiesta 1 → Thread 1 (attende I/O) → libero
Richiesta 2 → Thread 2 (attende I/O) → libero
Richiesta N → Thread N (attende I/O) → libero
```

**Problema**: con N richieste concorrenti occorrono N thread. Il sistema operativo deve gestire N context switch, con overhead crescente. Il numero di thread è limitato dalla memoria disponibile, rendendo questo modello poco scalabile con l'aumentare delle connessioni.

**Modello Event-Driven (Node.js):**

Node.js utilizza un **event loop** (loop di eventi) in esecuzione su un singolo thread:

```
Richiesta 1 → Evento → Event Queue
Richiesta 2 → Evento → Event Queue
Richiesta N → Evento → Event Queue
                    ↓
              Event Loop (singolo thread)
              ↓                   ↓
    [Elabora evento 1]  [Avvia I/O asincrono]
              ↓
    [Evento completato → callback]
```

Il thread principale non si blocca mai: quando avvia un'operazione I/O (es. lettura da database), registra una callback e passa immediatamente a elaborare altri eventi. Quando l'operazione I/O completa, l'evento corrispondente viene inserito nella coda e il loop lo elabora al prossimo turno.

**Attenzione critica**: poiché c'è un solo thread, un'operazione che blocca il thread (come una funzione `sleep()` sincrona, o un calcolo CPU-intensivo) **blocca tutti i client**. La programmazione con Node.js richiede una gestione attenta dell'asincronicità.

#### 5.3.3 DIRT Applications

Node.js è particolarmente adatto per le **DIRT Applications** (*Data-Intensive Real-Time Applications*): applicazioni che gestiscono grandi volumi di dati e richiedono comunicazione in tempo reale. Esempi:

- Servizi di streaming video/audio
- Giochi online multiplayer
- Applicazioni di chat
- Sistemi di monitoraggio IoT
- Dashboard in tempo reale

Node.js **non** è adatto per applicazioni CPU-intensive (es. elaborazione di immagini, calcoli matematici complessi, machine learning), perché il lungo calcolo bloccherebbe il thread unico.

#### 5.3.4 Esempio: Hello World con Node.js

```javascript
var http = require('http');

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World!');
}).listen(8080);

console.log('Server in ascolto sulla porta 8080');
```

Questo semplice esempio crea un web server HTTP che risponde con "Hello World!" a qualsiasi richiesta sulla porta 8080. Il modulo `http` è incluso nel core di Node.js e non richiede installazione aggiuntiva.

### 5.4 NPM — Node Package Manager

**NPM** (*Node Package Manager*) è il gestore di pacchetti per Node.js, nonché il più grande ecosistema di librerie open source al mondo. NPM consente di installare, aggiornare, rimuovere e pubblicare pacchetti JavaScript.

I comandi principali di NPM sono:

```bash
npm install <pacchetto>          # installa un pacchetto
npm install <pacchetto> --save   # installa e aggiunge a package.json (dipendenza)
npm install <pacchetto> -g       # installa globalmente
npm update                       # aggiorna tutti i pacchetti
npm list                         # elenca i pacchetti installati
npm uninstall <pacchetto>        # rimuove un pacchetto
npm publish                      # pubblica un pacchetto nel registry NPM
```

Il file `package.json` è il manifesto del progetto Node.js: descrive il nome del progetto, la versione, l'autore, le dipendenze (pacchetti necessari all'esecuzione) e le devDependencies (pacchetti necessari solo allo sviluppo).

### 5.5 NGINX come Reverse Proxy

In produzione, Node.js viene tipicamente affiancato da **NGINX**, un web server ad alte performance che funge da *reverse proxy*. I vantaggi di questa configurazione includono:

- **Gestione dei privilegi**: NGINX gira sulla porta 80/443 (richiede privilegi di root); Node.js gira su una porta alta (es. 3000) senza privilegi.
- **Serving dei file statici**: NGINX serve efficientemente file statici (immagini, CSS, JS) senza coinvolgere Node.js.
- **Caching statico**: NGINX può cachare le risposte di Node.js, riducendo il carico.
- **Anonimizzazione**: NGINX nasconde l'identità del server Node.js ai client.
- **Gestione dei crash**: NGINX può riavviare automaticamente Node.js in caso di errori.
- **Mitigazione DoS**: NGINX può limitare la frequenza delle richieste per mitigare attacchi.
- **Load balancing**: NGINX distribuisce le richieste tra più istanze di Node.js.

### 5.6 Express.js

**Express.js** è un framework web minimalista e flessibile per Node.js, progettato per semplificare lo sviluppo di applicazioni web e API REST. Express non impone una struttura rigida: il suo design minimal permette di aggiungere esattamente le funzionalità necessarie attraverso *middleware*.

Le funzionalità principali di Express.js sono:

- **Middleware**: funzioni che elaborano le richieste HTTP in sequenza prima di raggiungere il handler finale. Ogni middleware può leggere/modificare l'oggetto request/response, terminare la catena, o passare al middleware successivo.
- **Routing**: definizione di handler per percorsi URL specifici e metodi HTTP specifici (GET, POST, PUT, DELETE, PATCH).
- **Template engine**: supporto per motori di template (EJS, Pug, Handlebars) per la generazione di HTML dinamico lato server.
- **REST API**: facilita l'implementazione di API RESTful per il consumo da parte di client SPA.

```javascript
// Esempio Express.js: routing con metodi HTTP
const express = require('express');
const app = express();

app.get('/utenti', (req, res) => {
  res.json({ utenti: [] }); // risponde con JSON
});

app.post('/utenti', (req, res) => {
  // crea nuovo utente
  res.status(201).json({ messaggio: 'Utente creato' });
});

app.listen(3000);
```

### 5.7 MongoDB

**MongoDB** è un database NoSQL orientato ai documenti. A differenza dei database relazionali, MongoDB non utilizza tabelle e righe, ma **collezioni** di **documenti** in formato BSON (Binary JSON — superset di JSON).

Caratteristiche principali:

- **Schema flessibile (schema-less)**: i documenti nella stessa collezione possono avere strutture diverse. Non è necessario definire uno schema rigido in anticipo.
- **Scalabilità orizzontale**: MongoDB supporta nativamente la distribuzione dei dati su più server (*sharding*).
- **Cross-platform**: disponibile su Linux, Windows, macOS.
- **Integrazione con JavaScript**: il formato BSON/JSON è nativamente compatibile con JavaScript, eliminando le conversioni tra oggetti JS e righe di database.

### 5.8 Stack Aziendali

Le grandi aziende raramente adottano stack standardizzati "puri": personalizzano la combinazione di tecnologie in base alle proprie esigenze. Ad esempio:

- **Uber**: NGINX + Apache + MySQL + PostgreSQL + MongoDB + Node.js + Python + Java
- **Reddit**: NGINX + PostgreSQL + Redis + Cassandra + Node.js

Questo fenomeno dimostra che le etichette come "MEAN" o "LAMP" descrivono configurazioni ideali, non prescrittive: ogni azienda adatta lo stack alle proprie necessità operative.

---

## Capitolo 6 — Metodologie di Design per le Web User Interface

### 6.1 Il Problema del Design: Norman e la Caffettiera del Masochista

Il punto di partenza concettuale di questo capitolo è l'opera di **Donald Norman**, in particolare il libro *"La Caffettiera del Masochista"* (*The Design of Everyday Things*). La tesi centrale di Norman è che quando un utente non riesce a usare un oggetto o un'interfaccia, il problema non è nell'utente ma nel **design**: un design mal progettato mette l'utente in condizione di sbagliare, scaricando su di lui la responsabilità di errori che sono invece del progettista.

Questa visione rivoluzionò l'approccio alla progettazione delle interfacce: il design deve tenere conto dei **modelli mentali** degli utenti, dei vincoli fisici e cognitivi, e deve rendere le operazioni corrette ovvie e quelle errate difficili o impossibili.

### 6.2 HCI — Human-Computer Interaction

**HCI** (*Human-Computer Interaction*) è una disciplina interdisciplinare che studia le modalità di interazione tra esseri umani e sistemi informatici, con l'obiettivo di progettare sistemi usabili, affidabili e che supportino efficacemente le attività umane.

L'HCI è intrinsecamente multidisciplinare: attinge da informatica, psicologia cognitiva, ergonomia, scienze sociali, design grafico e comunicazione. Il suo campo di studio comprende:

- **Interfaccia**: componente software che consente all'utente di comunicare con l'applicazione (non solo la GUI, ma qualsiasi punto di contatto — si pensi alla maniglia di una porta come "interfaccia" di un edificio).
- **Interazione**: la relazione dinamica tra utente e sistema — include le azioni che l'utente compie e il feedback che il sistema fornisce in risposta.

### 6.3 Evoluzione del Ruolo dell'Utente

Il ruolo dell'utente nel processo di progettazione si è evoluto profondamente nel corso dei decenni:

- **Ruolo tradizionale**: l'utente veniva coinvolto solo nella fase di *testing*, a prodotto ultimato, per verificare che il sistema funzionasse correttamente.
- **Ruolo moderno**: l'utente è coinvolto in modo crescente nelle fasi precedenti, fino alla co-progettazione dell'interfaccia e alla definizione dei requisiti.

### 6.4 User Centered Design (UCD)

Il **User Centered Design** (UCD) è un approccio metodologico allo sviluppo di sistemi interattivi che pone i bisogni, i desideri e le limitazioni degli utenti finali al centro di ogni fase del processo di design e sviluppo.

Il processo UCD è **iterativo**: le fasi di analisi dei requisiti, design, prototipazione e valutazione si ripetono ciclicamente fino al raggiungimento di un risultato soddisfacente. Una caratteristica importante è che il processo UCD non richiede necessariamente il coinvolgimento diretto di utenti reali in tutte le fasi: gli utenti possono essere "virtualizzati" attraverso strumenti come le **Personas** (vedi sezione 6.7).

Le caratteristiche degli utenti che il progettista deve considerare includono:
- **Competenza**: livello di expertise con il dominio applicativo e con la tecnologia.
- **Abilità fisiche**: capacità motorie, visive, uditive.
- **Livello di attenzione**: durata e intensità dell'attenzione disponibile.
- **Motivazioni**: obiettivi e aspirazioni che guidano l'interazione con il sistema.

### 6.5 Participatory Design (PD)

Il **Participatory Design** (PD), noto anche come *Co-design*, è un approccio più inclusivo dell'UCD: gli utenti target sono **fisicamente coinvolti in tutte le fasi** del processo, inclusa la fase di progettazione. In alcuni casi, gli utenti diventano veri e propri *co-designer* — non semplici soggetti di studio, ma partecipanti attivi alle decisioni progettuali.

Il PD è particolarmente indicato quando:
- Gli utenti hanno conoscenze di dominio che i progettisti non possiedono.
- È necessario garantire l'accettazione del sistema da parte degli utenti.
- Il sistema riguarda aspetti sensibili della vita degli utenti (salute, lavoro, assistenza).

### 6.6 Co-creation e Open Innovation

**Co-creation**: approccio in cui gli utenti target guidano direttamente la definizione dei requisiti e degli obiettivi del sistema, andando oltre il semplice feedback.

**Open Innovation**: modello di innovazione basato sulla collaborazione attiva tra organizzazioni diverse (aziende, università, utenti, fornitori), con condivisione della proprietà intellettuale generata. Contrasta con il modello tradizionale di innovazione "chiusa", in cui la R&D avviene esclusivamente all'interno dell'organizzazione.

### 6.7 Personas

Le **Personas** sono descrizioni fittizie di utenti che incarnano le caratteristiche di una classe di utenti reali. Sono strumenti fondamentali dell'UCD per rappresentare concretamente il pubblico di destinazione senza dover coinvolgere utenti reali in ogni fase.

Una Persona ben costruita è un **archetipo** che sintetizza:
- **Intenzioni e obiettivi**: cosa vuole ottenere dall'interazione con il sistema.
- **Abitudini e comportamenti**: come si comporta tipicamente quando usa sistemi simili.
- **Profilo narrativo**: nome, età, professione, situazione familiare, contesto di vita. Questi elementi rendono la Persona "reale" nella mente del team di progettazione.

**Criteri per una buona Persona:**

La Persona deve rappresentare una **classe di utenti**, non un individuo specifico. Esistono diversi errori comuni da evitare:

- **"Utente elastico"**: Persona troppo generica, che cerca di rappresentare tutti gli utenti — inutile perché non guida le decisioni di design.
- **"Utente anarchico"**: Persona con caratteristiche così particolari da non rappresentare nessun gruppo reale.
- **"Caso sociale"**: Persona con problematiche talmente specifiche da non essere rappresentativa.
- **"Utente autoreferenziale"**: Persona che rispecchia le caratteristiche del progettista stesso, portando a un design che soddisfa il progettista ma non gli utenti reali.

Una buona Persona è **interessante** (ha una personalità distintiva), **tipica** (rappresenta un gruppo reale), ma **non "media"** (non è il mediocre minimo comune denominatore del gruppo).

### 6.8 Scenari d'Uso

Gli **scenari d'uso** sono narrazioni che descrivono in dettaglio come una Persona raggiunge un obiettivo eseguendo una serie di operazioni sul sistema. Ogni scenario:

- Descrive l'**interazione**, non i comandi dell'interfaccia.
- È molto **specifico**: una singola situazione, un singolo obiettivo.
- Descrive un'**azione completa**: dall'inizio alla fine del task.
- Riguarda sempre una Persona (non un utente generico).

Gli scenari d'uso sono strumenti narrativi potenti perché permettono al team di visualizzare concretamente come il sistema sarà utilizzato, identificando potenziali problemi prima di iniziare lo sviluppo.

### 6.9 Storyboard

Lo **storyboard** è una sequenza di immagini (disegni o mockup) che mostra gli stati successivi dello schermo durante l'esecuzione di un task da parte di una Persona. Ogni fotogramma illustra lo stato dell'interfaccia in un momento specifico, con eventuale indicazione degli elementi attivati (click, gesture, input).

Gli storyboard possono essere:
- **Disegni a mano libera**: rapidi ed economici, adatti alle prime fasi di ideazione.
- **Mockup digitali**: realizzati con strumenti specializzati come Balsamiq, Figma, Pencil o Mockup.io.

#### Strumenti di Prototipazione

- **Figma**: editor vettoriale web-based con funzionalità di prototipazione interattiva. Permette di creare design ad alta fedeltà e prototipi cliccabili, con collaborazione in tempo reale.
- **Balsamiq**: strumento specializzato nella creazione rapida di wireframe a bassa fedeltà. Creato da Giacomo "Peldi" Guilizzoni, laureato all'Università di Bologna.
- **Pencil**: strumento open source per mockup e wireframe.
- **Mockup.io**: piattaforma web per la creazione di wireframe collaborativi.

### 6.10 Focus Group

Il **focus group** è una tecnica di ricerca qualitativa basata sulla discussione di gruppo moderata. Nel contesto della progettazione di interfacce, è utilizzato sia nella fase di **analisi dei requisiti** che nella fase di **valutazione del design**.

**Caratteristiche operative:**
- **Composizione**: gruppi di 8-12 partecipanti.
- **Durata**: sessioni di 1,5-2 ore.
- **Ruoli**: un *moderatore* (guida la discussione) e un *co-moderatore* (prende note e gestisce la registrazione).

**Fasi di un focus group:**

1. **Preparazione**: selezione dei partecipanti, preparazione della scaletta di discussione, allestimento dell'ambiente.
2. **Conduzione**: la sessione viene registrata (audio/video), il moderatore garantisce che tutti i partecipanti contribuiscano equamente.
3. **Analisi e report**: i dati raccolti vengono analizzati e sintetizzati in un report con le principali evidenze.

### 6.11 Experience Prototyping

L'**experience prototyping** è una tecnica di valutazione che immerge completamente gli utenti nell'esperienza di utilizzo del sistema attraverso prototipi di varia fedeltà (storyboard, mockup interattivi, versioni beta dell'applicazione).

**Caratteristiche operative:**
- Coinvolge **un utente alla volta** (non gruppi).
- Ogni sessione prevede tipicamente **3-4 task** da completare.
- L'utente indica come interagirebbe con il prototipo.
- Il conduttore osserva e raccoglie feedback, simulando realisticamente le risposte del sistema.

Questa tecnica è particolarmente efficace per osservare il comportamento degli utenti **prima** dello sviluppo completo, ed è ampiamente utilizzata nei contesti Agile e nello sviluppo di applicazioni mobile.

### 6.12 Think Aloud Protocol

Il **Think Aloud Protocol** (protocollo del pensiero ad alta voce), sviluppato da **Clayton Lewis**, è una tecnica di valutazione dell'usabilità in cui i partecipanti verbalizzano tutti i loro pensieri, dubbi e ragionamenti mentre completano i task assegnati.

**Procedura:**
- Il partecipante svolge il task pensando ad alta voce ("ora clicco qui perché mi aspetto che...").
- L'osservatore prende note **senza interpretare** e **senza interferire** con l'utente (non risponde alle domande dell'utente durante il task).
- La sessione viene registrata in audio/video.

**Variante Co-discovery Learning:**

In questa variante, coppie di utenti lavorano insieme al task, discutendo tra loro. Questo produce un feedback più naturale e ricco, poiché la discussione tra i due utenti esplicita ragionamenti che altrimenti rimarrebbero impliciti. Questa variante richiede un minimo di **6 partecipanti** (3 coppie).

**Dati raccolti:**
- **Quantitativi**: tempo per completare ogni task, numero di task completati, frequenza degli errori, numero di richieste di aiuto.
- **Qualitativi**: successo/fallimento per task, qualità percepita dei componenti, sforzo cognitivo richiesto.

---

## Capitolo 7 — HCI: Metodologie di Sviluppo e Testing

### 7.1 Evoluzione dell'HCI

La disciplina dell'HCI ha attraversato diverse fasi evolutive che riflettono l'evoluzione del rapporto tra esseri umani e macchine:

- **Human Performance (XX secolo)**: influenzata dal Taylorismo, vede l'essere umano come una componente della catena produttiva, alla stregua di una macchina da ottimizzare.
- **Ergonomia (UK, WWII)**: nasce dall'esigenza bellica di adattare le macchine alle capacità fisiche degli operatori umani. Si focalizza sull'adattamento fisico uomo-macchina.
- **Human Factors (USA, anni '60)**: estende l'ergonomia includendo i fattori psicologici e fisiologici. Gli obiettivi sono: limitare gli errori, aumentare la produttività, migliorare la sicurezza e il comfort.
- **Ergonomia Cognitiva**: intersezione tra ergonomia e scienze cognitive. Studia i modelli mentali degli utenti e come questi influenzano l'interazione con i sistemi.
- **Interazione Uomo-Macchina (anni '80)**: focus sulla progettazione di software e hardware in modo integrato. Introduce il concetto di *"user friendliness"*.
- **Interaction Design (IXD)**: approccio multidisciplinare che mira a massimizzare la capacità degli esseri umani di utilizzare dispositivi e servizi. Supera il concetto di interfaccia grafica per abbracciare tutte le forme di interazione.
- **User eXperience (UX)**: concetto più ampio che comprende tutti gli aspetti dell'esperienza dell'utente con un prodotto o servizio — interazione, utilità percepita, facilità d'uso, efficienza, emozioni.

### 7.2 User Experience (UX)

La **User Experience** (UX) è un concetto multidimensionale e soggettivo che descrive la relazione complessiva tra una persona e un sistema, prodotto o servizio. Diverse definizioni autorevoli:

- **ISO 9241-210**: "percezioni e risposte soggettive di una persona che risultano dall'uso o dall'uso anticipato di un prodotto, sistema o servizio."
- **Nielsen & Norman**: "tutti gli aspetti dell'interazione dell'utente finale con l'azienda, i suoi servizi e i suoi prodotti."
- **Hassenzahl & Tractinsky**: combinazione di tre elementi: lo stato interno dell'utente (aspettative, bisogni, emozioni), le caratteristiche del sistema (complessità, scopo, usabilità) e il contesto d'uso (ambiente fisico, temporale, sociale).

**UX vs Usabilità vs UI:**

- **UX** è il concetto più ampio: comprende tutte le esperienze che un utente ha con un prodotto, incluse quelle che avvengono prima e dopo l'uso diretto.
- **Usabilità** è una dimensione della UX: si riferisce all'efficacia, efficienza e soddisfazione con cui utenti specifici raggiungono obiettivi specifici in contesti specifici.
- **UI** (*User Interface*) è la componente visiva e interattiva del prodotto: è parte della UX ma non la esaurisce.

### 7.3 Usabilità

#### 7.3.1 Definizioni

L'usabilità è definita in modo diverso da diversi standard e autori:

- **Wikipedia**: la misura in cui un artefatto umano può essere usato da specifici utenti per raggiungere specifici obiettivi con efficacia, efficienza e soddisfazione.
- **ISO 9241-11**: "il grado in cui un prodotto può essere usato da specifici utenti per raggiungere specifici obiettivi con efficacia, efficienza e soddisfazione in uno specifico contesto d'uso."
- **Jakob Nielsen** (5 attributi dell'usabilità):
  1. **Learnability** (apprendibilità): facilità di imparare a usare il sistema per la prima volta.
  2. **Efficiency** (efficienza): velocità di esecuzione dei task da parte di utenti esperti.
  3. **Memorability** (memorabilità): facilità di ricordare come si usa il sistema dopo un periodo di non utilizzo.
  4. **Errors** (errori): frequenza e gravità degli errori commessi dagli utenti.
  5. **Satisfaction** (soddisfazione): piacevolezza soggettiva dell'uso.

#### 7.3.2 Normativa Europea

La **Direttiva EU 90/270/EEC** del 1990 stabilisce che il software deve essere:
- Adatto ai task che deve supportare.
- Facile da usare.
- Adattabile al livello di conoscenza dell'operatore.
- In grado di fornire feedback comprensibile.
- Conforme ai principi dell'ergonomia.

### 7.4 Principi di Design

#### 7.4.1 Responsive Design

Il **Responsive Design** è un approccio progettuale che crea interfacce fluide capaci di adattarsi a qualsiasi dimensione di schermo e dispositivo. Si realizza attraverso:

- **Layout liquido**: dimensioni espresse in percentuale invece che in pixel fissi.
- **Immagini flessibili**: immagini che si ridimensionano all'interno del loro contenitore.
- **CSS3 Media Queries**: regole CSS che applicano stili diversi in base alle caratteristiche del dispositivo (larghezza, orientamento, risoluzione, ecc.).

Il Responsive Design migliora sia la UX (l'interfaccia funziona bene su tutti i dispositivi) che l'accessibilità (utenti con diversi dispositivi possono accedere ai contenuti).

#### 7.4.2 Mobile First

L'approccio **Mobile First**, introdotto da Luke Wroblewski, inverte la logica tradizionale di progettazione: invece di progettare per desktop e poi adattare per mobile, si progetta **prima per il dispositivo più vincolato** (mobile) e si scala poi verso le interfacce più ampie (tablet, desktop).

I vantaggi di questo approccio sono:
- Costringe a focalizzarsi sull'essenziale (il mobile ha spazio limitato).
- Le app mobile-first funzionano generalmente meglio anche su desktop.
- Il mobile è il dispositivo di accesso primario per la maggior parte degli utenti mondiali.

Mobile First è correlato ai principi di **Progressive Enhancement** (partire da una base funzionale e aggiungere progressivamente miglioramenti) e **Unobtrusive JavaScript** (JavaScript che non interferisce con l'esperienza di base).

#### 7.4.3 KISS

**KISS** (*Keep It Simple, Stupid*) è un principio di design formulato negli anni '60 dalla US Navy: la semplicità deve essere l'obiettivo primario di qualsiasi progetto, e la complessità non necessaria deve essere evitata.

Applicato alla progettazione di interfacce web, KISS implica: ridurre il numero di opzioni presentate all'utente, eliminare funzionalità non essenziali, usare linguaggio chiaro e diretto.

#### 7.4.4 Less is More

**Less is More** è un principio importato dall'architettura minimalista (Mies van der Rohe) e applicato al design di interfacce da Jakob Nielsen. Il principio afferma che eliminare tutti gli elementi non essenziali migliora l'esperienza complessiva.

L'applicazione pratica richiede un'analisi sistematica di ogni elemento dell'interfaccia: se un elemento non ha una funzione essenziale, va rimosso. Meno elementi significano: meno distrazione cognitiva, tempi di caricamento ridotti, maggiore chiarezza.

#### 7.4.5 Standard UI Elements

Colori, icone ed elementi di interazione devono seguire le **convenzioni stabilite** e rispettare i modelli mentali degli utenti. Un pulsante di chiusura deve avere una "X"; le notifiche di errore devono essere rosse; i link devono essere distinti dal testo normale. La violazione di queste convenzioni crea confusione e aumenta il carico cognitivo.

### 7.5 Metodologie di Testing dell'Usabilità

#### 7.5.1 Valutazione Euristica (Heuristic Evaluation)

La **valutazione euristica** è una tecnica di ispezione dell'usabilità proposta da **Jakob Nielsen nel 1993**. Esperti di usabilità valutano l'interfaccia rispetto a un insieme di principi (euristiche) riconosciuti. Non richiede utenti reali — è una valutazione *expert-based*.

Le **10 euristiche di Nielsen** sono:

1. **Visibilità dello stato del sistema**: il sistema deve sempre informare l'utente su cosa sta accadendo, con feedback tempestivi e appropriati.
2. **Corrispondenza tra sistema e mondo reale**: il sistema deve parlare il linguaggio dell'utente, usando parole, frasi e concetti familiari. Le informazioni devono apparire in ordine naturale e logico.
3. **Controllo e libertà dell'utente**: gli utenti commettono errori e hanno bisogno di "uscite di emergenza" chiaramente marcate per lasciare stati indesiderati senza dover ripercorrere percorsi lunghi.
4. **Consistenza e standard**: gli utenti non devono chiedersi se parole, situazioni o azioni diverse significhino la stessa cosa. Seguire le convenzioni della piattaforma.
5. **Prevenzione degli errori**: ancora meglio di un buon messaggio d'errore è un design attento che previene i problemi in primo luogo.
6. **Riconoscimento piuttosto che ricordo**: minimizzare il carico di memoria dell'utente rendendo visibili oggetti, azioni e opzioni. Le istruzioni per l'uso del sistema devono essere visibili o facilmente recuperabili quando necessario.
7. **Flessibilità ed efficienza d'uso**: acceleratori — non visibili ai nuovi utenti — possono velocizzare l'interazione per gli utenti esperti. Permettere agli utenti di personalizzare le azioni frequenti.
8. **Estetica e design minimalista**: i dialoghi non devono contenere informazioni irrilevanti o raramente necessarie. Ogni unità di informazione aggiuntiva compete con le informazioni rilevanti e ne diminuisce la visibilità relativa.
9. **Aiutare gli utenti a riconoscere, diagnosticare e correggere gli errori**: i messaggi d'errore devono essere espressi in linguaggio semplice (non codice), indicare precisamente il problema e suggerire una soluzione.
10. **Aiuto e documentazione**: sebbene sia preferibile che il sistema possa essere usato senza documentazione, può essere necessario fornire aiuto e documentazione. Tale materiale deve essere facile da cercare, focalizzato sul task dell'utente, e non troppo lungo.

**Caratteristiche della valutazione euristica:**
- Eseguita da esperti (non utenti reali): tipicamente 3-5 valutatori.
- Rapida ed economica.
- I risultati dipendono dall'expertise dei valutatori.
- Normalmente eseguita **prima** dei test con utenti, per rimuovere i problemi più evidenti.

#### 7.5.2 Cognitive Walkthrough

Il **Cognitive Walkthrough** è un metodo ispettivo per identificare problemi di usabilità relativi all'apprendibilità: si concentra sulla facilità con cui un nuovo utente (senza conoscenza pregressa del sistema) riesce a completare i task attraverso l'esplorazione.

**Procedura**: un team di esperti simula il percorso di un utente attraverso una sequenza di azioni necessarie per completare un task. Per ogni azione, si pongono quattro domande:
1. L'utente capirà cosa deve fare in questo step?
2. L'utente noterà che l'azione corretta è disponibile?
3. L'utente capirà che eseguire quell'azione porterà al completamento del sub-task?
4. L'utente riceverà un feedback appropriato dopo aver completato l'azione?

#### 7.5.3 Test di Usabilità

Il **test di usabilità** è la metodologia di riferimento per la valutazione empirica dell'usabilità: si osservano utenti reali in un ambiente controllato mentre svolgono task predefiniti.

**Configurazione tipica:**
- **Utenti reali** (non esperti né sviluppatori del sistema).
- **Ambiente controllato** (laboratorio di usabilità, con possibilità di registrazione video e osservazione unidirezionale).
- **Task predefiniti**: scenari d'uso realisti che gli utenti devono completare.
- **Strumenti aggiuntivi**: prototipi cartacei, questionari, think aloud, eye-tracking.

**Quanti utenti servono?**

Jakob Nielsen ha dimostrato empiricamente che **5 utenti** sono sufficienti a identificare circa l'85% dei problemi di usabilità. La formula è:

$$N = 1 - (1 - L)^n$$

dove $N$ è la proporzione di problemi trovati, $L$ è la probabilità che un singolo utente trovi un singolo problema (tipicamente $L = 0.31$), e $n$ è il numero di utenti.

Con 5 utenti: $N = 1 - (1 - 0.31)^5 \approx 0.85$ (85% dei problemi).
Con 15 utenti: circa 100% dei problemi.

Per studi **quantitativi** che richiedono significatività statistica, occorrono almeno **20 utenti**.

### 7.6 Questionari di Valutazione

#### 7.6.1 UEQ — User Experience Questionnaire

Il **UEQ** (*User Experience Questionnaire*) è uno strumento standardizzato per misurare la UX percepita dagli utenti. È composto da **26 coppie di aggettivi contrari** su scala a 7 punti (es. "difficile — facile", "noioso — entusiasmante"), raggruppate in 6 scale:

| Scala | Cosa misura |
|-------|------------|
| Attractiveness | Impressione complessiva del prodotto |
| Learnability | Facilità di apprendimento |
| Efficiency | Rapidità nell'esecuzione dei task |
| Controllability | Sensazione di avere il controllo |
| Stimulation | Eccitazione e motivazione nell'uso |
| Originality | Innovatività e creatività percepita |

Esiste anche una versione breve **UEQ-S** con soli 8 item.

#### 7.6.2 SUS — System Usability Scale

Il **SUS** (*System Usability Scale*) è uno degli strumenti di valutazione dell'usabilità più diffusi e affidabili, definito "quick and dirty" (rapido e approssimativo) ma comunque valido. È composto da **10 item** su scala Likert a 5 valori (da "completamente in disaccordo" a "completamente d'accordo").

Il punteggio SUS va da 0 a 100. Un punteggio superiore a **68** indica usabilità sopra la media.

**Calcolo del punteggio SUS:**
- Per gli **item dispari** (1, 3, 5, 7, 9): contributo = (posizione selezionata) - 1
- Per gli **item pari** (2, 4, 6, 8, 10): contributo = 5 - (posizione selezionata)
- **Punteggio totale** = somma di tutti i contributi × 2.5

Il SUS è particolarmente apprezzato perché è agnostico rispetto alla tecnologia valutata, produce risultati affidabili con pochi utenti, e permette confronti tra sistemi diversi.

---
