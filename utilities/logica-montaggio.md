## Qui la descrizione di come voglio che funzioni il CAD service. 
### Potrebbe essere necessario revisionare i DB e i Payloads

## Nel seguente capitolo verrà descritta l'esperienza che dovrà avere l'utente, non la logica di backend

Voglio che il sito mi  permetta di lavorare per step. Devo essere vincolato per non commettere errori. 

> Come prima cosa quando entro nel configuratore devo configurare l'ambiente, questo significa che vado a definire l'ingombro massimo sotto forma di altezza e larghezza disponibile.
> Ad esempio se ho una parete larga 5 metri e alta 3 metri potro configurare la larghezza massima a 500 e l' altezza massima a 300. 
> Nota importante: come vincoli aggiuntivi ci saranno la larghezza minima definita come la larghezza del ripiano più piccolo, e l'altezza minima che sarà definita come la somma di piedino + spessore ripiano + terminale. 
---
> Definito l'ingombro massimo la visuale sarà una griglia compresa di assi X e Y in scala, in modo da descrivere tutta l'area. 
> A questo punto si sceglie la tipologia/Categoria (Tondp, Quadro o kube)
---
> Kompo si pò definire anche come insieme di colonne, dove possiamo definire come colonna, una struttura verticale composta da 4 piedini, 4 terminali, r ripiani e m = r*4 montanti ( *2 in caso di kube) e che se osservata dalla vista TOP o BOTTOM l'area ossrvata sarà la medesima del ripiano.
> Lo step successivo sarà quindi la scelta del numero di colonne volute e la loro larghezza.
> La scelta della larghezza delle singole colonne viene effettuata cliccando tra le misure possibili prese dal catalogo dei ripiani. (filtrato per categoria ovviamente).
---
> A questo punto la preparazione dell'ambiente è terminata e si può passare al design dello scaffale.

Scriviamo prima alcune note:
1. Avendo selezionato già la largezza delle colonne, sappiamo già quali ripiani farenno parte di quelle colonne, quindi non li andremo a selezionare in quanto sono già decisi
2. Ora si tratta solo di posizionare lo scaffale
3. Posso iniziare il design dalla colonna che preferisco
4. 2 colonne adiacenti hanno montanti in comune (quelli al centro) che intersecheranno sia i ripiani alla loro destra che alla loro sinistra. [ Vincolo 1]
5. [Vincolo 1] 2 ripiani adiacenti non possono avere la stessa altezza, ma devono alternarsi
6. I montanti non verranno posizionati dall'utente, ma saranno inseriti in automatico
7. Per posizionare i ripiani parto dal basso e definisco lo spazio tra la terra e il ripiano 1, poi dal ripiano 1 al 2, etc...

