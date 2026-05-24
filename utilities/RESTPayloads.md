# REST Payloads

Questo file definisce i payload principali di request e response per gli endpoint REST piu' importanti del sistema.

Obiettivi:

- rendere espliciti i contratti applicativi prima dell'implementazione;
- mantenere separata la definizione degli endpoint dalla struttura dei payload;
- fornire una base coerente per DTO, validazione e documentazione OpenAPI futura.

## Convenzioni generali

- Tutti gli ID sono stringhe logiche (`usr_001`, `cfg_001`, `prod_001`).
- I timestamp sono in formato ISO 8601 UTC.
- I payload mostrati sono il formato logico iniziale, non ancora la versione tecnica definitiva.
- Le response di errore non sono elencate endpoint per endpoint in questo file; verranno gestite in una specifica separata del modello di errore.

## authenticationService

### `POST /auth/register`

Request:

```json
{
  "username": "valerio",
  "email": "valerio@example.com",
  "password": "PlainTextPassword123"
}
```

Response:

```json
{
  "user": {
    "id": "usr_001",
    "username": "valerio",
    "email": "valerio@example.com",
    "role": "BASE"
  },
  "message": "User registered successfully"
}
```

### `POST /auth/login`

Request:

```json
{
  "username": "valerio",
  "password": "PlainTextPassword123"
}
```

Response:

```json
{
  "token": "jwt-token-value",
  "session": {
    "id": "ses_001",
    "tokenId": "tok_001",
    "loggedIn": "2026-05-24T10:00:00Z",
    "expiresAt": "2026-05-24T18:00:00Z"
  },
  "user": {
    "id": "usr_001",
    "username": "valerio",
    "role": "BASE"
  }
}
```

### `POST /auth/guest`

Request:

```json
{}
```

Response:

```json
{
  "token": "jwt-token-value",
  "session": {
    "id": "ses_002",
    "tokenId": "tok_002",
    "loggedIn": "2026-05-24T10:05:00Z",
    "expiresAt": "2026-05-24T18:05:00Z"
  },
  "user": {
    "id": "usr_guest_001",
    "username": "guest_001",
    "role": "GUEST"
  }
}
```

### `GET /auth/me`

Response:

```json
{
  "id": "usr_001",
  "username": "valerio",
  "email": "valerio@example.com",
  "role": "BASE"
}
```

## catalogService

### `GET /catalog/products`

Response:

```json
{
  "items": [
    {
      "id": "prod_001",
      "systemType": "TONDO",
      "componentType": "RIPIANO",
      "name": "Ripiano Tondo 80x30 Bianco",
      "dimensions": {
        "width": 80,
        "depth": 30,
        "height": null
      },
      "soldAsPair": false,
      "price": {
        "amount": 49.9,
        "currency": "EUR"
      },
      "availability": true,
      "isActive": true
    }
  ]
}
```

### `GET /catalog/products/:productId`

Response:

```json
{
  "id": "prod_001",
  "systemType": "TONDO",
  "componentType": "RIPIANO",
  "name": "Ripiano Tondo 80x30 Bianco",
  "description": "Ripiano per sistema Tondo",
  "dimensions": {
    "width": 80,
    "depth": 30,
    "height": null
  },
  "soldAsPair": false,
  "price": {
    "amount": 49.9,
    "currency": "EUR"
  },
  "availability": true,
  "isActive": true
}
```

### `POST /catalog/products`

Request:

```json
{
  "systemType": "TONDO",
  "componentType": "RIPIANO",
  "name": "Ripiano Tondo 80x30 Bianco",
  "description": "Ripiano per sistema Tondo",
  "dimensions": {
    "width": 80,
    "depth": 30,
    "height": null
  },
  "soldAsPair": false,
  "price": {
    "amount": 49.9,
    "currency": "EUR"
  },
  "availability": true
}
```

Response:

