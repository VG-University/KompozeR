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
