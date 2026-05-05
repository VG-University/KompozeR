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
