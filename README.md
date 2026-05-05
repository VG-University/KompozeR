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