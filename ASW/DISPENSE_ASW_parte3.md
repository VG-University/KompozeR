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
