# Sistemi Distribuiti — Dispense Universitarie
## Parte 2: Obiettivi, Tipologie, Tempo, Spazio

**Corso:** Distributed Systems — A.A. 2025/2026  
**Docenti:** Andrea Omicini (Teoria) · Giovanni Ciatto (Lab)  
**Università:** Alma Mater Studiorum — Università di Bologna (Campus Cesena)

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

La sincronizzazione temporale (*quando* avvengono gli azioni) non basta: serve anche capire la *natura* delle azioni (cosa fanno). La **coordinazione** governa l'interazione tra processi tenendo conto sia della dimensione temporale che di quella semantica. È un problema aperto e centrale nei sistemi distribuiti.

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

## Riepilogo Parte 2

| Argomento | Concetti Chiave |
|---|---|
| **M4 — Obiettivi** | 5 goals: resource availability, transparency, openness, scalability, situatedness; 8 fallacies di Deutsch; middleware |
| **M5 — Tipologie** | Cluster, Grid, TP Systems (ACID), pervasive, cloud native (CNCF) |
| **M6 — Tempo** | CPS; orologi fisici (drift, skew); NTP; Berkeley; tempo logico vs fisico; coordinazione |
| **M7 — Spazio** | Distribuzione spaziale; logica S4; GIS; VR; LBS; AR; Spatial Computing |

---

*Documento generato da tutte le slide del corso. Per approfondimenti, riferirsi a Tanenbaum & van Steen, 3ª ed.*
