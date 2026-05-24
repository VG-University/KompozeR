# Domain DTOs

Questo file definisce i DTO logici condivisi del dominio, cioe' le forme dati stabili e riusabili tra microservizi, frontend e futuri contratti TypeScript.

Obiettivi:

- fissare un vocabolario dati comune prima dell'implementazione;
- evitare duplicazioni o differenze di naming tra servizi;
- separare i DTO di dominio dai payload specifici REST e WebSocket.

## Principi

- Un DTO logico descrive una forma dati condivisa, non una classe tecnica.
- I DTO qui definiti non dipendono da framework, database o librerie.
- I payload REST e WebSocket possono comporre questi DTO, estenderli o specializzarli.
- Non tutti i dati interni dei servizi devono diventare DTO condivisi: qui teniamo solo quelli stabili e trasversali.

## Convenzioni generali

- Tutti gli ID sono stringhe logiche.
- I timestamp sono stringhe ISO 8601 UTC.
- I nomi proposti sono gia' adatti a futura traduzione in interfacce TypeScript.
- Quando esistono una forma sintetica e una completa, il suffisso suggerito e' `Summary` o `Detail`.

## Value Object DTO condivisi

### `MoneyDto`

```json
{
  "amount": 49.9,
  "currency": "EUR"
}
```

Uso:

- prezzi di catalogo;
- totale configurazione;
- totale carrello;
- metriche di report.

### `DimensionsDto`

```json
{
  "width": 80,
  "depth": 30,
  "height": null
}
```

Uso:

- catalogo prodotti;
- eventuali riepiloghi di configurazione.

### `GridCellDto`

```json
{
  "x": 0,
  "y": 1,
  "z": 0
}
```

Uso:

- posizionamento dei componenti nella configurazione CAD;
- operazioni collaborative.

### `TargetRefDto`

```json
{
  "scope": "PRODUCT",
  "targetId": "prod_001"
}
```

Uso:

- notifiche;
- sottoscrizioni;
- eventuali riferimenti generici a risorse.

## DTO condivisi di identita' e accesso

### `UserSummaryDto`

```json
{
  "id": "usr_001",
  "username": "valerio",
  "email": "valerio@example.com",
  "role": "BASE"
}
```

Uso:

- autenticazione;
- risposta `auth/me`;
- contesti amministrativi o di audit.

### `SessionSummaryDto`

```json
{
  "id": "ses_001",
  "tokenId": "tok_001",
  "loggedIn": "2026-05-24T10:00:00Z",
  "expiresAt": "2026-05-24T18:00:00Z",
  "loggedOut": null,
  "isRevoked": false
}
```

Uso:

- login;
- gestione sessioni utente;
- future funzionalita' di revoke o audit sessioni.

## DTO condivisi di catalogo

### `ProductSummaryDto`

```json
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
```

### `ProductDetailDto`

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

Nota:

- `ProductSummaryDto` serve per liste e selezioni;
- `ProductDetailDto` aggiunge i campi descrittivi necessari alla vista dettaglio o all'admin.

## DTO condivisi di configurazione CAD

### `ConfigurationComponentDto`

```json
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
```

### `ConfigurationSummaryDto`

```json
{
  "id": "cfg_001",
  "ownerId": "usr_001",
  "systemType": "TONDO",
  "name": "Scaffale soggiorno",
  "status": "DRAFT",
  "totalPriceSnapshot": {
    "amount": 49.9,
    "currency": "EUR"
  },
  "createdAt": "2026-05-24T10:20:00Z",
  "updatedAt": "2026-05-24T10:30:00Z"
}
```

### `ConfigurationDetailDto`

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

### `CollaborativeSessionDto`

```json
{
  "sessionId": "col_001",
  "configurationId": "cfg_001",
  "ownerId": "usr_001",
  "participants": ["usr_001", "usr_002", "usr_003"],
  "activeUsers": ["usr_001", "usr_002"],
  "status": "ACTIVE",
  "createdAt": "2026-05-24T10:40:00Z",
  "updatedAt": "2026-05-24T10:45:00Z",
  "endedAt": null
}
```

### `CadOperationDto`

```json
{
  "id": "op_010",
  "authorId": "usr_002",
  "type": "ADD_COMPONENT",
  "baseVersion": 12,
  "appliedVersion": 13,
  "payload": {
    "productId": "prod_001",
    "componentType": "RIPIANO",
    "gridCell": {
      "x": 0,
      "y": 2,
      "z": 0
    },
    "quantity": 1
  },
  "createdAt": "2026-05-24T11:45:00Z"
}
```

Nota:

- `CadOperationDto` e' condiviso soprattutto tra payload WebSocket e futuro recupero degli edit incrementali.

## DTO condivisi di carrello e ordine

### `CartItemDto`

