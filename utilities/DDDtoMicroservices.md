# DDD to Microservices

Questo file raccoglie gli endpoint pubblici dei microservizi a partire dalle funzionalita' del dominio.

## authenticationService

| EndPoint | Type | Description |
|---|---|---|
| `/auth/register` | `POST` | Registra un nuovo utente base e crea il relativo account nel sistema. |
| `/auth/login` | `POST` | Autentica un utente registrato e restituisce il JWT con i dati essenziali di sessione. |
| `/auth/guest` | `POST` | Crea una sessione guest e restituisce il JWT con permessi limitati. |
| `/auth/logout` | `POST` | Chiude la sessione corrente dell'utente autenticato e marca la sessione come terminata. |
| `/auth/me` | `GET` | Restituisce le informazioni essenziali dell'utente autenticato a partire dal token valido. |
| `/auth/validate` | `GET` | Verifica che il JWT sia valido e restituisce l'esito della validazione con ruolo e userId. |
| `/auth/sessions` | `GET` | Restituisce l'elenco delle sessioni associate all'utente autenticato. |
| `/auth/sessions/:sessionId/revoke` | `PATCH` | Revoca una sessione specifica dell'utente, per logout selettivo o future estensioni di sicurezza. |

## catalogService

| EndPoint | Type | Description |
|---|---|---|
| `/catalog/products` | `GET` | Restituisce l'elenco dei prodotti disponibili nel catalogo, con eventuali filtri per `systemType` e `componentType`. |
| `/catalog/products/:productId` | `GET` | Restituisce il dettaglio di un singolo prodotto del catalogo. |
| `/catalog/products` | `POST` | Crea un nuovo prodotto nel catalogo. Endpoint riservato all'amministratore. |
| `/catalog/products/:productId` | `PATCH` | Aggiorna i dati generali di un prodotto esistente. Endpoint riservato all'amministratore. |
| `/catalog/products/:productId/price` | `PATCH` | Aggiorna il prezzo di un prodotto e genera il relativo evento di dominio. Endpoint riservato all'amministratore. |
| `/catalog/products/:productId/availability` | `PATCH` | Aggiorna la disponibilita' di un prodotto e genera il relativo evento di dominio. Endpoint riservato all'amministratore. |
| `/catalog/products/:productId/disable` | `PATCH` | Disabilita un prodotto dal catalogo senza eliminarlo fisicamente dal database. Endpoint riservato all'amministratore. |

## cadService - REST

| EndPoint | Type | Description |
|---|---|---|
| `/cad/configurations` | `POST` | Crea una nuova configurazione vuota associata all'utente autenticato e al relativo `systemType`. |
| `/cad/configurations` | `GET` | Restituisce l'elenco delle configurazioni dell'utente autenticato. |
| `/cad/configurations/:configurationId` | `GET` | Restituisce il dettaglio completo di una configurazione esistente. |
| `/cad/configurations/:configurationId` | `PATCH` | Aggiorna i metadati della configurazione, ad esempio nome o stato. |
| `/cad/configurations/:configurationId` | `DELETE` | Elimina logicamente una configurazione oppure la marca come archiviata/non piu' utilizzabile. |
| `/cad/configurations/:configurationId/price-preview` | `GET` | Ricalcola e restituisce il prezzo aggiornato della configurazione a partire dai prodotti correnti del catalogo. |
| `/cad/configurations/:configurationId/finalize` | `POST` | Finalizza la configurazione e la rende pronta per essere trasformata in carrello. |
| `/cad/configurations/:configurationId/snapshots/latest` | `GET` | Restituisce l'ultimo snapshot consistente della configurazione. |
| `/cad/configurations/:configurationId/collaboration` | `POST` | Crea una nuova sessione collaborativa per la configurazione, se non ne esiste gia' una attiva. |
| `/cad/configurations/:configurationId/collaboration` | `GET` | Restituisce le informazioni della sessione collaborativa attiva o lo storico delle sessioni della configurazione. |
| `/cad/collaboration/:sessionId` | `GET` | Restituisce il dettaglio di una specifica sessione collaborativa, con owner, partecipanti, utenti attivi e stato. |
| `/cad/collaboration/:sessionId/participants` | `POST` | Aggiunge uno o piu' utenti autorizzati alla sessione collaborativa. |
| `/cad/collaboration/:sessionId/participants/:userId` | `DELETE` | Rimuove un utente autorizzato dalla sessione collaborativa. |
| `/cad/collaboration/:sessionId/close` | `PATCH` | Chiude esplicitamente la sessione collaborativa e la marca come conclusa. |

