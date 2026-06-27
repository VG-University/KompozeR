# DDD to Microservices (allineato al codice)

Questo file raccoglie gli endpoint realmente implementati e raggiungibili tramite API Gateway.

Nota: salvo eccezioni (`/health`, `/auth/register`, `/auth/login`, `/auth/guest`), il gateway applica JWT middleware prima del forwarding.

## authenticationService (`/auth/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/auth/register` | `POST` | Registra utente BASE. |
| `/auth/login` | `POST` | Login utente registrato. |
| `/auth/guest` | `POST` | Crea sessione guest. |
| `/auth/me` | `GET` | Restituisce profilo utente corrente. |
| `/auth/sessions` | `GET` | Elenca sessioni utente. |
| `/auth/logout` | `POST` | Logout sessione corrente. |
| `/auth/sessions/:sessionId` | `DELETE` | Revoca sessione specifica (owner o ADMIN). |

## catalogService (`/catalog/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/catalog/health` | `GET` | Health check servizio catalogo. |
| `/catalog` | `GET` | Lista paginata/filtrata componenti. |
| `/catalog/:id` | `GET` | Dettaglio componente. |
| `/catalog` | `POST` | Crea componente (ADMIN). |
| `/catalog/:id` | `PUT` | Aggiorna componente (ADMIN). |
| `/catalog/:id` | `DELETE` | Elimina componente (ADMIN). |

## cadService (`/cad/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/cad/health` | `GET` | Health check CAD. |
| `/cad/configurations` | `POST` | Crea configurazione. |
| `/cad/configurations` | `GET` | Lista configurazioni utente. |
| `/cad/configurations/:id` | `GET` | Dettaglio configurazione. |
| `/cad/configurations/:id/next-options` | `GET` | Opzioni valide per colonna. |
| `/cad/configurations/:id/environment` | `PATCH` | Imposta ambiente. |
| `/cad/configurations/:id/category` | `PATCH` | Imposta categoria (`TONDO`, `QUADRO`, `KUBE`). |
| `/cad/configurations/:id/column-plan` | `PATCH` | Imposta piano colonne. |
| `/cad/configurations/:id/design` | `PATCH` | Aggiorna design colonne/livelli. |
| `/cad/configurations/:id/finalize` | `POST` | Finalizza configurazione e BOM. |
| `/cad/configurations/:id/reorder` | `POST` | Riordino da configurazione finalizzata. |

## cartService (`/cart/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/cart/health` | `GET` | Health check cart. |
| `/cart` | `GET` | Ottiene carrello utente. |
| `/cart/items/:sku` | `PUT` | Upsert item nel carrello. |
| `/cart/items/:sku` | `DELETE` | Rimuove item dal carrello. |
| `/cart` | `DELETE` | Svuota carrello. |
| `/cart/checkout` | `POST` | Checkout e creazione ordine. |

## orderService (`/orders/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/orders/health` | `GET` | Health check order. |
| `/orders` | `POST` | Crea ordine. |
| `/orders` | `GET` | Lista ordini (utente o admin). |
| `/orders/:orderId` | `GET` | Dettaglio ordine. |
| `/orders/:orderId/cancel` | `PATCH` | Annulla ordine (owner/admin). |
| `/orders/:orderId/status` | `PATCH` | Aggiorna stato ordine (ADMIN). |

## notificationService (`/notifications/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/notifications/subscriptions` | `GET` | Lista sottoscrizioni utente. |
| `/notifications/subscriptions` | `POST` | Crea sottoscrizione (`PRODUCT`, `IN_APP`). |
| `/notifications/subscriptions/:subscriptionId` | `GET` | Dettaglio sottoscrizione. |
| `/notifications/subscriptions/:subscriptionId` | `PATCH` | Aggiorna eventi/stato sottoscrizione. |
| `/notifications/subscriptions/:subscriptionId` | `DELETE` | Elimina sottoscrizione. |
| `/notifications` | `GET` | Lista notifiche utente (paginata, filtro unread). |
| `/notifications/unread/count` | `GET` | Conteggio non lette. |
| `/notifications/:notificationId/read` | `PATCH` | Marca notifica come letta. |

## notificationService WebSocket

Path websocket:

- `/ws/notifications/socket.io` (instradato dal gateway su `/ws/notifications`)

Eventi principali:

- `notification:subscribe`
- `notification:unsubscribe`
- `notification:push`
- `notification:error`

## chatbotService REST (`/chatbot/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/chatbot/health` | `GET` | Health check chatbot. |
| `/chatbot/sessions` | `POST` | Crea sessione chat. |
| `/chatbot/sessions/:sessionId` | `GET` | Dettaglio sessione. |
| `/chatbot/sessions/:sessionId/messages` | `GET` | Lista messaggi sessione. |
| `/chatbot/sessions/:sessionId/close` | `PATCH` | Chiude sessione. |
| `/chatbot/sessions/:sessionId/messages` | `POST` | Invia messaggio e ottiene risposta bot. |

## chatbotService WebSocket

Path websocket:

- `/chatbot/socket.io` (proxy gateway su `/chatbot` con ws=true)

Eventi principali:

- `chat:message:send`
- `chat:typing`
- `chat:message:new`
- `chat:error`

## reportingService (`/reports/*`)

| EndPoint | Type | Description |
|---|---|---|
| `/reports/health` | `GET` | Health check reporting. |
| `/reports/trends/orders` | `GET` | Trend ordini aggregato (ADMIN). |

## apiGateway

| EndPoint | Type | Description |
|---|---|---|
| `/health` | `GET` | Health aggregato gateway + servizi downstream. |
| `/ws/notifications` | `WS Proxy` | Proxy websocket verso notification service. |
| `/bff/dashboard` | `GET` | Endpoint BFF aggregato protetto (interno). |
| `/bff/configurator/:sessionId` | `GET` | Endpoint BFF configuratore protetto (interno). |

## Matrice autorizzazione (gateway)

| Categoria endpoint | Accesso |
|---|---|
| `/health` | `Public` |
| `/auth/register`, `/auth/login`, `/auth/guest` | `Public` |
| Tutti gli altri endpoint REST | `Authenticated` |
| Endpoint admin (`/catalog` mutazioni, `/orders/:id/status`, `/reports/trends/orders`) | `Admin` |

## Note

- Le route BFF esistono nel gateway ma non sono il percorso principale usato dalla SPA corrente.
- Nel perimetro runtime attuale non esistono endpoint CAD collaborativi websocket/REST.
- I path non hanno prefisso `/api`: il frontend usa direttamente `/auth`, `/catalog`, `/cad`, `/cart`, `/orders`, `/notifications`, `/chatbot`, `/reports` via gateway.
