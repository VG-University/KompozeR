# DISPENSE — APPLICAZIONI E SERVIZI WEB (ASW)
## Corso di Laurea Magistrale in Ingegneria Informatica
### Università di Bologna — A.A. 2024/2025
**Docente:** Prof.ssa Silvia Mirri | **Tutor:** Manuel Andruccioli

---

> **Nota metodologica.** Queste dispense sono redatte a partire dal materiale didattico ufficiale del corso ASW. Ogni capitolo corrisponde a un file di lezione. Il linguaggio è tecnico e formale, adatto allo studio per l'esame di laurea magistrale.

---

## Capitolo 1 — Introduzione al Corso

### 1.1 Struttura del Corso e Modalità d'Esame

Il corso di *Applicazioni e Servizi Web* (ASW) è erogato nell'ambito della Laurea Magistrale in Ingegneria Informatica presso l'Università di Bologna, sede di Cesena. Le lezioni teoriche si tengono il venerdì dalle 15:00 alle 17:00, mentre le sessioni di laboratorio si svolgono il mercoledì dalle 14:30 alle 17:30.

La valutazione finale è composta da due parti:

1. **Progetto di gruppo** (max 27/30): realizzato da gruppi di 2-3 studenti. Il progetto deve essere caricato su un repository GitHub pubblico e accompagnato da un report scritto in formato LaTeX. Il progetto consiste nello sviluppo di una web application completa, con un componente client, un componente server e un database NoSQL.
2. **Esame orale** (+/- 5 punti): difesa del progetto e discussione degli argomenti teorici del corso.

Il progetto è strutturato in tre fasi principali: design (analisi dei requisiti e progettazione), implementazione (sviluppo del codice) e testing (validazione funzionale e di usabilità).

### 1.2 Programma del Corso

Il corso si sviluppa attorno a un nucleo di argomenti che spaziano dall'architettura web alle tecnologie di frontend e backend, passando per le metodologie di sviluppo e di design centrato sull'utente. Di seguito l'elenco degli argomenti principali:

- **Architetture web**: evoluzione delle soluzioni architetturali, dal sito statico alla Single Page Application (SPA), stack LAMP e MEAN.
- **Browser**: struttura interna, motori di rendering, interprete JavaScript, pipeline di parsing HTML/CSS.
- **Server web e pattern MVC**: architetture server-side, pattern Model-View-Controller e sue varianti (MVVM, MVP, Flux).
- **Stack MEAN/MEVN**: MongoDB, Express.js, Vue.js (o Angular), Node.js. Il corso approfondisce in particolare il sotto-stack MEVN (con Vue.js al posto di Angular).
- **Metodologie di design HCI**: User Centered Design, Personas, Scenari d'uso, Storyboard, prototipazione, focus group, think aloud.
- **Metodologie di sviluppo e testing**: usabilità, valutazione euristica, cognitive walkthrough, test con utenti, questionari SUS e UEQ.
- **Single Page Application e framework JS**: confronto tra Angular, React e Vue.js.
- **Vue.js**: direttive, componenti, comunicazione tra componenti, MVVM.
- **TypeScript**: sistema di tipi, classi, interfacce, moduli.
- **CSS avanzato**: Flexbox, SASS/SCSS.
- **Angular**: architettura NgModule, componenti, lifecycle hooks, dependency injection, routing.
- **Docker e Docker Compose**: containerizzazione di applicazioni Node.js + MongoDB.
- **Sustainable Web Development**: sostenibilità digitale, Web Sustainability Guidelines (WSG).

### 1.3 Stack Tecnologico del Corso

Lo stack tecnologico adottato nel corso è il **MEVN**: MongoDB (database), Express.js (framework server), Vue.js (framework client), Node.js (runtime server). A questo si aggiungono TypeScript per la tipizzazione statica, SCSS/SASS per la gestione dei fogli di stile, e Angular come framework alternativo presentato a scopo comparativo.

### 1.4 Prerequisiti e Connessioni con Altri Corsi

Per seguire proficuamente il corso è necessario possedere una buona conoscenza di: HTML5, CSS3, JavaScript (incluse le librerie jQuery), PHP (almeno a livello base), il DOM, e i formati XML/JSON.

Il corso ha importanti connessioni con altri insegnamenti del piano di studi:
- **PCD** (Programmazione Concorrente e Distribuita): programmazione asincrona con callback/Promise, Node.js.
- **Paradigmi di Programmazione**: pattern architetturali MVC, MVVM.
- **Sistemi Distribuiti**: architetture a microservizi, comunicazione HTTP/REST.

---

## Capitolo 2 — Soluzioni Architetturali per il Web

### 2.1 Evoluzione dei Browser e dei Server Web

#### 2.1.1 Origini del Web

Il web nasce concettualmente negli anni Ottanta grazie a Ted Nelson, che formulò l'idea di ipertesto. L'implementazione pratica arrivò nel 1990 con **Tim Berners-Lee**, che al CERN sviluppò il primo browser — chiamato *WorldWideWeb* — e il primo server HTTP. Il browser Mosaic, rilasciato nei primi anni Novanta, fu il primo a rendere il web accessibile al grande pubblico attraverso un'interfaccia grafica.

#### 2.1.2 Le Guerre dei Browser

La storia dei browser si è sviluppata attraverso due fasi competitive principali, note come "guerre dei browser".

**Prima guerra dei browser (1994–1997):** Il protagonismo iniziale di Netscape Navigator, dominante dal 1994, fu contrastato dalla strategia di Microsoft, che integrava Internet Explorer (IE) direttamente nel sistema operativo Windows a partire da Windows 95. Questa pratica bundling consentì a IE di conquistare la maggioranza del mercato verso il 1997, segnando la vittoria di Microsoft nella prima guerra.

**Seconda guerra dei browser (dal 2004 in poi):** A partire dalla metà degli anni 2000, il mercato fu nuovamente sconvolto dall'emergere di Firefox (derivato da Netscape), Opera e Safari (Apple). Il vero cambio di paradigma arrivò nel 2008 con il lancio di **Google Chrome**, basato sul motore V8 per JavaScript e sul motore Blink per il rendering. Chrome conquistò rapidamente una quota di mercato dominante, posizione che mantiene tuttora.

#### 2.1.3 Definizione di Web Server

Il termine *web server* può riferirsi a due concetti distinti ma complementari:

- **Web server hardware**: un computer fisico sempre connesso alla rete, con un indirizzo IP costante, che ospita i file del sito web e li rende disponibili ad altri dispositivi su Internet.
- **Web server software**: il programma installato su quel computer che gestisce le richieste HTTP in arrivo, elabora le risposte e le invia ai client. Esempi storici e contemporanei includono Apache, Nginx, IIS.

### 2.2 Evoluzione delle Architetture Web

L'architettura delle applicazioni web ha attraversato una serie di trasformazioni radicali nel corso dei decenni. È possibile identificare sei fasi principali.

#### 2.2.1 Sito Statico

Nella prima fase del web, ogni pagina corrisponde a un file HTML separato, creato manualmente dallo sviluppatore. Non esiste alcuna logica di presentazione automatizzata: qualsiasi modifica al layout richiede l'aggiornamento manuale di tutti i file. Questa soluzione è completamente non scalabile per siti di grandi dimensioni.

#### 2.2.2 Server Side Include (SSI)

Le direttive **Server Side Include** (SSI), come la direttiva `<!--#include-->`, consentono di comporre pagine HTML includendo frammenti di codice comune (ad esempio header e footer) al momento della richiesta. Il server web elabora queste direttive prima di inviare la pagina al client. Si tratta di un miglioramento rispetto alla soluzione puramente statica, ma le capacità rimangono molto limitate.

#### 2.2.3 Architettura a 3 Livelli con Codice Embeddato

In questa fase, la logica applicativa è integrata direttamente all'interno delle pagine HTML attraverso linguaggi come PHP o ASP. Il codice di presentazione e la logica di business sono mescolati nello stesso file, creando soluzioni fragili e difficili da mantenere. Questa architettura è tecnicamente a tre livelli (client, server applicativo, database), ma la separazione tra presentazione e logica è carente.

#### 2.2.4 Architettura a 3 Livelli con Applicazione Completa

Con l'introduzione di framework server-side (come Struts, Ruby on Rails, Django, Spring MVC), si realizza una separazione netta tra la logica di business e la presentazione. La logica applicativa è contenuta in classi e moduli distinti, mentre la presentazione è delegata a *template engine* (motori di template). Strumenti come Velocity (Java), ERB (Ruby) o Jinja2 (Python) permettono di generare HTML dinamicamente a partire da dati prodotti dalla logica di business.

#### 2.2.5 Architettura a 4 Livelli

In questa architettura, la logica applicativa produce dati in formato indipendente dalla presentazione (tipicamente XML), che vengono poi trasformati in HTML attraverso un livello separato di presentazione, spesso implementato tramite XSLT. Questo approccio garantisce la massima separazione tra logica e presentazione, ma comporta una complessità architetturale elevata.

#### 2.2.6 Rich Client / AJAX (Web 2.0)

La svolta più significativa avviene con l'introduzione di **XMLHttpRequest** (XHR) e il paradigma AJAX (*Asynchronous JavaScript and XML*). Con questo approccio:

- Il server invia inizialmente una pagina HTML leggera con il codice JavaScript dell'applicazione.
- Il browser esegue il JavaScript, che effettua richieste asincrone al server per ottenere dati (inizialmente XML, poi JSON).
- La pagina si aggiorna dinamicamente senza necessità di ricaricamento completo.

Questo modello sposta parte della logica di presentazione dal server al client (browser), inaugurando l'era del **Web 2.0** e aprendo la strada alle moderne Single Page Application.

### 2.3 Framework e Librerie per il Web

L'evoluzione delle architetture web ha prodotto un ricco ecosistema di framework e librerie:

- **Framework server-side**: Struts (Java), Rails (Ruby), Django (Python), Spring MVC (Java) — per la gestione della logica server con pattern MVC.
- **Framework CSS**: Bootstrap, Foundation — per la gestione del layout e dello stile responsivo.
- **Librerie JavaScript**: jQuery (manipolazione DOM), Angular (Google), Vue.js (community), React (Facebook) — per la gestione dell'interfaccia client-side.

### 2.4 Single Page Application (SPA)

Una **Single Page Application** (SPA) è un'applicazione web che carica una singola pagina HTML e aggiorna dinamicamente il contenuto attraverso JavaScript, senza mai effettuare reload completi della pagina. Tutta la logica di navigazione, routing e gestione dello stato è gestita client-side attraverso il framework JavaScript.

I vantaggi principali delle SPA rispetto alle applicazioni tradizionali includono: interazione simile a un'app nativa, funzionamento offline (con Service Workers), transizioni fluide tra le viste, ridotto traffico di rete (HTML/CSS/JS inviati una sola volta).

### 2.5 Gli Stack Tecnologici

#### 2.5.1 Stack LAMP

Lo stack **LAMP** (*Linux + Apache + MySQL + PHP*) è stato per lungo tempo la soluzione dominante per lo sviluppo web:

| Componente | Tecnologia | Ruolo |
|-----------|-----------|-------|
| L | Linux | Sistema operativo |
| A | Apache | Web server |
| M | MySQL | Database relazionale |
| P | PHP | Linguaggio server-side |

Lo stack LAMP è completamente open source, ha un'ampia diffusione e una vasta comunità di supporto. La variante per sistemi Windows è nota come **WAMP**.

#### 2.5.2 Stack MEAN

Lo stack **MEAN** (*MongoDB + Express.js + Angular + Node.js*) rappresenta l'alternativa moderna, orientata alla filosofia *"JavaScript Everywhere"*:

| Componente | Tecnologia | Ruolo |
|-----------|-----------|-------|
| M | MongoDB | Database NoSQL, documenti JSON |
| E | Express.js | Framework web server-side per Node.js |
| A | Angular | Framework frontend SPA |
| N | Node.js | Runtime JavaScript server-side |

Le principali caratteristiche dello stack MEAN sono:
- **100% open source**: tutte le componenti sono liberamente disponibili.
- **100% JavaScript + JSON + HTML**: un unico linguaggio per frontend e backend.
- **100% standard web**: basato su tecnologie standard.
- **Multipiattaforma**: funziona su Linux, Windows, macOS.
- **Modello dati consistente**: JSON usato uniformemente tra database, server e client.
- **Basso overhead di memoria**: Node.js gestisce molte connessioni con un singolo thread.

#### 2.5.3 Varianti del MEAN

- **MEVN**: sostituisce Angular con **Vue.js** — variante adottata nel corso ASW.
- **MERN**: sostituisce Angular con **React** (Facebook).

#### 2.5.4 Confronto MEAN vs LAMP

| Caratteristica | LAMP | MEAN |
|--------------|------|------|
| Linguaggi | PHP (server), JS (client) | JavaScript ovunque |
| Database | Relazionale (schema fisso) | NoSQL (schema flessibile) |
| Server | Apache | Node.js |
| Interfaccia | Server-rendered pages | SPA client-side |
| Piattaforma | Prevalentemente Linux | Multipiattaforma |

---

## Capitolo 3 — Browser e Sue Componenti

### 3.1 Architettura del Browser

Il browser è un'applicazione software complessa, strutturata in sette componenti principali. La comprensione di questa architettura è fondamentale per lo sviluppo di applicazioni web efficienti.

#### Componente 1: User Interface (Interfaccia Utente)

L'interfaccia utente comprende tutti gli elementi visibili all'utente ma non direttamente parte della pagina web: barra degli indirizzi, pulsanti di navigazione (avanti/indietro), barra dei preferiti, schede (tab), barra di progresso, ecc. Non esiste uno standard formale per l'interfaccia utente del browser — la sua forma attuale è il risultato di anni di pratiche consolidate attraverso convenzioni di usabilità.

#### Componente 2: Browser Engine (Motore del Browser)

Il *browser engine* è il componente di coordinamento che funge da intermediario tra l'interfaccia utente e il motore di rendering. Gestisce il caricamento degli URL, coordina la navigazione, gestisce lo stato della sessione e la cache. È il "regista" che orchestra il funzionamento degli altri componenti.

#### Componente 3: Rendering Engine (Motore di Rendering)

Il motore di rendering è il cuore del browser: riceve il contenuto HTML e CSS e lo trasforma nella rappresentazione visiva che l'utente vede sullo schermo. Diversi browser adottano motori di rendering differenti:

| Browser | Motore di Rendering |
|---------|-------------------|
| Firefox | Gecko |
| Safari | WebKit |
| Chrome, Opera | Blink (derivato da WebKit) |
| Edge (vecchio) | EdgeHTML |

Il processo di rendering segue una pipeline specifica, descritta in dettaglio nella sezione 3.3.

#### Componente 4: Networking (Client HTTP)

Il componente di networking è responsabile delle comunicazioni di rete: invia le richieste HTTP/HTTPS, riceve le risposte, gestisce la cache delle risorse (tramite AppCache o i più moderni Service Workers). Nei browser contemporanei, questo componente può essere un collo di bottiglia per le performance, poiché deve gestire numerose richieste parallele per le risorse di una pagina moderna (immagini, script, fogli di stile, font, ecc.).

#### Componente 5: JavaScript Interpreter (Interprete JavaScript)

L'interprete JavaScript esegue il codice JavaScript della pagina. I principali interpreti sono:

| Browser/Piattaforma | Interprete JS |
|--------------------|--------------|
| Chrome, Node.js | V8 (Google, scritto in C++) |
| Firefox | SpiderMonkey |
| Safari | JavaScriptCore |

L'interprete JavaScript moderno non è un semplice interprete, ma utilizza tecniche di compilazione JIT (*Just-In-Time*) per ottimizzare le performance del codice a runtime.

#### Componente 6: UI Backend

Il *UI backend* è responsabile del rendering dei widget di base dell'interfaccia (pulsanti, menu a tendina, campi di input, ecc.). Utilizza le primitive del sistema operativo sottostante per disegnare questi elementi, garantendo che appaiano coerenti con il look-and-feel del sistema.

#### Componente 7: Data Persistence (Persistenza dei Dati)

Il componente di persistenza gestisce il salvataggio dei dati lato client. I principali meccanismi disponibili sono:

- **Cookies**: piccoli frammenti di dati inviati dal server e memorizzati nel browser. Hanno scadenza configurabile e sono inviati automaticamente con ogni richiesta HTTP allo stesso dominio.
- **localStorage**: storage chiave-valore persistente (circa 5 MB per dominio), accessibile via JavaScript. I dati non scadono automaticamente.
- **sessionStorage**: simile a localStorage, ma i dati sono eliminati alla chiusura della tab/finestra.
- **IndexedDB**: database client-side strutturato, adatto per grandi quantità di dati strutturati.
- **AppCache / Service Workers**: meccanismi per il caching delle risorse applicative, utili per il funzionamento offline.

### 3.2 Flusso Principale del Motore di Rendering

Il motore di rendering esegue il proprio lavoro seguendo una pipeline sequenziale di quattro fasi:

```
Parsing HTML → DOM Tree
      ↓
Render Tree Construction
      ↓
Layout of Render Tree
      ↓
Painting
```

Queste fasi non sono strettamente sequenziali: per migliorare l'esperienza utente, il browser avvia il rendering dei contenuti già disponibili mentre continua a scaricare e analizzare il resto della pagina.

### 3.3 Parsing HTML

Il parsing HTML è un processo particolarmente complesso rispetto al parsing di altri linguaggi. L'HTML non è un linguaggio *context-free* (libero dal contesto), a differenza di linguaggi come Java o Python. Questo significa che le tecniche di parsing standard (come quelle usate per i compilatori) non si applicano direttamente. Ogni browser implementa un parser HTML personalizzato, con robuste capacità di gestione degli errori.

Il processo di parsing si divide in due fasi strettamente collegate:

#### 3.3.1 Tokenizzazione

La tokenizzazione è implementata come una macchina a stati finiti. Il parser legge il documento HTML carattere per carattere, transitando tra stati secondo regole precise:

- **Stato Data**: stato iniziale, elabora il testo normale.
- **Stato Tag Open**: attivato quando si incontra il carattere `<`.
- **Stato Tag Name**: elabora il nome del tag (es. `div`, `p`, `span`).
- Al termine del riconoscimento di un tag, viene emesso un token.

Il risultato della tokenizzazione è una sequenza di token: token di apertura tag, token di chiusura tag, token di testo, token di commento, ecc.

#### 3.3.2 Costruzione dell'Albero (Tree Construction)

I token prodotti dalla fase di tokenizzazione vengono utilizzati per costruire il **DOM** (*Document Object Model*), ovvero l'albero che rappresenta la struttura logica del documento HTML. Il DOM è l'interfaccia attraverso cui JavaScript può accedere e manipolare il contenuto della pagina.

Un aspetto fondamentale del browser parsing è la **tolleranza agli errori**: i browser correggono silenziosamente l'HTML non valido, gestendo casi come tag non chiusi, tag annidati in modo errato, ecc. Questo comportamento di gestione degli errori è stato standardizzato attraverso anni di pratiche comuni tra i browser.

### 3.4 Parsing CSS

A differenza dell'HTML, il CSS è un linguaggio *context-free* e può essere analizzato con parser standard basati su grammatiche formali. Il risultato del parsing CSS è un oggetto `StyleSheet` contenente una lista di regole CSS, ognuna delle quali associa un selettore a un insieme di dichiarazioni di stile.

### 3.5 Render Tree vs DOM Tree

Il **Render Tree** è strutturato diversamente dall'albero DOM. Le differenze principali sono:

- Gli elementi con `display: none` sono **esclusi** dal Render Tree (a differenza di `visibility: hidden`, che è incluso poiché occupa ancora spazio nel layout).
- Gli elementi `<head>`, `<script>`, `<meta>` e simili sono esclusi.
- Un singolo elemento del DOM può richiedere più nodi nel Render Tree (ad esempio, un elemento `<select>` richiede tre renderer: uno per il bordo, uno per il dropdown, uno per la lista).

Ogni nodo del Render Tree è chiamato *renderer* o *render object* e contiene le informazioni geometriche e stilistiche necessarie per il rendering.

### 3.6 Layout

La fase di **layout** (o *reflow*) calcola la posizione e la dimensione di ogni renderer nel Render Tree. Questo processo è ricorsivo: inizia dalla radice dell'albero (`<html>`) e procede verso le foglie.

Le regole principali del layout sono:
- L'origine del sistema di coordinate è l'angolo in alto a sinistra del viewport.
- La larghezza di ogni elemento è calcolata in base alla larghezza del contenitore padre (può essere espressa in percentuale o in pixel).
- L'altezza di ogni elemento è tipicamente calcolata in base all'altezza del suo contenuto.

Il layout viene rieseguito (parzialmente) ogni volta che il contenuto o lo stile di un elemento cambia — operazione nota come *reflow* o *relayout*, che può essere costosa in termini di performance.

### 3.7 Ordine di Cascata CSS

L'ordine di precedenza delle regole CSS, dalla priorità più bassa a quella più alta, è il seguente:

1. Stile predefinito del browser (*browser default stylesheet*)
2. Preferenze dell'utente (impostazioni del browser)
3. Fogli di stile dell'autore: esterni → interni → inline
4. Regole `!important` dell'autore
5. Regole `!important` dell'utente (massima priorità)

### 3.8 Ordine di Pittura (Painting Order)

Per ogni blocco del Render Tree, la fase di *painting* segue un ordine preciso:

1. Colore di sfondo (`background-color`)
2. Immagine di sfondo (`background-image`)
3. Bordo (`border`)
4. Elementi figli (ricorsivamente)
5. Contorno (`outline`)

### 3.9 Il Motore V8 di JavaScript

Il motore **V8** di Google è un interprete JavaScript ad alte prestazioni scritto in C++, utilizzato sia da Chrome che da Node.js. Il suo funzionamento si basa su una pipeline di compilazione JIT:

```
Sorgente JavaScript
      ↓
    Parser
      ↓
AST (Abstract Syntax Tree)
      ↓
Bytecode Generator (Ignition)
      ↓
JIT Compiler (TurboFan)
      ↓
Codice macchina nativo
```

Il JIT compiler analizza il codice durante l'esecuzione, identifica le parti eseguite più frequentemente (*hot code*) e le ottimizza generando codice macchina nativo altamente ottimizzato. Le ottimizzazioni possono essere revocate (*deoptimization*) se le ipotesi su cui si basavano risultano errate a runtime.

---

## Capitolo 4 — Server Web e Pattern MVC per il Web

### 4.1 Il Web Server

#### 4.1.1 Definizione e Funzioni

Il **web server hardware** è un computer fisico costantemente connesso a Internet, dotato di un indirizzo IP statico, che ospita i file del sito web. Il **web server software** installato su quel computer svolge le seguenti funzioni principali:

- **File hosting**: serve i file statici (HTML, CSS, immagini, JavaScript) ai client richiedenti.
- **Protocollo HTTP**: gestisce il protocollo di comunicazione HTTP — un protocollo testuale e *stateless* (senza stato). Poiché HTTP è stateless, la gestione delle sessioni utente richiede meccanismi aggiuntivi (cookie, token, sessioni lato server).
- **Traduzione dei percorsi**: converte i percorsi URL nei percorsi fisici del filesystem. Ad esempio, in Apache, un URL come `/path/file.html` viene tradotto nel percorso filesystem `/home/www/path/file.html`.
- **Contenuto statico e dinamico**: serve direttamente i file statici; per il contenuto dinamico, passa la richiesta all'application server (ad esempio un'applicazione PHP, Python o Node.js).

#### 4.1.2 Flusso di Elaborazione HTTP

Il flusso tipico di elaborazione di una richiesta HTTP da parte di un web server è il seguente:

1. Ricezione della richiesta HTTP dal client.
2. Analisi della URL richiesta.
3. Ricerca del file corrispondente nel filesystem (o invocazione dell'applicazione dinamica).
4. Generazione della risposta HTTP (con il contenuto e i relativi header).
5. Invio della risposta al client.

Se il file non esiste, viene restituito un errore **404 Not Found**. Se si verifica un errore server-side durante l'elaborazione, vengono restituiti codici come 500 (Internal Server Error).

### 4.2 Architetture del Server

I web server adottano diverse architetture per gestire richieste concorrenti:

- **Multi-processing**: ogni richiesta viene assegnata a un processo separato. Robusto ma costoso in termini di memoria (ogni processo è pesante).
- **Multi-threaded**: ogni richiesta viene gestita da un thread separato all'interno di un unico processo. Più efficiente del multi-processing in termini di memoria.
- **Ibrido (processo + thread)**: combinazione delle due approcci precedenti — più processi, ognuno con più thread.
- **Single-Process Event-Driven** (modello Node.js): un singolo processo gestisce tutte le richieste attraverso un loop di eventi (*event loop*), senza bloccarsi in attesa di operazioni I/O.

### 4.3 Gestione del Sovraccarico

Le cause principali di sovraccarico di un web server includono:

- **Attacchi DDoS** (*Distributed Denial of Service*): flood di richieste da fonti distribuite.
- **Worm XSS** (*Cross-Site Scripting*): codice malevolo che si propaga attraverso i browser degli utenti.
- **Picchi di traffico**: eventi improvvisi (notizie virali, lanci di prodotto, ecc.).
- **Rallentamenti di rete**: code di richieste che si accumulano.

I codici di errore HTTP associati al sovraccarico sono: **500** (Internal Server Error), **502** (Bad Gateway), **503** (Service Unavailable), **504** (Gateway Timeout).

Le tecniche di mitigazione più comuni comprendono: firewall applicativi, caching web, distribuzione su più server, scaling orizzontale/verticale dell'hardware, utilizzo di **CDN** (*Content Delivery Network*).

### 4.4 Il Pattern Architetturale MVC

#### 4.4.1 Origini e Storia

Il pattern **MVC** (*Model-View-Controller*) fu concepito da **Trygve Reenskaug** e **Adele Goldberg** nel 1978 nell'ambito del linguaggio Smalltalk, come parte di un più ampio *Pattern Language*. La sua influenza si estese successivamente al celebre libro *Design Patterns* (Gamma et al., 1994), che sistematizzò i pattern di progettazione software orientata agli oggetti.

#### 4.4.2 Componenti dell'MVC

Il pattern MVC organizza un'applicazione in tre componenti con responsabilità ben distinte:

**Model (Modello)**
- Contiene i dati dell'applicazione.
- Implementa la logica di business.
- Gestisce la persistenza dei dati (interazione con il database).
- È indipendente dalla View e dal Controller.
- Notifica la View quando i dati cambiano (attraverso meccanismi di osservazione/eventi).

**View (Vista)**
- Rappresenta la visualizzazione dei dati del Model.
- Non contiene logica di business.
- Un singolo Model può avere più View diverse (ad esempio, una vista tabellare e una vista grafica degli stessi dati).
- Si aggiorna automaticamente quando il Model cambia.

**Controller (Controllore)**
- Gestisce l'input dell'utente (click, form submit, ecc.).
- Mappa le azioni dell'utente in aggiornamenti del Model.
- Seleziona la View appropriata da presentare.
- È il punto di ingresso dell'applicazione.

#### 4.4.3 MVC nei Framework Web degli Anni 2000

Con l'avvento dei framework web server-side degli anni 2000 (Spring, Rails, PHP MVC, ASP.NET MVC), il pattern MVC è stato adattato al contesto web, dove il Controller gestisce le richieste HTTP come punto di ingresso:

```
Browser → HTTP Request → Controller → Model (business logic + DB)
                              ↓
Browser ← HTTP Response ← View (template HTML)
```

Il Controller riceve la richiesta HTTP, interagisce con il Model per ottenere o aggiornare i dati, e infine seleziona e popola un template (View) che viene inviato come risposta HTML al browser.

#### 4.4.4 MVC nell'Era delle SPA

Con l'affermarsi delle Single Page Application, il modello architetturale cambia significativamente:

- Il browser carica inizialmente il bundle SPA (HTML/CSS/JS).
- La SPA effettua chiamate HTTP verso API REST del server.
- Il Controller sul server non gestisce più la renderizzazione HTML, ma restituisce dati in formato **JSON** attraverso API.
- La logica di presentazione è interamente lato client (nel framework JavaScript).

I framework frontend dominanti nell'era delle SPA sono: **React** (Facebook/Meta), **Vue.js** (community/Evan You), **Angular** (Google).

### 4.5 Varianti del Pattern MVC

#### 4.5.1 MVVM (Model-View-ViewModel)

Il pattern **MVVM** (*Model-View-ViewModel*) è la variante più adottata nei moderni framework frontend (Vue.js, Angular). Il **ViewModel** sostituisce il Controller con un componente che:

- Funge da *binder* (collegatore) bidirezionale tra View e Model.
- Espone i dati del Model in un formato adatto alla View.
- Implementa il comportamento a runtime tramite *data binding*.
- Non ha riferimenti diretti alla View (è la View che si lega al ViewModel).

La caratteristica distintiva dell'MVVM è il **two-way data binding**: le modifiche nel ViewModel si riflettono automaticamente nella View, e viceversa. Questo elimina la necessità di aggiornamenti manuali del DOM.

Rispetto al Controller MVC, il ViewModel è più adatto alle SPA poiché: definisce il comportamento dichiarativo a runtime, si lega direttamente alla View, e non gestisce le richieste HTTP come entry point.

**Svantaggio:** consumo di memoria più elevato rispetto all'MVC tradizionale, e non adatto per interfacce semplici.

#### 4.5.2 MVP (Model-View-Presenter)

Nel pattern **MVP** (*Model-View-Presenter*), il **Presenter** media tra View e Model. La differenza chiave rispetto all'MVC è che View e Presenter comunicano attraverso un'**interfaccia** (contratto), rendendo i due componenti disaccoppiati e facilitando il testing unitario della logica del Presenter.

#### 4.5.3 Flux (React)

**Flux** è il pattern architetturale adottato dall'ecosistema React, caratterizzato da un **flusso dati unidirezionale** (*unidirectional data flow*):

```
Actions → Dispatcher → Store → View
    ↑_________________________________|
```

- **Actions**: descrivono eventi che si verificano nell'applicazione (click utente, risposta API, ecc.).
- **Dispatcher**: instrada le Actions verso gli Store appropriati.
- **Store**: contiene lo stato dell'applicazione e la logica di aggiornamento dello stato.
- **View**: componente React che visualizza lo stato corrente dello Store.

La caratteristica fondamentale di Flux è che React crea una nuova View come funzione dello stato immutabile. Quando lo stato cambia, viene generata una nuova rappresentazione della View (o di parte di essa), e React aggiorna efficientemente il DOM reale attraverso il meccanismo del *Virtual DOM*.

---
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
## Capitolo 8 — Single Page Application e Framework JavaScript

### 8.1 Problemi delle Applicazioni Web Tradizionali

Le applicazioni web server-based tradizionali presentano limitazioni significative sia dal punto di vista del client che del server.

**Limitazioni lato client:**
- Ogni interazione con il server richiede un **ricaricamento completo della pagina**, con interruzione dell'esperienza utente.
- Il browser deve scaricare tutte le risorse (HTML, CSS, immagini, JS) ad ogni navigazione, anche quelle già scaricate in precedenza.
- Nessuna logica di business lato client: tutta l'elaborazione avviene sul server.
- Non è possibile implementare pattern MVC lato client.
- L'applicazione richiede una connessione di rete attiva per ogni operazione.

**Limitazioni lato server:**
- La pagina HTML viene rigenerata da zero ad ogni richiesta, anche quando solo una piccola parte del contenuto è cambiata.
- Spreco di banda: file CSS, JS e layout comune vengono reinviati ad ogni navigazione.
- Tutto il carico computazionale di rendering è sul server.
- Cambiare la tecnologia server-side richiede una riscrittura completa dell'applicazione.

### 8.2 Definizione di Single Page Application

Una **Single Page Application (SPA)** è un'applicazione web in cui la maggior parte delle interazioni viene gestita lato client senza necessità di contattare il server, con l'obiettivo di fornire un'esperienza utente più fluida.

In una SPA:
- Il server invia inizialmente un singolo documento HTML con il bundle JavaScript dell'applicazione.
- Tutte le navigazioni successive avvengono **senza ricaricamento della pagina**: JavaScript intercetta i click e aggiorna il DOM dinamicamente.
- Le comunicazioni con il server avvengono in background tramite chiamate AJAX/Fetch, recuperando solo i dati (JSON), non il markup HTML.
- Il routing (navigazione tra "pagine" logiche) è gestito interamente lato client.

**Vantaggi principali:**
- Interazione simile a un'app nativa (fluida, senza reload).
- I pulsanti avanti/indietro del browser continuano a funzionare (grazie all'HTML5 History API).
- Funzionamento offline parziale (con Service Workers).
- Transizioni animate tra viste.
- CSS e JavaScript inviati una sola volta: riduzione del traffico di rete nelle navigazioni successive.
- Manipolazione del DOM tramite JavaScript e template.

### 8.3 Perché jQuery Non Basta

**jQuery** è una libreria JavaScript che semplifica la manipolazione del DOM, la gestione degli eventi e le chiamate AJAX. Ha rivoluzionato lo sviluppo web quando fu introdotta, ma presenta limitazioni architetturali che la rendono inadeguata per le SPA moderne:

- **Lo stato risiede nel DOM**: in jQuery, l'applicazione legge lo stato direttamente dai valori dei campi HTML (es. `$('#input').val()`). Questo accoppia la logica applicativa alla struttura HTML.
- **Accoppiamento logica/presentazione**: il codice jQuery mescola la logica applicativa con la manipolazione dell'interfaccia, rendendo il codice difficile da testare e mantenere.
- **Non progettata per la gestione della logica applicativa**: jQuery è una libreria di utilità, non un framework architetturale. Non offre soluzioni per pattern come il data binding, la gestione del routing, o la componentizzazione dell'UI.

Questi limiti hanno reso necessaria la creazione di framework specificamente progettati per le SPA.

### 8.4 La Conferenza Throne of JS (2012)

Un momento di svolta nella storia dei framework JavaScript fu la conferenza **Throne of JS**, tenutasi a Toronto nel 2012. I principali sviluppatori di framework JavaScript si riunirono per discutere le sfide architetturali delle SPA e confrontare approcci diversi. Da questa conferenza emerse la consapevolezza che il mercato aveva bisogno di framework strutturati per affrontare le SPA, e che nessun approccio era universalmente superiore.

### 8.5 Confronto tra i Principali Framework JavaScript

I tre framework JavaScript dominanti nell'ecosistema delle SPA sono Angular, React e Vue.js. Ogni framework rappresenta un approccio filosofico diverso allo sviluppo di interfacce.

| Criterio | Angular | React | Vue.js |
|---------|---------|-------|--------|
| Prima release | 2010 (AngularJS) / 2016 (Angular 2, riscrittura completa in TypeScript) | Marzo 2013 | Febbraio 2014 |
| Sponsor | Google | Facebook/Meta | Community (Patreon); Evan You (ex-Google, team AngularJS) |
| GitHub stars | ~80.5K | ~185K | ~195K |
| Download settimanali NPM | 2.792K | 20.024K | 3.954K |
| Requisiti tecnici | TypeScript obbligatorio | JavaScript ES6+, JSX | HTML, JavaScript ES5+, CSS |
| Completezza | All-in-one (UI, stato, routing, testing e2e) | Solo gestione UI | Core + add-on ufficiali |
| Curva di apprendimento | Più ripida | Media | Più dolce |
| Performance | Più pesante e lento | Media | Più leggero e veloce |

#### 8.5.1 Angular

**Angular** (da non confondere con il vecchio AngularJS) è un framework completo e "opinionated" sviluppato e mantenuto da Google. Fornisce soluzioni integrate per tutte le esigenze di una SPA: gestione dell'interfaccia, stato dell'applicazione, routing, form, comunicazione HTTP, e testing end-to-end.

- Richiede **TypeScript** obbligatoriamente.
- Ha la curva di apprendimento più ripida dei tre framework.
- Richiede la CLI (`ng`) per la creazione e gestione del progetto.
- Comandi fondamentali: `ng new nomeapp` (crea nuovo progetto), `ng serve --open` (avvia server di sviluppo e apre il browser).

#### 8.5.2 React

**React** è una libreria (non un framework completo) sviluppata e mantenuta da Facebook/Meta. Si concentra esclusivamente sulla gestione dell'interfaccia utente attraverso un sistema di componenti.

- Utilizza **JSX**: sintassi che permette di scrivere HTML all'interno del codice JavaScript.
- Richiede ECMAScript moderno (ES6+).
- Per la gestione dello stato dell'applicazione richiede librerie esterne come Redux o MobX.
- Ha il volume di download settimanali più alto dei tre framework.

#### 8.5.3 Vue.js

**Vue.js** è un framework progressivo creato da **Evan You**, ex-ingegnere Google che aveva lavorato su AngularJS. Il termine "progressivo" indica che Vue può essere adottato incrementalmente: si può aggiungere a una pagina esistente tramite un semplice tag `<script>`, o essere usato come framework completo per SPA complesse.

Caratteristiche distintive:
- **Familiare per i developer jQuery**: la struttura basata su HTML, CSS e JavaScript rende Vue facile da adottare.
- **Documentazione eccellente**: considerata la migliore tra i tre framework principali.
- **Installazione minimale**: può essere incluso via CDN con un singolo tag `<script>`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/vue"></script>
  ```
- **Vue CLI** per progetti più complessi.
- **Vuex**: libreria ufficiale per la gestione centralizzata dello stato.
- Copre sia lo use-case del framework progressivo che quello del framework completo per SPA.
- Nel corso ASW è la tecnologia scelta per lo stack MEVN.

---

## Capitolo 9 — Vue.js

### 9.1 Fondamenti di Vue.js

**Vue.js** è un framework JavaScript progressivo per la costruzione di interfacce web reattive. La sua caratteristica principale è il **data binding reattivo bidirezionale** tra il modello dei dati e la vista: qualsiasi cambiamento nel modello si riflette automaticamente nella vista, e viceversa.

Vue.js implementa il pattern architetturale **MVVM** (*Model-View-ViewModel*):
- **Model**: implementazione dei dati di dominio (oggetti JavaScript).
- **View**: HTML renderizzato con CSS nel browser.
- **ViewModel**: il binder tra View e Model; descrive il comportamento a runtime attraverso il data binding.

### 9.2 ViewModel vs Controller

La distinzione tra ViewModel (MVVM) e Controller (MVC) è fondamentale per capire la filosofia di Vue.js:

- **Controller (MVC)**: esegue la logica di business prima del rendering; è il punto di ingresso delle richieste HTTP; decide quale view mostrare.
- **ViewModel (MVVM)**: definisce il comportamento a runtime del dato; è direttamente legato alla View; non gestisce richieste HTTP come entry point.

Il ViewModel è più adatto alla programmazione reattiva tipica delle SPA, dove la UI deve aggiornarsi in risposta ai cambiamenti dei dati senza necessità di codice imperativo esplicito.

### 9.3 Rendering Dichiarativo

Vue.js utilizza un approccio **dichiarativo** alla costruzione dell'interfaccia: il template HTML descrive *cosa* deve essere visualizzato, non *come* aggiornare il DOM. Vue si occupa internamente di compilare i template in un **Virtual DOM** e di aggiornare efficientemente il DOM reale solo quando necessario (minimizzando le operazioni DOM, che sono costose).

### 9.4 Data Binding in Vue.js

Vue.js offre tre principali meccanismi di data binding:

#### 9.4.1 Interpolazione con la Sintassi Mustache

L'interpolazione di testo avviene attraverso la doppia parentesi graffa (sintassi *mustache*):

```html
<p>Messaggio: {{ messaggio }}</p>
<p>Risultato: {{ a + b }}</p>
<p>Valore: {{ condizione ? 'sì' : 'no' }}</p>
```

All'interno delle doppie parentesi graffe si possono usare espressioni JavaScript semplici (ma non statement complessi come `if` o cicli `for`).

#### 9.4.2 Binding con v-bind

La direttiva `v-bind` (alias `:`) lega un attributo HTML a un'espressione JavaScript:

```html
<a v-bind:href="url">Link</a>
<!-- Equivalente con alias -->
<a :href="url">Link</a>

<img :src="imageUrl" :alt="imageAlt">
```

#### 9.4.3 Two-Way Binding con v-model

La direttiva `v-model` crea un **binding bidirezionale** tra un elemento di input e una proprietà del dato:

```html
<input v-model="messaggio" placeholder="Scrivi qualcosa">
<p>Il messaggio è: {{ messaggio }}</p>
```

Qualsiasi modifica al campo input aggiorna immediatamente `messaggio`, e viceversa.

### 9.5 Direttive Vue.js

Le **direttive** sono attributi speciali con il prefisso `v-` che applicano comportamenti reattivi al DOM. Vue.js offre un ricco set di direttive built-in.

#### 9.5.1 Rendering Condizionale

```html
<p v-if="visibile">Elemento visibile</p>
<p v-else-if="altroStato">Altro stato</p>
<p v-else>Elemento alternativo</p>
```

`v-if` rimuove fisicamente l'elemento dal DOM quando la condizione è falsa. Se si vuole mantenere l'elemento nel DOM ma nasconderlo, si usa `v-show` (che agisce sulla proprietà CSS `display`).

#### 9.5.2 Rendering di Liste

```html
<ul>
  <li v-for="(item, index) in lista" :key="item.id">
    {{ index }}: {{ item.nome }}
  </li>
</ul>

<!-- Iterazione su oggetti -->
<div v-for="(valore, chiave) in oggetto">
  {{ chiave }}: {{ valore }}
</div>
```

L'attributo `:key` è obbligatorio in produzione e deve essere univoco: permette a Vue di identificare efficientemente quali elementi aggiornare quando la lista cambia.

#### 9.5.3 Gestione degli Eventi

```html
<button v-on:click="gestore">Clicca</button>
<!-- Alias -->
<button @click="gestore">Clicca</button>

<!-- Inline handler -->
<button @click="contatore++">Incrementa</button>

<!-- Con parametri -->
<button @click="saluta('Mario')">Saluta</button>
```

#### 9.5.4 Modificatori delle Direttive

Vue.js offre modificatori che alterano il comportamento delle direttive:

**Modificatori di v-model:**
- `.lazy`: sincronizza al cambio dell'input (evento `change`), non ad ogni digitazione.
- `.number`: converte automaticamente il valore in numero.
- `.trim`: rimuove automaticamente gli spazi iniziali e finali.

**Modificatori di v-on:**
- `.stop`: chiama `event.stopPropagation()` (impedisce la propagazione dell'evento).
- `.prevent`: chiama `event.preventDefault()` (impedisce l'azione predefinita, es. submit del form).
- `.capture`: usa la fase di cattura invece di quella di bubbling.
- `.self`: attiva il handler solo se l'evento è originato sull'elemento stesso (non da un figlio).
- `.once`: il handler viene eseguito una sola volta.

**Modificatori di tastiera:**
`.enter`, `.tab`, `.delete`, `.esc`, `.space`, `.up`, `.down`, `.left`, `.right`

```html
<input @keyup.enter="invia">
<input @keyup.esc="cancella">
```

### 9.6 Binding di Classi e Stili

Vue.js offre una sintassi avanzata per il binding dinamico di classi CSS e stili inline.

```html
<!-- Sintassi oggetto: applica la classe se la condizione è vera -->
<div :class="{ 'attivo': isAttivo, 'errore': hasErrore }"></div>

<!-- Sintassi array: applica sempre le classi elencate -->
<div :class="['classe-base', classeCondicionale]"></div>

<!-- Stili inline con oggetto -->
<div :style="{ color: coloreAttivo, fontSize: dimensione + 'px' }"></div>

<!-- Stili inline con array di oggetti -->
<div :style="[stileBase, { width: '100px' }]"></div>
```

### 9.7 Computed Properties

Le **computed properties** (proprietà calcolate) sono proprietà reattive che dipendono da altre proprietà del dato e vengono ricalcolate automaticamente solo quando le loro dipendenze cambiano.

```javascript
export default {
  data() {
    return {
      nome: 'Mario',
      cognome: 'Rossi'
    }
  },
  computed: {
    nomeCompleto() {
      return this.nome + ' ' + this.cognome;
    }
  }
}
```

**Vantaggio rispetto ai metodi**: le computed properties sono **cachate** — il loro valore viene ricalcolato solo quando le dipendenze cambiano, non ad ogni accesso. Un metodo ordinario viene invece eseguito ogni volta che viene chiamato.

Le computed properties possono anche avere getter e setter personalizzati:

```javascript
computed: {
  nomeCompleto: {
    get() {
      return this.nome + ' ' + this.cognome;
    },
    set(valore) {
      const parti = valore.split(' ');
      this.nome = parti[0];
      this.cognome = parti[1];
    }
  }
}
```

### 9.8 Componenti Vue.js

I **componenti** sono blocchi riutilizzabili dell'interfaccia utente, ciascuno con la propria logica di business, template HTML e stili CSS incapsulati. La componentizzazione è il meccanismo fondamentale per la costruzione di SPA manutenibili.

I componenti si usano come tag HTML personalizzati:

```html
<!-- Utilizzo come tag personalizato -->
<mio-componente></mio-componente>
<!-- Oppure tramite attributo is -->
<div is="mio-componente"></div>
```

#### 9.8.1 Definizione di un Componente

```javascript
// Definizione con Options API
export default {
  name: 'MioComponente',
  // data DEVE essere una funzione nei componenti
  data() {
    return {
      contatore: 0
    }
  },
  template: `<button @click="contatore++">Cliccato {{ contatore }} volte</button>`
}
```

**Attenzione importante**: nei componenti (a differenza dell'istanza Vue radice), `data` **deve essere una funzione** che restituisce un oggetto, non un oggetto diretto. Questo è necessario per garantire che ogni istanza del componente abbia il proprio stato indipendente. Se `data` fosse un oggetto condiviso, tutte le istanze del componente condividerebbero lo stesso stato.

#### 9.8.2 Registrazione dei Componenti

**Registrazione globale**: il componente è disponibile in tutti i template dell'applicazione.

```javascript
const app = createApp(App);
app.component('mio-componente', MioComponente);
app.mount('#app');
```

**Registrazione locale**: il componente è disponibile solo nel componente che lo dichiara.

```javascript
import MioComponente from './MioComponente.vue';

export default {
  components: {
    MioComponente
  }
}
```

### 9.9 Comunicazione tra Componenti

Vue.js segue il principio del **flusso dati unidirezionale**: i dati fluiscono dal genitore verso i figli attraverso le props, mentre i figli comunicano verso il genitore attraverso eventi.

#### 9.9.1 Props (da Genitore a Figlio)

Le **props** sono proprietà esterne che il componente genitore passa al figlio. Rappresentano il canale di comunicazione dall'alto verso il basso.

```javascript
// Definizione nel componente figlio
export default {
  props: {
    titolo: {
      type: String,
      required: true
    },
    quantita: {
      type: Number,
      default: 0
    }
  }
}
```

```html
<!-- Utilizzo nel genitore -->
<componente-figlio :titolo="titoloGenitore" :quantita="5"></componente-figlio>
```

**Regola fondamentale**: il figlio non deve modificare direttamente le props ricevute dal genitore (violazione del flusso unidirezionale). Se il figlio deve modificare un dato, deve emettere un evento verso il genitore.

#### 9.9.2 Emit di Eventi (da Figlio a Genitore)

Il figlio comunica verso il genitore emettendo eventi tramite `$emit`:

```javascript
// Nel componente figlio
methods: {
  incrementa() {
    this.$emit('incrementato', this.contatore);
  }
}
```

```html
<!-- Nel genitore: ascolto dell'evento -->
<componente-figlio @incrementato="gestisciIncremento"></componente-figlio>
```

#### 9.9.3 Slots

Gli **slot** permettono al genitore di iniettare contenuto HTML all'interno del template del figlio:

```html
<!-- Template del componente figlio -->
<div class="card">
  <slot></slot>  <!-- Il contenuto del genitore viene inserito qui -->
</div>

<!-- Utilizzo nel genitore -->
<mia-card>
  <p>Questo contenuto sarà iniettato nello slot</p>
</mia-card>
```

#### 9.9.4 Event Bus

Per la comunicazione tra componenti non direttamente collegati (non genitore-figlio), Vue permette di usare un'istanza Vue separata come **event bus**:

```javascript
const eventBus = createApp({});

// Componente mittente
eventBus.config.globalProperties.$emit('evento-globale', dati);

// Componente ricevente
eventBus.config.globalProperties.$on('evento-globale', (dati) => {
  // elabora i dati
});
```

Per applicazioni complesse, questa soluzione è sostituita da **Vuex** (store di stato globale).

### 9.10 Best Practice per Componenti Riutilizzabili

Per la creazione di componenti genuinamente riutilizzabili, Vue.js raccomanda la seguente separazione delle responsabilità:

- **Props**: per passare dati dal contesto esterno al componente — il componente non deve fare assunzioni sul dato che riceve.
- **Events ($emit)**: per influenzare il contesto esterno dall'interno del componente — il componente non deve modificare lo stato esterno direttamente.
- **Slots**: per permettere al contesto esterno di influenzare il contenuto del componente — massima flessibilità di composizione.

### 9.11 Direttive Personalizzate

Vue.js permette di definire **direttive personalizzate** per operazioni che richiedono manipolazione diretta del DOM. Questo meccanismo è utile principalmente per integrare librerie di terze parti o per accedere direttamente alle API del browser.

```javascript
app.directive('evidenzia', {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow';
  }
});
```

```html
<p v-evidenzia="'lightblue'">Testo evidenziato</p>
```

---

## Capitolo 10 — TypeScript

### 10.1 Limiti di JavaScript

JavaScript è il linguaggio standard del web — può essere eseguito da qualsiasi browser senza installazione aggiuntiva. Tuttavia, presenta alcune caratteristiche che lo rendono difficile da usare per lo sviluppo di applicazioni complesse:

- **Nessuna fase di compilazione**: gli errori vengono rilevati solo a runtime, quando l'utente già usa l'applicazione.
- **Tipizzazione dinamica**: le variabili possono cambiare tipo durante l'esecuzione, rendendo difficile ragionare sul comportamento del codice.
- **Variabili globali**: JavaScript ha un'unica gestione degli scope che può portare a collisioni impreviste.
- **Abstract Equality** (`==`): l'operatore di uguaglianza non tipizzata produce risultati controintuitivi (`0 == ''` è `true`).
- **Problemi di scope**: il comportamento di `this`, le variabili dichiarate con `var` (hoisting), e la gestione delle closure possono essere fonte di bug.
- **Prototipizzazione**: il modello di ereditarietà basato su prototipi è diverso dall'ereditarietà classica e richiede una comprensione profonda.
- **Difficoltà organizzativa**: JavaScript non ha nativamente un sistema di moduli robusto per organizzare applicazioni di grandi dimensioni (anche se ES6+ ha introdotto i moduli).

**Il vantaggio fondamentale di JavaScript**: è il linguaggio del browser — non può essere sostituito senza perdere la compatibilità universale. Il paradigma *JavaScript Everywhere* (stesso linguaggio per frontend, backend e database) ne giustifica l'uso pervasivo.

### 10.2 Linguaggi Transpilati

La soluzione al problema dei limiti di JavaScript è la **transpilazione** (*source-to-source compilation*): scrivere il codice in un linguaggio più espressivo e sicuro, che viene poi compilato automaticamente in JavaScript eseguibile dal browser.

Il processo di transpilazione è distinto dalla classica compilazione (sorgente → codice macchina binario):

```
Linguaggio transpilato → [Transpilatore] → JavaScript
JavaScript            → [Browser/Node.js] → Esecuzione
```

Tra i linguaggi transpilati più noti: **CoffeeScript**, **TypeScript**, **ClojureScript**, **Haxe**, **Scala.js**, **Dart** (Google).

### 10.3 TypeScript

**TypeScript** è definito come "un superset tipizzato di JavaScript che compila in JavaScript semplice. Qualsiasi browser. Qualsiasi host. Qualsiasi OS. Open source." (Microsoft, Anders Hejlsberg).

TypeScript fu creato da **Anders Hejlsberg** (lo stesso autore di C# e Turbo Pascal) per Microsoft. Le sue caratteristiche fondamentali sono:

- **Superset di JavaScript**: qualsiasi codice JavaScript valido è anche codice TypeScript valido — la transizione è graduale.
- **Tipizzazione statica**: i tipi vengono verificati a tempo di compilazione, prima dell'esecuzione.
- **Orientamento agli oggetti**: classi, interfacce, ereditarietà, modificatori di accesso.
- **Intellisense**: il sistema di tipi abilitata l'autocompletamento avanzato nell'IDE.
- **Open source**: disponibile su GitHub, mantenuto da Microsoft.

### 10.4 Il Sistema di Tipi TypeScript

#### 10.4.1 Tipi Primitivi

TypeScript offre i seguenti tipi primitivi:

| Tipo | Descrizione | Esempio |
|------|------------|---------|
| `boolean` | Valori vero/falso | `let attivo: boolean = true;` |
| `number` | Numeri in virgola mobile (nessun intero nativo) | `let eta: number = 40;` |
| `string` | Stringhe di testo | `let nome: string = 'Mario';` |
| `void` | Assenza di valore (usato per funzioni senza return) | `function log(): void {}` |
| `null` | Valore nullo esplicito | `let vuoto: null = null;` |
| `undefined` | Valore indefinito | `let nonDef: undefined;` |

**Attenzione al tipo `number`**: TypeScript usa esclusivamente numeri in virgola mobile (come JavaScript). Non esiste una distinzione tra `int` e `float`. Di conseguenza:
```typescript
0.1 + 0.2              // = 0.30000000000000004
(0.1 + 0.2) == 0.3    // = false (!)
```
Per confronti numerici critici, occorre usare tolleranze (`Math.abs(a - b) < epsilon`).

#### 10.4.2 Tipi Composti

**Array:**
```typescript
var citta: string[] = ['Cesena', 'Bologna', 'Rimini'];
var numeri: Array<number> = [1, 2, 3];
```

**Enum:**
```typescript
enum Colore { Rosso, Verde, Blu }       // valori: 0, 1, 2
enum Stato { Attivo = 1, Inattivo = 2 } // valori espliciti

let c: Colore = Colore.Verde;
let nome: string = Colore[0]; // "Rosso"
```

**Any:**
```typescript
let qualsiasi: any = 4;
qualsiasi = "Ora sono una stringa"; // valido con any
qualsiasi = true;                   // valido con any
```

Il tipo `any` bypassa il sistema di tipi: utile per interfacciarsi con librerie JavaScript non tipizzate o per dati di input sconosciuti, ma da usare con parsimonia.

### 10.5 Type Inference

TypeScript può **inferire** il tipo di una variabile dall'assegnazione iniziale, senza dichiarazione esplicita:

```typescript
let messaggio = 'Ciao';        // TypeScript inferisce: string
messaggio = 42;                // ERRORE: Type 'number' is not assignable to type 'string'

let numero = 42;               // TypeScript inferisce: number
```

**Quattro modalità di dichiarazione:**

```typescript
let msg1: string = 'hello';   // Tipo + valore (raccomandato)
let msg2: string;              // Solo tipo (valore undefined)
let msg3 = 'hello';            // Solo valore (tipo inferito: string)
let msg4;                      // Niente (tipo: any, valore: undefined)
```

### 10.6 Funzioni in TypeScript

#### 10.6.1 Annotazioni di Tipo

```typescript
function somma(x: number, y: number): number {
  return x + y;
}

function saluta(nome: string): void {
  console.log('Ciao, ' + nome);
}
```

#### 10.6.2 Parametri Opzionali e con Valore Predefinito

```typescript
// Parametro opzionale (con ?)
function visualizza(messaggio: string, utente?: string): void {
  console.log(messaggio + (utente ? ', ' + utente : ''));
}

// Parametro con valore predefinito
function saluta(nome: string, titolo: string = 'Sig.'): string {
  return titolo + ' ' + nome;
}
```

#### 10.6.3 Overloading delle Funzioni

TypeScript supporta l'overloading delle funzioni attraverso dichiarazioni multiple di firma:

```typescript
// Firme multiple
function elabora(x: number): number;
function elabora(x: string): string;

// Implementazione unica con any
function elabora(x: any): any {
  if (typeof x === 'number') return x * 2;
  if (typeof x === 'string') return x.toUpperCase();
}
```

### 10.7 Classi in TypeScript

TypeScript introduce un sistema di classi che va ben oltre le "classi" di ES6, aggiungendo modificatori di accesso, proprietà con getter/setter, e metodi statici.

```typescript
class Persona {
  // Campi con modificatori di accesso
  public nome: string;
  private eta: number;

  // Constructor
  constructor(nome: string, eta: number) {
    this.nome = nome;
    this.eta = eta;
  }

  // Getter e setter con logica di validazione
  get etaPersona(): number {
    return this.eta;
  }

  set etaPersona(valore: number) {
    if (valore < 0) throw new Error('Età non valida');
    this.eta = valore;
  }

  // Metodo pubblico
  public saluta(): string {
    return `Ciao, sono ${this.nome}`;
  }

  // Metodo statico
  static crea(nome: string): Persona {
    return new Persona(nome, 0);
  }
}

// Ereditarietà
class Studente extends Persona {
  private matricola: string;

  constructor(nome: string, eta: number, matricola: string) {
    super(nome, eta);  // Chiama il constructor del genitore
    this.matricola = matricola;
  }
}
```

### 10.8 Interfacce

Le **interfacce** in TypeScript definiscono contratti di tipo per oggetti. Esistono solo a tempo di compilazione (vengono compilate in un file JavaScript vuoto) e non hanno impatto sul codice generato.

```typescript
interface Utente {
  nome: string;
  email: string;
  eta?: number;          // Proprietà opzionale
  readonly id: number;   // Proprietà in sola lettura
}

function creaAccount(utente: Utente): void {
  console.log('Account creato per: ' + utente.nome);
}

creaAccount({ nome: 'Mario', email: 'mario@esempio.it', id: 1 });
```

### 10.9 Moduli TypeScript

I **moduli** in TypeScript organizzano il codice in namespace separati, prevenendo la collisione di nomi globali.

```typescript
module Matematica {
  export class Calcolatrice {
    somma(a: number, b: number): number {
      return a + b;
    }
  }

  export interface Operazione {
    esegui(a: number, b: number): number;
  }
}

// Utilizzo
const calc = new Matematica.Calcolatrice();
```

I moduli possono contenere: moduli annidati, classi, interfacce, enum. **Non possono** contenere funzioni semplici (queste sono sempre a livello di modulo globale o ES module).

### 10.10 Perché Usare TypeScript

I benefici principali di TypeScript sono:

1. **Intellisense**: il sistema di tipi abilita l'autocompletamento avanzato e la navigazione del codice nell'IDE.
2. **Rilevamento precoce degli errori**: il compilatore TypeScript (`tsc`) rileva errori di tipo prima dell'esecuzione.
3. **Documentazione implicita**: le annotazioni di tipo documentano le API in modo leggibile dalla macchina.
4. **Refactoring sicuro**: il compilatore garantisce che i refactoring non rompano silenziosamente il codice.
5. **Interoperabilità con JavaScript**: il codice JavaScript puro è valido TypeScript; le librerie JS possono essere tipizzate con file di definizione (`@types/` packages).

**Configurazione del compilatore:**

Il compilatore TypeScript (`tsc`) è configurato tramite il file `tsconfig.json`. Supporta tre modalità di compilazione:
- **1-to-1**: un file `.ts` → un file `.js`.
- **Cartella**: tutti i file `.ts` in una cartella → corrispondenti `.js`.
- **File + dipendenze**: un file entry point + tutti i suoi import.

---
## Capitolo 11 — CSS Flexbox

### 11.1 Motivazione: Limiti del Modello Box Tradizionale

Il modello box tradizionale di CSS (basato su `float`, `position`, `display: inline-block`) presenta diverse limitazioni per la creazione di layout complessi e responsivi:

- La centratura verticale degli elementi è difficile e richiede workaround non intuitivi.
- Creare colonne di uguale altezza senza JavaScript è problematico.
- Il comportamento dei `float` richiede tecniche di *clearfix* aggiuntive.
- I layout basati su `table` per scopi di presentazione violano la separazione tra struttura e presentazione.
- Il ridimensionamento proporzionale degli elementi in relazione ai fratelli è complesso.

**Flexbox** (*Flexible Box Layout Module*) — un modulo di CSS3 — risolve questi problemi offrendo un modello di layout più prevedibile, particolarmente adatto per interfacce responsive e per componenti dell'interfaccia utente.

### 11.2 Concetti Fondamentali

#### 11.2.1 Flex Container e Flex Items

Il layout Flexbox si basa su due entità:

- **Flex container**: l'elemento genitore su cui si imposta `display: flex` (o `display: inline-flex`). È il contesto di formattazione Flexbox.
- **Flex items**: i figli diretti del flex container. Questi elementi vengono disposti secondo le regole Flexbox.

```css
.container {
  display: flex;         /* o inline-flex per un container inline */
}
```

Per default, un flex container dispone i suoi figli su una singola riga (da sinistra a destra), espandendoli per occupare l'intera altezza del container.

#### 11.2.2 Assi Principali

Flexbox opera su due assi:
- **Main axis** (asse principale): la direzione lungo cui vengono disposti i flex items. Per default è orizzontale (da sinistra a destra).
- **Cross axis** (asse trasversale): l'asse perpendicolare al main axis. Per default è verticale.

### 11.3 Proprietà del Flex Container

#### 11.3.1 flex-direction

Definisce la direzione del main axis (e quindi il verso di disposizione dei flex items):

| Valore | Descrizione |
|--------|------------|
| `row` (default) | Da sinistra a destra |
| `row-reverse` | Da destra a sinistra |
| `column` | Dall'alto verso il basso |
| `column-reverse` | Dal basso verso l'alto |

```css
.container {
  flex-direction: column;
}
```

#### 11.3.2 justify-content

Controlla l'allineamento dei flex items lungo il **main axis** (orizzontale per default):

| Valore | Descrizione |
|--------|------------|
| `flex-start` (default) | Items allineati all'inizio del main axis |
| `flex-end` | Items allineati alla fine del main axis |
| `center` | Items centrati nel main axis |
| `space-between` | Items distribuiti uniformemente; primo e ultimo agli estremi |
| `space-around` | Items distribuiti con uguale spazio attorno a ciascuno |
| `space-evenly` | Items distribuiti con uguale spazio tra e attorno a tutti |

#### 11.3.3 align-items

Controlla l'allineamento dei flex items lungo il **cross axis** (verticale per default):

| Valore | Descrizione |
|--------|------------|
| `stretch` (default) | Items espansi per riempire il container nel cross axis |
| `flex-start` | Items allineati all'inizio del cross axis |
| `flex-end` | Items allineati alla fine del cross axis |
| `center` | Items centrati nel cross axis |
| `baseline` | Items allineati alla loro linea di base tipografica |

#### 11.3.4 flex-wrap

Gestisce il comportamento del wrapping (avvolgimento su più righe):

| Valore | Descrizione |
|--------|------------|
| `nowrap` (default) | Tutti gli items su una sola riga/colonna |
| `wrap` | Gli items vengono avvolti su righe/colonne multiple |
| `wrap-reverse` | Come `wrap`, ma in direzione inversa |

#### 11.3.5 align-content

Controlla l'allineamento delle **righe** di flex items quando c'è spazio extra nel cross axis (applicabile solo con `flex-wrap: wrap` e più righe):

| Valore | Descrizione |
|--------|------------|
| `stretch` (default) | Le righe si espandono per riempire il container |
| `flex-start` | Righe accumulate all'inizio |
| `flex-end` | Righe accumulate alla fine |
| `center` | Righe centrate |
| `space-between` | Righe distribuite uniformemente |
| `space-around` | Uguale spazio attorno a ogni riga |

### 11.4 Proprietà dei Flex Items

#### 11.4.1 order

Controlla l'ordine di apparizione degli items nel container. Il valore è un numero intero (positivo, negativo o zero). Items con valore più basso appaiono prima.

```css
.item-1 { order: 2; }
.item-2 { order: -1; }  /* Appare prima di tutti */
.item-3 { order: 0; }   /* Default */
```

#### 11.4.2 margin: auto

Una delle caratteristiche più potenti di Flexbox è che `margin: auto` su un flex item assorbe tutto lo spazio extra disponibile. Questo permette di implementare con una sola riga di CSS una **perfetta centratura sia orizzontale che verticale**:

```css
.container {
  display: flex;
}
.item {
  margin: auto; /* Centra perfettamente in entrambe le direzioni */
}
```

Può anche essere usato per "spingere" items verso i bordi:

```css
.nav-logo  { /* ... */ }
.nav-links { margin-left: auto; } /* Spinge i link a destra */
```

#### 11.4.3 align-self

Sovrascrive l'`align-items` del container per un singolo item:

```css
.item-speciale {
  align-self: flex-end; /* Questo item si allinea alla fine, indipendentemente dagli altri */
}
```

#### 11.4.4 flex-grow

Definisce quanto un item deve crescere rispetto ai fratelli quando c'è spazio extra disponibile. Il valore è un numero (senza unità):

```css
.item-a { flex-grow: 1; } /* Cresce normalmente */
.item-b { flex-grow: 2; } /* Cresce il doppio rispetto a item-a */
.item-c { flex-grow: 0; } /* Non cresce (default) */
```

Con `flex-grow: 1` su tutti gli items, lo spazio extra viene distribuito equamente.

#### 11.4.5 flex-shrink

Definisce quanto un item deve ridursi rispetto ai fratelli quando manca spazio:

```css
.item { flex-shrink: 3; } /* Si riduce tre volte più velocemente degli altri */
```

### 11.5 Esempio Pratico: Layout Responsive

Un layout classico con header, nav, main, aside e footer si implementa in modo elegante con Flexbox:

```css
/* Struttura principale: colonne verticali */
.pagina {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Area centrale: riga orizzontale */
.contenuto-principale {
  display: flex;
  flex: 1; /* Occupa tutto lo spazio disponibile */
}

.nav     { flex: 0 0 200px; }  /* Larghezza fissa di 200px */
.main    { flex: 1; }          /* Occupa tutto lo spazio rimanente */
.aside   { flex: 0 0 150px; }  /* Larghezza fissa di 150px */

/* Layout mobile: tutto in colonna */
@media (max-width: 768px) {
  .contenuto-principale {
    flex-direction: column;
  }
  .nav, .aside { flex: none; }
}
```

---

## Capitolo 12 — SASS/SCSS

### 12.1 Limiti del CSS Tradizionale

Nonostante la sua potenza, il CSS presenta alcune limitazioni che diventano evidenti nei progetti di grandi dimensioni:

- **Nessuna variabile nativa** (prima di CSS3 Custom Properties): i valori come colori e dimensioni devono essere ripetuti in ogni regola che li utilizza.
- **Codice ripetitivo**: le stesse combinazioni di proprietà si ripetono in più regole, violando il principio DRY (*Don't Repeat Yourself*).
- **Molte richieste HTTP**: file CSS separati per diverse sezioni richiedono richieste aggiuntive (problema mitigato da HTTP/2 ma non eliminato).
- **Difficoltà di manutenzione**: modificare un colore o una dimensione utilizzata in molte regole richiede ricerca e sostituzione manuale.
- **Nessuna logica**: CSS non ha costrutti condizionali, cicli o funzioni.

### 12.2 I CSS Preprocessori

I **CSS preprocessori** sono strumenti che aggiungono funzionalità non disponibili nel CSS standard. Il codice viene scritto in una sintassi estesa e poi **compilato** in CSS standard. I principali preprocessori sono:

- **SASS/SCSS** (il più diffuso — oggetto di questo capitolo)
- **Less**: simile a SASS, usato da Bootstrap.
- **Stylus**: sintassi flessibile, meno diffuso.
- **PostCSS**: approccio plugin-based, trasforma CSS moderno in CSS compatibile con browser più datati.

### 12.3 SASS vs SCSS

Il preprocessore SASS offre due sintassi distinte:

**SASS (sintassi originale):** usa l'indentazione invece di parentesi graffe e non richiede il punto e virgola. La struttura è più compatta ma incompatibile con il CSS esistente.

**SCSS (Sassy CSS):** è **completamente compatibile con il CSS** — qualsiasi CSS valido è anche SCSS valido. Usa le stesse parentesi graffe e punto e virgola del CSS standard, ma aggiunge le funzionalità di SASS. **È la sintassi raccomandata e più diffusa.**

```scss
/* SCSS - sintassi familiare al CSS */
$colore-primario: #3498db;

.bottone {
  background-color: $colore-primario;
  &:hover {
    background-color: darken($colore-primario, 10%);
  }
}
```

### 12.4 Installazione e Compilazione

#### 12.4.1 Installazione

SASS può essere installato in diversi modi:

```bash
# Via NPM (più lento, richiede Node.js)
npm install -g sass

# Via Chocolatey (Windows)
choco install sass

# Via Homebrew (macOS)
brew install sass/sass/sass
```

#### 12.4.2 Compilazione

```bash
# Compilazione singolo file
sass input.scss output.css

# Compilazione con watch (ricompila automaticamente ad ogni modifica)
sass --watch input.scss:output.css

# Watch su una directory intera
sass --watch app/sass:public/stylesheets
```

**Output styles** (stile del CSS generato):
- `nested`: indentazione riflette la struttura SCSS (default per sviluppo).
- `expanded`: formato CSS standard leggibile.
- `compact`: ogni regola su una riga.
- `compressed`: CSS minificato senza spazi (per produzione).

```bash
sass --style=compressed input.scss output.css
```

### 12.5 Funzionalità Principali di SCSS

#### 12.5.1 Regole Nidificate

SCSS permette di **annidare** le regole CSS, riflettendo la struttura HTML e evitando la ripetizione dei selettori:

```scss
/* SCSS */
#main {
  color: #333;

  p {
    font-size: 14px;
    color: #0f0;

    .evidenziato {
      background-color: yellow;
    }
  }

  h1 {
    font-size: 24px;
  }
}
```

```css
/* CSS generato */
#main { color: #333; }
#main p { font-size: 14px; color: #0f0; }
#main p .evidenziato { background-color: yellow; }
#main h1 { font-size: 24px; }
```

#### 12.5.2 Il Selettore Padre (&)

Il carattere `&` all'interno di una regola nidificata fa riferimento al **selettore padre**. Questo è particolarmente utile per pseudo-classi, pseudo-elementi e varianti del selettore:

```scss
a {
  color: blue;
  
  &:hover {
    color: darkblue;       /* Genera: a:hover */
    text-decoration: none;
  }
  
  &:visited {
    color: purple;          /* Genera: a:visited */
  }
}

.bottone {
  background: blue;
  
  &-primario {
    background: darkblue;   /* Genera: .bottone-primario */
  }
  
  &-secondario {
    background: gray;        /* Genera: .bottone-secondario */
  }
}
```

#### 12.5.3 Variabili

Le variabili SCSS permettono di definire valori riutilizzabili in tutto il foglio di stile:

```scss
/* Definizione di variabili */
$colore-primario: #3498db;
$colore-testo: #333333;
$font-principale: 'Helvetica Neue', Helvetica, Arial, sans-serif;
$larghezza-max: 1200px;
$spaziatura: 16px;

/* Utilizzo */
body {
  color: $colore-testo;
  font-family: $font-principale;
  max-width: $larghezza-max;
}

.link {
  color: $colore-primario;
}
```

**Scope delle variabili:**
- Le variabili dichiarate fuori dai blocchi sono globali.
- Le variabili dichiarate all'interno di un blocco sono locali.
- Il flag `!global` promuove una variabile locale a globale.

**Tipi di dato delle variabili SCSS:** numeri, stringhe, colori, booleani, null, liste (separate da spazi o virgole), mappe.

#### 12.5.4 Operazioni

SCSS supporta operazioni matematiche sui valori:

```scss
$larghezza-totale: 1200px;
$colonne: 12;
$larghezza-colonna: $larghezza-totale / $colonne; // 100px

.header {
  width: $larghezza-totale - 60px; // 1140px
}

.font-grande {
  font-size: 16px * 1.5; // 24px
}
```

**Interpolazione `#{}`:** permette di inserire il valore di una variabile SCSS in contesti dove SCSS altrimenti interpretererebbe il simbolo in modo diverso:

```scss
$dimensione-font: 16;
$altezza-riga: 1.5;

p {
  font: #{$dimensione-font}px/#{$altezza-riga} Arial; // Non valutato come divisione
}
```

#### 12.5.5 Direttiva @import (Modularità)

SCSS permette di suddividere i fogli di stile in file modulari e di importarli:

```scss
// File _variabili.scss (il prefisso _ impedisce la compilazione separata)
$colore-primario: #3498db;

// File _reset.scss
* { box-sizing: border-box; margin: 0; padding: 0; }

// File principale style.scss
@import 'variabili';  // Non serve l'estensione né il prefisso _
@import 'reset';
@import 'layout';
@import 'componenti/bottoni';
```

I file con prefisso `_` (called *partial*) non vengono compilati separatamente — vengono inclusi solo quando importati.

#### 12.5.6 Direttiva @extend (Ereditarietà)

`@extend` permette a un selettore di ereditare tutti gli stili di un altro:

```scss
.messaggio {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.successo {
  @extend .messaggio;
  background-color: #dff0d8;
  border-color: #d6e9c6;
}

.errore {
  @extend .messaggio;
  background-color: #f2dede;
  border-color: #ebccd1;
}
```

**Placeholder selector `%`:** come `@extend`, ma non genera CSS per il selettore base (evita regole CSS "orfane"):

```scss
%stile-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.card-prodotto { @extend %stile-card; }
.card-utente   { @extend %stile-card; }
```

#### 12.5.7 Direttive di Controllo

SCSS supporta costrutti logici per la generazione condizionale di CSS:

```scss
// @if / @else if / @else
@mixin stile-tema($tema) {
  @if $tema == chiaro {
    background: white;
    color: black;
  } @else if $tema == scuro {
    background: #222;
    color: white;
  } @else {
    background: gray;
  }
}

// @for
@for $i from 1 through 5 {
  .colonna-#{$i} {
    width: 100% / 5 * $i;
  }
}

// @each
$colori: rosso, verde, blu;
@each $colore in $colori {
  .testo-#{$colore} {
    color: $colore;
  }
}

// @while
$i: 1;
@while $i <= 3 {
  .item-#{$i} { width: 10px * $i; }
  $i: $i + 1;
}
```

#### 12.5.8 Mixin (La Funzionalità più Potente)

I **mixin** sono blocchi di codice SCSS riutilizzabili che possono accettare parametri. Sono la funzionalità più potente di SCSS perché permettono la **parametrizzazione del CSS** — impossibile con il puro CSS.

```scss
// Definizione del mixin
@mixin bordo-arrotondato($raggio: 4px) {
  -webkit-border-radius: $raggio;
  -moz-border-radius: $raggio;
  border-radius: $raggio;
}

// Utilizzo
.bottone { @include bordo-arrotondato(10px); }
.card    { @include bordo-arrotondato(8px);  }
.logo    { @include bordo-arrotondato(50%);  } // Cerchio perfetto
```

**Parametri con nome (named arguments):**

```scss
@mixin transizione($proprieta: all, $durata: 0.3s, $funzione: ease) {
  transition: $proprieta $durata $funzione;
}

.elemento {
  @include transizione($durata: 0.5s, $funzione: ease-in-out);
}
```

**Argomenti variabili:**

```scss
@mixin box-shadow($ombre...) {
  box-shadow: $ombre;
}

.card {
  @include box-shadow(0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05));
}
```

**Differenza tra @extend e @mixin:**
- `@extend` produce un unico selettore CSS condiviso (efficiente in termini di dimensioni, ma meno flessibile).
- `@mixin` produce CSS separato per ogni `@include` (più dimensioni, ma permette parametrizzazione completa).

---

## Capitolo 13 — Angular

### 13.1 Definizione e Contesto

**Angular** è un framework open source per lo sviluppo di Single Page Application, mantenuto da Google. È importante distinguere due versioni storicamente distinte:

- **AngularJS** (2010): la versione originale, basata su JavaScript puro, che ha introdotto concetti rivoluzionari come il two-way data binding e le direttive.
- **Angular** (dal 2016, da Angular 2 in poi): una **riscrittura completa** del framework, incompatibile con AngularJS, basata su TypeScript. Angular fa parte dello stack MEAN nella sua definizione originale.

### 13.2 Angular CLI

La **Angular CLI** (*Command Line Interface*) è lo strumento ufficiale per la creazione e la gestione di progetti Angular:

```bash
# Installazione globale della CLI
npm install -g @angular/cli

# Creazione nuovo progetto
ng new nome-applicazione

# Avvio del server di sviluppo (con apertura automatica del browser)
ng serve --open

# Build per produzione
ng build --prod --base-href /url/base/
```

La CLI gestisce automaticamente la configurazione di TypeScript, webpack, testing e molto altro, permettendo di concentrarsi sul codice applicativo.

### 13.3 Architettura: NgModules

Ogni applicazione Angular è organizzata in **NgModules** (moduli Angular). Il modulo radice è `AppModule`, e ogni applicazione deve averne almeno uno.

Un NgModule è definito con il decoratore `@NgModule`:

```typescript
@NgModule({
  declarations: [
    // Componenti, direttive e pipe che appartengono a questo modulo
    AppComponent, MioComponente
  ],
  exports: [
    // Elementi visibili ad altri moduli che importano questo
    MioComponente
  ],
  imports: [
    // Altri moduli necessari (classi esportate da essi)
    BrowserModule, FormsModule, HttpClientModule
  ],
  providers: [
    // Servizi resi disponibili per l'iniezione di dipendenze
    MioServizio
  ],
  bootstrap: [
    // Il componente radice dell'applicazione (solo nel modulo principale)
    AppComponent
  ]
})
export class AppModule { }
```

### 13.4 Componenti Angular

I **componenti** sono le unità fondamentali dell'interfaccia utente in Angular. L'applicazione Angular è un albero di componenti, con un componente radice (`AppComponent`) come origine.

Un componente è definito con il decoratore `@Component`:

```typescript
@Component({
  selector: 'app-saluto',            // Tag HTML personalizzato
  templateUrl: './saluto.component.html',  // Template esterno
  styleUrls: ['./saluto.component.scss']   // Stili incapsulati
})
export class SalutoComponent {
  nome: string = 'Mondo';
}
```

**Nota sugli stili**: `styles` (stile inline) e `styleUrls` (file esterno) non hanno relazione di priorità — vince semplicemente l'ultimo definito.

### 13.5 Lifecycle Hooks dei Componenti

Angular offre una serie di **lifecycle hooks** — metodi speciali che vengono chiamati automaticamente in momenti specifici del ciclo di vita del componente:

| Hook | Quando viene chiamato |
|------|----------------------|
| `ngOnChanges` | Prima di `ngOnInit` e ogni volta che una proprietà `@Input` cambia |
| `ngOnInit` | Una volta, dopo il primo `ngOnChanges`; inizializzazione del componente |
| `ngDoCheck` | Ad ogni ciclo di change detection |
| `ngAfterContentInit` | Una volta, dopo la prima proiezione del contenuto (`<ng-content>`) |
| `ngAfterContentChecked` | Dopo ogni verifica del contenuto proiettato |
| `ngAfterViewInit` | Una volta, dopo la renderizzazione della view (inclusi i componenti figli) |
| `ngAfterViewChecked` | Dopo ogni verifica della view |
| `ngOnDestroy` | Subito prima che il componente venga distrutto |

**Attenzione**: è fondamentale **annullare le subscription agli Observable** in `ngOnDestroy` per prevenire memory leak:

```typescript
ngOnDestroy() {
  this.miaSottoscrizione.unsubscribe();
}
```

### 13.6 Data Binding in Angular

Angular supporta quattro tipi di data binding, ciascuno con una direzione di flusso diversa:

#### 13.6.1 Interpolazione

Flusso unidirezionale dal componente al DOM. Valuta un'espressione e la inserisce come testo.

```html
<h1>Ciao, {{ nome }}!</h1>
<p>Totale: {{ prezzo * quantita | currency }}</p>
```

#### 13.6.2 Property Binding

Flusso unidirezionale dal componente al DOM. Lega una proprietà del DOM a un'espressione del componente.

```html
<img [src]="urlImmagine">
<button [disabled]="!formularioValido">Invia</button>
<div [hidden]="nonVisibile">Contenuto nascosto</div>
```

#### 13.6.3 Event Binding

Flusso unidirezionale dal DOM al componente. Esegue un'istruzione del componente in risposta a un evento DOM.

```html
<button (click)="gestisciClick()">Clicca</button>
<input (input)="aggiornaValore($event)">
<form (submit)="inviaForm()">
```

#### 13.6.4 Two-Way Data Binding

Flusso bidirezionale tra componente e DOM. Combina property binding ed event binding in un'unica sintassi compatta, soprannominata "banana in a box" (`[()]`):

```html
<input [(ngModel)]="nomeutente">
<p>Valore corrente: {{ nomeutente }}</p>
```

Richiede l'import di `FormsModule` nel modulo Angular.

### 13.7 Pipes

Le **pipe** sono trasformazioni di valori applicabili nei template attraverso la sintassi `|` (pipe):

```html
{{ valore | pipe }}
{{ valore | pipe:parametro }}            <!-- Con parametro -->
{{ valore | pipe1 | pipe2 }}             <!-- Catena di pipe -->
```

**Pipe built-in di Angular:**

```html
{{ nome | uppercase }}                          <!-- MARIO ROSSI -->
{{ nome | lowercase }}                          <!-- mario rossi -->
{{ dataOggi | date }}                           <!-- Jan 15, 2025 -->
{{ dataOggi | date:'dd/MM/yyyy' }}              <!-- 15/01/2025 -->
{{ prezzo | currency:'EUR':'symbol' }}           <!-- €1.234,56 -->
{{ percentuale | percent }}                     <!-- 85% -->
{{ oggetto | json }}                            <!-- { "a": 1, "b": 2 } -->
```

**Pipe personalizzate:**

```typescript
@Pipe({ name: 'evidenzia' })
export class EvidenziaPipe implements PipeTransform {
  transform(valore: string, ricerca: string): string {
    return valore.replace(ricerca, `<mark>${ricerca}</mark>`);
  }
}
```

### 13.8 Direttive Angular

Angular definisce tre tipi di direttive:

#### 13.8.1 Componenti

I componenti sono tecnicamente direttive con un template associato.

#### 13.8.2 Direttive Strutturali

Le **direttive strutturali** modificano la struttura del DOM aggiungendo, rimuovendo o sostituendo elementi. Si riconoscono dal prefisso `*`:

```html
<!-- *ngIf: aggiunge/rimuove elemento dal DOM -->
<p *ngIf="utente.isAdmin">Sezione amministratore</p>
<p *ngIf="isLoggedIn; else loginTemplate">Benvenuto!</p>
<ng-template #loginTemplate><p>Effettua il login</p></ng-template>

<!-- *ngSwitch -->
<div [ngSwitch]="colore">
  <p *ngSwitchCase="'rosso'">Rosso</p>
  <p *ngSwitchCase="'blu'">Blu</p>
  <p *ngSwitchDefault>Altro</p>
</div>

<!-- *ngFor: ripete un elemento per ogni item della lista -->
<li *ngFor="let prodotto of prodotti; index as i; odd as isDispari">
  {{ i + 1 }}. {{ prodotto.nome }}
</li>
```

#### 13.8.3 Direttive Attributo

Le **direttive attributo** modificano l'aspetto o il comportamento di un elemento esistente senza modificare il DOM:

```html
<!-- ngClass: manipolazione dinamica delle classi CSS -->
<div [ngClass]="{ 'attivo': isAttivo, 'disabilitato': isDisabilitato }">
  Contenuto
</div>

<!-- ngStyle: impostazione dinamica degli stili CSS -->
<div [ngStyle]="{ 'color': coloreFont, 'font-size': dimensione + 'px' }">
  Testo stilizzato
</div>

<!-- ngNonBindable: disabilita la compilazione del binding per una sezione -->
<p ngNonBindable>{{ questo non verrà interpretato }}</p>

<!-- ng-container: raggruppamento senza output DOM -->
<ng-container *ngFor="let item of lista">
  <p>{{ item.titolo }}</p>
  <p>{{ item.descrizione }}</p>
</ng-container>
```

### 13.9 Servizi e Dependency Injection

#### 13.9.1 Servizi

I **servizi** in Angular sono classi con uno scopo specifico (caricamento dati, logging, autenticazione, ecc.) progettate per essere riutilizzate tra più componenti. A differenza dei componenti, i servizi non hanno un template associato.

```typescript
@Injectable({
  providedIn: 'root'  // Servizio disponibile a tutta l'applicazione
})
export class DatiService {
  private dati: string[] = [];

  aggiungi(elemento: string): void {
    this.dati.push(elemento);
  }

  ottieni(): string[] {
    return this.dati;
  }
}
```

#### 13.9.2 Dependency Injection

La **Dependency Injection** (DI) è un pattern di progettazione in cui le dipendenze di un oggetto vengono fornite dall'esterno invece che create internamente. Angular ha un sistema DI integrato:

- Angular legge i tipi dei parametri del constructor per determinare quali servizi iniettare.
- L'**Injector** mantiene un container di istanze di servizi.
- La DI è **gerarchica**: segue la gerarchia dei componenti.

```typescript
@Component({ ... })
export class MioComponente {
  constructor(
    private datiService: DatiService,  // Angular inietta automaticamente
    private router: Router
  ) { }
}
```

**Scope dell'iniezione:**
- Dichiarato nel **modulo radice** (o con `providedIn: 'root'`): un'unica istanza condivisa da tutta l'applicazione (singleton).
- Dichiarato nel **decorator di un componente** (`providers` nel `@Component`): un'istanza per ogni istanza del componente e dei suoi figli.

### 13.10 Reactive Forms e HTTP

#### 13.10.1 Forms

Angular offre un sistema robusto per la gestione dei form:

- **`FormControl`**: wrappa un singolo elemento di input e mantiene il suo stato (valore, validità, dirty/pristine, touched/untouched).
- **`FormGroup`**: raccolta di FormControl che formano un form completo.
- **Validators**: funzioni di validazione built-in (`required`, `minLength`, `maxLength`, `pattern`, `email`) e personalizzate.

```typescript
this.loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required, Validators.minLength(8)])
});
```

#### 13.10.2 HTTP e Observables

Angular utilizza la libreria **RxJS** per la gestione delle operazioni asincrone, basandosi su **Observable** invece di Promise o callback tradizionali.

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) { }

  getProdotti(): Observable<Prodotto[]> {
    return this.http.get<Prodotto[]>('/api/prodotti');
  }

  creaProdotto(prodotto: Prodotto): Observable<Prodotto> {
    return this.http.post<Prodotto>('/api/prodotti', prodotto);
  }
}
```

**Confronto tra approcci asincroni:**

| Approccio | Caratteristiche |
|-----------|----------------|
| Callback | Più antico; porta al "callback hell" nelle operazioni concatenate |
| Promise | ES6+; gestisce un singolo valore futuro; più leggibile dei callback |
| Observable (RxJS) | Gestisce stream di valori; componibile con operatori; cancellabile; scelto da Angular |

### 13.11 Routing

Il **Router** di Angular gestisce la navigazione tra le viste dell'applicazione SPA:

```typescript
// Definizione delle routes
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'prodotti', component: ProdottiComponent },
  { path: 'prodotti/:id', component: DettaglioProdottoComponent },
  { path: '**', component: NotFoundComponent } // Wildcard route
];
```

```html
<!-- Nel template principale -->
<nav>
  <a routerLink="/">Home</a>
  <a routerLink="/prodotti">Prodotti</a>
