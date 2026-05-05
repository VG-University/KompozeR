# Sistemi Distribuiti — Dispense Universitarie
## Parte 5: Laboratorio — Comunicazione, Socket, Distributed Pong, Fondamenti di Ingegneria dei DS

**Corso:** Distributed Systems — Module 2 (Lab) — A.A. 2025/2026  
**Docente:** Giovanni Ciatto (giovanni.ciatto@unibo.it)  
**Università:** Alma Mater Studiorum — Università di Bologna (Campus Cesena)

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

Qualsiasi combinazione delle seguenti motivazioni:

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

**Esempi reali**:
- **Google Search**: scalabilità (miliardi di query/giorno), parallelismo, geo-distribuzione.
- **Instagram / WhatsApp**: milioni di utenti contemporanei, bassa latenza, Big Data (GDPR).
- **Amazon**: milioni di ordini, compliance locale, inventory distribuito.
- **Online Gaming (LoL, Fortnite)**: sincronizzazione in tempo reale a scala globale.
- **Google Docs**: disponibilità, collaborazione in tempo reale, backup impliciti.
- **Federated Learning (Gboard)**: privacy, Big Data locali, resource sharing.

### Come Cambia il Workflow di Software Engineering per i DS?

**Workflow SE classico**:
1. Raccolta dei casi d'uso.
2. Analisi dei requisiti.
3. Design (modellazione, comportamento, interazione).
4. Implementazione.
5. Verifica (testing automatizzato + acceptance).
6. Release.
7. Deployment.
8. Documentazione.
9. Manutenzione.

**Aggiustamenti per i sistemi distribuiti** (passi aggiuntivi/modificati):

**Raccolta casi d'uso**:
- Dove si trovano gli utenti?
- Quando e con quale frequenza interagiscono?
- Da quali dispositivi interagiscono?
- Quali dati devono essere memorizzati? Dove?

**Analisi dei requisiti** (aggiuntivi):
- Requisiti di *latenza* (max tollerata).
- Requisiti di *disponibilità* (quanti "nines"?).
- Requisiti di *consistenza* (forte o eventuale?).
- Requisiti di *sicurezza* (autenticazione, autorizzazione, crittografia).
- Requisiti di *scalabilità* (stima del carico, picchi).

**Design** (aggiuntivo):
- Quante *repliche* del servizio?
- Dove sono *localizzate* le repliche?
- Quali componenti fanno *fault tolerance*?
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
- **Distributed processes**: permette a processi sullo stesso host di comunicare *e* a processi su host diversi.
- **Multiplexable**: più socket indipendenti su porte diverse.
- **Full-duplex**: dati in entrambe le direzioni simultaneamente.
- **Point-to-point** o **point-to-multipoint**: una socket può comunicare con uno o più peer.

### Due Tipi di Socket

| | Stream Socket | Datagram Socket |
|---|---|---|
| **Protocollo tipico** | TCP | UDP |
| **Modello** | Connection-oriented | Connectionless |
| **Unità di dati** | Stream di byte (illimitato) | Pacchetto (datagramma) di dimensione finita (max 64 KiB in UDP) |
| **Ordine** | Garantito | Non garantito |
| **Affidabilità** | Garantita | Non garantita |
| **Uso tipico** | HTTP, FTP, database | DNS, video streaming, giochi online |

**Nota**: entrambi i tipi operano su byte — è l'applicazione che interpreta il contenuto.

### Jargon dei Socket

- **Client socket**: il socket che *inizia* la comunicazione.
- **Server socket**: il socket che *accetta* la comunicazione.
- **Indirizzo**: indirizzo IP della macchina.
- **Porta**: numero di porta del socket.
- **Endpoint**: coppia (indirizzo, porta) che identifica univocamente un socket.

**Porte note** (well-known ports): 0–1023, riservate per protocolli standard (HTTP=80, HTTPS=443, SSH=22...).  
**Porte custom**: 1024–65535.

