# KompozeR

## Descrizione del prodotto
Progetto di un servizio che estende le funzionalità di un e-commerce già esistente. 

>www.soluzionekompo.com 

Kompo è un'azienda che vende mobili componibili la cui struttura è completamente personalizzabile in base alle esigenze del singolo individuo.  \
Questa estensione ha il compito di facilitare l'esperienza di acquisto per l'utente, dando la possibilità di progettare la propria scaffalatura in modo semplice e veloce, avendo anche un impatto visuale sul risultato finale.  \
Con la progettazione viene anche "popolato il carrello" in modo automatico, essendo così pronti ad ordinare il prodotto finale. 


## Punti Chiave per gli insegnamenti 

### ASW

| Feature | Capitolo dispense |
|---|---|
| SPA con Vue Router (configuratore, catalogo, carrello) | Cap. 8, 9 |
| Componenti Vue + Vuex per stato della configurazione | Cap. 9 |
| SCSS + Flexbox per UI del configuratore a griglia | Cap. 11, 12 |
| REST API Express (prodotti, configurazioni, ordini) | Cap. 4, 5 |
| MongoDB per catalogo prodotti e configurazioni salvate | Cap. 14 |
| JWT auth (login per salvare la propria configurazione) | Cap. 5 |
| Socket.io: chatbot real-time + notifiche disponibilità | Cap. 8 |
| Docker Compose (frontend + backend + mongo) | Cap. 14 |
| UCD + Personas + Mockup Balsamiq | Cap. 6, 7 |
| Nielsen's 10 euristiche | Cap. 7 |
| Sviluppo Web Sostenibile (lazy loading, ecc.) | Cap. 15 |
| TypeScript sul backend | Cap. 10 |

#### Stack Tecnologico
**MEVN**: MongoDB · Express · Vue.js · Node.js  
Deployment tramite **Docker Compose** (3 container: frontend, backend, mongo).  
Linguaggio: **TypeScript** sul backend.

#### Funzionalità Core

1. **Catalogo componenti** — navigazione e filtraggio dei moduli disponibili 
2. **Configuratore visuale** — griglia click-based per aggiungere/rimuovere moduli con anteprima live
3. **Salvataggio configurazione** — utente autenticato (JWT) può salvare e riprendere i propri progetti
4. **Carrello automatico** — dalla configurazione finale si genera automaticamente la lista prodotti con prezzi
5. **Chatbot assistente** — via Socket.io, risponde in real-time a domande su dimensioni, compatibilità e prezzi
6. **Notifiche real-time** — alert via Socket.io se un componente nella configurazione diventa non disponibile o aumenta di prezzo


### DS

| Feature | Capitolo dispense |
|---|---|
| Architettura client-server con coordinatore centrale | M4, M8 |
| Comunicazione event-based per collaborazione real-time | M8, LAB 2 |
| Collaborative editing della stessa configurazione | M0, M4 |
| Causal ordering degli aggiornamenti concorrenti | M3, C5 |
| Replica della persistenza con MongoDB Replica Set | M3, C1 |
| Trade-off consistenza/disponibilità configurabile | M3, C1 |
| Checkpointing e recovery dello stato collaborativo | C2 |
| Fault tolerance in caso di crash del backend | M1, C2 |
| Gestione della concorrenza su configurazioni, carrelli e catalogo | M2, M3 |
| Container orchestration locale con Docker Compose | M8 |
| Deployment production-oriented con Kubernetes/Minikube | CX |

#### Stack Tecnologico
**Node.js + Express** per backend REST e coordinamento delle sessioni collaborative.  
**Vue.js + TypeScript** per la SPA con configuratore visuale.  
**Socket.io** per la comunicazione bidirezionale real-time.  
**MongoDB Replica Set** per la persistenza replicata.  
Deployment locale con **Docker Compose** e deployment production-oriented con **Kubernetes (Minikube)**.

#### Funzionalità Core

1. **Collaborative editing** — più utenti autenticati possono lavorare sulla stessa configurazione in tempo reale
2. **Session coordinator** — il backend centrale coordina le sessioni collaborative e mantiene uno stato condiviso consistente
3. **Aggiornamenti incrementali via WebSocket** — ogni modifica viene propagata agli altri partecipanti senza ricaricare l'intera configurazione
4. **Causal ordering** — gli aggiornamenti concorrenti vengono ordinati secondo relazioni causali, senza dipendere da un clock globale
5. **Replica della persistenza** — i dati del sistema, in particolare quelli del CAD collaborativo, sono mantenuti su storage replicato
6. **Checkpointing e recovery** — lo stato delle sessioni collaborative viene salvato periodicamente per poter recuperare dopo un crash
7. **Gestione dei fault** — in caso di failure del backend o del nodo primario MongoDB, il sistema deve riprendere il servizio in modo controllato
8. **Consistenza applicativa esplicita** — il progetto rende evidente il compromesso tra consistenza e disponibilita', soprattutto nelle operazioni concorrenti