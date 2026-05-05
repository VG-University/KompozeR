# Sistemi Distribuiti — Dispense Universitarie
## Parte 3: Architetture, Algebra dei Processi, CAP Theorem, Logging e Checkpointing

**Corso:** Distributed Systems — A.A. 2025/2026  
**Docenti:** Andrea Omicini (Teoria) · Giovanni Ciatto (Lab)  
**Università:** Alma Mater Studiorum — Università di Bologna (Campus Cesena)

---

## M8 — Modellazione dei Sistemi Distribuiti: Architetture Software e di Sistema

### Cos'è un'Architettura Software

Un'architettura software è una *rappresentazione astratta* degli elementi in esecuzione di un sistema. La definizione di Fielding (2000) descrive:

- **Component**: unità modulare con interfacce ben definite, sostituibile indipendentemente. Fornisce e richiede servizi via le proprie interfacce.
- **Connector**: meccanismo che media comunicazione, coordinazione e cooperazione tra componenti.
- **Architectural Style**: insieme coordinato di vincoli che limitano i ruoli e le caratteristiche dei componenti e dei connettori.

La differenza tra **architettura software** (organizzazione logica) e **architettura di sistema** (posizionamento fisico) è fondamentale:
- Architettura software: come i componenti sono organizzati nel tempo.
- Architettura di sistema: come i componenti sono distribuiti nello spazio.

### 5 Stili Architetturali Principali per i Sistemi Distribuiti

#### 1. Architetture a Strati (Layered)

I componenti sono organizzati in strati:
- Ogni strato offre servizi allo strato superiore e usa quelli dello strato inferiore.
- La comunicazione avviene solo tra strati adiacenti.
- Classico esempio: protocolli di rete (OSI, TCP/IP).

**Flusso**: una richiesta scende dagli strati superiori a quelli inferiori; la risposta risale.

#### 2. Architetture Object-based (Basate su Oggetti)

I componenti sono *oggetti* che incapsulano stato e logica. Si comunicano tramite **RPC (Remote Procedure Call)**, che rende trasparente la distribuzione:
- Il client chiama una procedura remota come se fosse locale.
- Lo stub del client serializza i parametri, li invia in rete; lo stub del server li deserializza e chiama il metodo.

Sono alla base delle architetture **client-server** classiche.

#### 3. Architetture Data-Centered (Centrate sui Dati)

I componenti comunicano attraverso un **repository condiviso** (database, file system, data store).

- **Repository passivo**: i componenti eseguono query esplicite sui dati.
- **Repository attivo** (blackboard): i componenti si registrano per ricevere notifiche su certi dati (pattern publish/subscribe sui dati).

I sistemi web-based con database condiviso sono il caso tipico.

#### 4. Architetture Event-based (Basate su Eventi)

I processi comunicano tramite un **event bus** o *message broker*:
- Il *publisher* pubblica un evento senza sapere chi lo riceverà.
- Il *subscriber* si iscrive a certi tipi di eventi senza sapere chi li produce.

Questo schema garantisce:
- **Disaccoppiamento referenziale**: publisher e subscriber non si conoscono.
- **Disaccoppiamento spaziale**: non devono condividere lo stesso spazio di indirizzamento.

#### 5. Architetture Shared Data-Space (Spazio Dati Condiviso)

Combinano data-centered ed event-based. Caratteristiche:
- Spazio dati persistente e condiviso (come un *blackboard*).
- I processi non devono essere attivi contemporaneamente (**disaccoppiamento temporale**).
- Si aggiunge al disaccoppiamento referenziale e spaziale.

Esempio: sistemi di tipo *tuple space* (Linda, TuCSoN).

### Confronto degli Stili Architetturali

| Stile | Accoppiamento Referenziale | Accoppiamento Spaziale | Accoppiamento Temporale |
|---|---|---|---|
| Layered | Stretto | Stretto | Stretto |
| Object-based | Stretto | Stretto | Stretto |
| Data-centered | Debole | Stretto | Stretto |
| Event-based | Debole | Debole | Stretto |
| Shared Data-Space | Debole | Debole | **Assente** |

---

## M9 — Modellazione dei Sistemi Distribuiti: Algebra dei Processi

### Motivazione