### Datagram Socket in Python

```python
import socket

# Creazione socket datagram (UDP, IPv4)
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Binding (associa al proprio endpoint per ricevere)
sock.bind(('0.0.0.0', 12345))  # '0.0.0.0' = tutte le interfacce locali

# Invio datagramma
payload = 'Hello, world!'
recipient = ('A.B.C.D', 54321)
sock.sendto(payload.encode(), recipient)

# Ricezione datagramma
data, sender = sock.recvfrom(bufsize=4096)  # buffer 4096 byte
data = data.decode()
print(f'Ricevuto: "{data}" da "{sender}"')
```

**Punti chiave**:
- `AF_INET` = IPv4; `SOCK_DGRAM` = UDP.
- `bind()` associa il socket a un endpoint locale (necessario per ricevere).
- `sendto()` specifica ogni volta il destinatario (connectionless).
- `recvfrom()` restituisce sia i dati che il mittente.
- Binding non obbligatorio se si vuole solo inviare (il SO assegna una porta temporanea).

### Stream Socket in Python

```python
import socket

# Lato SERVER
server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_sock.bind(('0.0.0.0', 8080))
server_sock.listen(5)          # coda di connessioni in attesa
client_sock, addr = server_sock.accept()  # blocca fino a connessione

# Lato CLIENT
client_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_sock.connect(('server_ip', 8080))

# Invio e ricezione (identico per client e server dopo la connessione)
client_sock.sendall(b'Hello, server!')
data = client_sock.recv(1024)

# Chiusura
client_sock.close()
```

**Punti chiave**:
- `SOCK_STREAM` = TCP.
- Il server: `bind` → `listen` → `accept` (loop).
- Il client: `connect` → scambia dati → `close`.
- La connessione è persistente: non serve specificare ogni volta il destinatario.

---

## LAB 3 — Distributed Pong: Progettazione di un Gioco Distribuito

### Contesto

**Pong** è un classico videogioco arcade (1972): due palette, una pallina, si gioca su due lati dello schermo. Nell'ambito del laboratorio, viene implementato in versione **distribuita** in Python con **PyGame**, come esempio pratico di progettazione di un sistema distribuito.

**Repository**: `https://github.com/unibo-fc-isi-ds/dpongpy`  
**Installazione**: `pip install dpongpy`  
**Avvio**: `python -m dpongpy -mode local`

### PyGame — Fondamenti

**PyGame** è una libreria Python per lo sviluppo di giochi 2D:
- Gestisce grafica, audio, input, timing.
- Semplice da usare, leggero e portabile.
- Installazione: `pip install pygame`.

### Il Game Loop

Il **game loop** è il ciclo principale di ogni videogioco. Gestisce:

1. **Input utente** (keyboard, mouse, gamepad).
2. **Aggiornamento dello stato di gioco** (posizione oggetti, punteggi...).
3. **Rendering** (disegna il mondo di gioco sullo schermo).
4. **Simulazione del tempo** (muove gli oggetti anche senza input).

Di solito si introduce un'attesa alla fine di ogni ciclo per controllare il frame rate (es. 60 FPS → ogni ciclo dura al massimo ~16ms).

**Caratteristiche PyGame per il game loop**:
- **Event queue**: coda di eventi (pressione tasti, click, eventi custom).
- Ogni evento ha un `type` (es. `pygame.KEYDOWN`) e attributi (es. `event.key`).
- `pygame.event.get()`: legge eventi dalla coda.
- `pygame.event.post(event)`: aggiunge eventi artificiali alla coda.

### Clean Code per Giochi Distribuiti

#### 1. Game Objects

Rappresentazione esplicita di ogni entità nel gioco:

```python
class GameObject:
    name: str
    position: Vector2  # dal modulo pygame.math
    size: Vector2
    speed: Vector2
    
    def update(self, dt: float):
        # Aggiorna posizione in base a speed e dt (tempo trascorso)
        self.position += self.speed * dt
```