> Per il posizionamento dei ripiani voglio un sistema che prevede dei bottoni + e -:
> + significa aggiunta di un ripiano, - significa rimozione del ripiano. (questi bottoni saranno visibili solo dal ripiano più alto in quanto posso decidere di aggiungere un ripiano sopra di esso, o rimuovere l'ultimo)
> Premendo il tasto + potrò scegliere lo spazio selezionando le opzioni disponibili (tali opzioni sono le altezze dei montanti, o dei piedini nel caso del primo ripiano)
> Posso procedere facendo una colonna intera e poi passo alla successiva o andare in ordine sparso facendo crescere le colonne in parallelo. 

SCENARIO 1: 
- Ho fatto la prima colonna, vado a fare la seconda, nel posizionamento  del ripiano 1 colonna 2 posso selezionare un altezza minore o maggiore rispetto a quella del ripiano 1 colonna 1, per rispettaro il vincolo sopra citato.

SCENARIO 2: 
- Costruisco 1 colonna alla volta, devo impedire che si verifichi una condizione che mi impedisca di costruire la colonna successiva o quella dopo ancora. Ad esempio scegliendo solo la distanza minima non riesco a rispettare il vincolo 1. 

> I terminali hanno solo 1 misura, quindi anche quelli verranno messi in automatico al temine della progettazione. 

---
> Quando inserisco un nuovo ripiano aggiorno anche la lista dei componenti che popolano il carrello

## Frontend 
 Qui descrivo brevemente come vorrei il frontend: 

### Desktop / schermi "orizzontali" o grandi 

Nella versione visualizzabile da pc vorrei un riquadro sulla destra che mi faccia vedere la lista dei componenti aggiornata e il prezzo totale che si sta costruendo
Il core sarà poi centrale e grande: 
> Una griglia con esposti gli assi X e Y con sotto la casella dove impostare le loro dimensioni (compilabile solo all'inizio, se cambiata in corso d'opera resetta il progetto, quindi serve una doppia conferma prima di cambiare). 
> Sopra la lista della spesa, un piccolo menù che fa selezionare la categoria (TONDO, Quadro e Kube). Anche qui, cambiando in corso d'opera si resetta il progetto. 
> Sopra la griglia vorrei avere la gestione del numero di colonne e la loro larghezza (mi piacerebbe che il "riquadro" per la selezione della larghezza della colonna sia in corrispondenza della colonna stessa).

### Cellulare
Nella versione cellulare ci saranno un pò di differenze: 
> Lo scermo sarà diviso in 2, sopra la griglia e sotto la gestione. ovvero posso interagire con la griglia cliccando i tasti + e - o gli assi e la larghezza delle colonne, ma la selezione della grandezza o l'inserimento dei valori dimensionali degli assi verrà fatto nella metà in basso, così da lasciare sempre visibile la griglia. 
> in questo caso la lista della spesa sarà un' icona che se cliccata mostrerà un pop up con la lista. 

### note aggiuntive
Ovviamente in entrambi i casi ci sarà un tasto salva e le altre cose generali.

# LOGICA BACKEND

## Obiettivo backend

Il `cadService` deve comportarsi come un "motore di configurazione vincolata".
Il frontend guida l'utente per step, ma la verita' sulle regole vive nel backend.

Principio chiave:
- il frontend non decide mai se una configurazione e' valida;
- il backend espone solo operazioni ammesse nello stato corrente;
- ogni modifica viene validata da un constraint engine centralizzato.

---

## Unita' di misura e normalizzazione

Per evitare ambiguita':
- il backend lavora in millimetri (`mm`), interi;
- il frontend puo' mostrare centimetri o metri;
- ogni request viene normalizzata a `mm` prima della validazione.

Esempio:
- parete 5m x 3m -> `maxWidthMm=5000`, `maxHeightMm=3000`.

---

## Workflow a stati (step obbligati)

Proposta stato configurazione (`configuration.status`):

1. `DRAFT`
2. `ENVIRONMENT_DEFINED`
3. `CATEGORY_SELECTED`
4. `COLUMNS_DEFINED`
5. `DESIGN_IN_PROGRESS`
6. `READY_FOR_FINALIZE`
7. `FINALIZED`

Regole:
- non si puo' saltare uno stato;
- cambiare `environment` o `category` dopo `COLUMNS_DEFINED` richiede reset esplicito (double confirm lato UI, enforcement lato backend);
- in `FINALIZED` le operazioni di editing sono bloccate (serve riapertura esplicita o nuova bozza).

---

## Modello dominio backend (logico)

### 1) Environment

```json
{
	"maxWidthMm": 5000,
	"maxHeightMm": 3000,
	"minWidthMm": 600,
	"minHeightMm": 220,
	"unit": "mm"
}
```

`minWidthMm` e `minHeightMm` sono derivati da catalogo filtrato per categoria scelta.

### 2) ColumnPlan

```json
{
	"columnCount": 3,
	"columns": [
		{ "index": 0, "shelfWidthMm": 800 },
		{ "index": 1, "shelfWidthMm": 600 },
		{ "index": 2, "shelfWidthMm": 800 }
	]
}
```

### 3) ColumnDesign

Per ogni colonna, il backend salva solo le altezze cumulative dei ripiani:

```json
{
	"columnIndex": 1,
	"levelsMm": [420, 860, 1300],
	"shelfThicknessMm": 20
}
```

`levelsMm[n]` = quota da terra del ripiano `n`.
`shelfThicknessMm` = spessore del ripiano usato in quella colonna (o nel relativo sistema).

---

## Vincoli backend (invarianti)

### Vincoli geometrici globali

1. `sum(columnWidths) <= maxWidthMm`
2. l'altezza finale deve includere anche lo spessore dei ripiani:
	`max(levelsMm ultima quota per colonna + shelfThicknessMm + terminalHeightMm) <= maxHeightMm`
3. larghezza colonna ammessa solo se presente in catalogo `RIPIANO` della categoria selezionata.

### Vincoli di adiacenza (Vincolo 1)

Per colonne adiacenti `i` e `i+1`, al livello `k`:

- `levelsMm[i][k] != levelsMm[i+1][k]`

Interpretazione operativa:
- i ripiani "alla stessa progressione verticale" tra colonne adiacenti devono alternarsi (non allinearsi alla stessa quota).

### Vincoli di costruzione livelli

1. Il primo gap usa set di altezze ammesso (`piedini` o combinazione base definita a catalogo).
2. I gap successivi usano set altezze `montanti`.
3. Le quote in una colonna sono strettamente crescenti.
4. L'utente aggiunge/rimuove solo dall'alto (stack discipline).

### Vincoli di fattibilita' futura (Scenario 2)

Dopo ogni scelta, il backend esegue un controllo "look-ahead":

- dato lo stato corrente delle colonne, deve esistere almeno una soluzione per completare tutte le colonne rimanenti rispettando il vincolo di adiacenza e i limiti di altezza.

Se non esiste:
- la mossa viene rifiutata (`422 BUSINESS_RULE_VIOLATION`),
- il backend restituisce le alternative valide.

---

## Constraint engine (comportamento)

Input:
- stato configurazione corrente,
- catalogo filtrato per categoria,
- comando utente (`addShelf` / `removeShelf` / `setColumns` ...).

Output:
- stato aggiornato valido,
- lista prossime azioni consentite,
- BOM aggiornata e prezzo snapshot.

Pseudo-flusso `addShelf(columnIndex)`:

1. verifica stato (`DESIGN_IN_PROGRESS`);
2. costruisce candidate heights dal catalogo (`piedino` o `montante`);
3. filtra candidate che:
	 - non superano `maxHeightMm`,
	 - rispettano il vincolo adiacenza con colonne vicine,
	 - preservano fattibilita' futura (look-ahead);
4. se nessuna candidata -> errore con motivazione + suggerimenti;
5. applica scelta, rigenera componenti automatici, aggiorna prezzo.

---

## Componenti automatici e distinta base (BOM)

L'utente non inserisce manualmente montanti, piedini, terminali.
Il backend li deriva dalla struttura.

Regole base:

1. `RIPIANO`
- fissato dalla larghezza colonna e dal numero livelli della colonna.

2. `PIEDINO`
- 4 per colonna (o regola specifica di sistema, gestita per categoria).

3. `TERMINALE`
- 4 per colonna, aggiunti alla finalizzazione (o in anteprima se richiesto dalla UI).

4. `MONTANTE`
- derivati dai gap verticali;
- su colonne adiacenti, i montanti centrali sono condivisi (evita doppio conteggio);
- in `KUBE` applicare moltiplicatore previsto (nota progetto: *2).

Ogni update del design produce:
- `bom.items[]` aggregata per `productId`;
- `totalPriceSnapshot` ricalcolato su prezzi catalog correnti;
- `cartPreview` opzionale.

---

## Integrazione con cartService

Comportamento atteso:

1. Durante il design:
- il CAD mantiene `bom` e `pricePreview` lato proprio dominio.

2. In finalizzazione:
- CAD emette comando/evento `ConfigurationFinalized` con BOM normalizzata;
- `cartService` upserta il carrello utente da BOM (snapshot commerciale).

3. Se cambia catalogo dopo salvataggio:
- configurazione resta valida come geometria,
- prezzo/disponibilita' vengono marcati come "stale" e ricalcolati alla riapertura/finalizzazione.

---

## API backend consigliate (logiche, non definitive)

### Setup

- `POST /cad/configurations`
- `PUT /cad/configurations/:id/environment`
- `PUT /cad/configurations/:id/category`
- `PUT /cad/configurations/:id/columns`

### Design

- `POST /cad/configurations/:id/columns/:columnIndex/shelves` (add top shelf)
- `DELETE /cad/configurations/:id/columns/:columnIndex/shelves/top` (remove top shelf)
- `GET /cad/configurations/:id/next-options?columnIndex=...`

### Stato e finalizzazione

- `GET /cad/configurations/:id`
- `GET /cad/configurations/:id/bom-preview`
- `POST /cad/configurations/:id/finalize`

Tutte le risposte di errore nel formato `RESTErrorModel` (`error.code`, `error.message`, `error.details`, `error.timestamp`).

---

## FIT vs progetto attuale (utilities) - analisi

### FIT (coerente)

1. Requisiti `FR1/FR2/FR3/FR4/FR9` in `requisiti.md`:
- il modello a step e il constraint engine coprono configuratore, anteprima, prezzo e vincolo no-mix categoria.

2. Struttura CAD in `Definizione dei DB.md`:
- `configurations`, `editOperations`, `projectSnapshots` sono compatibili con l'approccio proposto.

3. `RESTErrorModel.md`:
- perfettamente adatto per vincoli di dominio (`BUSINESS_RULE_VIOLATION`, `VERSION_CONFLICT`).

### GAP / NON FIT (da valutare)

1. `RESTPayloads.md` del CAD e' troppo generico rispetto agli step reali:
- oggi espone componenti "liberi" su griglia;
- serve payload orientato a `environment`, `columnPlan`, `add/remove shelf`.

2. `DomainDTOs.md` usa `GridCellDto` come centro del CAD:
- con il design per colonne/livelli, il DTO principale dovrebbe essere anche `ColumnDesignDto` (livelli verticali), non solo celle xyz.

3. DB CAD attuale non esplicita environment/column plan come first-class fields:
- conviene aggiungere campi dedicati in `configurations` (`environment`, `category`, `columnPlan`, `columnDesigns`).

4. Ambiguita' su nomenclatura catalogo:
- nei documenti convivono `products`/`components`, `systemType`/`category`, `componentType`/`Type`.
- va definito un mapping canonico (senza cambiare ora il progetto, ma documentandolo).

5. Scenario 2 richiede solver con look-ahead:
- non e' ancora esplicitato nei documenti tecnici correnti;
- va aggiunto come requisito backend non funzionale di correttezza (evitare dead-end configurativi).

---

## Proposta di adeguamento (solo documentale, per ora)

Senza toccare ancora il progetto:

1. Estendere `RESTPayloads.md` con i payload step-based del CAD.
2. Estendere `DomainDTOs.md` con DTO specifici di colonna/livelli.
3. Aggiornare `Definizione dei DB.md` aggiungendo i campi CAD per environment e column plan.
4. Aggiungere in checklist un task esplicito: "constraint solver con look-ahead".

---

## Decisione architetturale consigliata

Per ottenere davvero l'esperienza utente descritta:

- il frontend resta guidato a step;
- il backend CAD deve essere autoritativo sui vincoli e sulla fattibilita' futura;
- la distinta componenti e il prezzo devono essere sempre derivati dal backend, mai calcolati solo dal client.

Questo riduce errori, mantiene coerenza con i requisiti ASW e prepara il terreno alle estensioni DS.

---

## Revisione mirata con tag MUST / SHOULD / NICE TO HAVE

1. [MUST] Backend autoritativo sui vincoli.
Il frontend guida l'utente, ma l'accettazione/rifiuto delle mosse e' solo lato backend.

2. [MUST] Workflow a stati non aggirabile.
Niente salti di step; cambi strutturali dopo `COLUMNS_DEFINED` richiedono reset esplicito.

3. [MUST] Unita' di misura canonica in `mm`.
Ogni input deve essere normalizzato prima della validazione per evitare mismatch tra UI e dominio.

4. [MUST] Vincolo altezza con spessore ripiano.
La verifica finale deve considerare quota ultimo livello + spessore ripiano + terminale.

5. [MUST] Vincolo adiacenza tra colonne.
Due ripiani adiacenti alla stessa progressione non possono avere la stessa quota.

6. [MUST] Controllo di fattibilita' futura (Scenario 2).
Ogni mossa deve essere accettata solo se esiste almeno un completamento possibile della configurazione.

7. [MUST] Distinta componenti derivata dal backend.
Montanti, terminali e conteggi condivisi non devono dipendere da logiche client.

8. [MUST] Error model uniforme.
In caso di vincolo violato: `422` con `BUSINESS_RULE_VIOLATION` e dettagli azionabili.

9. [SHOULD] Persistenza esplicita di `environment`, `columnPlan`, `columnDesigns`.
Migliora coerenza tra regole step-based e stato salvato nel DB CAD.

10. [SHOULD] Evoluzione payload CAD da griglia libera a comandi di dominio.
Endpoint orientati a `setEnvironment`, `setColumns`, `addShelf`, `removeShelf`.

11. [SHOULD] Evoluzione DTO CAD oltre `GridCellDto`.
Serve un DTO primario per livelli verticali di colonna (`ColumnDesignDto`).

12. [SHOULD] Nomenclatura canonica cross-document.
Allineare terminologia tra `products/components`, `systemType/category`, `componentType/type`.

13. [NICE TO HAVE] `next-options` con suggerimenti guidati.
Oltre al solo "errore", proporre direttamente le altezze selezionabili che mantengono la fattibilita'.

14. [NICE TO HAVE] Strategia "stale pricing" esplicita in UI.
Quando il catalogo cambia, mostrare stato "prezzo da ricalcolare" prima della finalizzazione.

15. [NICE TO HAVE] Parametrizzazione per categoria del calcolo montanti.
Formalizzare il moltiplicatore `KUBE` e altre regole in tabella configurabile, non hardcoded.