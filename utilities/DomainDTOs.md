# Domain DTOs (allineati al progetto)

Questo documento raccoglie i DTO/payload trasversali nello stato corrente del codice.

## Convenzioni

- ID: string.
- Timestamp: ISO 8601 UTC.
- Prezzi catalogo backend: numeri in centesimi (`price`, `unitPriceCents`).
- Prezzi frontend cart/order: numeri decimali (`unitPrice`, `total`).

## Auth DTO

### `AuthUserDto`

```json
{
  "id": "usr_001",
  "username": "valerio",
  "email": "valerio@example.com",
  "role": "BASE"
}
```

Ruoli supportati backend: `GUEST`, `BASE`, `ADMIN`.

### `LoginResponseDto`

```json
{
  "token": "jwt...",
  "session": {
    "id": "ses_001",
    "tokenId": "tok_001",
    "loggedIn": "2026-06-01T10:00:00.000Z",
    "expiresAt": "2026-06-01T18:00:00.000Z"
  },
  "user": {
    "id": "usr_001",
    "username": "valerio",
    "role": "BASE"
  }
}
```

### `GuestAuthResponseDto`

```json
{
  "token": "jwt..."
}
```

## Catalog DTO

### `CatalogItemDto`

```json
{
  "id": "cmp_001",
  "sku": "INT-RIP-800-001",
  "name": "Ripiano 800",
  "description": "...",
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
  "version": 1
}
```

### `CatalogListDto`

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

## CAD DTO

### `ConfigurationDto`

```json
{
  "id": "cfg_001",
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
  "version": 3,
  "bom": [
    {
      "sku": "INT-RIP-800-001",
      "name": "Ripiano 800",
      "quantity": 2,
      "unitPriceCents": 3490,
      "componentType": "RIPIANO"
    }
  ],
  "createdAt": "2026-06-01T10:00:00.000Z",
  "updatedAt": "2026-06-01T10:10:00.000Z"
}
```

### `ConfigurationsListDto`

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### `NextOptionsDto`

```json
{
  "columnIndex": 0,
  "options": [
    { "heightMm": 120, "allowed": true }
  ],
  "lookAhead": { "feasible": true },
  "version": 4
}
```

## Cart e Order DTO

### `CartDto`

```json
{
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
  "total": 69.8,
  "updatedAt": "2026-06-01T10:15:00.000Z"
}
```

### `CheckoutResultDto`

```json
{
  "orderId": "ord_001",
  "status": "SUBMITTED",
  "userId": "usr_001",
  "items": [],
  "total": 69.8,
  "submittedAt": "2026-06-01T10:20:00.000Z"
}
```

### `OrderDto`

```json
{
  "id": "ord_001",
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
  "submittedAt": "2026-06-01T10:20:00.000Z"
}
```

## Notification DTO

### `NotificationDto`

```json
{
  "id": "notif_001",
  "userId": "usr_001",
  "type": "PRICE_CHANGED",
  "title": "Prezzo aggiornato",
  "message": "...",
  "sku": "INT-RIP-800-001",
  "componentId": "cmp_001",
  "contextType": "CART",
  "contextId": "cart_usr_001",
  "read": false,
  "createdAt": "2026-06-01T10:25:00.000Z",
  "readAt": null
}
```

### `NotificationSubscriptionDto`

```json
{
  "id": "sub_001",
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

### `UnreadCountDto`

```json
{ "count": 3 }
```

## Chatbot DTO

### `ChatSessionDto`

```json
{
  "id": "chat_001",
  "userId": "usr_001",
  "configurationId": "cfg_001",
  "status": "ACTIVE",
  "createdAt": "2026-06-01T10:30:00.000Z",
  "updatedAt": "2026-06-01T10:31:00.000Z"
}
```

### `ChatMessageDto`

```json
{
  "id": "msg_001",
  "sessionId": "chat_001",
  "role": "USER",
  "content": "Quanto costa il ripiano?",
  "userId": "usr_001",
  "createdAt": "2026-06-01T10:31:00.000Z"
}
```

### `SendChatMessageDto`

```json
{
  "sessionId": "chat_001",
  "userMessage": {},
  "botMessage": {}
}
```

## Reporting DTO

### `OrderTrendDto`

```json
{
  "from": "2026-06-01",
  "to": "2026-06-07",
  "days": 7,
  "totals": {
    "submitted": 10,
    "done": 6,
    "cancelled": 1,
    "totalOrders": 17,
    "totalRevenue": 1200.5
  },
  "points": [
    {
      "date": "2026-06-01",
      "submitted": 2,
      "done": 1,
      "cancelled": 0,
      "totalOrders": 3,
      "revenue": 210.4
    }
  ]
}
```

## Error DTO

### `ApiErrorDto`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload is invalid",
    "details": {},
    "timestamp": "2026-06-01T12:10:00.000Z"
  }
}
```

## WebSocket payload principali

### `NotificationPushWsMessage`

```json
{
  "event": "notification:push",
  "data": {
    "notification": {
      "id": "notif_001",
      "type": "PRICE_CHANGED",
      "title": "Prezzo aggiornato",
      "message": "...",
      "target": { "scope": "CART", "targetId": "cart_usr_001" },
      "read": false,
      "createdAt": "2026-06-01T10:25:00.000Z"
    }
  }
}
```

### `ChatRealtimeEvents`

- client -> server: `chat:message:send`
- server -> client: `chat:typing`, `chat:message:new`, `chat:error`

## Note

- Questo file descrive i contratti attuali usati da backend/frontend, non il modello target futuro.
- Eventuali estensioni DS (collaborazione CAD realtime) non fanno parte dei payload runtime correnti.
