## Capitolo 14 — MongoDB e Node.js in Container Docker

### 14.1 Introduzione e Obiettivi

Questo capitolo illustra la realizzazione di un'applicazione web composta da due servizi containerizzati comunicanti: un server **Node.js + Express** e un database **MongoDB**, orchestrati con **Docker Compose**. Il materiale è tratto dal seminario tenuto dal Prof. Vittorio Ghini il 30/10/2024 nell'ambito del corso ASW.

**Architettura dell'applicazione:** l'applicazione espone tre endpoint HTTP:
- `POST /submit`: accetta due sequenze (`seq1`, `seq2`), ne calcola l'allineamento (`as1`, `as2`), salva la quaterna nel database e la restituisce al client.
- `GET /show`: restituisce il contenuto completo del database.
- `GET /`: restituisce un modulo HTML per l'inserimento delle sequenze.

**Struttura dei container:**
- Container `nodejsapp`: server Node.js, porta 3000, connesso alle reti `interna` ed `esterna`.
- Container `mongodb`: database MongoDB, porta 27017, connesso solo alla rete `interna` (non raggiungibile direttamente dall'esterno).

La rete `interna` è una rete Docker virtuale privata tra i container; la rete `esterna` espone `nodejsapp` all'host e al mondo esterno.

### 14.2 Installazione di Docker su Ubuntu

Docker può essere installato su Ubuntu con i seguenti comandi:

```bash
# Installazione prerequisito
sudo apt-get install curl

# Download e installazione dello script ufficiale Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verifica installazione di Docker Compose (v2 è integrato in Docker)
docker compose version
# Output atteso: Docker Compose version v2.29.7

# Aggiunta dell'utente corrente al gruppo docker
# (permette di eseguire comandi docker senza sudo)
sudo usermod -aG docker ${USER}
```

**Nota**: dopo `usermod`, occorre effettuare il logout e il login per rendere effettiva la modifica.

### 14.3 Reti Virtuali Docker

Docker permette di creare reti virtuali per isolare la comunicazione tra container. La distinzione tra rete `interna` ed `esterna` è fondamentale per la sicurezza dell'architettura.

```bash
# Rete interna: bridge isolato, NON raggiungibile dall'host
docker network create -d bridge --internal interna

# Rete esterna: bridge normale, raggiungibile dall'host
docker network create -d bridge esterna
```

**DNS Docker**: i container connessi alla stessa rete Docker si risolvono per nome. Questo significa che il server Node.js può connettersi al MongoDB usando il nome `mongodb` (nome del container/servizio) nell'URL di connessione, senza dover conoscere l'indirizzo IP del container (che può cambiare ad ogni riavvio).

### 14.4 Problema dei Volumi MongoDB e Soluzione

#### 14.4.1 Il Problema

L'immagine ufficiale MongoDB (`mongo:8.0.1-noble`) crea automaticamente due **volumi anonimi** per la persistenza dei dati:
- `/data/db` — i dati del database
- `/data/configdb` — la configurazione

Questi volumi vengono creati al di fuori del container filesystem (nell'area di storage di Docker sull'host). Questo causa due problemi nel contesto del progetto ASW:

1. **Non consegnabili**: i volumi persistono sull'host ma non possono essere facilmente inclusi nel pacchetto del progetto da consegnare.
2. **Non rimuovibili dall'immagine**: non è possibile rimuovere i volumi da un'immagine Docker standard senza procedure speciali.

#### 14.4.2 La Soluzione: FORCE_CREATE_NOVOLUME_BASE_IMAGE.sh

Lo script `FORCE_CREATE_NOVOLUME_BASE_IMAGE.sh` crea un'immagine MongoDB personalizzata (`mongonovolume`) priva di volumi anonimi:

```bash
#!/bin/bash
# 1. Avvia il container originale MongoDB
docker run -itd --name temp_mongo mongo:8.0.1-noble

# 2. Trova gli ID dei volumi anonimi creati
VOLUMES=$(docker inspect temp_mongo --format '{{range .Mounts}}{{.Name}} {{end}}')

# 3. Ferma il container (non rimuovere)
docker stop temp_mongo

# 4. Esporta il filesystem del container come tar (SENZA i volumi)
docker export temp_mongo > mongonovolume.tar

# 5. Importa il tar come nuova immagine
docker import mongonovolume.tar mongonovolume

# 6. Pulizia
docker rm temp_mongo
rm mongonovolume.tar
for VOL in $VOLUMES; do docker volume rm $VOL; done
```

**Differenza fondamentale tra `docker export` e `docker save`:**
- `docker export`: esporta il **filesystem del container** (snapshot dello stato del container), senza i volumi montati e senza i metadati dell'immagine (layer history).
- `docker save`: esporta l'**immagine Docker** con tutti i layer e i metadati; utilizzato per trasferire immagini tra host.

### 14.5 Dockerfile per MongoDB Personalizzato

Con l'immagine `mongonovolume` come base, si costruisce l'immagine `mymongo` che include il file di inizializzazione del database:

```dockerfile
FROM mongonovolume

# Copia lo script di inizializzazione del database
COPY ./mydbinit.js /docker-entrypoint-initdb.d/

WORKDIR /usr/local/bin/

# Assegna i permessi necessari
RUN chmod 777 /docker-entrypoint-initdb.d/ mydbinit.js

EXPOSE 27017 27018 27019

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mongod"]
```

**Meccanismo di inizializzazione MongoDB**: i file (`.sh` o `.js`) presenti in `/docker-entrypoint-initdb.d/` vengono eseguiti automaticamente dal container MongoDB **alla prima esecuzione** (quando il database è vuoto). Il file `mydbinit.js` crea il database `dbsa` e la collezione `alignments`:

```javascript
// mydbinit.js
var conn = new Mongo();
var db = conn.getDB('dbsa');
db.createCollection('alignments');
```

**Build dell'immagine:**

```bash
docker build -t "mymongo" .
```

### 14.6 Esecuzione e Debug del Container MongoDB

#### 14.6.1 Avvio del Container

```bash
docker run -itd \
  --network interna \
  -p 27017-27019:27017-27019 \
  --name mongodb \
  mymongo
```

Parametri:
- `-itd`: interattivo + terminale + detached (background).
- `--network interna`: connette alla rete interna.
- `-p 27017-27019:27017-27019`: espone le porte MongoDB (necessario per debug dall'esterno).
- `--name mongodb`: nome del container (usato dal DNS Docker).

#### 14.6.2 Verifica e Debug

```bash
# Controlla i log del container (errori di avvio, ecc.)
docker logs mongodb

# Accede alla shell MongoDB dall'interno del container
docker exec -it mongodb /usr/bin/mongosh

# Comandi mongosh utili
use dbsa
db.alignments.find()
db.alignments.count()
```

**Debug dall'esterno del container** (richiede che la porta sia esposta con `-p` e che il container sia su una rete non-internal):

```bash
mongosh --host 0.0.0.0 --port 27017
```

#### 14.6.3 Salvataggio dello Stato del Database

Quando si vuole preservare i dati presenti nel database (ad esempio, dati di test inseriti durante lo sviluppo), è possibile committare lo stato del container come nuova immagine:

```bash
# script: commit_mongo_image.sh
docker stop mongodb
docker commit -m "saved mongo" -a "nome_autore" mongodb mymongo.1
docker rm mongodb

# Aggiorna l'immagine mymongo con lo stato salvato
docker rmi mymongo
docker tag mymongo.1 mymongo
docker rmi mymongo.1
```

Dopo questo script, il container `mongodb` è stato rimosso ma la sua versione aggiornata è disponibile come immagine `mymongo`. La prossima esecuzione di `docker run ... mymongo` partirà con i dati già presenti.

### 14.7 Applicazione Node.js: Struttura e Codice

#### 14.7.1 Struttura del Progetto Node.js

```
./app/
    index.js                          # Entry point del server
    package.json                      # Dipendenze NPM
    src/
        controllers/
            controller.js             # Logica di business
        lib/
            sequences_alignment.js    # Algoritmo di allineamento
        routes/
            routes.js                 # Definizione delle route Express
        models/
            alignmentModels.js        # Schema Mongoose
./Dockerfile                          # Dockerfile per il container Node.js
```

#### 14.7.2 Entry Point (index.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./src/routes/routes');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Connessione a MongoDB
// 'mongodb' è risolto dal DNS Docker al container mongodb
mongoose.connect('mongodb://mongodb/dbsa', {
  useNewUrlParser: true,
  useFindAndModify: false
});

// Registrazione delle route
routes(app);

// Avvio del server
app.listen(3000, function() {
  console.log('Node API server started on port 3000!');
});
```

**Attenzione critica**: nell'URL di connessione `mongodb://mongodb/dbsa`:
- Il primo `mongodb` dopo `://` è il **protocollo** (URI scheme).
- Il secondo `mongodb` (dopo `://`) è il **nome host** — risolto dal DNS Docker al container chiamato `mongodb`.
- `dbsa` è il nome del database.

### 14.8 Dockerfile per Node.js

```dockerfile
FROM ubuntu:focal

ENV WORKINGDIR=/root/app
WORKDIR ${WORKINGDIR}

# Copia il codice sorgente dell'applicazione
COPY ./app ${WORKINGDIR}/

# Installazione di Node.js e NPM
RUN apt-get -y update && \
    apt-get -y install nodejs npm && \
    apt-get -y clean

# Installazione delle dipendenze NPM
RUN npm install

EXPOSE 3000

# Avvio del server
CMD nodejs index.js
```

**Build dell'immagine:**

```bash
docker build -t "nodejsapp" .
```

### 14.9 Esecuzione del Container Node.js

```bash
# Avvio sulla rete interna con esposizione della porta 3000
docker run -itd \
  --rm \
  --network interna \
  --name nodejsapp \
  -p 3000:3000 \
  nodejsapp

# Connessione alla rete esterna (per accesso dall'host)
docker network connect esterna nodejsapp
```

**`--rm`**: rimuove automaticamente il container quando viene fermato (utile in sviluppo per non accumulare container fermi).

**Test dell'applicazione:**

```bash
# Test POST /submit
curl \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --request POST \
  --data 'seq1=ABC&seq2=DEF' \
  http://0.0.0.0:3000/submit

# Test GET /show
curl http://0.0.0.0:3000/show

# Test GET /
curl http://0.0.0.0:3000/
```

### 14.10 Docker Compose: Orchestrazione Automatizzata

Docker Compose permette di definire e avviare applicazioni multi-container con un singolo file di configurazione `docker-compose.yml`.

#### 14.10.1 Struttura del docker-compose.yml

```yaml
services:
  nodejsapp:
    build:
      context: ./nodejs
      dockerfile: Dockerfile
    image: nodejsapp
    command: [ "nodejs", "index.js" ]
    depends_on:
      - mongodb
    ports:
      - 3000:3000
    networks:
      - interna
      - esterna

  mongodb:
    build:
      context: ./mongodb
      dockerfile: Dockerfile
    image: mymongo
    command: [ "docker-entrypoint.sh", "mongod" ]
    networks:
      - interna

networks:
  interna:
    driver: bridge
    internal: true
  esterna:
    driver: bridge
    internal: false
```

**Problema di timing**: `depends_on` garantisce solo che il container `mongodb` sia **avviato** prima di `nodejsapp`, ma non che MongoDB sia **pronto** ad accettare connessioni. La soluzione adottata è aggiungere una pausa di 10 secondi nel codice Node.js prima del tentativo di connessione a MongoDB:

```javascript
// In index.js, prima di mongoose.connect()
await new Promise(resolve => setTimeout(resolve, 10000));
```

#### 14.10.2 Convenzioni di Naming di Docker Compose

Docker Compose usa il **nome del progetto** come prefisso per tutti i container e le reti creati. Il nome del progetto si imposta con la variabile `COMPOSE_PROJECT_NAME` nel file `.env`:

```bash
# .env
COMPOSE_PROJECT_NAME=aswl4
```

Con questo prefisso:
- Container: `aswl4-nodejsapp-1`, `aswl4-mongodb-1`
- Reti: `aswl4-interna-1`, `aswl4-esterna-1`
- **Hostname interno** (usato dal DNS Docker): `nodejsapp`, `mongodb` (il nome del servizio, senza prefisso)

### 14.11 Packaging e Trasferimento del Progetto

Per consegnare il progetto in modo completo e riproducibile:

```bash
# 1. Build di tutte le immagini
docker compose build

# 2. Salvataggio delle immagini come tar
docker save nodejsapp > nodejsapp_save.tar
docker save mymongo   > mymongo_save.tar

# 3. Archivio del progetto completo (codice + immagini)
cd ../
tar cvzf ASWl4_saved.tgz ASWl4/
```

**Ripristino su un altro sistema:**

```bash
# 1. Estrazione dell'archivio
tar xvzf ASWl4_saved.tgz
cd ASWl4/

# 2. Caricamento delle immagini in Docker
docker load < mymongo_save.tar
docker load < nodejsapp_save.tar

# 3. Avvio dell'applicazione
docker compose up -d
```

### 14.12 Riepilogo dei Comandi Docker

#### Ciclo di Vita dell'Applicazione

```bash
# ============================================================
# BUILD
# ============================================================
# Crea l'immagine MongoDB senza volumi anonimi
./mongodb/FORCE_CREATE_NOVOLUME_BASE_IMAGE.sh

# Costruisce tutte le immagini definite in docker-compose.yml
docker compose build

# ============================================================
# ESECUZIONE
# ============================================================
# Avvia tutti i servizi in background
docker compose up -d

# ============================================================
# UTILIZZO
# ============================================================
# Invia dati (POST)
curl --header "Content-Type: application/x-www-form-urlencoded" \
     --request POST \
     --data 'seq1=LANCIA&seq2=DELTA' \
     http://0.0.0.0:3000/submit

# Visualizza dati (GET)
curl http://0.0.0.0:3000/show

# ============================================================
# SALVATAGGIO STATO MONGODB
# ============================================================
docker compose stop
docker commit -m "saved" -a "autore" aswl4-mongodb-1 mymongo.1
docker compose down
docker rmi mymongo
docker tag mymongo.1 mymongo
docker rmi mymongo.1

# ============================================================
# DISTRUZIONE COMPLETA
# ============================================================
# Ferma, rimuove container e reti, rimuove immagini
docker compose down --rmi all

# ============================================================
# SVILUPPO: aggiornare solo nodejsapp
# ============================================================
docker compose stop nodejsapp
docker compose rm -f nodejsapp
# ... modifica il codice ...
docker compose build nodejsapp
docker compose up -d nodejsapp
```

---

## Capitolo 15 — Sviluppo Web Sostenibile

### 15.1 Il Concetto di Sostenibilità

La sostenibilità è definita nella Commissione Brundtland (1987):

> *"La sostenibilità è la capacità di soddisfare i bisogni del presente senza compromettere la possibilità delle future generazioni di soddisfare i propri."*

Questa definizione, elaborata in "Our Common Future" (Rapporto Brundtland, WCED), ha posto le basi per la moderna agenda dello sviluppo sostenibile.

#### 15.1.1 I Tre Pilastri della Sostenibilità

La sostenibilità si articola in tre dimensioni interconnesse e complementari:

- **Ambientale**: preservazione degli ecosistemi, riduzione delle emissioni, uso responsabile delle risorse naturali.
- **Economico**: crescita economica inclusiva, benessere materiale, modelli di business sostenibili nel lungo periodo.
- **Sociale**: equità, giustizia, coesione sociale, accesso alle opportunità per tutti.

I tre pilastri non sono indipendenti: la sostenibilità ambientale è prerequisito per la sostenibilità economica e sociale nel lungo termine.

#### 15.1.2 Agenda 2030 e gli SDG

Il **25 settembre 2015**, l'Assemblea Generale delle Nazioni Unite ha adottato la risoluzione "Trasformare il nostro mondo: l'Agenda 2030 per lo Sviluppo Sostenibile", sottoscritta da 193 paesi.

L'Agenda 2030 definisce **17 Obiettivi di Sviluppo Sostenibile** (*Sustainable Development Goals* — SDG):

1. Sconfiggere la povertà
2. Sconfiggere la fame
3. Salute e benessere
4. Istruzione di qualità
5. Parità di genere
6. Acqua pulita e igiene
7. Energia pulita e accessibile
8. Lavoro dignitoso e crescita economica
9. Industria, innovazione e infrastrutture
10. Ridurre le disuguaglianze
11. Città e comunità sostenibili
12. Consumo e produzione responsabili
13. Lotta contro il cambiamento climatico
14. Vita sott'acqua
15. Vita sulla terra
16. Pace, giustizia e istituzioni solide
17. Partnership per gli obiettivi

Gli SDG sono **universali** (si applicano a tutti i paesi, non solo a quelli in via di sviluppo) ma **non vincolanti giuridicamente**.

**Le 5P dello Sviluppo Sostenibile:** People (Persone), Planet (Pianeta), Prosperity (Prosperità), Peace (Pace), Partnership.

### 15.2 L'Impatto del Web sull'Ambiente

#### 15.2.1 Dati sull'Impronta Carbonica di Internet

- Internet è responsabile di circa il **4% delle emissioni globali di CO₂** — una percentuale paragonabile all'intera industria aeronautica.
- Ogni singola ricerca su Google genera tra **1g e 10g di CO₂**; con circa 3,5 miliardi di ricerche al giorno, si tratta di migliaia di tonnellate di CO₂ quotidiane.
- I siti web emettono in media **1,76g di CO₂ per ogni pagina visitata**.
- Per confronto: i trasporti generano circa l'8% delle emissioni globali; il traffico aereo circa il 2%; una sigaretta equivale a circa 14g di CO₂.

#### 15.2.2 Le Variabili di Impatto Ambientale del Web

Le principali variabili che determinano l'impatto ambientale di un sito web o servizio digitale sono:

- **Acqua**: i data center richiedono grandi quantità d'acqua per il raffreddamento dei server.
- **Energia**: consumata dal client (dispositivo dell'utente), dal server, e dalla rete di trasmissione.
- **Rifiuti elettronici (e-waste)**: dispositivi obsoleti, apparecchiature di rete dismesse.

### 15.3 Il Contesto Sociale e Normativo

#### 15.3.1 Sensibilità Pubblica

- Il fenomeno del **greenwashing** (comunicare iniziative ambientali false o esagerate) è sempre più denunciato da consumatori e media.
- I brand con politiche etiche e sostenibili godono di maggiore fiducia del pubblico.
- Il giornalismo di dati monitora e pubblica le emissioni digitali dei principali servizi web.

#### 15.3.2 Quadro Normativo

**Standard e best practice:**
- **GRI** (Global Reporting Initiative): standard internazionali per il reporting di sostenibilità.
- **ISO 14001**: standard per i sistemi di gestione ambientale.
- **GR491** e **SDGs**: framework di best practice.

**Regolamenti:**
- **CSRD** (Corporate Sustainability Reporting Directive): direttiva UE che obbliga le grandi aziende a rendicontare la propria sostenibilità.
- **ESRS** (European Sustainability Reporting Standards): standard tecnici per l'implementazione della CSRD.
- **GCD** (Green Claims Directive): regola come le aziende comunicano le proprie credenziali ambientali.

### 15.4 Il Sustainable Web Manifesto

Il [Sustainable Web Manifesto](https://www.sustainablewebmanifesto.com/) definisce sei principi per un web più sostenibile:

1. **Clean** (Pulito): i siti web e i servizi che creiamo saranno alimentati da fonti di energia rinnovabile.
2. **Efficient** (Efficiente): utilizzeremo la minima quantità di energia e risorse materiali possibile.
3. **Open** (Aperto): i servizi che creiamo saranno accessibili, permetteranno il libero scambio di informazioni e rispetteranno il controllo dei dati da parte degli utenti.
4. **Honest** (Onesto): i servizi che creiamo non inganneranno né sfrutteranno gli utenti a vantaggio delle aziende creatici.
5. **Regenerative** (Rigenerativo): i servizi che creiamo supporteranno un'economia che nutre le persone e il pianeta.
6. **Resilient** (Resiliente): i servizi che creiamo funzioneranno quando le persone ne hanno bisogno.

### 15.5 Il W3C Sustainable Web Design Community Group

Il **W3C Sustainable Web Design Community Group** è un gruppo di lavoro della comunità W3C dedicato alla sostenibilità del web:

- Sito ufficiale: [https://www.w3.org/community/sustyweb/](https://www.w3.org/community/sustyweb/)
- Conta oltre **200 partecipanti** da tutto il mondo.
- Chair: **Tim Frick** e **Alexander Dawson**.

Il gruppo ha prodotto le **Web Sustainability Guidelines (WSG)**.

### 15.6 Web Sustainability Guidelines (WSG)

Le **Web Sustainability Guidelines** sono una raccolta di **94 raccomandazioni** per la creazione di prodotti digitali più sostenibili dal punto di vista ambientale, economico e sociale.

La struttura si ispira direttamente alle **WCAG** (Web Content Accessibility Guidelines): ogni guideline comprende criteri di successo, scala di impatto ed effort, benefici per le diverse tipologie di stakeholder, metriche di reporting (GRI), esempi pratici e risorse di approfondimento.

Le WSG sono organizzate in **quattro categorie principali**:

| Categoria | Numero | Linee guida |
|-----------|--------|------------|
| UX Design Guidelines | 2.x | 29 linee guida |
| Web Development Guidelines | 3.x | 24 linee guida |
| Hosting & Infrastructure Guidelines | 4.x | 12 linee guida |
| Business & Product Strategies Guidelines | 5.x | 29 linee guida |

### 15.7 UX Design Guidelines (2.x)

Le linee guida di UX Design riguardano le scelte progettuali dell'interfaccia che hanno impatto sulla sostenibilità:

**2.2 — Assess and Research Visitor Needs**
- *Impatto*: Medio | *Effort*: Alto
- Prima di progettare, ricercare le reali necessità degli utenti evita di costruire funzionalità non utilizzate che consumano risorse inutilmente.

**2.4 — Consider Sustainability in Early Ideation**
- *Impatto*: Basso | *Effort*: Basso
- Incorporare la sostenibilità fin dalle prime fasi (wireframe, paper prototyping) è molto meno costoso che rimediare a posteriori.

**2.10 — Use Recognized Design Patterns**
- *Impatto*: Medio | *Effort*: Basso
- L'uso di pattern di interazione riconosciuti riduce la curva di apprendimento degli utenti e quindi il tempo (e l'energia) necessari a completare le loro attività.

**2.11 — Avoid Manipulative Patterns**
- *Impatto*: Alto | *Effort*: Medio
- I **dark pattern** (pattern ingannevoli) — come i cookie banner ingannevoli, la sottoscrizione nascosta, i countdown falsi — spingono gli utenti a interazioni non desiderate, generando traffico e dati non necessari. Sono contrari al principio di onestà del Sustainable Web Manifesto.

**2.15 — Sustainable Approach to Image Assets**
- *Impatto*: Alto | *Effort*: Basso
- Le immagini rappresentano la principale fonte di spreco di banda web. Le azioni raccomandate includono:
  - **Lazy loading**: caricare le immagini solo quando entrano nel viewport.
  - **Ottimizzazione**: ridurre la qualità delle immagini al minimo accettabile.
  - **Compressione**: usare formati efficienti come WebP o AVIF invece di JPEG/PNG.
  - **Responsive images**: servire dimensioni appropriate al dispositivo dell'utente.

**2.19 — Provide Alternatives to Web Assets**
- *Impatto*: Medio | *Effort*: Medio
- Offrire alternative testuali a video, audio e immagini riduce il consumo di banda per chi ne ha bisogno.

**2.20 — Provide Accessible, Usable, Minimal Web Forms**
- *Impatto*: Basso | *Effort*: Basso
- Form ben progettati con meno campi necessari e validazione inline riducono il numero di tentativi di invio falliti e i round-trip al server.

### 15.8 Web Development Guidelines (3.x)

Le linee guida di sviluppo web riguardano le pratiche tecniche degli sviluppatori:

**3.1 — Identify Relevant Technical Indicators**
- *Impatto*: Medio | *Effort*: Medio
- Monitorare metriche come il numero di richieste HTTP, le dimensioni del DOM, il peso delle pagine, il Time to Interactive (TTI).

**3.2 — Minify HTML, CSS, JavaScript**
- *Impatto*: Basso | *Effort*: Basso
- La minificazione (rimozione di spazi, commenti, abbreviazione di nomi di variabili) riduce le dimensioni dei file e il tempo di trasferimento.

**3.3 — Use Code-Splitting**
- *Impatto*: Medio | *Effort*: Basso
- Suddividere il bundle JavaScript in moduli caricati su richiesta (*lazy loading*) riduce il payload iniziale della pagina.

**3.4 — Apply Tree Shaking**
- *Impatto*: Medio | *Effort*: Medio
- Il **tree shaking** è una tecnica dei bundler moderni (webpack, Rollup) che elimina automaticamente il codice JavaScript non referenziato (*dead code elimination*). Riduce significativamente le dimensioni del bundle finale.

**3.5 — Ensure Accessibility**
- *Impatto*: Alto | *Effort*: Medio
- La conformità alle **WCAG** (Web Content Accessibility Guidelines) e l'uso di **ARIA** (Accessible Rich Internet Applications) garantisce che il sito sia usabile da tutti, riducendo il numero di tentativi falliti e il traffico generato da interazioni errate.

**3.6 — Avoid Code Duplication**
- *Impatto*: Medio | *Effort*: Medio
- Principi da seguire: **DRY** (*Don't Repeat Yourself*), **BEM** (*Block Element Modifier* per i CSS), evitare il pattern **WET** (*Write Everything Twice*).

**3.7 — Rigorously Assess Third-Party Services**
- *Impatto*: Alto | *Effort*: Medio
- Librerie di terze parti, font hosting, analytics, social widget e script di monitoraggio hanno spesso una grande impronta ambientale. Generano richieste HTTP aggiuntive, rallentano la pagina e appartengono alla **Scope 3** delle emissioni (catena del valore). Ogni dipendenza esterna deve essere valutata criticamente.

**3.8 — Use HTML Elements Correctly**
- *Impatto*: Medio | *Effort*: Medio
- L'**HTML semantico** (uso corretto di `<nav>`, `<main>`, `<article>`, `<aside>`, ecc.) migliora l'accessibilità, favorisce il corretto funzionamento degli screen reader e riduce la necessità di JavaScript aggiuntivo per comunicare la struttura della pagina.

**3.9 — Resolve Render Blocking Content**
- *Impatto*: Medio | *Effort*: Basso
- Il rendering della pagina viene bloccato finché script e CSS non sono completamente scaricati e parsati. Le soluzioni includono:
  - `defer`: scarica lo script in parallelo ma lo esegue dopo il parsing HTML.
  - `async`: scarica ed esegue lo script non appena disponibile.
  - **Lazy loading** per immagini e iframe.
  - CSS critico inline + caricamento asincrono del resto del CSS.

**3.13 — Adapt to User Preferences**
- *Impatto*: Medio | *Effort*: Basso
- Le **CSS Media Preference Queries** permettono di rispettare le impostazioni di sistema dell'utente:
  - `prefers-color-scheme: dark` — tema scuro (risparmio energetico su OLED).
  - `prefers-reduced-motion: reduce` — animazioni ridotte (accessibilità + performance).
  - `prefers-reduced-data: reduce` — contenuti ridotti (risparmio banda).
  - `prefers-contrast: more` — contrasto elevato.

**3.14 — Develop Mobile-First Layout**
- *Impatto*: Medio | *Effort*: Basso
- Il design **mobile-first** (partire dal layout per schermi piccoli e poi espandere) produce CSS più snello e garantisce che i contenuti essenziali vengano caricati su tutti i dispositivi. Il **carbon-aware design** considera che diversi dispositivi hanno diversa efficienza energetica.

**3.15 — Use Beneficial JavaScript and APIs**
- *Impatto*: Alto | *Effort*: Medio
- Usare JavaScript solo dove aggiunge valore reale. Preferire le API native del browser (Intersection Observer, Resize Observer, ecc.) alle librerie JavaScript che replicano le stesse funzionalità.

**3.16 — Ensure Scripts Are Secure**
- *Impatto*: Medio | *Effort*: Medio
- Script non sicuri possono essere vettori di attacchi (XSS, code injection) che compromettono la confidenzialità degli utenti e causano traffico malevolo. La sicurezza è un componente della sostenibilità digitale.

**3.17 — Manage Dependencies Appropriately**
- *Impatto*: Medio | *Effort*: Basso
- Aggiornare regolarmente le dipendenze, rimuovere quelle non usate, preferire dipendenze più leggere quando equivalenti.

**3.21 — Align Technical Requirements with Sustainability**
- *Impatto*: Medio | *Effort*: Medio
- Scegliere la soluzione tecnica appropriata al caso d'uso: un **Static Site Generator (SSG)** è molto più efficiente di un CMS dinamico per contenuti che cambiano raramente. Il sito statico non richiede computazione server per ogni richiesta.

**3.22 — Use Latest Stable Language Version**
- *Impatto*: Medio | *Effort*: Medio
- Le versioni più recenti dei linguaggi e runtime sono generalmente più efficienti delle versioni precedenti.

**3.23 — Take Advantage of Native Features**
- *Impatto*: Medio | *Effort*: Basso
- Preferire le funzionalità native del browser (form validation HTML5, Date input, geolocalizzazione nativa, ecc.) alle implementazioni JavaScript equivalenti.

**3.24 — Run Fewer, Simpler Queries**
- *Impatto*: Medio | *Effort*: Basso
- Ottimizzare le query al database: ridurne il numero, usare indici, evitare N+1 queries, implementare caching dove appropriato.

### 15.9 Hosting & Infrastructure Guidelines (4.x)

Le 12 linee guida di hosting e infrastruttura riguardano le scelte infrastrutturali:

| Guideline | Titolo |
|-----------|--------|
| 4.1 | Choose Sustainable Hosting Provider — Scegliere provider alimentati da energie rinnovabili |
| 4.2 | Optimize Browser Caching — Configurare header HTTP per il caching ottimale |
| 4.3 | Compress Files — Compressione Gzip/Brotli dei file trasferiti |
| 4.4 | Error Pages and Redirects — Minimizzare redirect, gestire 404 efficientemente |
| 4.5 | Limit Additional Environments — Non mantenere ambienti di test/staging non necessari |
| 4.6 | Automate to Fit Needs — Scalare automaticamente in base alla domanda effettiva |
| 4.7 | Maintain Relevant Refresh Frequency — Non aggiornare contenuti più frequentemente di quanto necessario |
| 4.8 | Be Mindful of Duplicate Data — Evitare la duplicazione dei dati in storage e backup |
| 4.9 | Enable Async Processing — Usare code di messaggi per elaborazioni non urgenti |
| 4.10 | CDNs and Edge Caching — Distribuire i contenuti geograficamente vicino agli utenti |
| 4.11 | Use Lowest Infrastructure Tier — Non sovra-dimensionare l'infrastruttura |
| 4.12 | Store Data According to Visitor Needs — Conservare solo i dati strettamente necessari |

### 15.10 Business & Product Strategies Guidelines (5.x)

Le 29 linee guida di strategia aziendale e di prodotto riguardano le decisioni organizzative e strategiche:

Tra le più rilevanti:
- **5.1** — Ethical/Sustainability Product Strategy: integrare la sostenibilità nella strategia di prodotto.
- **5.14** — Establish if Digital Product is Necessary: valutare se il prodotto digitale aggiunge davvero valore o se potrebbe essere sostituito da alternative non digitali più sostenibili.
- **5.20** — Promote Responsible Data Practices: minimizzare la raccolta di dati, favorire la privacy by design.
- **5.26** — E-Waste/Right-To-Repair: supportare il diritto alla riparazione dei dispositivi.
- **5.27** — Define Performance and Environmental Budgets: stabilire budget non solo per le performance (es. max 200KB di JavaScript), ma anche per le emissioni.
- **5.28** — Use Open Source Tools: preferire strumenti open source a quelli proprietari.

### 15.11 Strumenti per la Misurazione

**Website Carbon Calculator** (`websitecarbon.com`)
Strumento online che analizza un URL e stima le emissioni di CO₂ generate per ogni visita, classificando il sito rispetto alla media del web.

**Ecograder** (`ecograder.com`)
Valuta la sostenibilità di un sito web producendo un punteggio complessivo e dettagliato per categoria (rete, energia, performance, design), con suggerimenti specifici di miglioramento.

### 15.12 Il Web come Strumento per la Sostenibilità

Oltre a *rendere il web sostenibile*, esiste la dimensione di *usare il web per la sostenibilità*:

**AI for Sustainable Development Goals (AI4SDGs) Think Tank**
- Sito: [https://ai-for-sdgs.academy/observatory](https://ai-for-sdgs.academy/observatory)
- Raccoglie ricerche e progetti sull'uso dell'intelligenza artificiale per il raggiungimento degli SDG.

**Quiz SDG personale**
- URL: [https://globalgoals.org/quiz](https://globalgoals.org/quiz)
- Permette di esplorare gli SDG in modo interattivo.

### 15.13 Riferimenti Bibliografici

- Greenwood, T. (2021). *Sustainable web design*. A Book Apart.
- McGovern, G. (2020). *World Wide Waste*.
- Shedroff, N. (2019). *Design Is the Solution*.
- Frick, T. (2016). *Designing for sustainability*. O'Reilly.
- Andersen, M. (2023). *Sustainable Web Design In 20 Lessons*.
- Falbe, T., Andersen, M., & Frederiksen, K. S. (2020). *Ethical design handbook*. Smashing Media.

---