Gli stili architetturali descrivono la struttura, ma **non** permettono di ragionare formalmente sul comportamento. Per dimostrare proprietà (es. assenza di deadlock, correttezza del protocollo), serve un modello formale.

L'**algebra dei processi** è una tecnica di descrizione formale per sistemi complessi concorrenti e distribuiti.

### Breve Storia

- Prima dell'algebra dei processi: solo **Reti di Petri** (Petri, 1962) per modellare la concorrenza.
- Semantica operazionale: descrizione tramite macchine astratte (Abstract State Machines).
- Semantica denotazionale: descrizione come funzione matematica.
- Semantica assiomatica: metodi di prova (Hoare logic).

Le principali algebre dei processi:
- **ACP** (Algebra of Communicating Processes) — Bergstra & Klop, 1984
- **CCS** (Calculus of Communicating Systems) — Milner, 1980
- **CSP** (Communicating Sequential Processes) — Brookes, Hoare, Roscoe, 1984

### Ingredienti Fondamentali

1. **Modellazione compositiva**: i sistemi si descrivono combinando componenti più semplici.
2. **Semantica operazionale (SOS → LTS)**: il comportamento è descritto come un **Labelled Transition System** (LTS), dove i nodi sono stati e gli archi sono transizioni etichettate con azioni.
3. **Ragionamento comportamentale**: nozione di equivalenza tra processi (bisimulazione).

### Operatori di Base (ACP)

| Operatore | Notazione | Proprietà |
|---|---|---|
| **Composizione alternativa** | x + y | Commutativa, associativa, idempotente |
| **Composizione sequenziale** | x · y (o x ; y) | Associativa |
| **Composizione parallela** | x ∥ y | Commutativa, associativa |

**Leggi fondamentali**:
- Distributività destra di `+` su `;`: $(x + y) ; z = (x;z) + (y;z)$
- Associatività di `;`: $(x;y);z = x;(y;z)$
- Commutatività di `∥`: $x \| y = y \| x$

**Branching time vs Linear time**:
- **Linear time**: valgono sia la distributività sinistra che destra di `+` su `;` → ogni sequenza di azioni è "appiattita".
- **Branching time**: solo la distributività destra → l'albero delle scelte è preservato.

### Semantica Operazionale Strutturata (SOS) e LTS

Le **regole SOS** definiscono come un processo evolve tramite un'azione. L'insieme di tutte le evoluzioni possibili forma un **LTS**:

- Azione atomica: $a \xrightarrow{a} \checkmark$ (termina con successo)
- Composizione sequenziale: se $x \xrightarrow{a} \checkmark$ allora $x;y \xrightarrow{a} y$
- Composizione parallela con funzione di comunicazione $\gamma(a,b) = c$: se $x \xrightarrow{a}$ e $y \xrightarrow{b}$, allora $x\|y \xrightarrow{c}$

### Limitazioni dell'Algebra dei Processi

- Le dimostrazioni di equivalenza non sono sempre intuitive.
- Modellano la *concorrenza* ma non la *distribuzione fisica*.
- Non catturano aspetti spaziali (posizione dei processi, topologia di rete).

---

## C1 — Il CAP Theorem

### Il Teorema CAP

**CAP Theorem (Brewer, 2000 — formalmente dimostrato da Gilbert & Lynch, 2002):**

> Qualsiasi sistema distribuito che condivide dati può garantire **al massimo 2 delle 3** seguenti proprietà: Consistency, Availability, Partition tolerance.

**Definizioni formali (Gilbert & Lynch)**:

- **Consistency (C)**: i dati sono un oggetto atomico; le operazioni sono totalmente ordinate; una lettura dopo una scrittura restituisce la stessa versione o una più recente.
- **Availability (A)**: ogni richiesta ricevuta da un nodo non guasto deve ricevere una risposta (non è ammessa la non-risposta).
- **Partition tolerance (P)**: il sistema continua a funzionare anche se tutti i messaggi tra un gruppo di nodi e un altro vengono persi.

### Dimostrazione per Assurdo

Siano G1 e G2 due gruppi di nodi separati da una partizione:

1. Un client scrive il valore $v_1 \neq v_0$ su un nodo di G1.
2. La partizione impedisce la propagazione di $v_1$ a G2.
3. Un client legge da un nodo di G2.
4. Se il sistema è **available**, deve rispondere → restituisce $v_0$.
5. Ma $v_0 \neq v_1$ → violazione della **consistency**.

Quindi, in presenza di partizione, un sistema che garantisce A non può garantire C, e viceversa.

### Implicazioni Pratiche

La **partition tolerance** (P) non è opzionale nei sistemi moderni:
- Reti mobili, IoT, data center geograficamente distribuiti → le partizioni *accadranno*.
- **Se P è obbligatorio**, la scelta reale è tra C e A in caso di partizione.

**Strategie** (Brewer):
| Scenario | Scelta | Esempio |
|---|---|---|
| In presenza di partizione | A (disponibilità) | DNS, sistemi e-commerce |
| In presenza di partizione | C (consistenza) | Sistemi bancari, sistemi critici |
| In assenza di partizione | Sia A che C | Sistemi locali, single-node |

### ACID vs BASE

| | ACID | BASE |
|---|---|---|
| **Acronimo** | Atomic, Consistent, Isolated, Durable | Basically Available, Soft state, Eventually consistent |
| **Dove** | Database tradizionali | Servizi internet scalabili |
| **Consistenza** | Forte (sempre) | Eventuale (converge nel tempo) |
| **Disponibilità** | Può sacrificarsi | Prioritaria |
| **Origine** | Fox et al., 1997 (proposto come alternativa) |

**ACID** è troppo rigido per molti servizi Internet ad alta scala: sacrifica disponibilità e scalabilità sull'altare della consistenza.  
**BASE** accetta l'inconsistenza temporanea ma garantisce che il sistema sarà sempre disponibile e alla fine consistente.

### Esempio Reale: Pokémon Go

Pokémon Go usa Google Cloud con una combinazione di sistemi:
- **Spanner** (strongly consistent, ACID): per transazioni in-game critiche.
- **Bigtable** (eventually consistent): per logging e dati meno critici.
- **Backend spaziale con cache locale**: per le query geografiche.
- **GKE** (Google Kubernetes Engine): per l'orchestrazione del frontend.

Questo dimostra come nella pratica si usino sistemi con diversi modelli di consistenza, scelti in base al tipo di dato e requisito.

---

## C2 — Logging e Checkpointing nei Sistemi Distribuiti

### Causalità

**Causalità** = relazione causa-effetto tra eventi nel sistema.

- **Causalità interna**: tracciabile dal sistema (passaggio di messaggi, dipendenze logiche).
- **Causalità esterna**: non rilevabile automaticamente dal sistema (es. un utente legge un output e poi interagisce con un altro nodo).

La definizione probabilistica di Judea Pearl (2009) formalizza la causalità come controfattuale: *A causa B se, in assenza di A, B non sarebbe avvenuto*.

### Meccanismi di Base

- **Checkpointing**: salva lo *stato* del processo in un *archivio stabile* (stable storage). Permette di tornare a uno stato precedente dopo un guasto (rollback recovery).
- **Logging (Message Logging)**: salva i *messaggi* scambiati tra processi. Permette di ricostruire la sequenza di eventi dall'ultimo checkpoint.

I due meccanismi si usano **insieme**: il checkpointing limita il tempo di recovery e la dimensione del log.

### Modello di Sistema

- $N$ processi che interagiscono tramite scambio di messaggi.
- Modello di failure: **fail-stop** (un processo si ferma e non riprende senza recovery).
- Comunicazione: reliable FIFO (i messaggi arrivano in ordine, senza perdite — salvo partizioni).

### Stato Globale e Consistenza

Lo **stato globale** di un sistema distribuito comprende:
- Gli *stati dei processi* (memorie locali).
- Gli *stati dei canali* (messaggi in transito).

Uno stato globale è **consistente** se non contiene dipendenze "rotte":

> Se il processo $P_j$ ha ricevuto un messaggio $m$ da $P_i$, allora lo stato di $P_i$ deve riflettere l'invio di $m$.

**Scenari**:
- **Stato inconsistente**: $P_1$ riflette la ricezione di $m_0$, ma $P_0$ non riflette l'invio → impossibile usarlo per recovery.
- **Stato consistente ma non recuperabile**: messaggi in transito andrebbero persi durante il recovery → occorre gestirli.
- **Stato consistente e recuperabile**: tutti i messaggi in transito sono correttamente registrati.

