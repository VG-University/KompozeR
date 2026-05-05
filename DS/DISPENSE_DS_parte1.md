# Sistemi Distribuiti — Dispense Universitarie
## Parte 1: Fondamenti — Perché i Sistemi Distribuiti, Dependability, Radici Computazionali, Replicazione e Consistenza

**Corso:** Distributed Systems — A.A. 2025/2026  
**Docenti:** Andrea Omicini (Teoria, M1) · Giovanni Ciatto (Lab, M2)  
**Università:** Alma Mater Studiorum — Università di Bologna (Campus Cesena)  
**Esame:** Discussione orale di un progetto individuale/di gruppo, concordato col docente  
**Riferimento principale:** Tanenbaum & van Steen, *Distributed Systems. Principles and Paradigms*, 3ª ed.

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

## Riepilogo Parte 1

| Argomento | Concetti Chiave |
|---|---|
| **M0 — Perché DS** | Distribuzione spaziale/temporale; vantaggi economicità, scalabilità, fault tolerance |
| **M1 — Dependability** | Catena Fault→Error→Failure; modelli di failure; availability/reliability; ridondanza |
| **M2 — Radici computazionali** | Computazione sequenziale/concorrente/distribuita; ordinamento parziale degli eventi; no global clock |
| **M3 — Replicazione** | Tradeoff consistenza/performance; modelli data-centric e client-centric; sistemi reali |

---

*Documento generato da tutte le slide del corso. Per approfondimenti, riferirsi a Tanenbaum & van Steen, 3ª ed.*