## cadService - WebSocket

| EndPoint | Type | Description |
|---|---|---|
| `cad:join-session` | `WS` | Permette a un utente autorizzato di entrare nella sessione collaborativa e ricevere lo stato corrente della configurazione. |
| `cad:leave-session` | `WS` | Notifica l'uscita di un utente dalla sessione collaborativa e aggiorna la lista degli utenti attivi. |
| `cad:apply-operation` | `WS` | Invia una modifica incrementale alla configurazione condivisa, da validare e applicare lato server. |
| `cad:operation-applied` | `WS` | Messaggio broadcast del server che conferma l'applicazione di una modifica e la propaga a tutti i partecipanti attivi. |
| `cad:user-joined` | `WS` | Evento broadcast del server quando un partecipante entra nella sessione collaborativa. |
| `cad:user-left` | `WS` | Evento broadcast del server quando un partecipante esce dalla sessione collaborativa. |
| `cad:resync-request` | `WS` | Richiesta del client per ottenere nuovamente lo stato consistente della configurazione dopo perdita di sincronizzazione o reconnessione. |
| `cad:resync-state` | `WS` | Risposta del server con snapshot consistente e metadati minimi necessari a riallineare il client. |
| `cad:session-closed` | `WS` | Evento broadcast del server che comunica la chiusura della sessione collaborativa a tutti i client connessi. |

## cartService

| EndPoint | Type | Description |
|---|---|---|
| `/cart` | `GET` | Restituisce il carrello attivo dell'utente autenticato. |
| `/cart` | `POST` | Crea un nuovo carrello attivo per l'utente autenticato, se necessario. |
| `/cart/items` | `POST` | Aggiunge un prodotto al carrello con il relativo snapshot commerciale. |
| `/cart/items/:productId` | `PATCH` | Aggiorna la quantita' di un prodotto gia' presente nel carrello. |
| `/cart/items/:productId` | `DELETE` | Rimuove un prodotto dal carrello. |
| `/cart/from-configuration/:configurationId` | `POST` | Popola o aggiorna il carrello a partire da una configurazione finalizzata del CAD. |
| `/cart/summary` | `GET` | Restituisce il riepilogo economico del carrello con totale aggiornato e numero articoli. |
| `/cart/checkout` | `POST` | Invia una richiesta d'ordine a partire dal carrello corrente e crea un `OrderRequest`. |
| `/cart/order-requests` | `GET` | Restituisce lo storico delle richieste d'ordine dell'utente autenticato. |
| `/cart/order-requests/:orderRequestId` | `GET` | Restituisce il dettaglio di una specifica richiesta d'ordine. |

## notificationService - REST

| EndPoint | Type | Description |
|---|---|---|
| `/notifications/subscriptions` | `GET` | Restituisce le sottoscrizioni attive dell'utente autenticato. |
| `/notifications/subscriptions` | `POST` | Crea una nuova sottoscrizione per monitorare una configurazione o un insieme di prodotti. |
| `/notifications/subscriptions/:subscriptionId` | `GET` | Restituisce il dettaglio di una specifica sottoscrizione. |
| `/notifications/subscriptions/:subscriptionId` | `PATCH` | Aggiorna le preferenze della sottoscrizione, ad esempio canale o stato attivo. |
| `/notifications/subscriptions/:subscriptionId` | `DELETE` | Disattiva o rimuove una sottoscrizione esistente. |
| `/notifications` | `GET` | Restituisce le notifiche consegnate all'utente autenticato. |
| `/notifications/:notificationId/read` | `PATCH` | Marca una notifica come letta. |