### Assunzione PDA (Piecewise Deterministic Assumption)

Ogni processo evolve deterministicamente finché non avviene un *evento non-deterministico* (es. ricezione di un messaggio). Tutti gli eventi non-deterministici possono essere identificati e registrati nel log.

> Questa assunzione è fondamentale per i protocolli di logging: se un processo può ripetere deterministicamente le sue azioni dopo un evento, bastano i log degli eventi non-deterministici per ricostruirlo.

### Stable Storage

I log e i checkpoint vengono salvati in un **archivio stabile** che sopravvive ai guasti del singolo processo. Può essere:
- Disco locale (RAID).
- Storage distribuito/cloud (es. Amazon S3).

### Protocolli di Checkpoint

#### Uncoordinated Checkpointing
Ogni processo salva checkpoint in modo *indipendente*. Recovery complessa: può portare al **domino effect** (una cascata di rollback che fa tornare tutti i processi all'inizio).

#### Tamir & Sequin — Blocking Coordinated (2-Phase Commit)
1. **Fase 1**: il coordinatore invia `CHECKPOINT` a tutti i processi; i processi salvano il checkpoint e rispondono `SAVED`.
2. **Fase 2**: il coordinatore invia `RESUME`; i processi riprendono l'esecuzione.

Il sistema entra in un *quiescent point* durante la fase 1 (nessun messaggio in transito). Se un processo non risponde entro il timeout, il coordinatore abortisce il checkpoint.

**Pro**: semplice recovery. **Contro**: sistema bloccato durante il checkpoint.

#### Chandy & Lamport — Non-Blocking
Qualsiasi processo può iniziare un checkpoint inviando un **Marker** su tutti i propri canali di uscita:
1. Il processo che invia il Marker salva il proprio stato.
2. Quando un processo riceve un Marker su un canale:
   - Se è il *primo* Marker ricevuto: salva il proprio stato e propaga il Marker.
   - Registra tutti i messaggi che arrivano sul canale tra il proprio salvataggio e il Marker (stato del canale).
3. Quando il processo ha ricevuto il Marker su tutti i canali in ingresso → *Marker Certificate* completo.

**Pro**: non blocca il sistema. **Contro**: più complesso.

### Protocolli di Message Logging

Richiedono l'assunzione PDA.

#### Pessimistic Logging
Ogni messaggio viene loggato in modo *sincrono* su stable storage **prima** di essere consegnato al processo. 
- **Recovery**: semplice (basta rieseguire i messaggi dal checkpoint).
- **Overhead**: alto (ogni messaggio richiede I/O su disco).

#### Optimistic Logging
I messaggi vengono prima scritti su una *volatile log* (RAM) e poi, in modo *asincrono*, su stable storage.
- **Pro**: performance migliore.
- **Contro**: in caso di guasto prima del flush, il recovery può andare più indietro del punto di failure. Possibile *cascading rollback*.

#### Causal Logging
I messaggi non ancora loggati vengono *piggybacked* sui messaggi inviati dal processo (cioè vengono inclusi nel payload dei messaggi stessi). Garantisce che ogni processo conosca la storia causale di ogni messaggio che riceve.
- **Pro**: no cascading rollback.
- **Contro**: overhead maggiore (messaggi più grandi), implementazione complessa.

---

## Riepilogo Parte 3

| Argomento | Concetti Chiave |
|---|---|
| **M8 — Architetture** | 5 stili: layered, object-based, data-centered, event-based, shared data-space; disaccoppiamento referenziale/spaziale/temporale |
| **M9 — Process Algebra** | ACP/CCS/CSP; SOS → LTS; operatori +/;/∥; branching vs linear time |
| **C1 — CAP** | C + A + P: al massimo 2; partition non opzionale; ACID vs BASE; Pokémon Go |
| **C2 — Logging** | Checkpointing + logging; stato globale consistente; PDA; Chandy-Lamport; pessimistic/optimistic/causal logging |

---

*Documento generato da tutte le slide del corso. Per approfondimenti, riferirsi a Tanenbaum & van Steen, 3ª ed.*