```json
{
  "id": "prod_001",
  "message": "Product created successfully"
}
```

### `PATCH /catalog/products/:productId/price`

Request:

```json
{
  "price": {
    "amount": 54.9,
    "currency": "EUR"
  }
}
```

Response:

```json
{
  "id": "prod_001",
  "price": {
    "amount": 54.9,
    "currency": "EUR"
  },
  "message": "Price updated successfully"
}
```

### `PATCH /catalog/products/:productId/availability`

Request:

```json
{
  "availability": false
}
```

Response:

```json
{
  "id": "prod_001",
  "availability": false,
  "message": "Availability updated successfully"
}
```

## cadService

### `POST /cad/configurations`

Request:

```json
{
  "systemType": "TONDO",
  "name": "Scaffale soggiorno"
}
```

Response:

```json
{
  "id": "cfg_001",
  "ownerId": "usr_001",
  "systemType": "TONDO",
  "name": "Scaffale soggiorno",
  "status": "DRAFT",
  "components": [],
  "totalPriceSnapshot": {
    "amount": 0,
    "currency": "EUR"
  },
  "createdAt": "2026-05-24T10:20:00Z",
  "updatedAt": "2026-05-24T10:20:00Z"
}
```

### `GET /cad/configurations/:configurationId`

Response:

```json
{
  "id": "cfg_001",
  "ownerId": "usr_001",
  "systemType": "TONDO",
  "name": "Scaffale soggiorno",
  "status": "DRAFT",
  "components": [
    {
      "productId": "prod_001",
      "componentType": "RIPIANO",
      "gridCell": {
        "x": 0,
        "y": 1,
        "z": 0
      },
      "quantity": 1
    }
  ],
  "totalPriceSnapshot": {
    "amount": 49.9,
    "currency": "EUR"
  },
  "createdAt": "2026-05-24T10:20:00Z",
  "updatedAt": "2026-05-24T10:30:00Z"
}
```

### `PATCH /cad/configurations/:configurationId`

Request:

```json
{
  "name": "Scaffale ingresso",
  "status": "SAVED"
}
```

Response:

```json
{
  "id": "cfg_001",
  "name": "Scaffale ingresso",
  "status": "SAVED",
  "updatedAt": "2026-05-24T10:35:00Z"
}
```

### `GET /cad/configurations/:configurationId/price-preview`

Response:

```json
{
  "configurationId": "cfg_001",
  "totalPrice": {
    "amount": 129.7,
    "currency": "EUR"
  },
  "pricedComponents": [
    {
      "productId": "prod_010",
      "quantity": 2,
      "unitPrice": {
        "amount": 39.9,
        "currency": "EUR"
      },
      "lineTotal": {
        "amount": 79.8,
        "currency": "EUR"
      }
    },
    {
      "productId": "prod_001",
      "quantity": 1,
      "unitPrice": {
        "amount": 49.9,
        "currency": "EUR"
      },
      "lineTotal": {
        "amount": 49.9,
        "currency": "EUR"
      }
    }
  ]
}
```

### `POST /cad/configurations/:configurationId/finalize`

Request:

```json
{}
```

Response:

```json
{
  "configurationId": "cfg_001",
  "status": "FINALIZED",
  "message": "Configuration finalized successfully"
}
```

### `POST /cad/configurations/:configurationId/collaboration`

Request:

```json
{
  "participants": ["usr_002", "usr_003"]
}
```

Response:

```json
{
  "sessionId": "col_001",
  "configurationId": "cfg_001",
  "ownerId": "usr_001",
  "participants": ["usr_001", "usr_002", "usr_003"],
  "activeUsers": [],
  "status": "PENDING",
  "createdAt": "2026-05-24T10:40:00Z"
}
```

## cartService

### `GET /cart`

Response:

```json
{
  "id": "cart_001",
  "ownerId": "usr_001",
  "sourceConfigurationId": "cfg_001",
  "status": "ACTIVE",
  "items": [
    {
      "productId": "prod_010",
      "nameSnapshot": "Montante Tondo 120 Nero",
      "unitPriceSnapshot": {
        "amount": 39.9,
        "currency": "EUR"
      },
      "quantity": 2,
      "lineTotal": {
        "amount": 79.8,
        "currency": "EUR"
      }
    }
  ],
  "totalPriceSnapshot": {
    "amount": 79.8,
    "currency": "EUR"
  }
}
```

### `POST /cart/items`

Request:

```json
{
  "productId": "prod_001",
  "quantity": 1
}
```

Response:

```json
{
  "cartId": "cart_001",
  "message": "Item added to cart",
  "totalPriceSnapshot": {
    "amount": 129.7,
    "currency": "EUR"
  }
}
```

### `PATCH /cart/items/:productId`

Request:

```json
{
  "quantity": 2
}
```

Response:

```json
{
  "cartId": "cart_001",
  "productId": "prod_001",
  "quantity": 2,
  "message": "Item quantity updated"
}
```

### `POST /cart/from-configuration/:configurationId`

Request:

```json
{}
```

Response:

```json
{
  "cartId": "cart_001",
  "sourceConfigurationId": "cfg_001",
  "message": "Cart populated from configuration"
}
```

### `POST /cart/checkout`

Request:

```json
{
  "contactEmail": "valerio@example.com"
}
```

Response:

```json
{
  "orderRequestId": "ordreq_001",
  "cartId": "cart_001",
  "status": "SUBMITTED",
  "submittedAt": "2026-05-24T11:00:00Z"
}
```

## notificationService

### `GET /notifications/subscriptions`

Response:

```json
{
  "items": [
    {
      "id": "sub_001",
      "userId": "usr_001",
      "scope": "PRODUCT",
      "targetId": "prod_001",
      "events": ["PRICE_CHANGED", "AVAILABILITY_CHANGED"],
      "channel": "IN_APP",
      "isActive": true,
      "createdAt": "2026-05-24T11:05:00Z"
    }
  ]
}
```

### `POST /notifications/subscriptions`

Request:

```json
{
  "scope": "PRODUCT",
  "targetId": "prod_001",
  "events": ["PRICE_CHANGED", "AVAILABILITY_CHANGED"],
  "channel": "IN_APP"
}
```

Response:

```json
{
  "id": "sub_001",
  "userId": "usr_001",
  "scope": "PRODUCT",
  "targetId": "prod_001",
  "events": ["PRICE_CHANGED", "AVAILABILITY_CHANGED"],
  "channel": "IN_APP",
  "isActive": true,
  "createdAt": "2026-05-24T11:05:00Z"
}
```

### `GET /notifications/subscriptions/:subscriptionId`

Response:

```json
{
  "id": "sub_001",
  "userId": "usr_001",
  "scope": "PRODUCT",
  "targetId": "prod_001",
  "events": ["PRICE_CHANGED", "AVAILABILITY_CHANGED"],
  "channel": "IN_APP",
  "isActive": true,
  "createdAt": "2026-05-24T11:05:00Z",
  "updatedAt": "2026-05-24T11:05:00Z"
}
```

### `PATCH /notifications/subscriptions/:subscriptionId`

Request:

```json
{
  "events": ["PRICE_CHANGED"],
  "channel": "IN_APP",
  "isActive": false
}
```

Response:

```json
{
  "id": "sub_001",
  "events": ["PRICE_CHANGED"],
  "channel": "IN_APP",
  "isActive": false,
  "updatedAt": "2026-05-24T11:10:00Z"
}
```

### `GET /notifications`

Response:

```json
{
  "items": [
    {
      "id": "notif_001",
      "type": "PRICE_CHANGED",
      "title": "Prezzo aggiornato",
      "message": "Il prodotto Ripiano Tondo 80x30 Bianco e' stato aggiornato.",
      "target": {
        "scope": "PRODUCT",
        "targetId": "prod_001"
      },
      "read": false,
      "createdAt": "2026-05-24T11:12:00Z"
    }
  ]
}
```