</nav>

<!-- Outlet dove Angular renderizza il componente della route corrente -->
<router-outlet></router-outlet>
```

### 13.12 Sviluppo Mobile con NativeScript

**NativeScript** è un framework open source per lo sviluppo di applicazioni mobile native (iOS e Android) usando JavaScript/TypeScript e Angular. A differenza delle web app mobile (che usano una WebView), NativeScript renderizza componenti UI nativi del sistema operativo, garantendo performance e aspetto nativi.

---
## Capitolo 14 — MongoDB e Node.js in Container Docker

### 14.1 Introduzione e Obiettivi

Questo capitolo illustra la realizzazione di un'applicazione web composta da due servizi containerizzati comunicanti: un server **Node.js + Express** e un database **MongoDB**, orchestrati con **Docker Compose**. Il materiale è tratto dal seminario tenuto dal Prof. Vittorio Ghini il 30/10/2024 nell'ambito del corso ASW.

**Architettura dell'applicazione:** l'applicazione espone tre endpoint HTTP:
- `POST /submit`: accetta due sequenze (`seq1`, `seq2`), ne calcola l'allineamento (`as1`, `as2`), salva la quaterna nel database e la restituisce al client.
- `GET /show`: restituisce il contenuto completo del database.
- `GET /`: restituisce un modulo HTML per l'inserimento delle sequenze.

**Struttura dei container:**
- Container `nodejsapp`: server Node.js, porta 3000, connesso alle reti `interna` ed `esterna`.
- Container `mongodb`: database MongoDB, porta 27017, connesso solo alla rete `interna` (non raggiungibile direttamente dall'esterno).

La rete `interna` è una rete Docker virtuale privata tra i container; la rete `esterna` espone `nodejsapp` all'host e al mondo esterno.

### 14.2 Installazione di Docker su Ubuntu

Docker può essere installato su Ubuntu con i seguenti comandi:

```bash
# Installazione prerequisito
sudo apt-get install curl