## notificationService - WebSocket

| EndPoint | Type | Description |
|---|---|---|
| `notification:subscribe` | `WS` | Registra il client autenticato al canale di notifiche real-time del proprio utente. |
| `notification:unsubscribe` | `WS` | Disconnette il client dal canale di notifiche real-time. |
| `notification:push` | `WS` | Evento inviato dal server per notificare cambiamenti di prezzo o disponibilita' rilevanti per l'utente. |
| `notification:read` | `WS` | Evento opzionale del client per marcare una notifica come letta in tempo reale. |

## chatbotService - REST

| EndPoint | Type | Description |
|---|---|---|
| `/chatbot/sessions` | `POST` | Crea una nuova sessione di chat contestuale all'utente autenticato e, opzionalmente, a una configurazione attiva. |
| `/chatbot/sessions/:sessionId` | `GET` | Restituisce il dettaglio di una sessione di chat esistente. |
| `/chatbot/sessions/:sessionId/messages` | `GET` | Restituisce la cronologia dei messaggi di una sessione di chat. |
| `/chatbot/sessions/:sessionId/close` | `PATCH` | Chiude esplicitamente una sessione di chat. |

## chatbotService - WebSocket

| EndPoint | Type | Description |
|---|---|---|
| `chatbot:join-session` | `WS` | Collega il client a una sessione di chat esistente e abilita lo scambio real-time dei messaggi. |
| `chatbot:send-message` | `WS` | Invia un messaggio dell'utente al chatbot insieme all'eventuale contesto della configurazione corrente. |
| `chatbot:response` | `WS` | Evento inviato dal server con la risposta generata dal chatbot. |
| `chatbot:leave-session` | `WS` | Disconnette il client dalla sessione di chat attiva. |

## reportingService

| EndPoint | Type | Description |
|---|---|---|
| `/reports` | `GET` | Restituisce l'elenco dei report disponibili per l'utente o per l'amministratore, a seconda del ruolo. |
| `/reports/:reportId` | `GET` | Restituisce il dettaglio di un report specifico. |
| `/reports/generate` | `POST` | Genera un nuovo report su un intervallo temporale o su un insieme di metriche richieste. Endpoint tipicamente riservato all'amministratore. |
| `/reports/sales-snapshots` | `GET` | Restituisce gli snapshot aggregati delle metriche di vendita. |
| `/reports/configurations-summary` | `GET` | Restituisce statistiche aggregate sulle configurazioni finalizzate, ad esempio componenti o `systemType` piu' utilizzati. |

## apiGateway

| EndPoint | Type | Description |
|---|---|---|
| `/api/auth/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint di `authenticationService` e applica le policy di accesso pubbliche o protette. |
| `/api/catalog/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint di `catalogService`, con eventuali controlli di ruolo per le operazioni admin. |
| `/api/cad/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint REST di `cadService`. |
| `/api/cart/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint di `cartService`. |
| `/api/notifications/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint REST di `notificationService`. |
| `/api/chatbot/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint REST di `chatbotService`. |
| `/api/reports/*` | `HTTP Proxy` | Espone verso il frontend gli endpoint di `reportingService`, tipicamente con controlli di autorizzazione aggiuntivi. |
| `/ws/cad` | `WS Proxy` | Instrada la comunicazione WebSocket del frontend verso il canale collaborativo di `cadService`. |
| `/ws/notifications` | `WS Proxy` | Instrada la comunicazione WebSocket del frontend verso `notificationService`. |
| `/ws/chatbot` | `WS Proxy` | Instrada la comunicazione WebSocket del frontend verso `chatbotService`. |

