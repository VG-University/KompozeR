# Definizione dei DB (allineata al codice)

Questo file descrive la persistenza MongoDB nello stato attuale del progetto.

## Regole generali

- Ogni microservizio possiede la propria collezione/ownership logica.
- `apiGateway` non possiede database.
- Prezzo e disponibilita sono di ownership Catalog.
- I riferimenti tra servizi avvengono per ID/snapshot.
- `reportingService` non mantiene un database dedicato nel setup corrente: legge `orders` in sola lettura.

## Mappa DB runtime

| Microservizio | Database | Collection principali |
|---|---|---|
| `authenticationService` | `authdb` | `users`, `sessions` |
| `catalogService` | `catalogdb` | `components` |
| `cadService` | `caddb` | `configurations` |
| `cartService` | `cartdb` | `carts` |
| `orderService` | `orderdb` | `orders` |
| `notificationService` | `notificationdb` | `notifications`, `notificationSubscriptions`, `notificationEvents` |
| `chatbotService` | `chatbotdb` | `chatSessions`, `chatMessages` |
| `reportingService` | `orderdb` (read-only) | `orders` |

## Authentication Service

### `users`

```json
{
  "_id": "usr_001",
  "username": "valerio",
  "passwordHash": "...",
  "email": "valerio@example.com",
  "role": "BASE",
  "isActive": true,
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:00:00.000Z"
}
```

### `sessions`

```json
{
  "_id": "ses_001",
  "userId": "usr_001",
  "tokenId": "tok_001",
  "loggedIn": "2026-06-01T10:05:00.000Z",
  "expiresAt": "2026-06-01T18:05:00.000Z",
  "loggedOut": null,
  "isRevoked": false
}
```

## Catalog Service

### `components`

```json
{
  "_id": "cmp_001",
  "sku": "INT-RIP-800-001",
  "name": "Ripiano 800",
  "description": "Ripiano test",
  "category": "TONDO",
  "Type": "RIPIANO",
  "price": 3490,
  "isAvailable": true,
  "imageUrl": "",
  "dimensions": {
    "widthMm": 800,
    "heightMm": 20,
    "depthMm": 300
  },
  "compatibleWith": [],
  "version": 1,
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:00:00.000Z"
}
```

## CAD Service

### `configurations`

```json
{
  "_id": "cfg_001",
  "ownerId": "usr_001",
  "name": "Scaffale soggiorno",
  "status": "READY_FOR_FINALIZE",
  "category": "TONDO",
  "environment": {
    "maxWidthMm": 5000,
    "maxHeightMm": 3000,
    "minWidthMm": 600,
    "minHeightMm": 220,
    "unit": "mm"
  },
  "columnPlan": {
    "columnCount": 2,
    "columns": [
      { "index": 0, "shelfWidthMm": 800 },
      { "index": 1, "shelfWidthMm": 800 }
    ]
  },
  "columnDesigns": [
    { "columnIndex": 0, "levelsMm": [120, 440], "shelfThicknessMm": 20 }
  ],
  "components": [
    {
      "sku": "INT-RIP-800-001",
      "name": "Ripiano 800",
      "quantity": 2,
      "unitPriceCents": 3490,
      "componentType": "RIPIANO"
    }
  ],
  "version": 3,
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:10:00.000Z"
}
```

## Cart Service

### `carts`

```json
{
  "_id": "cart_usr_001",
  "userId": "usr_001",
  "items": [
    {
      "sku": "INT-RIP-800-001",
      "name": "Ripiano 800",
      "unitPrice": 34.9,
      "quantity": 2,
      "lineTotal": 69.8
    }
  ],
  "removedUnavailableItems": {},
  "total": 69.8,
  "updatedAt": "2026-06-01T10:15:00.000Z"
}
```

## Order Service

### `orders`

```json
{
  "_id": "ord_001",
  "userId": "usr_001",
  "items": [
    {
      "sku": "INT-RIP-800-001",
      "name": "Ripiano 800",
      "unitPrice": 34.9,
      "quantity": 2
    }
  ],
  "total": 69.8,
  "status": "SUBMITTED",
  "submittedAt": "2026-06-01T10:20:00.000Z",
  "doneAt": null,
  "cancelledAt": null
}
```

## Notification Service

### `notifications`

```json
{
  "_id": "notif_001",
  "userId": "usr_001",
  "type": "PRICE_CHANGED",
  "title": "Prezzo aggiornato",
  "message": "Il componente INT-RIP-800-001 ha cambiato prezzo",
  "sku": "INT-RIP-800-001",
  "componentId": "cmp_001",
  "contextType": "CART",
  "contextId": "cart_usr_001",
  "read": false,
  "createdAt": "2026-06-01T10:25:00.000Z",
  "readAt": null
}
```

### `notificationSubscriptions`

```json
{
  "_id": "sub_001",
  "userId": "usr_001",
  "scope": "PRODUCT",
  "targetId": "INT-RIP-800-001",
  "events": ["PRICE_CHANGED", "AVAILABILITY_CHANGED"],
  "channel": "IN_APP",
  "isActive": true,
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:25:00.000Z"
}
```

### `notificationEvents`

```json
{
  "_id": "evt_001",
  "processedAt": "2026-06-01T10:25:00.000Z"
}
```

Uso: idempotenza su eventi catalogo gia processati.

## Chatbot Service

### `chatSessions`

```json
{
  "_id": "chat_001",
  "userId": "usr_001",
  "configurationId": "cfg_001",
  "status": "ACTIVE",
  "createdAt": "2026-06-01T10:30:00.000Z",
  "updatedAt": "2026-06-01T10:31:00.000Z"
}
```

### `chatMessages`

```json
{
  "_id": "msg_001",
  "sessionId": "chat_001",
  "role": "USER",
  "content": "Quanto costa il ripiano?",
  "userId": "usr_001",
  "createdAt": "2026-06-01T10:31:00.000Z"
}
```

## Reporting Service

Il reporting usa la collection `orders` del servizio ordini e restituisce aggregazioni giornaliere (`submitted`, `done`, `cancelled`, `revenue`) senza persistere report materializzati nel runtime corrente.

## Note operative

- `notificationService` usa anche connessioni read-only a `cartdb` e `caddb` per risoluzione impatti.
- Le porte host Mongo in sviluppo sono esposte (27017-27023) per ispezione con Compass.
- La nomenclatura qui riportata segue gli schema Mongoose realmente presenti nel codice.
