# Domain Model (allineato al codice)

Questo file descrive i bounded context nello stato attuale del progetto implementato.

## Bounded Context

1. Authentication (support)

- Responsabilita: gestione identita, login, registrazione, sessioni e ruoli.
- Possiede: utenti (`users`) e sessioni (`sessions`).
- Non possiede: catalogo, configurazioni, carrello, ordini, notifiche, chat, reporting.

2. Catalog (support)

- Responsabilita: gestione componenti, prezzo, disponibilita e ricerca catalogo.
- Possiede: componenti (`components`).
- Pubblica eventi su Redis (`catalog:events`) quando cambiano prezzo/disponibilita.

3. CAD (core)

- Responsabilita: ciclo di vita della configurazione scaffalatura.
- Possiede: configurazioni (`configurations`) con stato, ambiente, categoria, piano colonne, design e BOM.
- Dipende da Catalog per regole/componenti e da Cart/Notification per finalizzazione e sottoscrizioni.

4. Cart (core)

- Responsabilita: gestione carrello utente e checkout.
- Possiede: carrelli (`carts`) con item snapshot (sku, prezzo unitario, quantita, totale riga).
- Reagisce agli eventi catalogo per rimuovere/ripristinare articoli e riallineare prezzi.

5. Order (core)

- Responsabilita: persistenza ordini e transizioni di stato.
- Possiede: ordini (`orders`) con stati `SUBMITTED`, `DONE`, `CANCELLED`.

6. Notification (core)

- Responsabilita: sottoscrizioni utente e notifiche in-app.
- Possiede: notifiche (`notifications`), sottoscrizioni (`notificationSubscriptions`), eventi processati (`notificationEvents`).
- Consuma eventi catalogo da Redis e risolve impatti su contesti CAD/CART/SUBSCRIPTION.

7. Chatbot (core)

- Responsabilita: sessioni chat e messaggistica contestuale.
- Possiede: sessioni (`chatSessions`) e messaggi (`chatMessages`).
- Dipende da Catalog e CAD per risposte contestuali.

8. Reporting (support)

- Responsabilita: trend ordini per area amministrativa.
- Non possiede un DB dedicato nel setup corrente: legge la collection `orders` (orderdb) in sola lettura.

## Context Map (stato corrente)

- Frontend -> API Gateway: entry point unico per API e websocket.
- API Gateway -> Authentication: autenticazione/ruoli/sessioni.
- API Gateway -> Catalog/CAD/Cart/Order/Notification/Chatbot/Reporting: proxy REST.
- Catalog -> Notification: eventi `PRICE_CHANGED` e `AVAILABILITY_CHANGED` su Redis.
- Catalog -> Cart: eventi Redis per riallineamento carrello.
- CAD -> Cart: finalizzazione configurazione e sincronizzazione BOM.
- CAD -> Notification: creazione sottoscrizioni prodotto in fase di finalize.
- Order -> Reporting: reporting aggrega trend da `orders`.
- Chatbot -> Catalog/CAD: recupero contesto per risposte.

## Entita globali principali

| Entita | Owner | Uso principale |
|---|---|---|
| `User` | Authentication | Identita e ruolo (`GUEST`, `BASE`, `ADMIN`) |
| `Component` | Catalog | SKU, categoria, tipo, prezzo, disponibilita |
| `Configuration` | CAD | Workflow configurazione + BOM |
| `Cart` | Cart | Carrello utente e checkout |
| `Order` | Order | Stato ordine e storico operativo |
| `Notification` | Notification | Notifiche prezzo/disponibilita |
| `NotificationSubscription` | Notification | Monitoraggio SKU per utente |
| `ChatSession` / `ChatMessage` | Chatbot | Assistenza contestuale |

## Eventi di dominio rilevanti (implementati)

### Catalog

- `PRICE_CHANGED`
- `AVAILABILITY_CHANGED`

### Cart

- `CartCreated`
- `ItemAddedToCart`
- `ItemRemovedFromCart`
- `CartUpdatedFromConfiguration`
- `CartItemsRemovedUnavailable`
- `CartItemsRestoredAvailable`
- `CartPricesUpdated`
- `OrderRequestSubmitted`
- `OrderConfirmationRequested`

### Notification

- Consumo di eventi Catalog con idempotenza su `eventId`
- Emissione realtime `notification:push` verso room utente

## Note di modellazione

- Ogni bounded context mantiene ownership del proprio schema Mongo.
- I riferimenti inter-context avvengono per ID o snapshot minimi.
- Prezzo/disponibilita restano di proprieta del Catalog.
- Nel progetto corrente non e implementata la collaborazione CAD multiutente: le funzionalita collaborative restano fuori dal perimetro runtime attuale.
