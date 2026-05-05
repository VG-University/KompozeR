# Sistemi Distribuiti — Dispense Universitarie
## Parte 4: Consenso, Blockchain, Orologi Logici, Mobilità del Codice, Kubernetes

**Corso:** Distributed Systems — A.A. 2025/2026  
**Docenti:** Andrea Omicini (Teoria) · Giovanni Ciatto (Lab) · Mattia Matteini (Kubernetes)  
**Università:** Alma Mater Studiorum — Università di Bologna (Campus Cesena)

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

> *Nota: questo capitolo è basato sulle slide del corso (89.971 caratteri). Il contenuto è stato estratto e sintetizzato dall'intero documento.*

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

Un oggetto K8s è un'entità persistente che rappresenta lo stato del cluster. È un "record di intent":

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

## Riepilogo Parte 4

| Argomento | Concetti Chiave |
|---|---|
| **C3 — Consenso** | FLP impossibility; Paxos (ruoli, fasi Prepare+Accept+Decide); SMR; Raft; ZooKeeper |
| **C4 — Blockchain** | Struttura blocchi; Merkle Tree; PoW/PoS/PBFT; Bitcoin vs Ethereum; Smart Contract; scalability trilemma |
| **C5 — Orologi Logici** | Happened-before; Lamport scalar clock (consistente, non strongly); Vector clocks (strongly consistent); Matrix clocks |
| **C6 — Mobilità Codice** | Weak vs strong mobility; sender vs receiver-initiated; migration vs cloning; binding risorsa-macchina |
| **CX — Kubernetes** | Cluster architecture; Pod, ReplicaSet, Deployment, Service, HPA; kubectl; Prometheus+Grafana |

---

*Documento generato da tutte le slide del corso. Per approfondimenti, riferirsi a Tanenbaum & van Steen, 3ª ed.*