Lo *stato di gioco* globale è l'insieme di tutti i GameObject.

#### 2. Input Handler e Controller

```python
class GameEvent(Enum):
    MOVE_UP = custom_type()     # Evento custom
    MOVE_DOWN = custom_type()
    STOP = pygame.QUIT          # Usa evento pygame esistente

class InputHandler:
    keymap: Dict[int, int]      # tasto → GameEvent
    def handle_inputs(self) -> List[int]: ...

class Controller:
    def handle_event(self, event: GameEvent): ...
```

Questa separazione permette di:
- Cambiare i keybind senza modificare la logica di gioco.
- Inviare in rete GameEvent invece di raw input → indipendenza dal dispositivo.

### Architettura del Sistema Distribuito: Pong

**Modalità centralizzata** (implementata nel lab):

```
[Terminal LEFT]  ←─── network ───→  [Coordinator Server]
                                           │
[Terminal RIGHT] ←─── network ───→  [Coordinator Server]
```

- **Coordinator**: gestisce lo stato di gioco centralizzato; riceve input dai terminal; invia lo stato aggiornato.
- **Terminal**: gestisce l'input locale e il rendering locale; invia comandi al coordinator.

**Comandi per la modalità centralizzata**:
```bash
# Avvio coordinator
python -m dpongpy -mode centralised -role coordinator

# Avvio terminal sinistro
python -m dpongpy -mode centralised -role terminal -side left -keys wasd -host IP_COORD

# Avvio terminal destro
python -m dpongpy -mode centralised -role terminal -side right -keys arrows -host IP_COORD
```

### Sfide nella Distribuzione di un Gioco Real-Time

**Sincronizzazione dello stato**:
- Il coordinator deve propagare lo stato a tutti i terminal a ogni frame (o a ogni aggiornamento significativo).
- I terminal non devono mai avere state divergenti (o l'esperienza di gioco peggiora).

**Latenza**:
- Gli input dei giocatori devono arrivare al coordinator e il nuovo stato deve tornare ai terminal nel minor tempo possibile.
- Latenza alta → input lag → esperienza di gioco negativa.

**Tecniche avanzate** (non implementate nel lab di base):
- **Client-side prediction**: il terminal predice localmente l'effetto del proprio input.
- **Server reconciliation**: il server corregge eventuali discrepanze.
- **Entity interpolation**: interpola gli stati ricevuti per evitare movimenti a scatti.

---

## Riepilogo del Laboratorio

| Laboratorio | Argomenti Chiave |
|---|---|
| **LAB 1 — Preliminari** | Definizioni di DS; motivazioni; workflow SE per DS (req. di latency, availability, consistency, deployment) |
| **LAB 2 — Socket** | Berkeley API; stream vs datagram; client/server; Python socket module; porte e indirizzi |
| **LAB 3 — Distributed Pong** | PyGame; game loop; game objects; input handler; architettura centralizzata coordinator-terminal; sfide real-time |

---

## Appendice: Concetti Python Utili per il Lab

### Serializzazione dei Dati

Per inviare oggetti Python tramite socket, è necessario serializzarli in bytes:

```python
import pickle  # Serializzazione Python-native (NON usare per dati untrusted!)
import json    # Per dati strutturati, cross-language

# JSON (sicuro, cross-platform)
import json
data = {'x': 1, 'y': 2}
bytes_out = json.dumps(data).encode('utf-8')
data_back = json.loads(bytes_out.decode('utf-8'))
```

### Threading per Socket

I server devono gestire più client contemporaneamente:

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

Per il lab è consigliato usare ambienti virtuali per isolare le dipendenze:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

pip install pygame dpongpy
```

---

*Fine delle dispense di Sistemi Distribuiti — A.A. 2025/2026.*  
*Documento generato da tutte le slide del corso (23 PDF). Per approfondimenti, riferirsi a Tanenbaum & van Steen, 3ª ed., e alla documentazione online del corso su Virtuale.*