# Download e installazione dello script ufficiale Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verifica installazione di Docker Compose (v2 è integrato in Docker)
docker compose version
# Output atteso: Docker Compose version v2.29.7

# Aggiunta dell'utente corrente al gruppo docker
# (permette di eseguire comandi docker senza sudo)
sudo usermod -aG docker ${USER}
```

**Nota**: dopo `usermod`, occorre effettuare il logout e il login per rendere effettiva la modifica.

### 14.3 Reti Virtuali Docker

Docker permette di creare reti virtuali per isolare la comunicazione tra container. La distinzione tra rete `interna` ed `esterna` è fondamentale per la sicurezza dell'architettura.

```bash
# Rete interna: bridge isolato, NON raggiungibile dall'host
docker network create -d bridge --internal interna

# Rete esterna: bridge normale, raggiungibile dall'host
docker network create -d bridge esterna
```

**DNS Docker**: i container connessi alla stessa rete Docker si risolvono per nome. Questo significa che il server Node.js può connettersi al MongoDB usando il nome `mongodb` (nome del container/servizio) nell'URL di connessione, senza dover conoscere l'indirizzo IP del container (che può cambiare ad ogni riavvio).

### 14.4 Problema dei Volumi MongoDB e Soluzione

#### 14.4.1 Il Problema

L'immagine ufficiale MongoDB (`mongo:8.0.1-noble`) crea automaticamente due **volumi anonimi** per la persistenza dei dati:
- `/data/db` — i dati del database
- `/data/configdb` — la configurazione

Questi volumi vengono creati al di fuori del container filesystem (nell'area di storage di Docker sull'host). Questo causa due problemi nel contesto del progetto ASW:

1. **Non consegnabili**: i volumi persistono sull'host ma non possono essere facilmente inclusi nel pacchetto del progetto da consegnare.
2. **Non rimuovibili dall'immagine**: non è possibile rimuovere i volumi da un'immagine Docker standard senza procedure speciali.

#### 14.4.2 La Soluzione: FORCE_CREATE_NOVOLUME_BASE_IMAGE.sh

Lo script `FORCE_CREATE_NOVOLUME_BASE_IMAGE.sh` crea un'immagine MongoDB personalizzata (`mongonovolume`) priva di volumi anonimi:

```bash
#!/bin/bash
# 1. Avvia il container originale MongoDB
docker run -itd --name temp_mongo mongo:8.0.1-noble

