# DISPENSE — SISTEMI DISTRIBUITI (DS)
## Corso di Laurea Magistrale in Ingegneria e Scienze Informatiche
### Alma Mater Studiorum — Università di Bologna (Campus Cesena) — A.A. 2025/2026

**Docente Teoria:** Prof. Andrea Omicini (`andrea.omicini@unibo.it`)  
**Docente Lab:** Prof. Giovanni Ciatto (`giovanni.ciatto@unibo.it`)  
**Ospite:** Mattia Matteini (Kubernetes)  
**Esame:** Discussione orale di un progetto individuale/di gruppo approvato dai docenti

---

> **Nota metodologica.** Queste dispense sono redatte a partire dal materiale didattico ufficiale del corso (23 PDF di slide). Ogni sezione corrisponde a un modulo teorico (M0–M9), una lezione complementare (C1–CX) o una sessione di laboratorio (LAB). Il linguaggio è tecnico e formale, adatto allo studio per l'esame. Il riferimento bibliografico principale è Tanenbaum & van Steen, *Distributed Systems. Principles and Paradigms*, 3ª ed.

---

## Indice

### Parte I — Fondamenti

- [M0 — Perché i Sistemi Distribuiti?](#m0--perché-i-sistemi-distribuiti)
- [M1 — Dependability](#m1--dependability-nei-sistemi-distribuiti)
- [M2 — Radici dei Sistemi Distribuiti: Computazione in Spazio e Tempo](#m2--radici-dei-sistemi-distribuiti-computazione-in-spazio-e-tempo)
- [M3 — Replicazione e Consistenza](#m3--replicazione-e-consistenza-nei-sistemi-distribuiti)

### Parte II — Obiettivi, Tipologie, Tempo e Spazio

- [M4 — Definizioni e Obiettivi](#m4--definizioni-e-obiettivi-dei-sistemi-distribuiti)
- [M5 — Tipologie di Sistemi Distribuiti](#m5--tipologie-di-sistemi-distribuiti)
- [M6 — Computazione con il Tempo](#m6--computazione-con-il-tempo)
- [M7 — Computazione con lo Spazio](#m7--computazione-con-lo-spazio)

### Parte III — Architetture, Modelli Formali, CAP e Recovery

- [M8 — Architetture Software e di Sistema](#m8--modellazione-dei-sistemi-distribuiti-architetture-software-e-di-sistema)
- [M9 — Algebra dei Processi](#m9--modellazione-dei-sistemi-distribuiti-algebra-dei-processi)
- [C1 — Il CAP Theorem](#c1--il-cap-theorem)
- [C2 — Logging e Checkpointing](#c2--logging-e-checkpointing-nei-sistemi-distribuiti)

### Parte IV — Protocolli Avanzati e Tecnologie

- [C3 — Consenso nei Sistemi Distribuiti](#c3--consenso-nei-sistemi-distribuiti)
- [C4 — Blockchain](#c4--blockchain)
- [C5 — Orologi Logici](#c5--orologi-logici)
- [C6 — Mobilità del Codice](#c6--mobilità-del-codice)
- [CX — Kubernetes](#cx--kubernetes-orchestrazione-di-container)

### Parte V — Laboratorio

- [LAB 1 — Preliminari sull'Ingegneria dei DS](#lab-1--preliminari-sullingegneria-dei-sistemi-distribuiti)
- [LAB 2 — Meccanismi di Comunicazione: Socket](#lab-2--meccanismi-di-comunicazione-socket)
- [LAB 3 — Distributed Pong](#lab-3--distributed-pong-progettazione-di-un-gioco-distribuito)
- [Appendice Python](#appendice-concetti-python-utili-per-il-lab)

---

---

# PARTE I — FONDAMENTI

---

## M0 — Perché i Sistemi Distribuiti?

### Sistemi Computazionali Pervasivi

I sistemi computazionali sono oggi pervasivi: si trovano ovunque, dall'industria ai dispositivi personali, dall'Internet of Things ai datacenter globali. Il punto di partenza del corso è comprendere *perché* questa diffusione sia avvenuta e *quali sfide* essa comporti.

### Distribuzione Spaziale e Temporale

Un sistema distribuito è distribuito su due assi fondamentali:

**Distribuzione Spaziale**: le unità computazionali, i canali di comunicazione, i dati, i sensori e gli attuatori si trovano fisicamente in luoghi diversi.

**Distribuzione Temporale**: gli eventi nel sistema non sono più totalmente ordinati. In un sistema centralizzato, c'è un unico clock di riferimento e tutti gli eventi possono essere sequenzializzati. In un sistema distribuito, vale solo un ordinamento parziale degli eventi.

### Centralizzato vs. Distribuito (tabella comparativa)

| Caratteristica | Centralizzato | Distribuito |
|---|---|---|
| **Economicità** | Bassa (hw costoso) | Alta (commodity HW) |
| **Disponibilità** | Bassa (single point of failure) | Alta (ridondanza) |
| **Complessità** | Bassa | Alta |
| **Consistenza** | Semplice (un'unica copia) | Difficile (repliche multiple) |
| **Scalabilità** | Scarsa | Buona |
| **Tecnologia** | Omogenea | Eterogenea |
| **Sicurezza** | Alta | Bassa (superficie di attacco maggiore) |

### Perché Distribuire?

Secondo Ghosh (2014), le motivazioni principali sono:

1. **Ambienti geograficamente distribuiti**: alcuni problemi sono intrinsecamente distribuiti (sensori in campo, utenti globali).
2. **Speedup**: parallelismo su risorse diverse per ridurre i tempi di computazione.
3. **Resource Sharing**: condivisione di risorse (storage, CPU, stampanti, dati) tra nodi diversi.
4. **Fault Tolerance**: la ridondanza permette al sistema di continuare a funzionare anche in presenza di guasti.

---

## M1 — Dependability nei Sistemi Distribuiti

### La Catena delle Minacce

La Dependability (affidabilità nel senso più ampio) si basa sulla comprensione della *catena delle minacce*:

```
Fault → Error → Failure
```

- **Fault** (guasto): la *causa* di un errore. Può essere dormiente finché non viene attivato da qualche condizione.
- **Error** (errore): uno *stato errato* in un componente del sistema (conseguenza del fault).
- **Failure** (fallimento): la *deviazione del servizio* dalla specifica. È osservabile dall'esterno.

> ⚠️ Un fault non sempre porta a un error; un error non sempre porta a un failure. La propagazione può essere intercettata.

### Classificazione dei Fault

I fault si classificano lungo diverse dimensioni:

| Dimensione | Tipi |
|---|---|
| **Fonte** | Hardware, Software, Operatore |
| **Intento** | Non malevolo, Malevolo (Byzantine) |
| **Durata** | Transiente, Intermittente, Permanente (crash) |
| **Manifestazione** | Content fault, Timing fault |
| **Riproducibilità** | Deterministico (riproducibile), Non-deterministico (Heisenbug) |
| **Relazione** | Indipendente, Correlato (Common Mode Failure) |

### Modelli di Failure (Tanenbaum)

| Tipo | Descrizione |
|---|---|
| **Crash failure** | Il server si ferma e non risponde più |
| **Omission failure** | Il server non riesce a rispondere alle richieste in arrivo |
| **Timing failure** | Il server risponde fuori dal range di tempo accordato (sistemi síncronos) |
| **Response failure** | La risposta del server è errata (valore sbagliato o stato di transizione sbagliato) |
| **Byzantine failure** | Il server produce risposte arbitrarie, in momenti arbitrari (inclusi comportamenti malevoli) |

**Modelli comportamentali di failure:**
- **Fail-stop**: il sistema si ferma quando fallisce (rilevabile dagli altri).
- **Fail-safe**: il sistema transisce in stati predefiniti sicuri in caso di guasto.
- **Fail-fast**: il sistema si ferma immediatamente quando rileva uno stato di errore.

### Attributi della Dependability

#### 1. Availability (Disponibilità)
La probabilità che il sistema stia funzionando in un dato istante.

$$\text{Availability} = \frac{\text{MTTF}}{\text{MTTF} + \text{MTTR}} = \frac{\text{MTTF}}{\text{MTBF}}$$

Dove:
- **MTTF** = Mean Time To Failure
- **MTTR** = Mean Time To Repair
- **MTBF** = Mean Time Between Failures

La disponibilità si misura in *"nines"*:

| Nines | Percentuale | Downtime/anno |
|---|---|---|
| 2 nines | 99% | ~87.6 ore |
| 3 nines | 99.9% | ~8.76 ore |
| 4 nines | 99.99% | ~52.6 minuti |
| 5 nines | 99.999% | ~5.26 minuti |

#### 2. Reliability (Affidabilità)
La capacità di funzionare in modo continuativo. Si misura come:

$$R(\Delta t) = e^{-\lambda \Delta t}$$

Dove $\lambda = 1/\text{MTTF}$ è il tasso di guasto.

> ⚠️ **Availability ≠ Reliability**: un sistema può essere molto disponibile ma poco affidabile (se si guasta spesso ma si ripara in fretta), e viceversa.

#### 3. Integrity (Integrità)
Protezione dello stato del sistema. Nei sistemi replicati: consistenza delle repliche, garantita finché il numero di repliche faulty è sotto una certa soglia.

#### 4. Maintainability (Manutenibilità)
Capacità di evolvere dopo il deployment (inclusi live upgrades).

#### 5. Safety (Sicurezza funzionale)
Assenza di conseguenze catastrofiche in caso di failure (fail-safe). Non rilevante per sistemi come l'e-commerce, essenziale per sistemi critici (avionica, medicina).

### Mezzi per Raggiungere la Dependability

1. **Fault Avoidance**: progettazione rigorosa, metodi formali, testing.
2. **Fault Detection & Diagnosis**: probing, exception handling, strumenti statistici.
3. **Fault Removal**: isolamento, riparazione/sostituzione, riconfigurazione, membership.
4. **Fault Tolerance**: tecnica principale; basata sulla **ridondanza**:
   - *Ridondanza informativa*: bit aggiuntivi (es. error-correcting codes).
   - *Ridondanza temporale*: riesecuzione dell'operazione (es. retry).
   - *Ridondanza fisica*: componenti hardware/software multipli (es. RAID, repliche).

Tecniche specifiche di fault tolerance:
- **Logging & Checkpointing**: per alta disponibilità; permette rollback recovery.
- **Recovery-oriented computing**: il sistema può sempre recuperare da uno stato consistente.

---

## M2 — Radici dei Sistemi Distribuiti: Computazione in Spazio e Tempo

### Cosa Studia l'Informatica

L'informatica è la *scienza della computazione*: studia i fenomeni computazionali attraverso metodologie sistematiche, costruendo modelli (noumeni) a partire da osservazioni (fenomeni). La definizione di "computazione" si è evoluta nel tempo, dal 1940 a oggi, espandendosi dall'elaborazione simbolica sequenziale a forme non-terminanti, continue, situate.

### Cos'è la Computazione

La computazione è fondamentalmente manipolazione di simboli secondo passi ben definiti. Le sue dimensioni chiave:
- **Modello computazionale**: automi, macchine di Turing, lambda calcolo, CPS...
- **Computazioni naturali**: calcolo analogico, calcolo biologico.
- **Non-terminazione**: loop infiniti, server sempre attivi.
- **Continuità**: interazione con ambienti fisici.

### Ontologia del Processo Computazionale

Un **processo elementare** è sequenziale e ha:
- **Input/Output**: ciò che riceve e produce.
- **Contesto**: macchina computazionale + risorse + tempo + spazio.

Si parla di **computazione situata** quando l'ambiente in cui il processo è immerso è rilevante per il suo comportamento (es. un robot che percepisce il mondo fisico).

Un **sistema computazionale** è composto da due o più processi che computano *e* interagiscono.

### Definizioni Fondamentali

| Tipo | Caratteristica | Ordinamento degli eventi |
|---|---|---|
| **Computazione Parallela** | Stesso contesto temporale T per tutti i processi | Totale |
| **Computazione Concorrente** | Contesti temporali diversi (T ≠ T') | Al più parziale |
| **Computazione Distribuita** | Contesti spaziali diversi (S ≠ S') | Dipende |
| **Distribuita Parallela** | S ≠ S', stesso T | Totale |
| **Distribuita Concorrente** | S ≠ S', T ≠ T' | Al più parziale (caso reale più comune) |

> 💡 **Insight chiave**: in un sistema distribuito concorrente (il caso più comune nella realtà), non esiste un unico orologio globale. Gli eventi possono essere ordinati solo parzialmente.

### Implicazioni per i Sistemi Distribuiti

La coesistenza di distribuzione spaziale e temporale genera le sfide fondamentali dei sistemi distribuiti:
- Non esiste un "tempo globale" condiviso.
- Non esiste una "memoria condivisa" accessibile a tutti.
- La comunicazione avviene tramite scambio di messaggi.
- I guasti sono la norma, non l'eccezione.

---

## M3 — Replicazione e Consistenza nei Sistemi Distribuiti

### Motivazioni per la Replicazione

La replicazione (duplicare dati o servizi su più nodi) è adottata per tre ragioni principali:

1. **Reliability (Affidabilità)**: se un nodo cade, gli altri continuano a servire i dati.
2. **Performance**: accesso locale ai dati riduce la latenza percepita.
3. **Scalabilità**: distribuzione del carico su più nodi (sia per numero di utenti che per distribuzione geografica).

### Il Dilemma della Replicazione

> La replicazione migliora le prestazioni, ma mantenere le copie consistenti richiede sincronizzazione globale (costosa).  
> **Soluzione**: rilassare i vincoli di consistenza.

Questo è il *fundamental tradeoff* della replicazione: più forte è la consistenza, più costosa è la sincronizzazione, più basse le prestazioni.

### Modelli di Consistenza Data-Centric

Questi modelli descrivono le garanzie offerte dal sistema a tutti i processi che accedono ai dati:

#### Consistenza Continua (Conit-based)
Limita le deviazioni accettabili tra repliche lungo tre assi:
- **Deviazione numerica**: differenza nel valore dei dati.
- **Deviazione di staleness**: quanto vecchi possono essere i dati letti.
- **Deviazione di ordinamento**: discrepanza nell'ordine delle operazioni.

#### Consistenza Sequenziale
Tutti i processi vedono *tutte* le operazioni di scrittura nello *stesso ordine sequenziale*; l'ordine individuale di ogni processo è preservato. È un modello **forte** ma costoso da implementare in sistemi distribuiti.

#### Consistenza Causale
Indebolimento della consistenza sequenziale: solo le operazioni di scrittura in relazione causa-effetto devono essere viste nello stesso ordine da tutti i processi. Le operazioni *concurrent* (non in relazione causale) possono essere viste in ordini diversi da processi diversi.

### Modelli di Consistenza Client-Centric

Pensati per scenari *mobile* (un singolo client che si sposta tra diverse repliche):

| Modello | Garanzia |
|---|---|
| **Eventual Consistency** | Le repliche convergeranno alla stessa versione (in assenza di aggiornamenti concorrenti). Es. DNS, web cache. |
| **Monotonic Reads** | Successive letture dello stesso elemento restituiscono sempre la stessa versione o una più recente. |
| **Monotonic Writes** | Una scrittura su x è completata prima di qualsiasi scrittura successiva su x dallo stesso processo. |
| **Read-your-writes** | L'effetto di una scrittura è sempre visibile nelle letture successive dello stesso processo. |
| **Writes-follow-reads** | Una scrittura su x che segue una lettura di x opera sulla stessa versione o su una più recente. |

### Tipi di Replicazione

- **Replicazione di dati**: copie dei dati su più nodi.
- **Replicazione di servizi**: copie di un servizio (con la propria logica) su più nodi.
- **Replicazione di processi**: clonazione di processi in esecuzione.

**Replica management**: dove collocare le repliche, quando aggiornarle, da chi farle aggiornare.

### Tabella Pratica: Consistenza e Sistemi Reali

| Modello di Consistenza | Meccanismo | Sistemi |
|---|---|---|
| **Forte** | Raft, Paxos | etcd, Spanner, CockroachDB |
| **Eventuale** | Gossip, Merkle Trees | DynamoDB, Cassandra, Riak |
| **Causale** | Vector Clocks, CRDTs | AntidoteDB, Orleans, Akka |
| **Tunable** | Quorum (R/W) | Cassandra, sistemi Dynamo-style |
| **Transazionale** | Consensus + TrueTime | Spanner, CockroachDB |
| **Log-based** | ISR, CDC Streams | Kafka, Debezium, Aurora |

> 💡 **Takeaway per l'esame**: non esiste un modello "universalmente migliore". La scelta dipende dai requisiti applicativi: quanto si può tollerare la staleness? Quanto è critica la consistenza? È preferibile disponibilità o correttezza?

---

---

# PARTE II — OBIETTIVI, TIPOLOGIE, TEMPO E SPAZIO

---

## M4 — Definizioni e Obiettivi dei Sistemi Distribuiti

### Tre Definizioni Classiche

**1. Visione Utente (Tanenbaum)**
Un sistema distribuito appare all'utente come un *singolo* sistema coerente, anche se è fisicamente distribuito su più macchine.

**2. Visione Ingegneristica**
Un sistema distribuito è un insieme di macchine indipendenti che collaborano al fine di risolvere un problema comune, coordinandosi tramite comunicazione.

**3. Coulouris (enfasi sul message passing)**
Un sistema distribuito è uno in cui hardware o software si trovano su computer connessi in rete e comunicano e coordinano le proprie azioni *esclusivamente tramite scambio di messaggi*.

### Il Middleware

Il middleware è uno strato software che si pone *al di sopra* di più macchine fisiche offrendo una *stessa interfaccia* verso le applicazioni, nascondendo l'eterogeneità sottostante.

```
[App 1] [App 2] [App 3]
        |
   [Middleware]
        |
[OS 1] [OS 2] [OS 3]
[HW 1] [HW 2] [HW 3]
```

### Le 8 Fallacies di Peter Deutsch

Peter Deutsch (Sun Microsystems) ha elencato 8 assunzioni errate che i neofiti dei sistemi distribuiti tendono a fare:

1. La rete è affidabile.
2. La rete è sicura.
3. La rete è omogenea.
4. La topologia non cambia.
5. La latenza è zero.
6. La banda è infinita.
7. Il trasporto non costa nulla.
8. C'è un unico amministratore.

> Tutte e 8 sono **false** nel mondo reale. Ignorarle è la causa principale dei problemi nei sistemi distribuiti.

### I 5 Obiettivi dei Sistemi Distribuiti

#### 1. Disponibilità delle Risorse (Resource Availability)
Le risorse (dati, servizi, hardware) devono essere accessibili da qualunque nodo della rete, indipendentemente dalla posizione fisica.

#### 2. Trasparenza (Transparency)
Il sistema deve *nascondere* la sua natura distribuita all'utente e alle applicazioni. Tipi di trasparenza:

| Tipo | Descrizione |
|---|---|
| **Access** | Nasconde la differenza nella rappresentazione dei dati e nel modo di accedere alle risorse |
| **Location** | Nasconde dove si trova fisicamente la risorsa |
| **Migration** | Nasconde che la risorsa può muoversi da un nodo all'altro |
| **Relocation** | Nasconde che la risorsa si può muovere *durante* l'accesso |
| **Replication** | Nasconde che esistono più copie della risorsa |
| **Concurrency** | Nasconde che la risorsa può essere usata concorrentemente da più processi |
| **Failure** | Nasconde il guasto e il ripristino di una risorsa |

#### 3. Openness (Apertura)
Il sistema deve essere *aperto*: usa interfacce standard (IDL — Interface Definition Language) che garantiscono:
- **Interoperabilità**: componenti di fornitori diversi possono lavorare insieme.
- **Portabilità**: un'applicazione sviluppata per il sistema A può girare su B con poche modifiche.
- **Estensibilità**: nuovi componenti possono essere aggiunti senza modificare il sistema esistente.

#### 4. Scalabilità
Secondo Neuman (1994), la scalabilità si manifesta in tre dimensioni:

| Dimensione | Descrizione |
|---|---|
| **Scalabilità di dimensione (Size)** | Aumentare il numero di utenti/risorse senza perdita di performance |
| **Scalabilità geografica (Geography)** | Servire utenti distanti geograficamente con latenza accettabile |
| **Scalabilità amministrativa** | Gestire il sistema anche se distribuito su più domini amministrativi |

**Caratteristiche degli algoritmi decentralizzati** per la scalabilità:
- Nessun nodo ha informazioni complete sullo stato del sistema.
- I nodi prendono decisioni solo sulla base delle informazioni locali.
- Non c'è un singolo punto di guasto.
- Non esiste un global clock.

**Tecniche per la scalabilità**:
- Comunicazione *asincrona* (evitare attese attive).
- *Distribuzione* dei dati e della computazione.
- *Replicazione e caching* (con le relative problematiche di consistenza).

#### 5. Situatedness (Situatezza)
Il sistema deve essere *consapevole del contesto*: può adattarsi all'ambiente fisico in cui opera. Particolarmente rilevante per sistemi pervasivi, IoT, sistemi cyber-fisici.

---

## M5 — Tipologie di Sistemi Distribuiti

### Tre Macro-Categorie

#### 1. Distributed Computing Systems

**Cluster Computing (Beowulf-style)**
- Macchine *simili* (commodity hardware).
- Stesso sistema operativo.
- Stessa LAN (alta velocità e bassa latenza interna).
- Singolo dominio amministrativo.
- Esempio: cluster di calcolo scientifico.

**Grid Computing**
- Macchine *eterogenee*.
- Sistemi operativi e architetture diverse.
- Organizzazioni virtuali tra domini amministrativi diversi.
- Connesse tramite WAN.
- Architettura a strati:

```
[Application layer]      ← Applicazioni utente
[Collective layer]       ← Broker, scheduler, monitoraggio
[Connectivity layer]     ← Comunicazione sicura, autenticazione
[Resource layer]         ← Singola risorsa (un nodo)
[Fabric layer]           ← Hardware fisico sottostante
```

#### 2. Distributed Information Systems

**Transaction Processing (TP) Systems**
Garantiscono proprietà **ACID** delle transazioni:
- **Atomic**: la transazione è eseguita interamente o non eseguita affatto.
- **Consistent**: porta il sistema da uno stato consistente a un altro.
- **Isolated**: nessuna interferenza tra transazioni concorrenti.
- **Durable**: gli effetti di una transazione confermata persistono.

Supportano *nested transactions* (transazioni che contengono sotto-transazioni). I **TP Monitors** coordinano le transazioni distribuite tra più sistemi eterogenei.

**Enterprise Application Integration (EAI)**
Integrazione a livello applicativo di sistemi eterogenei preesistenti (legacy). Middleware RPC e message-passing.

#### 3. Distributed Pervasive Systems

L'instabilità è la norma, non l'eccezione. Secondo Grimm (2004), i sistemi pervasivi devono:
- **Abbracciare** i cambiamenti contestuali (il dispositivo può spostarsi, connettersi/disconnettersi).
- **Incoraggiare** la composizione ad-hoc (i nodi si associano e disassociano dinamicamente).
- **Riconoscere** che la condivisione è il default.

**Home systems**: domotica, device eterogenei (TV, termostati, telecamere), UI unica.

**Health care systems (BAN — Body Area Networks)**: sensori indossabili che trasmettono dati biomedici. Requisiti stringenti di affidabilità e latenza.

**Reti di sensori**:
- Nodi con risorse limitate (CPU, batteria, storage).
- **In-network data processing**: l'elaborazione avviene sui nodi stessi, non su un server centrale.
- Architettura ad albero per la propagazione delle query:
  - Le *query* scendono dall'alto (da radice verso le foglie).
  - I *dati aggregati* risalgono (dalle foglie verso la radice).

### Il Paradigma Cloud Native (Presente)

La **Cloud Native Computing Foundation (CNCF)**, parte della Linux Foundation, promuove un paradigma moderno per i sistemi distribuiti. Caratteristiche chiave:

| Caratteristica | Descrizione |
|---|---|
| **Containers** | Unità di deployment leggere e portabili |
| **Microservizi** | Servizi piccoli, indipendenti, con singola responsabilità |
| **Service Meshes** | Gestione della comunicazione tra microservizi |
| **Immutable Infrastructure** | I componenti non si modificano, si sostituiscono |
| **Declarative APIs** | La configurazione descrive lo *stato desiderato*, non le operazioni |

---

## M6 — Computazione con il Tempo

### Cyber-Physical Systems (CPS)

I **CPS** sono sistemi che *uniscono* la computazione ai processi fisici. Esempi: impianti industriali, veicoli autonomi, robotica. Il tempo ha un ruolo *semantico* nei CPS, non solo prestazionale.

**Misconcezioni comuni sul tempo nella computazione**:
1. ❌ "La computazione non prende tempo" → La computazione richiede tempo fisico reale.
2. ❌ "Il tempo è solo una risorsa da ottimizzare" → Il tempo è una proprietà *semantica* del sistema.
3. ❌ "Il real-time è solo QoS" → Nei CPS, rispettare le scadenze temporali è parte della *correttezza funzionale*.

### Nessun Tempo Globale nei Sistemi Distribuiti

Gli orologi fisici dei nodi *driftano*: si allontanano gradualmente dall'ora reale. In un sistema distribuito:
- Nessun nodo ha accesso a un orologio globale condiviso.
- Due nodi non possono sincronizzarsi perfettamente (latenza di rete variabile).
- La sincronizzazione avviene periodicamente, con un'approssimazione.

**Definizioni su orologi fisici**:
- **Offset**: $C_a(t) - t$ (differenza dall'ora reale).
- **Skew**: $C'_a - C'_b$ (differenza nel tasso di avanzamento tra due orologi).
- **Drift**: $C''_a$ (variazione del tasso di avanzamento nel tempo — 2ª derivata).

### Sincronizzazione degli Orologi Fisici

**UTC (Coordinated Universal Time)**
Standard globale mantenuto da BIPM. I nodi lo ottengono tramite GPS, radio o rete.

**NTP (Network Time Protocol, RFC 5905)**
Protocollo gerarchico a strati (*strata*) per la sincronizzazione. Il server di stratum 0 è collegato a un orologio atomico. Gli orologi possono solo avanzare (non tornare indietro).

**Berkeley Algorithm** (sincronizzazione relativa)
Un master interroga periodicamente tutti i clock e calcola il tempo medio. La correzione viene inviata come *offset* (non come valore assoluto), per evitare shock temporali.

**Reference Broadcast Synchronisation (RBS)**
Per reti wireless: un nodo trasmette un beacon di sincronizzazione. I ricevitori stimano la deviazione relativa confrontando i tempi di ricezione. Elimina la variabilità del *send time* (presente in NTP) stimando solo il *receive time*.

### Dal Tempo Fisico al Tempo Logico

Spesso in un sistema distribuito non importa l'*ora esatta*, ma solo l'*ordine* in cui avvengono gli eventi. Esempi:
- **make / Gradle**: ricompilano un file se il sorgente è più recente del binario → serve solo l'ordinamento, non l'ora assoluta.
- **Replicated bank account**: se due operazioni concorrenti (deposit e withdrawal) arrivano con timestamp simili, l'ordine sbagliato causa inconsistenza.

> Questo problema motiva i **logical clocks**, trattati in C5.

### Verso la Coordinazione

La sincronizzazione temporale (*quando* avvengono le azioni) non basta: serve anche capire la *natura* delle azioni (cosa fanno). La **coordinazione** governa l'interazione tra processi tenendo conto sia della dimensione temporale che di quella semantica. È un problema aperto e centrale nei sistemi distribuiti.

---

## M7 — Computazione con lo Spazio

### Spazio nella Computazione Distribuita

Lo **spazio fisico** è una dimensione intrinseca dei sistemi distribuiti: i nodi sono fisicamente distribuiti e questa distribuzione ha conseguenze computazionali (latenza, topologia di rete, localizzazione dei dati).

### Matematica e Logica dello Spazio

**Geometria**:
- Euclidea (fino al 1800) → assiomatizzazione di Tarski (decidibile, finitary).
- Non-Euclidea (Riemann, Bolyai-Lobachevsky): geometrie valide in spazi curvi.

**Logiche Modali dello Spazio**:
- $\Box$ come operatore di *interior* (interno topologico).
- $\Diamond$ come operatore di *closure* (chiusura topologica).
- **S4** = logica modale dello spazio Euclideo.

**Morfologia Matematica**: operazioni su insiemi nello spazio (es. dilatazione, erosione).

### Spazio in Informatica

**Spazio fisico nei sistemi computazionali**:
- I sistemi distribuiti derivano dalla *distribuzione fisica* dei nodi.
- Il middleware fornisce una topologia logica che astrae quella fisica.
- I sistemi pervasivi e l'IoT rendono la computazione *situata* (il nodo conosce la propria posizione).

**Computational Geometry**: algoritmi su strutture spaziali (triangolazione, convex hull, Voronoi).

**GIS (Geographic Information Systems)**: sistemi informativi geografici.

**VR (Virtual Reality)**: ambienti sintetici con interfacce scientifiche e comportamentali, entità 3D, interazione in tempo reale tramite canali sensomotori.

**Gaming**: Unity3D, Unreal Engine — simulazione di spazio 3D in tempo reale.

### Spazio Fisico + Spazio Computazionale

**LBS (Location-Based Services)**: servizi che si adattano alla posizione dell'utente (es. navigatori, ricerca attività locali).

**AR (Augmented Reality)**: integrazione dinamica del mondo reale e di elementi virtuali.

**Spatial Computing** (Dagstuhl 2006): paradigma computazionale dove:
- Il sistema è **distribuito** (lo spazio è una risorsa).
- Il sistema è **situato** (la posizione è essenziale).
- Lo **spazio** è fondamentale per il problema da risolvere (non solo per la sua realizzazione tecnica).

> Esempio: un algoritmo di routing stradale — lo spazio è parte del *problema*, non solo dell'implementazione.

---

---

# PARTE III — ARCHITETTURE, MODELLI FORMALI, CAP E RECOVERY

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

---

# PARTE IV — PROTOCOLLI AVANZATI E TECNOLOGIE

---

## C3 — Consenso nei Sistemi Distribuiti

### Il Problema del Consenso

Il **consenso** è il processo per cui macchine non affidabili su una rete (potenzialmente asincrona) raggiungono un accordo su un valore. Applicazioni:
- Commit distribuito di una transazione: tutti i nodi devono concordare su commit o abort.
- File system replicati: tutti i nodi devono concordare sulla versione corrente.
- Sistemi di controllo per l'avionica: i nodi devono concordare sullo stato dell'aereo.

### Modelli Temporali

**Modello Sincrono**: esiste un bound $\Delta$ sulla latenza dei messaggi e un bound $\Phi$ sulla velocità dei processi. Questo rende la *failure detection affidabile* (un processo che non risponde entro $\Delta$ è considerato guasto).

**Modello Asincrono**: nessun bound su latency e velocità. La failure detection è *inaffidabile*: un processo lento è indistinguibile da uno guasto.

### Tipi di Consenso

| Tipo | Descrizione |
|---|---|
| **Single-bit consensus** | Accordo su un singolo bit |
| **Interactive consistency** | Ogni processo deve concordare sul vettore di valori iniziali di tutti i processi |
| **Generals Problem (Reliable Broadcast)** | Un nodo trasmette, tutti gli altri devono ricevere lo stesso valore |

### Transaction Commit

Accordo tra tutti i partecipanti di una transazione distribuita: *commit* (conferma) o *abort* (annullamento).

### Il Teorema FLP

**Fischer-Lynch-Paterson (1985)**:

> In un sistema completamente asincrono, anche se è richiesta solo la non-trivialità (ovvero, entrambe le decisioni "commit" e "abort" devono essere raggiungibili), è impossibile garantire il consenso distribuito anche con un solo processo guasto.

**Intuizione**: "Il blocco di un singolo processo in un momento inopportuno può far fallire qualsiasi protocollo di commit distribuito."

**Implicazione pratica**: nei sistemi reali, si accettano due compromessi:
1. Il sistema può essere *temporaneamente non disponibile* (non garantisce liveness in tutti i casi).
2. Si fanno *assunzioni di sincronia parziale* (es. timeout finiti per rilevare i guasti).

### Paxos (Lamport, 1998)

**Ruoli**:
- **Proposer**: propone un valore per conto di un client.
- **Acceptor**: partecipa al voto per decidere quale valore accettare.
- **Learner**: raccoglie le decisioni e le notifica ai client.

**Garanzie**:
- Tolera $f$ guasti con $n \geq 2f + 1$ processi (maggioranza).
- Non tollera guasti Byzantine.
- Garantisce *agreement* e *validity*.
- Garantisce la *termination* solo se c'è un periodo sufficientemente lungo senza contention.

**Fasi di Paxos**:

**Fase 1 — Prepare**:
1. Il proposer sceglie un numero di proposta $n$ (unico, crescente) e invia `prepare(n)` a tutti gli acceptor.
2. Ogni acceptor risponde con `ack(n, ⊥, ⊥)` se non ha mai accettato niente, oppure con `ack(n, v', n')` dove `(v', n')` è il valore e il numero della proposta più recente già accettata.

**Fase 2 — Accept**:
3. Se il proposer riceve una maggioranza di `ack`, invia `accept(v, n)` a tutti gli acceptor (dove `v` è il valore dell'`ack` con il numero più alto ricevuto, o il valore proposto dal client se tutti gli `ack` erano vuoti).
4. Gli acceptor accettano `accept(v, n)` se non hanno già promesso di ignorare $n$ (nel round di Prepare).

**Fase 3 — Decide**:
5. Quando una maggioranza ha accettato $(v, n)$, il valore è definitivo. I learner lo raccolgono e notificano i client.

**Problema del Livelock**: due proposer in competizione possono usurparsi il round a vicenda indefinitamente. Multi-Paxos e l'elezione di un *leader distinto* risolvono questo problema.

### State Machine Replication (SMR)

**Schneider (1990)**: stesso *state machine* replicata su tutti i nodi. Un modulo di consenso garantisce che tutte le operazioni vengano eseguite solo dopo che tutti i nodi hanno concordato sull'ordine.

```
Client → Consensus module → [SM replica 1]
                         → [SM replica 2]
                         → [SM replica 3]
```

### Oltre Paxos

| Sistema | Algoritmo | Note |
|---|---|---|
| **Multi-Paxos** | Paxos + leader stabile | SMR efficiente |
| **ZooKeeper / ZAB** | ZooKeeper Atomic Broadcast | Leader-based, ottimizzato per alta frequenza di scritture |
| **Raft** | Raft | Pensato per essere comprensibile; leader election + log replication |
| **Egalitarian Paxos** | EPaxos | Nessun leader designato; latenza ottimale |
| **Google Chubby** | Paxos | Servizio di lock distribuito di Google |

---

## C4 — Blockchain

### Cos'è una Blockchain

Una **blockchain** è un registro (ledger) distribuito, decentralizzato e immutabile, che memorizza transazioni in blocchi concatenati crittograficamente.

Proprietà chiave:
- **Decentralizzazione**: nessun nodo di controllo centrale.
- **Immutabilità**: un blocco, una volta aggiunto, non può essere modificato senza alterare tutti i blocchi successivi.
- **Trasparenza**: tutti i partecipanti possono verificare la storia delle transazioni.
- **Trustless**: la fiducia è garantita dalla matematica (crittografia), non da un'autorità centrale.

### Struttura di un Blocco

```
┌─────────────────────────────────┐
│ Block Header                    │
│ ├── Previous Block Hash         │ ← Collegamento al blocco precedente
│ ├── Timestamp                   │
│ ├── Nonce                       │ ← Valore variabile per il mining
│ └── Merkle Root                 │ ← Hash dell'albero delle transazioni
├─────────────────────────────────┤
│ Transactions                    │
│ ├── Tx 1                        │
│ ├── Tx 2                        │
│ └── ...                         │
└─────────────────────────────────┘
```

**Merkle Tree**: struttura ad albero dove ogni foglia è l'hash di una transazione e ogni nodo interno è l'hash dei suoi figli. La radice (Merkle Root) riassume in modo efficiente tutte le transazioni del blocco.

### Crittografia nella Blockchain

**Hash crittografici** (es. SHA-256):
- Funzione a senso unico: facile calcolare $H(x)$, impossibile calcolare $x$ da $H(x)$.
- Proprietà: collision resistance (due input diversi producono hash diversi con probabilità astronomicamente bassa).

**Firma digitale** (ECDSA):
- Ogni partecipante ha una coppia di chiavi: chiave privata (segreta) e chiave pubblica.
- Le transazioni vengono firmate con la chiave privata.
- Chiunque può verificare la firma con la chiave pubblica.

### Algoritmi di Consenso per Blockchain

**Proof of Work (PoW)**:
- I minatori competono per trovare un `nonce` tale che $H(\text{block}) < \text{target}$.
- Chi trova prima il nonce aggiunge il blocco e riceve una ricompensa.
- Il consenso è determinato dalla *longest chain* (catena più lunga = più computazione investita).
- **Vantaggi**: sicuro, decentralizzato. **Svantaggi**: enorme consumo energetico (es. Bitcoin ≈ consumi di un paese).

**Proof of Stake (PoS)**:
- I validatori vengono scelti in proporzione alla loro partecipazione (stake) nella criptovaluta.
- Nessuna computazione energivora.
- **Slashing**: i validatori che si comportano male perdono parte del loro stake.
- Usato da Ethereum (dal 2022, dopo il "The Merge").

**Proof of Authority (PoA)**:
- I validatori sono nodi pre-autorizzati (identità nota e verificata).
- Usato nelle blockchain *permissioned* (es. reti aziendali).
- Alta efficienza, bassa decentralizzazione.

**Practical Byzantine Fault Tolerance (PBFT)**:
- Tolera guasti Byzantine (nodi malevoli), non solo crash.
- Richiede $n \geq 3f + 1$ nodi per tollerare $f$ guasti Byzantine.
- Usato in blockchain aziendali (es. Hyperledger Fabric).

### Bitcoin vs Ethereum

| | Bitcoin | Ethereum |
|---|---|---|
| **Scopo primario** | Valuta digitale | Piattaforma per smart contract |
| **Consenso** | PoW | PoS (dal 2022) |
| **Smart Contract** | Limitati (Script) | Turing-completi (Solidity/EVM) |
| **Block time** | ~10 minuti | ~12 secondi |
| **Scalabilità** | ~7 TPS | ~15 TPS (ma in miglioramento) |

### Smart Contract

Un **smart contract** è codice che gira direttamente sulla blockchain. Caratteristiche:
- **Self-executing**: si eseguono automaticamente al verificarsi delle condizioni stabilite.
- **Immutabili**: una volta deployati, non possono essere modificati.
- **Deterministici**: tutti i nodi ottengono lo stesso risultato.
- **Trasparenti**: il codice è visibile a tutti.

Ethereum Virtual Machine (EVM): environment di esecuzione degli smart contract su Ethereum.

**Esempi di applicazioni**:
- **DeFi** (Decentralized Finance): exchange decentralizzati, lending, yield farming.
- **NFT** (Non-Fungible Tokens): tokenizzazione di asset digitali unici.
- **DAO** (Decentralized Autonomous Organizations): governance on-chain tramite voto dei token holder.

### Scalabilità e Problemi Aperti

**Trilemma di Ethereum** (Buterin):
> Una blockchain non può avere simultaneamente *decentralizzazione*, *sicurezza* e *scalabilità*.

**Soluzioni per la scalabilità**:
- **Layer 2 (L2)**: rollup (Optimistic Rollups, ZK-Rollups) che aggregano le transazioni off-chain e pubblicano solo il risultato su L1.
- **Sharding**: dividere la blockchain in "shard" paralleli.
- **Sidechains**: catene laterali con bridge verso la mainchain.

### Blockchain nei Sistemi Distribuiti

Nella prospettiva dei sistemi distribuiti, la blockchain è un *sistema di consenso* che:
- Garantisce l'accordo su una sequenza di transazioni (replica di un log).
- Non richiede fiducia in nessun nodo centrale (trustless).
- Usa PoW/PoS come meccanismo di consenso *Sybil-resistant* (resistente alla creazione di falsi nodi).

Ma ha limitazioni:
- **Latenza alta** (minuti per la finalità in PoW).
- **Throughput basso** (decine di TPS vs migliaia per sistemi centralizzati).
- **Immutabilità = rigidità**: bug negli smart contract non si possono correggere facilmente.

---

## C5 — Orologi Logici

### Azioni ed Events nei Sistemi Distribuiti

In qualsiasi computazione, una sequenza di *azioni* produce *eventi*. In un sistema distribuito, gli eventi si verificano in luoghi multipli e non esiste un orologio globale condiviso.

**Causalità interna** (trackable dal sistema):
- Un evento $c$ può causare un evento $e$ se:
  - Sono nello stesso processo e $c$ precede $e$; oppure
  - Processi diversi e $e$ potrebbe conoscere $c$ tramite una catena di messaggi.

### La Relazione Happened-Before (Lamport, 1978)

La relazione $\rightarrow$ (happened-before) è la chiusura transitiva di:

1. **Stessa sequenza**: se $a$ e $b$ sono eventi dello stesso processo, $a \rightarrow b$ se $a$ precede $b$.
2. **Comunicazione**: se $a$ = *send* di un messaggio e $b$ = *receive* dello stesso messaggio, allora $a \rightarrow b$.
3. **Transitività**: se $a \rightarrow b$ e $b \rightarrow c$, allora $a \rightarrow c$.

La relazione $\rightarrow$ definisce un *ordine parziale* sugli eventi.

Due eventi sono **concorrenti** ($a \| b$) se né $a \rightarrow b$ né $b \rightarrow a$.

### Storie Causali

Assegna a ogni evento un nome unico (nodo + contatore). La *storia causale* $H(e)$ di un evento è l'insieme di tutti gli eventi che lo precedono causalmente:

$$H(e) = \{e\} \cup \bigcup_{a \rightarrow e} H(a)$$

- **Invio**: il messaggio porta la storia causale del sender.
- **Ricezione**: la storia causale del receiver diventa l'unione della propria e di quella del messaggio.

**Svantaggio**: le storie causali crescono esponenzialmente — non scalano.

### Clock Logici

Un **clock logico** è una funzione $C: \text{eventi} \rightarrow T$ (un insieme totalmente ordinato) tale che:

$$a \rightarrow b \Rightarrow C(a) < C(b) \quad \text{(clock consistency)}$$

Un clock è **strongly consistent** se:

$$a \rightarrow b \Leftrightarrow C(a) < C(b)$$

### Algoritmo di Lamport (Scalar Clock)

Ogni processo $p_i$ mantiene un contatore logico $lc_i$. Regole:

- **R1 (Prima di ogni evento)**: $lc_i \leftarrow lc_i + \delta$ (tipicamente $\delta = 1$).
- **R2 (Invio di messaggio)**: il messaggio viene inviato con il timestamp $lc_i$.
- **R3 (Ricezione di messaggio con timestamp $ts$)**: $lc_j \leftarrow \max(lc_j, ts)$, poi applica R1.

**Proprietà**:
- Garantisce *clock consistency* ($a \rightarrow b \Rightarrow lc(a) < lc(b)$).
- **Non** garantisce *strong consistency* ($lc(a) < lc(b) \not\Rightarrow a \rightarrow b$).

**Uso pratico**: permette di definire un *ordine totale* sugli eventi (con tie-breaking tramite ID del processo), utile per la State Machine Replication.

**Event counting**: se $\delta = 1$, il timestamp di un evento corrisponde all'altezza dell'evento nel grafo causale (numero di eventi sul percorso causale più lungo).

### Vector Clocks

Ogni processo $p_i$ mantiene un vettore $vc_i$ di $n$ elementi (uno per processo):
- $vc_i[i]$: clock scalare locale.
- $vc_i[j]$: il numero di eventi di $p_j$ di cui $p_i$ è a conoscenza.

**Regole**:
1. **Prima di ogni evento locale**: $vc_i[i]++$
2. **Invio di messaggio**: il messaggio porta $vc_i$ come timestamp.
3. **Ricezione di messaggio con timestamp $ts$**: $\forall k, vc_j[k] \leftarrow \max(vc_j[k], ts[k])$, poi applica la regola 1.

**Ordinamento dei vector clock**:
$$vc(m_1) < vc(m_2) \Leftrightarrow \forall i: vc(m_1)_i \leq vc(m_2)_i \text{ and } \exists i': vc(m_1)_{i'} < vc(m_2)_{i'}$$

**Strong consistency**:
$$vc(m_1) < vc(m_2) \Leftrightarrow m_1 \rightarrow m_2$$

> I vector clock sono **strongly consistent**: danno una rappresentazione esatta della causalità. Il loro limite è la dimensione $O(n)$ per ogni messaggio.

**Matrix Clocks**: estensione a matrice dove $mc_i[j]$ è il vector clock di $p_j$ come visto da $p_i$. Permette di sapere "cosa $p_i$ sa che $p_j$ sa" — usato per il garbage collection dei log.

---

## C6 — Mobilità del Codice

### Motivazioni

A volte non basta spostare i *dati*: conviene spostare l'*esecuzione* stessa. Motivazioni:
- **Load balancing**: spostare computazione verso nodi meno carichi.
- **Sicurezza**: eseguire codice untrusted in un ambiente isolato remoto.
- **Scalabilità**: avvicinare la computazione ai dati (evita trasmissioni massive).
- **Riduzione della latenza**: code as a request = meno round trip.

### Il Modello del Processo

Un processo è composto da tre segmenti:
- **Code segment**: le istruzioni del programma.
- **Execution segment**: stato di esecuzione (program counter, stack, variabili locali).
- **Resource segment**: riferimenti a risorse esterne (file aperti, connessioni, device).

### Weak Mobility vs Strong Mobility

| | Weak Mobility | Strong Mobility |
|---|---|---|
| **Cosa si trasferisce** | Solo code segment (+ dati di inizializzazione) | Code + execution segment |
| **Esecuzione** | Il target riparte da capo (*ex novo*) | Il target riprende dall'esatto punto di sospensione |
| **Complessità** | Semplice | Richiede supporto del middleware |
| **Esempi** | JavaScript nel browser, Java Applets | Agenti mobili (Aglets, JADE) |

### Sender-Initiated vs Receiver-Initiated

- **Sender-initiated**: il codice parte da dove risiede e migra verso un target. Usato negli *agenti mobili* (es. spider di ricerca). Più complesso (il sender deve sapere dove andare).
- **Receiver-initiated (Client-initiated)**: il target richiede nuovo comportamento. Usato in JavaScript, Java Applets, plugin. Più semplice (i client possono essere anonimi e connettersi senza accordi preventivi).

### Cloning vs Migrating

- **Migrating**: il processo si sposta — smette di esistere sul nodo sorgente e riprende sul nodo destinazione.
- **Cloning**: il processo viene *copiato* — entrambe le copie continuano ad eseguire in parallelo (analogo di `fork()` remoto).

### Esecuzione Separata vs In-Process

- **Esecuzione nel processo target** (stesso address space): alta performance, ma rischio di sicurezza (il codice foreign può accedere alle risorse del processo host). Es: plugin, extensioni.
- **Esecuzione in processo separato**: isolamento, ma overhead di IPC. Usato da Java Applets nel browser.

### Binding Risorsa-Macchina

| Tipo di binding | Descrizione | Mobilità |
|---|---|---|
| **Unattached** | Risorsa non legata a una macchina specifica (es. file) | Facile da muovere |
| **Fastened** | Risorsa legata ma spostabile con costo (es. DB locale) | Spostabile con sforzo |
| **Fixed** | Risorsa non spostabile (es. monitor hardware) | Non spostabile |

### Binding Processo-Risorsa

| Tipo di riferimento | Descrizione |
|---|---|
| **Per identificatore** | URL, riferimento diretto alla risorsa specifica |
| **Per valore** | Il valore viene copiato (es. librerie di codice) |
| **Per tipo** | Il processo richiede un tipo di risorsa (es. "una stampante"), che viene soddisfatta localmente |

---

## CX — Kubernetes: Orchestrazione di Container

*Presentato da Mattia Matteini, 13 ottobre 2025*

### Motivazioni

1. La containerizzazione (Docker) ha aperto nuovi paradigmi di deployment.
2. La maggior parte del software moderno è distribuito e complesso.
3. I requisiti non-funzionali (scalabilità, affidabilità, manutenibilità) sono diventati critici.
4. Kubernetes è il **de facto standard** per l'orchestrazione di container.

### Cosa NON è Kubernetes

- Una piattaforma di containerizzazione (quello è Docker).
- Un PaaS (come Heroku).
- Un cloud provider.
- Uno strumento di CI/CD.
- Uno strumento di logging/monitoring (ma offre integrazioni).

### Kubernetes vs Docker Swarm

| | Docker Swarm | Kubernetes |
|---|---|---|
| **Complessità** | Semplice | Complesso, feature-rich |
| **Cluster** | Piccoli/medi | Grandi, enterprise |
| **Scaling** | Manuale | Automatico |
| **Load balancing** | Manuale | Automatico |
| **Configurazione** | `docker-compose.yml` | YAML manifests + kubectl |
| **Access control** | TLS-based | RBAC (Role-Based Access Control) |

### Funzionalità Chiave

#### 1. Immutabilità
Le risorse K8s non si modificano in place: vengono eliminate e ricreate. I container sono *efemeri* e *stateless* per design. Questo garantisce consistenza e replica fedele dello stato desiderato.

#### 2. Configurazione Dichiarativa
"Everything is an object" — la configurazione descrive lo stato *desiderato*. K8s si occupa di raggiungere (e mantenere) quello stato.

```bash
kubectl apply -f my-deployment.yaml
```

#### 3. Autoscaling
- **Horizontal Pod Autoscaler (HPA)**: aumenta/diminuisce il numero di repliche in base a metriche (CPU, memoria).
- **Vertical Pod Autoscaler (VPA)**: aumenta/diminuisce le risorse assegnate a ciascun container.

#### 4. Self-healing
- Container falliti vengono automaticamente riavviati.
- Se un nodo cade, i Pod vengono riprogrammati su altri nodi.
- Il traffico viene rediretto lontano dai container non sani.

#### 5. Container Runtime Interface (CRI)
K8s supporta qualsiasi runtime compatibile CRI: Docker (tramite shim), `containerd`, `CRI-O`, Mirantis Container Runtime.

### Architettura del Cluster

```
┌─────────────────── Kubernetes Cluster ───────────────────┐
│                                                           │
│  ┌─── Control Plane ──────────────────────────────────┐  │
│  │  kube-apiserver    → REST API per kubectl e nodi   │  │
│  │  etcd              → key-value store (metadata)    │  │
│  │  kube-scheduler    → assegna Pod ai nodi           │  │
│  │  kube-controller   → mantiene lo stato desiderato  │  │
│  │  cloud-controller  → integrazione cloud provider   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─── Worker Node 1 ──┐  ┌─── Worker Node 2 ──┐         │
│  │  kubelet           │  │  kubelet            │         │
│  │  kube-proxy        │  │  kube-proxy         │         │
│  │  container runtime │  │  container runtime  │         │
│  │  [Pod] [Pod]       │  │  [Pod] [Pod]        │         │
│  └────────────────────┘  └─────────────────────┘         │
└───────────────────────────────────────────────────────────┘
```

**Control Plane**:
- `kube-apiserver`: componente centrale; espone l'API K8s (REST); tutti i comandi `kubectl` passano da qui.
- `etcd`: database key-value distribuito; memorizza i metadati del cluster (stato desiderato).
- `kube-scheduler`: osserva i Pod senza nodo assegnato e li schedula su un Worker Node appropriato.
- `kube-controller-manager`: esegue i *controller* (deployment controller, node controller, ecc.).
- `cloud-controller-manager`: gestisce le integrazioni con il cloud provider (es. per creare LoadBalancer).

**Worker Node**:
- `kubelet`: agente su ogni nodo; garantisce che i container dei Pod siano in esecuzione.
- `kube-proxy`: gestisce le regole di rete per i Service.
- Container runtime: Docker, containerd, ecc.

### Oggetti Kubernetes

Un oggetto K8s è un'entità persistente che rappresenta lo stato del cluster. È un "record of intent":

```yaml
apiVersion: ...    # versione dell'API K8s
kind: ...          # tipo di oggetto (Pod, Deployment, Service...)
metadata:          # nome, labels, namespace
  name: ...
spec:              # stato DESIDERATO
  ...
status:            # stato ATTUALE (aggiornato da K8s)
  ...
```

#### Pod

Il **Pod** è l'unità minima deployable. Può contenere uno o più container che condividono:
- Indirizzo IP e porte.
- Hostname.
- Storage volumes.
- Process identifiers (PIDs).

**Casi d'uso multi-container**:
- **Sidecar**: container ausiliario che estende le funzionalità del principale (es. logging agent).
- **Ambassador**: proxy locale che gestisce la comunicazione verso l'esterno.
- **Adapter**: standardizza l'output del container principale.

Esempio di manifest Pod:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.14.2
    ports:
    - containerPort: 80
```

#### ReplicaSet

Mantiene un numero specificato di repliche identiche di un Pod in esecuzione. Di solito non si gestisce direttamente — si usa un Deployment.

#### Deployment

Gestisce Pod (tramite ReplicaSet). Funzionalità chiave:
- **Rollout**: aggiornamento dichiarativo (es. nuova versione dell'immagine) senza downtime.
- **Rollback**: ritorno alla versione precedente in caso di problemi.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

**Oggetti alternativi al Deployment**:
- **Job**: task one-shot (run-to-completion).
- **CronJob**: task programmato periodicamente.
- **StatefulSet**: Pod con identità stabile (es. database).
- **DaemonSet**: un Pod su *ogni* nodo del cluster (es. agente di monitoraggio).

#### Service

Un Service espone un insieme di Pod tramite un *endpoint stabile* (IP + DNS name), indipendentemente da dove i Pod si trovano. Usa **label selectors** per identificare i Pod.

**Tipi di Service**:

| Tipo | Descrizione |
|---|---|
| **ClusterIP** (default) | Accesso solo dall'interno del cluster |
| **NodePort** | Espone il service su una porta statica di ogni nodo |
| **LoadBalancer** | Usa un load balancer esterno (cloud provider o MetalLB on-premise) |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: NodePort
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
```

### Esempio Pratico: Flask + Redis → Kubernetes

**Scenario**: una web app che conta le visite, composta da un backend Flask e Redis.

**Da Docker Compose**:
```yaml
services:
  backend:
    image: mala1180/kubernetes-example-backend:latest
    ports: ["3000:3000"]
    environment:
      - REDIS_HOST=redis
  redis:
    image: redis:7-alpine
```

**A Kubernetes** (per ogni servizio in Compose: Deployment + Service):

```yaml
# backend-hpa.yaml — HPA attivato se CPU > 50% o memoria > 70%
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

**Stack di monitoring** (Prometheus + Grafana):
- **Prometheus**: scraping delle metriche dai Pod tramite endpoint `/metrics`.
- **Grafana**: dashboard per visualizzare le metriche raccolte da Prometheus.
- **kube-state-metrics**: esporta metriche sullo stato degli oggetti K8s (Deployment, Pod, Node...).

---

---

# PARTE V — LABORATORIO

---

## LAB 1 — Preliminari sull'Ingegneria dei Sistemi Distribuiti

### Definizioni Introduttive

Prima di affrontare la pratica, è utile raccogliere le diverse prospettive su *cosa sia* un sistema distribuito:

| Fonte | Definizione | Enfasi |
|---|---|---|
| **Lamport (1987)** | "Un sistema distribuito è uno in cui il guasto di un computer che non sapevi esistesse rende il tuo computer inutilizzabile." | Interdipendenze nascoste |
| **Tanenbaum & van Steen** | "Una collezione di computer indipendenti che appare ai suoi utenti come un singolo sistema coerente." | Illusione di unità |
| **Coulouris et al.** | "Un sistema in cui hardware o software si trovano su computer connessi in rete e comunicano e coordinano le proprie azioni solo tramite scambio di messaggi." | Message passing |
| **Van Roy & Haridi** | "Un insieme di computer collegati da una rete." | Astrazione massima |

**Caratteristiche essenziali** che emergono dalle definizioni:
- Componenti indipendenti.
- Comunicazione tramite messaggi.
- Sfida: presentare un sistema unificato nonostante guasti e complessità.

### Perché Rendere Distribuito un Sistema?

| Motivazione | Spiegazione |
|---|---|
| **Scalabilità** | Gestire sistemi su larga scala in modo efficiente |
| **Fault Tolerance & Availability** | Assicurare affidabilità nonostante i guasti |
| **Bassa Latenza & Geo-distribuzione** | Migliore UX per utenti distribuiti globalmente |
| **Resource Sharing** | Uso efficiente di CPU e storage |
| **Gestione Big Data** | Elaborare i dati localmente invece di trasportarli |
| **Parallelismo** | Velocizzare i task tramite esecuzione concorrente |
| **Efficienza dei Costi** | Ridurre i costi infrastrutturali tramite resource pooling |
| **Collaborazione** | Aggiornamenti in tempo reale e interazioni a distanza |

**Esempi reali**: Google Search, Instagram/WhatsApp, Amazon, Online Gaming (LoL/Fortnite), Google Docs, Federated Learning (Gboard).

### Come Cambia il Workflow di Software Engineering per i DS?

**Workflow SE classico**: raccolta casi d'uso → analisi requisiti → design → implementazione → verifica → release → deployment → documentazione → manutenzione.

**Aggiustamenti per i sistemi distribuiti**:

**Analisi dei requisiti** (aggiuntivi):
- Requisiti di *latenza* (max tollerata).
- Requisiti di *disponibilità* (quanti "nines"?).
- Requisiti di *consistenza* (forte o eventuale?).
- Requisiti di *sicurezza* (autenticazione, autorizzazione, crittografia).
- Requisiti di *scalabilità* (stima del carico, picchi).

**Design** (aggiuntivo):
- Quante *repliche* del servizio? Dove sono *localizzate*?
- Quali *protocolli di comunicazione* (REST, gRPC, message queue...)?
- Quale *modello di consistenza* adottare?

**Deployment** (molto più importante):
- Containerizzazione (Docker).
- Orchestrazione (Kubernetes).
- Configurazione dell'infrastruttura (IaC: Terraform, Ansible).
- Monitoring e alerting.

---

## LAB 2 — Meccanismi di Comunicazione: Socket

### Contesto

I sistemi distribuiti richiedono che i nodi comunicino sulla rete. L'astrazione di base per la comunicazione di rete è il **socket** (Berkeley API, anni '80), disponibile in praticamente tutti i linguaggi di programmazione.

**Perché studiare i socket**:
- API stabile e antica (→ didattica eccellente).
- Tutti i protocolli di livello superiore (HTTP, RPC, gRPC, WebSocket...) sono costruiti sopra i socket.
- Espone concetti fondamentali: connection-oriented vs connectionless, stream vs message-based.

### Definizione di Socket

> Un socket è una rappresentazione astratta per l'endpoint locale di un percorso di comunicazione di rete.

Interpretazione: è il *gateway* di un processo verso la rete, che fornisce un mezzo di comunicazione full-duplex, multiplexable, point-to-point o point-to-multipoint verso altri processi distribuiti sulla rete.

**Proprietà**:
- **Multiplexable**: più socket indipendenti su porte diverse.
- **Full-duplex**: dati in entrambe le direzioni simultaneamente.
- **Point-to-point** o **point-to-multipoint**: una socket può comunicare con uno o più peer.

### Due Tipi di Socket

| | Stream Socket | Datagram Socket |
|---|---|---|
| **Protocollo tipico** | TCP | UDP |
| **Modello** | Connection-oriented | Connectionless |
| **Unità di dati** | Stream di byte (illimitato) | Pacchetto (max 64 KiB in UDP) |
| **Ordine** | Garantito | Non garantito |
| **Affidabilità** | Garantita | Non garantita |
| **Uso tipico** | HTTP, FTP, database | DNS, video streaming, giochi online |

### Jargon dei Socket

- **Client socket**: il socket che *inizia* la comunicazione.
- **Server socket**: il socket che *accetta* la comunicazione.
- **Endpoint**: coppia (indirizzo IP, porta) che identifica univocamente un socket.
- **Well-known ports**: 0–1023, riservate per protocolli standard (HTTP=80, HTTPS=443, SSH=22).
- **Porte custom**: 1024–65535.

### Datagram Socket in Python

```python
import socket

# Creazione socket datagram (UDP, IPv4)
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Binding (associa al proprio endpoint per ricevere)
sock.bind(('0.0.0.0', 12345))

# Invio datagramma
payload = 'Hello, world!'
recipient = ('A.B.C.D', 54321)
sock.sendto(payload.encode(), recipient)

# Ricezione datagramma
data, sender = sock.recvfrom(bufsize=4096)
data = data.decode()
print(f'Ricevuto: "{data}" da "{sender}"')
```

**Punti chiave**: `AF_INET` = IPv4; `SOCK_DGRAM` = UDP; `bind()` associa il socket per ricevere; `sendto()` specifica il destinatario ogni volta; `recvfrom()` restituisce dati e mittente.

### Stream Socket in Python

```python
import socket

# Lato SERVER
server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.bind(('0.0.0.0', 8080))
server_sock.listen(5)
client_sock, addr = server_sock.accept()  # blocca fino a connessione

# Lato CLIENT
client_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_sock.connect(('server_ip', 8080))

# Scambio dati
client_sock.sendall(b'Hello, server!')
data = client_sock.recv(1024)
client_sock.close()
```

**Flusso server**: `bind` → `listen` → `accept` (loop). **Flusso client**: `connect` → scambia dati → `close`. Connessione persistente — non serve specificare il destinatario ogni volta.

---

## LAB 3 — Distributed Pong: Progettazione di un Gioco Distribuito

### Contesto

**Pong** (1972) implementato in versione **distribuita** in Python con **PyGame**, come esempio pratico di progettazione di un sistema distribuito.

**Repository**: `https://github.com/unibo-fc-isi-ds/dpongpy`  
**Installazione**: `pip install dpongpy`

### PyGame — Fondamenti

**PyGame** è una libreria Python per lo sviluppo di giochi 2D: gestisce grafica, audio, input, timing. Semplice da usare, leggero e portabile. Installazione: `pip install pygame`.

### Il Game Loop

Il **game loop** è il ciclo principale di ogni videogioco. Gestisce:

1. **Input utente** (keyboard, mouse, gamepad).
2. **Aggiornamento dello stato di gioco** (posizione oggetti, punteggi...).
3. **Rendering** (disegna il mondo di gioco sullo schermo).
4. **Simulazione del tempo** (muove gli oggetti anche senza input).

**Caratteristiche PyGame per il game loop**:
- **Event queue**: coda di eventi (`pygame.KEYDOWN`, ecc.).
- `pygame.event.get()`: legge eventi dalla coda.
- `pygame.event.post(event)`: aggiunge eventi artificiali alla coda.

### Clean Code per Giochi Distribuiti

#### 1. Game Objects

```python
class GameObject:
    name: str
    position: Vector2  # dal modulo pygame.math
    size: Vector2
    speed: Vector2
    
    def update(self, dt: float):
        self.position += self.speed * dt
```

#### 2. Input Handler e Controller

```python
class GameEvent(Enum):
    MOVE_UP = custom_type()
    MOVE_DOWN = custom_type()
    STOP = pygame.QUIT

class InputHandler:
    keymap: Dict[int, int]      # tasto → GameEvent
    def handle_inputs(self) -> List[int]: ...

class Controller:
    def handle_event(self, event: GameEvent): ...
```

Questa separazione permette di inviare in rete `GameEvent` invece di raw input → indipendenza dal dispositivo.

### Architettura del Sistema Distribuito: Pong

**Modalità centralizzata** (implementata nel lab):

```
[Terminal LEFT]  ←─── network ───→  [Coordinator Server]
                                           │
[Terminal RIGHT] ←─── network ───→  [Coordinator Server]
```

- **Coordinator**: gestisce lo stato di gioco centralizzato; riceve input dai terminal; invia lo stato aggiornato.
- **Terminal**: gestisce l'input locale e il rendering locale; invia comandi al coordinator.

**Comandi**:
```bash
# Avvio coordinator
python -m dpongpy -mode centralised -role coordinator

# Avvio terminal sinistro (WASD)
python -m dpongpy -mode centralised -role terminal -side left -keys wasd -host IP_COORD

# Avvio terminal destro (frecce)
python -m dpongpy -mode centralised -role terminal -side right -keys arrows -host IP_COORD
```

### Sfide nella Distribuzione di un Gioco Real-Time

- **Sincronizzazione dello stato**: il coordinator propaga lo stato a tutti i terminal; divergenza → esperienza di gioco deteriorata.
- **Latenza**: input lag negativo per l'esperienza utente.
- **Tecniche avanzate** (non implementate nel lab di base): client-side prediction, server reconciliation, entity interpolation.

---

## Appendice: Concetti Python Utili per il Lab

### Serializzazione dei Dati

```python
import json

# JSON (sicuro, cross-platform)
data = {'x': 1, 'y': 2}
bytes_out = json.dumps(data).encode('utf-8')
data_back = json.loads(bytes_out.decode('utf-8'))
```

> ⚠️ Non usare `pickle` per dati ricevuti da fonti non fidate (vulnerabilità di sicurezza).

### Threading per Socket

```python
import threading

def handle_client(client_sock, addr):
    data = client_sock.recv(1024)
    # elabora...
    client_sock.close()

server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.bind(('0.0.0.0', 8080))
server_sock.listen(10)

while True:
    client_sock, addr = server_sock.accept()
    t = threading.Thread(target=handle_client, args=(client_sock, addr))
    t.start()
```

### Ambienti Virtuali Python

```bash
python -m venv venv
venv\Scripts\activate     # Windows

pip install pygame dpongpy
```

---

---

## Riepilogo Generale

| Modulo | Argomenti Chiave |
|---|---|
| **M0** | Distribuzione spaziale/temporale; vantaggi: economicità, scalabilità, fault tolerance |
| **M1** | Catena Fault→Error→Failure; modelli di failure; availability/reliability (nines); ridondanza |
| **M2** | Computazione seq./conc./distr.; ordinamento parziale degli eventi; no global clock |
| **M3** | Tradeoff consistenza/performance; modelli data-centric e client-centric; sistemi reali |
| **M4** | 5 obiettivi; 8 fallacies di Deutsch; middleware; trasparenza (7 tipi); scalabilità (3 dimensioni) |
| **M5** | Cluster, Grid, TP Systems (ACID), pervasive (BAN, sensori); cloud native (CNCF) |
| **M6** | CPS; orologi fisici (offset, skew, drift); NTP; Berkeley; RBS; tempo logico |
| **M7** | Spazio fisico nei DS; logica S4; GIS; VR; LBS; AR; Spatial Computing |
| **M8** | 5 stili: layered, object-based, data-centered, event-based, shared data-space |
| **M9** | ACP/CCS/CSP; SOS → LTS; operatori +/;/∥; branching vs linear time |
| **C1** | CAP: al massimo 2 su 3; P obbligatorio → scegliere A vs C; ACID vs BASE |
| **C2** | Checkpointing + message logging; stato globale consistente; PDA; Chandy-Lamport; pessimistic/optimistic/causal |
| **C3** | FLP impossibility; Paxos (Prepare+Accept+Decide); SMR; Raft; ZooKeeper |
| **C4** | Struttura blocchi; Merkle Tree; PoW/PoS/PBFT; Bitcoin vs Ethereum; Smart Contract; trilemma |
| **C5** | Happened-before; Lamport scalar (consistente, non strongly); Vector clocks (strongly consistent); Matrix clocks |
| **C6** | Weak vs strong mobility; sender vs receiver-initiated; migration vs cloning; binding risorsa |
| **CX** | Cluster architecture; Pod/ReplicaSet/Deployment/Service/HPA; kubectl; Prometheus+Grafana |
| **LAB 1** | Definizioni DS; motivazioni; workflow SE per DS; requisiti di latency/availability/consistency |
| **LAB 2** | Berkeley socket API; stream vs datagram; Python `socket` module; porte e indirizzi |
| **LAB 3** | PyGame; game loop; game objects/input handler; architettura coordinator-terminal; sfide real-time |

---

*Fine delle dispense di Sistemi Distribuiti — A.A. 2025/2026.*  
*Documento generato da tutte le slide del corso (23 PDF). Per approfondimenti, riferirsi a Tanenbaum & van Steen, *Distributed Systems. Principles and Paradigms*, 3ª ed., e alla documentazione online del corso su Virtuale (Università di Bologna).*