## Rilevanza per gli insegnamenti

Questa sezione classifica i servizi e le relative aree funzionali rispetto ai due corsi, trattando KompozeR come un unico progetto coerente.

| Servizio / Area | Rilevanza |
|---|---|
| `authenticationService` | `ASW + DS` |
| `catalogService` | `ASW + DS` |
| `cadService - REST` | `ASW + DS` |
| `cadService - WebSocket` | `DS` |
| `cartService` | `ASW + DS` |
| `notificationService - REST` | `ASW + DS` |
| `notificationService - WebSocket` | `ASW + DS` |
| `chatbotService - REST` | `ASW` |
| `chatbotService - WebSocket` | `ASW + DS` |
| `reportingService` | `ASW + DS` |
| `apiGateway` | `ASW + DS` |

### Criterio di classificazione

- `ASW`: funzionalita' principalmente legate a sviluppo web, SPA, API REST, autenticazione web e servizi applicativi tradizionali.
- `DS`: funzionalita' principalmente legate a coordinamento distribuito, collaborazione concorrente, causal ordering, recovery e fault tolerance.
- `ASW + DS`: funzionalita' che hanno rilevanza per entrambi i corsi, sia dal punto di vista applicativo sia dal punto di vista distribuito.

## Autorizzazione degli endpoint

Questa sezione definisce il livello minimo di accesso richiesto per ogni area del sistema.

Legenda:

- `Public`: endpoint accessibile senza autenticazione.
- `Authenticated`: endpoint accessibile a qualsiasi utente autenticato, incluso guest se esplicitamente ammesso.
- `Authenticated (no guest)`: endpoint riservato a utenti autenticati non guest.
- `Admin`: endpoint riservato a utenti con ruolo amministratore.