# 2. Trova gli ID dei volumi anonimi creati
VOLUMES=$(docker inspect temp_mongo --format '{{range .Mounts}}{{.Name}} {{end}}')

# 3. Ferma il container (non rimuovere)
docker stop temp_mongo

# 4. Esporta il filesystem del container come tar (SENZA i volumi)
docker export temp_mongo > mongonovolume.tar

# 5. Importa il tar come nuova immagine
docker import mongonovolume.tar mongonovolume

# 6. Pulizia
docker rm temp_mongo
rm mongonovolume.tar
for VOL in $VOLUMES; do docker volume rm $VOL; done
```

**Differenza fondamentale tra `docker export` e `docker save`:**
- `docker export`: esporta il **filesystem del container** (snapshot dello stato del container), senza i volumi montati e senza i metadati dell'immagine (layer history).
- `docker save`: esporta l'**immagine Docker** con tutti i layer e i metadati; utilizzato per trasferire immagini tra host.

### 14.5 Dockerfile per MongoDB Personalizzato

Con l'immagine `mongonovolume` come base, si costruisce l'immagine `mymongo` che include il file di inizializzazione del database:

```dockerfile
FROM mongonovolume

# Copia lo script di inizializzazione del database
COPY ./mydbinit.js /docker-entrypoint-initdb.d/