### `PATCH /notifications/:notificationId/read`

Request:

```json
{}
```

Response:

```json
{
  "id": "notif_001",
  "read": true,
  "readAt": "2026-05-24T11:13:00Z",
  "message": "Notification marked as read"
}
```

## chatbotService

### `POST /chatbot/sessions`

Request:

```json
{
  "configurationId": "cfg_001"
}
```

Response:

```json
{
  "id": "chat_001",
  "userId": "usr_001",
  "configurationId": "cfg_001",
  "status": "ACTIVE",
  "createdAt": "2026-05-24T11:20:00Z"
}
```

### `GET /chatbot/sessions/:sessionId`

Response:

```json
{
  "id": "chat_001",
  "userId": "usr_001",
  "configurationId": "cfg_001",
  "status": "ACTIVE",
  "createdAt": "2026-05-24T11:20:00Z",
  "updatedAt": "2026-05-24T11:21:00Z"
}
```

### `GET /chatbot/sessions/:sessionId/messages`

Response:

```json
{
  "items": [
    {
      "id": "msg_001",
      "sender": "USER",
      "content": "Vorrei aggiungere due ripiani.",
      "createdAt": "2026-05-24T11:20:30Z"
    },
    {
      "id": "msg_002",
      "sender": "BOT",
      "content": "Posso aiutarti a scegliere i ripiani compatibili con il sistema TONDO.",
      "createdAt": "2026-05-24T11:20:35Z"
    }
  ]
}
```

### `PATCH /chatbot/sessions/:sessionId/close`

Request:

```json
{}
```

Response:

```json
{
  "id": "chat_001",
  "status": "CLOSED",
  "closedAt": "2026-05-24T11:25:00Z",
  "message": "Chat session closed"
}
```

## reportingService

### `GET /reports`

Response:

```json
{
  "items": [
    {
      "id": "rep_001",
      "type": "SALES_SUMMARY",
      "status": "READY",
      "createdAt": "2026-05-24T11:30:00Z",
      "createdBy": "usr_admin_001"
    }
  ]
}
```

### `GET /reports/:reportId`

Response:

```json
{
  "id": "rep_001",
  "type": "SALES_SUMMARY",
  "status": "READY",
  "parameters": {
    "from": "2026-05-01T00:00:00Z",
    "to": "2026-05-24T23:59:59Z"
  },
  "generatedAt": "2026-05-24T11:31:00Z",
  "downloadUrl": "/api/reports/rep_001/download"
}
```

### `POST /reports/generate`

Request:

```json
{
  "type": "SALES_SUMMARY",
  "parameters": {
    "from": "2026-05-01T00:00:00Z",
    "to": "2026-05-24T23:59:59Z"
  }
}
```

Response:

```json
{
  "id": "rep_001",
  "type": "SALES_SUMMARY",
  "status": "QUEUED",
  "createdAt": "2026-05-24T11:30:00Z",
  "message": "Report generation requested"
}
```

### `GET /reports/sales-snapshots`

Response:

```json
{
  "items": [
    {
      "date": "2026-05-24",
      "totalOrderRequests": 12,
      "totalRevenueEstimate": {
        "amount": 1840.5,
        "currency": "EUR"
      }
    }
  ]
}
```

### `GET /reports/configurations-summary`

Response:

```json
{
  "generatedAt": "2026-05-24T11:35:00Z",
  "systemTypes": [
    {
      "systemType": "TONDO",
      "finalizedConfigurations": 18
    },
    {
      "systemType": "QUADRO",
      "finalizedConfigurations": 7
    }
  ],
  "topComponents": [
    {
      "componentType": "RIPIANO",
      "usageCount": 42
    }
  ]
}
```