| Servizio / Area | Accesso |
|---|---|
| `POST /auth/register` | `Public` |
| `POST /auth/login` | `Public` |
| `POST /auth/guest` | `Public` |
| `POST /auth/logout` | `Authenticated` |
| `GET /auth/me` | `Authenticated` |
| `GET /auth/validate` | `Authenticated` |
| `GET /auth/sessions` | `Authenticated` |
| `PATCH /auth/sessions/:sessionId/revoke` | `Authenticated` |
| `GET /catalog/products` | `Public` |
| `GET /catalog/products/:productId` | `Public` |
| `POST /catalog/products` | `Admin` |
| `PATCH /catalog/products/:productId` | `Admin` |
| `PATCH /catalog/products/:productId/price` | `Admin` |
| `PATCH /catalog/products/:productId/availability` | `Admin` |
| `PATCH /catalog/products/:productId/disable` | `Admin` |
| `POST /cad/configurations` | `Authenticated` |
| `GET /cad/configurations` | `Authenticated` |
| `GET /cad/configurations/:configurationId` | `Authenticated` |
| `PATCH /cad/configurations/:configurationId` | `Authenticated` |
| `DELETE /cad/configurations/:configurationId` | `Authenticated` |
| `GET /cad/configurations/:configurationId/price-preview` | `Authenticated` |
| `POST /cad/configurations/:configurationId/finalize` | `Authenticated` |
| `GET /cad/configurations/:configurationId/snapshots/latest` | `Authenticated` |
| `POST /cad/configurations/:configurationId/collaboration` | `Authenticated (no guest)` |
| `GET /cad/configurations/:configurationId/collaboration` | `Authenticated (no guest)` |
| `GET /cad/collaboration/:sessionId` | `Authenticated (no guest)` |
| `POST /cad/collaboration/:sessionId/participants` | `Authenticated (no guest)` |
| `DELETE /cad/collaboration/:sessionId/participants/:userId` | `Authenticated (no guest)` |
| `PATCH /cad/collaboration/:sessionId/close` | `Authenticated (no guest)` |
| `WS cad:join-session` | `Authenticated (no guest)` |
| `WS cad:leave-session` | `Authenticated (no guest)` |
| `WS cad:apply-operation` | `Authenticated (no guest)` |
| `WS cad:operation-applied` | `Authenticated (no guest)` |
| `WS cad:user-joined` | `Authenticated (no guest)` |
| `WS cad:user-left` | `Authenticated (no guest)` |
| `WS cad:resync-request` | `Authenticated (no guest)` |
| `WS cad:resync-state` | `Authenticated (no guest)` |
| `WS cad:session-closed` | `Authenticated (no guest)` |
| `GET /cart` | `Authenticated` |
| `POST /cart` | `Authenticated` |
| `POST /cart/items` | `Authenticated` |
| `PATCH /cart/items/:productId` | `Authenticated` |
| `DELETE /cart/items/:productId` | `Authenticated` |
| `POST /cart/from-configuration/:configurationId` | `Authenticated` |
| `GET /cart/summary` | `Authenticated` |
| `POST /cart/checkout` | `Authenticated` |
| `GET /cart/order-requests` | `Authenticated` |
| `GET /cart/order-requests/:orderRequestId` | `Authenticated` |
| `GET /notifications/subscriptions` | `Authenticated (no guest)` |
| `POST /notifications/subscriptions` | `Authenticated (no guest)` |
| `GET /notifications/subscriptions/:subscriptionId` | `Authenticated (no guest)` |
| `PATCH /notifications/subscriptions/:subscriptionId` | `Authenticated (no guest)` |
| `DELETE /notifications/subscriptions/:subscriptionId` | `Authenticated (no guest)` |
| `GET /notifications` | `Authenticated (no guest)` |
| `PATCH /notifications/:notificationId/read` | `Authenticated (no guest)` |
| `WS notification:subscribe` | `Authenticated (no guest)` |
| `WS notification:unsubscribe` | `Authenticated (no guest)` |
| `WS notification:push` | `Authenticated (no guest)` |
| `WS notification:read` | `Authenticated (no guest)` |
| `POST /chatbot/sessions` | `Authenticated` |
| `GET /chatbot/sessions/:sessionId` | `Authenticated` |
| `GET /chatbot/sessions/:sessionId/messages` | `Authenticated` |
| `PATCH /chatbot/sessions/:sessionId/close` | `Authenticated` |
| `WS chatbot:join-session` | `Authenticated` |
| `WS chatbot:send-message` | `Authenticated` |
| `WS chatbot:response` | `Authenticated` |
| `WS chatbot:leave-session` | `Authenticated` |
| `GET /reports` | `Authenticated` |
| `GET /reports/:reportId` | `Authenticated` |
| `POST /reports/generate` | `Admin` |
| `GET /reports/sales-snapshots` | `Admin` |
| `GET /reports/configurations-summary` | `Admin` |
| `/api/auth/*` | `Public` + `Authenticated` a seconda dell'endpoint sottostante |
| `/api/catalog/*` | `Public` o `Admin` a seconda dell'endpoint sottostante |
| `/api/cad/*` | `Authenticated` o `Authenticated (no guest)` a seconda dell'endpoint sottostante |
| `/api/cart/*` | `Authenticated` |
| `/api/notifications/*` | `Authenticated (no guest)` |
| `/api/chatbot/*` | `Authenticated` |
| `/api/reports/*` | `Authenticated` o `Admin` a seconda dell'endpoint sottostante |
| `/ws/cad` | `Authenticated (no guest)` |
| `/ws/notifications` | `Authenticated (no guest)` |
| `/ws/chatbot` | `Authenticated` |

### Note

- Gli utenti guest possono navigare il catalogo, usare il configuratore e il chatbot, e creare/modificare un carrello nel limite delle funzionalita' permesse dal dominio.
- Le funzionalita' di collaborazione e notifiche sono riservate a utenti autenticati non guest.
- Gli endpoint admin sono accessibili solo tramite token con ruolo `ADMIN`, tipicamente verificato dal gateway prima del forwarding.