```json
{
  "productId": "prod_001",
  "nameSnapshot": "Ripiano Tondo 80x30 Bianco",
  "unitPriceSnapshot": {
    "amount": 49.9,
    "currency": "EUR"
  },
  "quantity": 1,
  "lineTotal": {
    "amount": 49.9,
    "currency": "EUR"
  }
}
```

### `CartDto`

```json
{
  "id": "cart_001",
  "ownerId": "usr_001",
  "sourceConfigurationId": "cfg_001",
  "status": "ACTIVE",
  "items": [
    {
      "productId": "prod_001",
      "nameSnapshot": "Ripiano Tondo 80x30 Bianco",
      "unitPriceSnapshot": {
        "amount": 49.9,
        "currency": "EUR"
      },
      "quantity": 1,
      "lineTotal": {
        "amount": 49.9,
        "currency": "EUR"
      }
    }
  ],
  "totalPriceSnapshot": {
    "amount": 49.9,
    "currency": "EUR"
  }
}
```

### `OrderRequestDto`

```json
{
  "id": "ordreq_001",
  "cartId": "cart_001",
  "status": "SUBMITTED",
  "submittedAt": "2026-05-24T11:00:00Z"
}
```

## DTO condivisi di notifiche

### `NotificationSubscriptionDto`

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
  "updatedAt": "2026-05-24T11:10:00Z"
}
```

### `NotificationDto`

```json
{
  "id": "notif_001",
  "type": "PRICE_CHANGED",
  "title": "Prezzo aggiornato",
  "message": "Il prodotto selezionato e' stato aggiornato.",
  "target": {
    "scope": "PRODUCT",
    "targetId": "prod_001"
  },
  "read": false,
  "createdAt": "2026-05-24T11:12:00Z",
  "readAt": null
}
```

## DTO condivisi di chatbot

### `ChatMessageDto`

```json
{
  "id": "msg_001",
  "sender": "USER",
  "content": "Vorrei aggiungere due ripiani.",
  "createdAt": "2026-05-24T11:20:30Z"
}
```

### `ChatSessionDto`

```json
{
  "id": "chat_001",
  "userId": "usr_001",
  "configurationId": "cfg_001",
  "status": "ACTIVE",
  "createdAt": "2026-05-24T11:20:00Z",
  "updatedAt": "2026-05-24T11:21:00Z",
  "closedAt": null
}
```

## DTO condivisi di reporting

### `ReportSummaryDto`

```json
{
  "id": "rep_001",
  "type": "SALES_SUMMARY",
  "status": "READY",
  "createdAt": "2026-05-24T11:30:00Z",
  "createdBy": "usr_admin_001"
}
```

### `ReportDetailDto`

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

### `SalesSnapshotDto`

```json
{
  "date": "2026-05-24",
  "totalOrderRequests": 12,
  "totalRevenueEstimate": {
    "amount": 1840.5,
    "currency": "EUR"
  }
}
```

### `ConfigurationsSummaryDto`

```json
{
  "generatedAt": "2026-05-24T11:35:00Z",
  "systemTypes": [
    {
      "systemType": "TONDO",
      "finalizedConfigurations": 18
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

## DTO condivisi di errore e trasporto

### `ApiErrorDto`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload is invalid",
    "details": [],
    "traceId": "trc_001",
    "timestamp": "2026-05-24T12:10:00Z"
  }
}
```

### `WsMessageDto<T>`

```json
{
  "event": "cad:operation-applied",
  "requestId": "req_010",
  "data": {}
}
```

Nota:

- `ApiErrorDto` rimanda alla specifica di [utilities/RESTErrorModel.md](c:/Users/giann/Documents/GitHub/KompozeR/utilities/RESTErrorModel.md);
- `WsMessageDto<T>` rimanda alla struttura generica definita in [utilities/WebSocketPayloads.md](c:/Users/giann/Documents/GitHub/KompozeR/utilities/WebSocketPayloads.md).

## Relazione con gli altri documenti

- [utilities/RESTPayloads.md](c:/Users/giann/Documents/GitHub/KompozeR/utilities/RESTPayloads.md): definisce i payload endpoint per endpoint.
- [utilities/WebSocketPayloads.md](c:/Users/giann/Documents/GitHub/KompozeR/utilities/WebSocketPayloads.md): definisce i messaggi real-time evento per evento.
- [utilities/RESTErrorModel.md](c:/Users/giann/Documents/GitHub/KompozeR/utilities/RESTErrorModel.md): definisce il contratto uniforme degli errori REST.
- Questo file raccoglie invece i mattoni dati riusabili che quei payload compongono.

## Criterio per il passo successivo

Quando iniziera' l'implementazione backend, questi DTO potranno diventare:

- interfacce TypeScript condivise tra servizi o per servizio;
- schemi di validazione input/output;
- tipi usati da controller, use case e adapter.

In quel passaggio non andra' ridefinito il dominio: andra' solo tradotto in file `.ts` mantenendo questi nomi e queste forme il piu' possibile stabili.