WORKDIR /usr/local/bin/

# Assegna i permessi necessari
RUN chmod 777 /docker-entrypoint-initdb.d/ mydbinit.js

EXPOSE 27017 27018 27019

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mongod"]
```

**Meccanismo di inizializzazione MongoDB**: i file (`.sh` o `.js`) presenti in `/docker-entrypoint-initdb.d/` vengono eseguiti automaticamente dal container MongoDB **alla prima esecuzione** (quando il database è vuoto). Il file `mydbinit.js` crea il database `dbsa` e la collezione `alignments`:

```javascript
// mydbinit.js
var conn = new Mongo();
var db = conn.getDB('dbsa');
db.createCollection('alignments');
```

**Build dell'immagine:**

```bash
docker build -t "mymongo" .
```

### 14.6 Esecuzione e Debug del Container MongoDB

#### 14.6.1 Avvio del Container

```bash
docker run -itd \
  --network interna \
  -p 27017-27019:27017-27019 \
  --name mongodb \
  mymongo
```

Parametri:
- `-itd`: interattivo + terminale + detached (background).
- `--network interna`: connette alla rete interna.
- `-p 27017-27019:27017-27019`: espone le porte MongoDB (necessario per debug dall'esterno).
- `--name mongodb`: nome del container (usato dal DNS Docker).

#### 14.6.2 Verifica e Debug

```bash
# Controlla i log del container (errori di avvio, ecc.)
docker logs mongodb

# Accede alla shell MongoDB dall'interno del container
docker exec -it mongodb /usr/bin/mongosh

# Comandi mongosh utili
use dbsa
db.alignments.find()
db.alignments.count()
```

**Debug dall'esterno del container** (richiede che la porta sia esposta con `-p` e che il container sia su una rete non-internal):

```bash
mongosh --host 0.0.0.0 --port 27017
```

#### 14.6.3 Salvataggio dello Stato del Database

Quando si vuole preservare i dati presenti nel database (ad esempio, dati di test inseriti durante lo sviluppo), è possibile committare lo stato del container come nuova immagine:

```bash
# script: commit_mongo_image.sh
docker stop mongodb
docker commit -m "saved mongo" -a "nome_autore" mongodb mymongo.1
docker rm mongodb

# Aggiorna l'immagine mymongo con lo stato salvato
docker rmi mymongo
docker tag mymongo.1 mymongo
docker rmi mymongo.1
```

Dopo questo script, il container `mongodb` è stato rimosso ma la sua versione aggiornata è disponibile come immagine `mymongo`. La prossima esecuzione di `docker run ... mymongo` partirà con i dati già presenti.

### 14.7 Applicazione Node.js: Struttura e Codice

#### 14.7.1 Struttura del Progetto Node.js

```
./app/
    index.js                          # Entry point del server
    package.json                      # Dipendenze NPM
    src/
        controllers/
            controller.js             # Logica di business
        lib/
            sequences_alignment.js    # Algoritmo di allineamento
        routes/
            routes.js                 # Definizione delle route Express
        models/
            alignmentModels.js        # Schema Mongoose
./Dockerfile                          # Dockerfile per il container Node.js
```

#### 14.7.2 Entry Point (index.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./src/routes/routes');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Connessione a MongoDB
// 'mongodb' è risolto dal DNS Docker al container mongodb
mongoose.connect('mongodb://mongodb/dbsa', {
  useNewUrlParser: true,
  useFindAndModify: false
});

// Registrazione delle route
routes(app);

// Avvio del server
app.listen(3000, function() {
  console.log('Node API server started on port 3000!');
});
```

**Attenzione critica**: nell'URL di connessione `mongodb://mongodb/dbsa`:
- Il primo `mongodb` dopo `://` è il **protocollo** (URI scheme).
- Il secondo `mongodb` (dopo `://`) è il **nome host** — risolto dal DNS Docker al container chiamato `mongodb`.
- `dbsa` è il nome del database.

### 14.8 Dockerfile per Node.js

```dockerfile
FROM ubuntu:focal

ENV WORKINGDIR=/root/app
WORKDIR ${WORKINGDIR}

# Copia il codice sorgente dell'applicazione
COPY ./app ${WORKINGDIR}/

# Installazione di Node.js e NPM
RUN apt-get -y update && \
    apt-get -y install nodejs npm && \
    apt-get -y clean

# Installazione delle dipendenze NPM
RUN npm install

EXPOSE 3000

# Avvio del server
CMD nodejs index.js
```

**Build dell'immagine:**

```bash
docker build -t "nodejsapp" .
```

### 14.9 Esecuzione del Container Node.js

```bash
# Avvio sulla rete interna con esposizione della porta 3000
docker run -itd \
  --rm \
  --network interna \
  --name nodejsapp \
  -p 3000:3000 \
  nodejsapp

# Connessione alla rete esterna (per accesso dall'host)
docker network connect esterna nodejsapp
```

**`--rm`**: rimuove automaticamente il container quando viene fermato (utile in sviluppo per non accumulare container fermi).

**Test dell'applicazione:**

```bash
# Test POST /submit
curl \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --request POST \
  --data 'seq1=ABC&seq2=DEF' \
  http://0.0.0.0:3000/submit

# Test GET /show
curl http://0.0.0.0:3000/show

# Test GET /
curl http://0.0.0.0:3000/
```

### 14.10 Docker Compose: Orchestrazione Automatizzata

Docker Compose permette di definire e avviare applicazioni multi-container con un singolo file di configurazione `docker-compose.yml`.

#### 14.10.1 Struttura del docker-compose.yml

```yaml
services:
  nodejsapp:
    build:
      context: ./nodejs
      dockerfile: Dockerfile
    image: nodejsapp
    command: [ "nodejs", "index.js" ]
    depends_on:
      - mongodb
    ports:
      - 3000:3000
    networks:
      - interna
      - esterna

  mongodb:
    build:
      context: ./mongodb
      dockerfile: Dockerfile
    image: mymongo
    command: [ "docker-entrypoint.sh", "mongod" ]
    networks:
      - interna

networks:
  interna:
    driver: bridge
    internal: true
  esterna:
    driver: bridge
    internal: false
```

**Problema di timing**: `depends_on` garantisce solo che il container `mongodb` sia **avviato** prima di `nodejsapp`, ma non che MongoDB sia **pronto** ad accettare connessioni. La soluzione adottata è aggiungere una pausa di 10 secondi nel codice Node.js prima del tentativo di connessione a MongoDB:

```javascript
// In index.js, prima di mongoose.connect()
await new Promise(resolve => setTimeout(resolve, 10000));
```

#### 14.10.2 Convenzioni di Naming di Docker Compose

Docker Compose usa il **nome del progetto** come prefisso per tutti i container e le reti creati. Il nome del progetto si imposta con la variabile `COMPOSE_PROJECT_NAME` nel file `.env`:

```bash
# .env
COMPOSE_PROJECT_NAME=aswl4
```

Con questo prefisso:
- Container: `aswl4-nodejsapp-1`, `aswl4-mongodb-1`
- Reti: `aswl4-interna-1`, `aswl4-esterna-1`
- **Hostname interno** (usato dal DNS Docker): `nodejsapp`, `mongodb` (il nome del servizio, senza prefisso)

### 14.11 Packaging e Trasferimento del Progetto

Per consegnare il progetto in modo completo e riproducibile:

```bash
# 1. Build di tutte le immagini
docker compose build

# 2. Salvataggio delle immagini come tar
docker save nodejsapp > nodejsapp_save.tar
docker save mymongo   > mymongo_save.tar

# 3. Archivio del progetto completo (codice + immagini)
cd ../
tar cvzf ASWl4_saved.tgz ASWl4/
```

**Ripristino su un altro sistema:**

```bash
# 1. Estrazione dell'archivio
tar xvzf ASWl4_saved.tgz
cd ASWl4/

# 2. Caricamento delle immagini in Docker
docker load < mymongo_save.tar
docker load < nodejsapp_save.tar

# 3. Avvio dell'applicazione
docker compose up -d
```

### 14.12 Riepilogo dei Comandi Docker

#### Ciclo di Vita dell'Applicazione

```bash
# ============================================================
# BUILD
# ============================================================
# Crea l'immagine MongoDB senza volumi anonimi
./mongodb/FORCE_CREATE_NOVOLUME_BASE_IMAGE.sh

# Costruisce tutte le immagini definite in docker-compose.yml
docker compose build

# ============================================================
# ESECUZIONE
# ============================================================
# Avvia tutti i servizi in background
docker compose up -d

# ============================================================
# UTILIZZO
# ============================================================
# Invia dati (POST)
curl --header "Content-Type: application/x-www-form-urlencoded" \
     --request POST \
     --data 'seq1=LANCIA&seq2=DELTA' \
     http://0.0.0.0:3000/submit

# Visualizza dati (GET)
curl http://0.0.0.0:3000/show

# ============================================================
# SALVATAGGIO STATO MONGODB
# ============================================================
docker compose stop
docker commit -m "saved" -a "autore" aswl4-mongodb-1 mymongo.1
docker compose down
docker rmi mymongo
docker tag mymongo.1 mymongo
docker rmi mymongo.1

# ============================================================
# DISTRUZIONE COMPLETA
# ============================================================
# Ferma, rimuove container e reti, rimuove immagini
docker compose down --rmi all

# ============================================================
# SVILUPPO: aggiornare solo nodejsapp
# ============================================================
docker compose stop nodejsapp
docker compose rm -f nodejsapp
# ... modifica il codice ...
docker compose build nodejsapp
docker compose up -d nodejsapp
```

---

## Capitolo 15 — Sviluppo Web Sostenibile

### 15.1 Il Concetto di Sostenibilità

La sostenibilità è definita nella Commissione Brundtland (1987):

> *"La sostenibilità è la capacità di soddisfare i bisogni del presente senza compromettere la possibilità delle future generazioni di soddisfare i propri."*

Questa definizione, elaborata in "Our Common Future" (Rapporto Brundtland, WCED), ha posto le basi per la moderna agenda dello sviluppo sostenibile.

#### 15.1.1 I Tre Pilastri della Sostenibilità

La sostenibilità si articola in tre dimensioni interconnesse e complementari:

- **Ambientale**: preservazione degli ecosistemi, riduzione delle emissioni, uso responsabile delle risorse naturali.
- **Economico**: crescita economica inclusiva, benessere materiale, modelli di business sostenibili nel lungo periodo.
- **Sociale**: equità, giustizia, coesione sociale, accesso alle opportunità per tutti.

I tre pilastri non sono indipendenti: la sostenibilità ambientale è prerequisito per la sostenibilità economica e sociale nel lungo termine.

#### 15.1.2 Agenda 2030 e gli SDG

Il **25 settembre 2015**, l'Assemblea Generale delle Nazioni Unite ha adottato la risoluzione "Trasformare il nostro mondo: l'Agenda 2030 per lo Sviluppo Sostenibile", sottoscritta da 193 paesi.

L'Agenda 2030 definisce **17 Obiettivi di Sviluppo Sostenibile** (*Sustainable Development Goals* — SDG):

1. Sconfiggere la povertà
2. Sconfiggere la fame
3. Salute e benessere
4. Istruzione di qualità
5. Parità di genere
6. Acqua pulita e igiene
7. Energia pulita e accessibile
8. Lavoro dignitoso e crescita economica
9. Industria, innovazione e infrastrutture
10. Ridurre le disuguaglianze
11. Città e comunità sostenibili
12. Consumo e produzione responsabili
13. Lotta contro il cambiamento climatico
14. Vita sott'acqua
15. Vita sulla terra
16. Pace, giustizia e istituzioni solide
17. Partnership per gli obiettivi

Gli SDG sono **universali** (si applicano a tutti i paesi, non solo a quelli in via di sviluppo) ma **non vincolanti giuridicamente**.

**Le 5P dello Sviluppo Sostenibile:** People (Persone), Planet (Pianeta), Prosperity (Prosperità), Peace (Pace), Partnership.

### 15.2 L'Impatto del Web sull'Ambiente

#### 15.2.1 Dati sull'Impronta Carbonica di Internet

- Internet è responsabile di circa il **4% delle emissioni globali di CO₂** — una percentuale paragonabile all'intera industria aeronautica.
- Ogni singola ricerca su Google genera tra **1g e 10g di CO₂**; con circa 3,5 miliardi di ricerche al giorno, si tratta di migliaia di tonnellate di CO₂ quotidiane.
- I siti web emettono in media **1,76g di CO₂ per ogni pagina visitata**.
- Per confronto: i trasporti generano circa l'8% delle emissioni globali; il traffico aereo circa il 2%; una sigaretta equivale a circa 14g di CO₂.

#### 15.2.2 Le Variabili di Impatto Ambientale del Web

Le principali variabili che determinano l'impatto ambientale di un sito web o servizio digitale sono:

- **Acqua**: i data center richiedono grandi quantità d'acqua per il raffreddamento dei server.
- **Energia**: consumata dal client (dispositivo dell'utente), dal server, e dalla rete di trasmissione.
- **Rifiuti elettronici (e-waste)**: dispositivi obsoleti, apparecchiature di rete dismesse.

### 15.3 Il Contesto Sociale e Normativo

#### 15.3.1 Sensibilità Pubblica

- Il fenomeno del **greenwashing** (comunicare iniziative ambientali false o esagerate) è sempre più denunciato da consumatori e media.
- I brand con politiche etiche e sostenibili godono di maggiore fiducia del pubblico.
- Il giornalismo di dati monitora e pubblica le emissioni digitali dei principali servizi web.

#### 15.3.2 Quadro Normativo

**Standard e best practice:**
- **GRI** (Global Reporting Initiative): standard internazionali per il reporting di sostenibilità.
- **ISO 14001**: standard per i sistemi di gestione ambientale.
- **GR491** e **SDGs**: framework di best practice.

**Regolamenti:**
- **CSRD** (Corporate Sustainability Reporting Directive): direttiva UE che obbliga le grandi aziende a rendicontare la propria sostenibilità.
- **ESRS** (European Sustainability Reporting Standards): standard tecnici per l'implementazione della CSRD.
- **GCD** (Green Claims Directive): regola come le aziende comunicano le proprie credenziali ambientali.

### 15.4 Il Sustainable Web Manifesto

Il [Sustainable Web Manifesto](https://www.sustainablewebmanifesto.com/) definisce sei principi per un web più sostenibile:

1. **Clean** (Pulito): i siti web e i servizi che creiamo saranno alimentati da fonti di energia rinnovabile.
2. **Efficient** (Efficiente): utilizzeremo la minima quantità di energia e risorse materiali possibile.
3. **Open** (Aperto): i servizi che creiamo saranno accessibili, permetteranno il libero scambio di informazioni e rispetteranno il controllo dei dati da parte degli utenti.
4. **Honest** (Onesto): i servizi che creiamo non inganneranno né sfrutteranno gli utenti a vantaggio delle aziende creatici.
5. **Regenerative** (Rigenerativo): i servizi che creiamo supporteranno un'economia che nutre le persone e il pianeta.
6. **Resilient** (Resiliente): i servizi che creiamo funzioneranno quando le persone ne hanno bisogno.

### 15.5 Il W3C Sustainable Web Design Community Group

Il **W3C Sustainable Web Design Community Group** è un gruppo di lavoro della comunità W3C dedicato alla sostenibilità del web:

- Sito ufficiale: [https://www.w3.org/community/sustyweb/](https://www.w3.org/community/sustyweb/)
- Conta oltre **200 partecipanti** da tutto il mondo.
- Chair: **Tim Frick** e **Alexander Dawson**.

Il gruppo ha prodotto le **Web Sustainability Guidelines (WSG)**.

### 15.6 Web Sustainability Guidelines (WSG)

Le **Web Sustainability Guidelines** sono una raccolta di **94 raccomandazioni** per la creazione di prodotti digitali più sostenibili dal punto di vista ambientale, economico e sociale.

La struttura si ispira direttamente alle **WCAG** (Web Content Accessibility Guidelines): ogni guideline comprende criteri di successo, scala di impatto ed effort, benefici per le diverse tipologie di stakeholder, metriche di reporting (GRI), esempi pratici e risorse di approfondimento.

Le WSG sono organizzate in **quattro categorie principali**:

| Categoria | Numero | Linee guida |
|-----------|--------|------------|
| UX Design Guidelines | 2.x | 29 linee guida |
| Web Development Guidelines | 3.x | 24 linee guida |
| Hosting & Infrastructure Guidelines | 4.x | 12 linee guida |
| Business & Product Strategies Guidelines | 5.x | 29 linee guida |

### 15.7 UX Design Guidelines (2.x)

Le linee guida di UX Design riguardano le scelte progettuali dell'interfaccia che hanno impatto sulla sostenibilità:

**2.2 — Assess and Research Visitor Needs**
- *Impatto*: Medio | *Effort*: Alto
- Prima di progettare, ricercare le reali necessità degli utenti evita di costruire funzionalità non utilizzate che consumano risorse inutilmente.

**2.4 — Consider Sustainability in Early Ideation**
- *Impatto*: Basso | *Effort*: Basso
- Incorporare la sostenibilità fin dalle prime fasi (wireframe, paper prototyping) è molto meno costoso che rimediare a posteriori.

**2.10 — Use Recognized Design Patterns**
- *Impatto*: Medio | *Effort*: Basso
- L'uso di pattern di interazione riconosciuti riduce la curva di apprendimento degli utenti e quindi il tempo (e l'energia) necessari a completare le loro attività.

**2.11 — Avoid Manipulative Patterns**
- *Impatto*: Alto | *Effort*: Medio
- I **dark pattern** (pattern ingannevoli) — come i cookie banner ingannevoli, la sottoscrizione nascosta, i countdown falsi — spingono gli utenti a interazioni non desiderate, generando traffico e dati non necessari. Sono contrari al principio di onestà del Sustainable Web Manifesto.

**2.15 — Sustainable Approach to Image Assets**
- *Impatto*: Alto | *Effort*: Basso
- Le immagini rappresentano la principale fonte di spreco di banda web. Le azioni raccomandate includono:
  - **Lazy loading**: caricare le immagini solo quando entrano nel viewport.
  - **Ottimizzazione**: ridurre la qualità delle immagini al minimo accettabile.
  - **Compressione**: usare formati efficienti come WebP o AVIF invece di JPEG/PNG.
  - **Responsive images**: servire dimensioni appropriate al dispositivo dell'utente.

**2.19 — Provide Alternatives to Web Assets**
- *Impatto*: Medio | *Effort*: Medio
- Offrire alternative testuali a video, audio e immagini riduce il consumo di banda per chi ne ha bisogno.

**2.20 — Provide Accessible, Usable, Minimal Web Forms**
- *Impatto*: Basso | *Effort*: Basso
- Form ben progettati con meno campi necessari e validazione inline riducono il numero di tentativi di invio falliti e i round-trip al server.

### 15.8 Web Development Guidelines (3.x)

Le linee guida di sviluppo web riguardano le pratiche tecniche degli sviluppatori:

**3.1 — Identify Relevant Technical Indicators**
- *Impatto*: Medio | *Effort*: Medio
- Monitorare metriche come il numero di richieste HTTP, le dimensioni del DOM, il peso delle pagine, il Time to Interactive (TTI).

**3.2 — Minify HTML, CSS, JavaScript**
- *Impatto*: Basso | *Effort*: Basso
- La minificazione (rimozione di spazi, commenti, abbreviazione di nomi di variabili) riduce le dimensioni dei file e il tempo di trasferimento.

**3.3 — Use Code-Splitting**
- *Impatto*: Medio | *Effort*: Basso
- Suddividere il bundle JavaScript in moduli caricati su richiesta (*lazy loading*) riduce il payload iniziale della pagina.

**3.4 — Apply Tree Shaking**
- *Impatto*: Medio | *Effort*: Medio
- Il **tree shaking** è una tecnica dei bundler moderni (webpack, Rollup) che elimina automaticamente il codice JavaScript non referenziato (*dead code elimination*). Riduce significativamente le dimensioni del bundle finale.

**3.5 — Ensure Accessibility**
- *Impatto*: Alto | *Effort*: Medio
- La conformità alle **WCAG** (Web Content Accessibility Guidelines) e l'uso di **ARIA** (Accessible Rich Internet Applications) garantisce che il sito sia usabile da tutti, riducendo il numero di tentativi falliti e il traffico generato da interazioni errate.

**3.6 — Avoid Code Duplication**
- *Impatto*: Medio | *Effort*: Medio
- Principi da seguire: **DRY** (*Don't Repeat Yourself*), **BEM** (*Block Element Modifier* per i CSS), evitare il pattern **WET** (*Write Everything Twice*).

**3.7 — Rigorously Assess Third-Party Services**
- *Impatto*: Alto | *Effort*: Medio
- Librerie di terze parti, font hosting, analytics, social widget e script di monitoraggio hanno spesso una grande impronta ambientale. Generano richieste HTTP aggiuntive, rallentano la pagina e appartengono alla **Scope 3** delle emissioni (catena del valore). Ogni dipendenza esterna deve essere valutata criticamente.

**3.8 — Use HTML Elements Correctly**
- *Impatto*: Medio | *Effort*: Medio
- L'**HTML semantico** (uso corretto di `<nav>`, `<main>`, `<article>`, `<aside>`, ecc.) migliora l'accessibilità, favorisce il corretto funzionamento degli screen reader e riduce la necessità di JavaScript aggiuntivo per comunicare la struttura della pagina.

**3.9 — Resolve Render Blocking Content**
- *Impatto*: Medio | *Effort*: Basso
- Il rendering della pagina viene bloccato finché script e CSS non sono completamente scaricati e parsati. Le soluzioni includono:
  - `defer`: scarica lo script in parallelo ma lo esegue dopo il parsing HTML.
  - `async`: scarica ed esegue lo script non appena disponibile.
  - **Lazy loading** per immagini e iframe.
  - CSS critico inline + caricamento asincrono del resto del CSS.

**3.13 — Adapt to User Preferences**
- *Impatto*: Medio | *Effort*: Basso
- Le **CSS Media Preference Queries** permettono di rispettare le impostazioni di sistema dell'utente:
  - `prefers-color-scheme: dark` — tema scuro (risparmio energetico su OLED).
  - `prefers-reduced-motion: reduce` — animazioni ridotte (accessibilità + performance).
  - `prefers-reduced-data: reduce` — contenuti ridotti (risparmio banda).
  - `prefers-contrast: more` — contrasto elevato.

**3.14 — Develop Mobile-First Layout**
- *Impatto*: Medio | *Effort*: Basso
- Il design **mobile-first** (partire dal layout per schermi piccoli e poi espandere) produce CSS più snello e garantisce che i contenuti essenziali vengano caricati su tutti i dispositivi. Il **carbon-aware design** considera che diversi dispositivi hanno diversa efficienza energetica.

**3.15 — Use Beneficial JavaScript and APIs**
- *Impatto*: Alto | *Effort*: Medio
- Usare JavaScript solo dove aggiunge valore reale. Preferire le API native del browser (Intersection Observer, Resize Observer, ecc.) alle librerie JavaScript che replicano le stesse funzionalità.

**3.16 — Ensure Scripts Are Secure**
- *Impatto*: Medio | *Effort*: Medio
- Script non sicuri possono essere vettori di attacchi (XSS, code injection) che compromettono la confidenzialità degli utenti e causano traffico malevolo. La sicurezza è un componente della sostenibilità digitale.

**3.17 — Manage Dependencies Appropriately**
- *Impatto*: Medio | *Effort*: Basso
- Aggiornare regolarmente le dipendenze, rimuovere quelle non usate, preferire dipendenze più leggere quando equivalenti.

**3.21 — Align Technical Requirements with Sustainability**
- *Impatto*: Medio | *Effort*: Medio
- Scegliere la soluzione tecnica appropriata al caso d'uso: un **Static Site Generator (SSG)** è molto più efficiente di un CMS dinamico per contenuti che cambiano raramente. Il sito statico non richiede computazione server per ogni richiesta.

**3.22 — Use Latest Stable Language Version**
- *Impatto*: Medio | *Effort*: Medio
- Le versioni più recenti dei linguaggi e runtime sono generalmente più efficienti delle versioni precedenti.

**3.23 — Take Advantage of Native Features**
- *Impatto*: Medio | *Effort*: Basso
- Preferire le funzionalità native del browser (form validation HTML5, Date input, geolocalizzazione nativa, ecc.) alle implementazioni JavaScript equivalenti.

**3.24 — Run Fewer, Simpler Queries**
- *Impatto*: Medio | *Effort*: Basso
- Ottimizzare le query al database: ridurne il numero, usare indici, evitare N+1 queries, implementare caching dove appropriato.

### 15.9 Hosting & Infrastructure Guidelines (4.x)

Le 12 linee guida di hosting e infrastruttura riguardano le scelte infrastrutturali:

| Guideline | Titolo |
|-----------|--------|
| 4.1 | Choose Sustainable Hosting Provider — Scegliere provider alimentati da energie rinnovabili |
| 4.2 | Optimize Browser Caching — Configurare header HTTP per il caching ottimale |
| 4.3 | Compress Files — Compressione Gzip/Brotli dei file trasferiti |
| 4.4 | Error Pages and Redirects — Minimizzare redirect, gestire 404 efficientemente |
| 4.5 | Limit Additional Environments — Non mantenere ambienti di test/staging non necessari |
| 4.6 | Automate to Fit Needs — Scalare automaticamente in base alla domanda effettiva |
| 4.7 | Maintain Relevant Refresh Frequency — Non aggiornare contenuti più frequentemente di quanto necessario |
| 4.8 | Be Mindful of Duplicate Data — Evitare la duplicazione dei dati in storage e backup |
| 4.9 | Enable Async Processing — Usare code di messaggi per elaborazioni non urgenti |
| 4.10 | CDNs and Edge Caching — Distribuire i contenuti geograficamente vicino agli utenti |
| 4.11 | Use Lowest Infrastructure Tier — Non sovra-dimensionare l'infrastruttura |
| 4.12 | Store Data According to Visitor Needs — Conservare solo i dati strettamente necessari |

### 15.10 Business & Product Strategies Guidelines (5.x)

Le 29 linee guida di strategia aziendale e di prodotto riguardano le decisioni organizzative e strategiche:

Tra le più rilevanti:
- **5.1** — Ethical/Sustainability Product Strategy: integrare la sostenibilità nella strategia di prodotto.
- **5.14** — Establish if Digital Product is Necessary: valutare se il prodotto digitale aggiunge davvero valore o se potrebbe essere sostituito da alternative non digitali più sostenibili.
- **5.20** — Promote Responsible Data Practices: minimizzare la raccolta di dati, favorire la privacy by design.
- **5.26** — E-Waste/Right-To-Repair: supportare il diritto alla riparazione dei dispositivi.
- **5.27** — Define Performance and Environmental Budgets: stabilire budget non solo per le performance (es. max 200KB di JavaScript), ma anche per le emissioni.
- **5.28** — Use Open Source Tools: preferire strumenti open source a quelli proprietari.

### 15.11 Strumenti per la Misurazione

**Website Carbon Calculator** (`websitecarbon.com`)
Strumento online che analizza un URL e stima le emissioni di CO₂ generate per ogni visita, classificando il sito rispetto alla media del web.

**Ecograder** (`ecograder.com`)
Valuta la sostenibilità di un sito web producendo un punteggio complessivo e dettagliato per categoria (rete, energia, performance, design), con suggerimenti specifici di miglioramento.

### 15.12 Il Web come Strumento per la Sostenibilità

Oltre a *rendere il web sostenibile*, esiste la dimensione di *usare il web per la sostenibilità*:

**AI for Sustainable Development Goals (AI4SDGs) Think Tank**
- Sito: [https://ai-for-sdgs.academy/observatory](https://ai-for-sdgs.academy/observatory)
- Raccoglie ricerche e progetti sull'uso dell'intelligenza artificiale per il raggiungimento degli SDG.

**Quiz SDG personale**
- URL: [https://globalgoals.org/quiz](https://globalgoals.org/quiz)
- Permette di esplorare gli SDG in modo interattivo.

### 15.13 Riferimenti Bibliografici

- Greenwood, T. (2021). *Sustainable web design*. A Book Apart.
- McGovern, G. (2020). *World Wide Waste*.
- Shedroff, N. (2019). *Design Is the Solution*.
- Frick, T. (2016). *Designing for sustainability*. O'Reilly.
- Andersen, M. (2023). *Sustainable Web Design In 20 Lessons*.
- Falbe, T., Andersen, M., & Frederiksen, K. S. (2020). *Ethical design handbook*. Smashing Media.

---
