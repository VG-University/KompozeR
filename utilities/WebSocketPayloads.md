# WebSocket Payloads

Questo file definisce i payload principali dei messaggi WebSocket per i servizi real-time del sistema.

Obiettivi:

- fissare il contratto dei messaggi client-server e server-client;
- separare i flussi real-time dai payload REST;
- rendere espliciti i campi minimi necessari per collaborazione, notifiche e chat.

## Convenzioni generali

- I messaggi sono presentati in forma logica, indipendente dalla libreria tecnica.
- Ogni messaggio puo' includere `requestId` per correlare richieste, ack e messaggi di errore.
- Gli ID sono stringhe logiche (`col_001`, `cfg_001`, `chat_001`, `notif_001`).
- I timestamp sono in formato ISO 8601 UTC.
- Il controllo di autorizzazione avviene al momento della connessione e della gestione del singolo evento.

## Struttura logica del messaggio

Messaggio client -> server:

```json
{
  "event": "cad:join-session",
  "requestId": "req_001",
  "data": {}
}
```

Messaggio server -> client:

```json
{
  "event": "cad:operation-applied",
  "requestId": "req_010",
  "data": {}
}
```

## cadService

### `cad:join-session`

Client -> server:

```json
{
  "event": "cad:join-session",
  "requestId": "req_001",
  "data": {
    "sessionId": "col_001"
  }
}
```

Server -> client:

```json
{
  "event": "cad:join-session",
  "requestId": "req_001",
  "data": {
    "sessionId": "col_001",
    "configurationId": "cfg_001",
    "joinedAs": "usr_002",
    "activeUsers": ["usr_001", "usr_002"],
    "status": "ACTIVE",
    "serverVersion": 12
  }
}
```

### `cad:leave-session`

Client -> server:

```json
{
  "event": "cad:leave-session",
  "requestId": "req_002",
  "data": {
    "sessionId": "col_001"
  }
}
```

Server -> client:

```json
{
  "event": "cad:leave-session",
  "requestId": "req_002",
  "data": {
    "sessionId": "col_001",
    "leftUserId": "usr_002",
    "activeUsers": ["usr_001"]
  }
}
```

### `cad:apply-operation`

Client -> server:

```json
{
  "event": "cad:apply-operation",
  "requestId": "req_003",
  "data": {
    "sessionId": "col_001",
    "configurationId": "cfg_001",
    "operation": {
      "type": "ADD_COMPONENT",
      "baseVersion": 12,
      "payload": {
        "productId": "prod_001",
        "componentType": "RIPIANO",
        "gridCell": {
          "x": 0,
          "y": 2,
          "z": 0
        },
        "quantity": 1
      }
    }
  }
}
```

Server -> client:

```json
{
  "event": "cad:apply-operation",
  "requestId": "req_003",
  "data": {
    "accepted": true,
    "operationId": "op_010",
    "appliedVersion": 13
  }
}
```

### `cad:operation-applied`

Server -> client broadcast:

```json
{
  "event": "cad:operation-applied",
  "data": {
    "sessionId": "col_001",
    "configurationId": "cfg_001",
    "operation": {
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
  }
}
```

### `cad:user-joined`

Server -> client broadcast:

```json
{
  "event": "cad:user-joined",
  "data": {
    "sessionId": "col_001",
    "userId": "usr_003",
    "activeUsers": ["usr_001", "usr_002", "usr_003"],
    "joinedAt": "2026-05-24T11:46:00Z"
  }
}
```

### `cad:user-left`

Server -> client broadcast:

```json
{
  "event": "cad:user-left",
  "data": {
    "sessionId": "col_001",
    "userId": "usr_002",
    "activeUsers": ["usr_001", "usr_003"],
    "leftAt": "2026-05-24T11:47:00Z"
  }
}
```

### `cad:resync-request`

Client -> server:

```json
{
  "event": "cad:resync-request",
  "requestId": "req_004",
  "data": {
    "sessionId": "col_001",
    "configurationId": "cfg_001",
    "knownVersion": 10
  }
}
```

### `cad:resync-state`

Server -> client:

```json
{
  "event": "cad:resync-state",
  "requestId": "req_004",
  "data": {
    "sessionId": "col_001",
    "configurationId": "cfg_001",
    "serverVersion": 13,
    "snapshot": {
      "components": [
        {
          "productId": "prod_010",
          "componentType": "PIEDINO",
          "gridCell": {
            "x": 0,
            "y": 0,
            "z": 0
          },
          "quantity": 1
        },
        {
          "productId": "prod_001",
          "componentType": "RIPIANO",
          "gridCell": {
            "x": 0,
            "y": 2,
            "z": 0
          },
          "quantity": 1
        }
      ]
    }
  }
}
```

### `cad:session-closed`

Server -> client broadcast:

```json
{
  "event": "cad:session-closed",
  "data": {
    "sessionId": "col_001",
    "configurationId": "cfg_001",
    "closedBy": "usr_001",
    "reason": "OWNER_CLOSED",
    "closedAt": "2026-05-24T11:50:00Z"
  }
}
```

## notificationService

### `notification:subscribe`

Client -> server:

```json
{
  "event": "notification:subscribe",
  "requestId": "req_101",
  "data": {
    "userId": "usr_001"
  }
}
```

Server -> client:

```json
{
  "event": "notification:subscribe",
  "requestId": "req_101",
  "data": {
    "subscribed": true,
    "userId": "usr_001"
  }
}
```

### `notification:unsubscribe`

Client -> server:

```json
{
  "event": "notification:unsubscribe",
  "requestId": "req_102",
  "data": {
    "userId": "usr_001"
  }
}
```

Server -> client:

```json
{
  "event": "notification:unsubscribe",
  "requestId": "req_102",
  "data": {
    "subscribed": false,
    "userId": "usr_001"
  }
}
```

### `notification:push`

Server -> client:

```json
{
  "event": "notification:push",
  "data": {
    "notification": {
      "id": "notif_001",
      "type": "PRICE_CHANGED",
      "title": "Prezzo aggiornato",
      "message": "Il prezzo del prodotto selezionato e' cambiato.",
      "target": {
        "scope": "PRODUCT",
        "targetId": "prod_001"
      },
      "read": false,
      "createdAt": "2026-05-24T11:55:00Z"
    }
  }
}
```

### `notification:read`

Client -> server:

```json
{
  "event": "notification:read",
  "requestId": "req_103",
  "data": {
    "notificationId": "notif_001"
  }
}
```

Server -> client:

```json
{
  "event": "notification:read",
  "requestId": "req_103",
  "data": {
    "notificationId": "notif_001",
    "read": true,
    "readAt": "2026-05-24T11:56:00Z"
  }
}
```

## chatbotService

### `chatbot:join-session`

Client -> server:

```json
{
  "event": "chatbot:join-session",
  "requestId": "req_201",
  "data": {
    "sessionId": "chat_001"
  }
}
```

Server -> client:

```json
{
  "event": "chatbot:join-session",
  "requestId": "req_201",
  "data": {
    "sessionId": "chat_001",
    "status": "ACTIVE",
    "configurationId": "cfg_001"
  }
}
```

### `chatbot:send-message`

Client -> server:

```json
{
  "event": "chatbot:send-message",
  "requestId": "req_202",
  "data": {
    "sessionId": "chat_001",
    "message": {
      "content": "Quali componenti sono compatibili con TONDO?"
    },
    "context": {
      "configurationId": "cfg_001",
      "systemType": "TONDO"
    }
  }
}
```

Server -> client:

```json
{
  "event": "chatbot:send-message",
  "requestId": "req_202",
  "data": {
    "accepted": true,
    "messageId": "msg_010",
    "createdAt": "2026-05-24T12:00:00Z"
  }
}
```

### `chatbot:response`

Server -> client:

```json
{
  "event": "chatbot:response",
  "data": {
    "sessionId": "chat_001",
    "message": {
      "id": "msg_011",
      "sender": "BOT",
      "content": "Per TONDO puoi usare ripiani, montanti e terminali compatibili con quel sistema.",
      "createdAt": "2026-05-24T12:00:02Z"
    }
  }
}
```

### `chatbot:leave-session`

Client -> server:

```json
{
  "event": "chatbot:leave-session",
  "requestId": "req_203",
  "data": {
    "sessionId": "chat_001"
  }
}
```

Server -> client:

```json
{
  "event": "chatbot:leave-session",
  "requestId": "req_203",
  "data": {
    "sessionId": "chat_001",
    "status": "DETACHED"
  }
}
```
