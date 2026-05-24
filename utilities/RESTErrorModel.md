# REST Error Model

Questo file definisce il modello di errore REST condiviso tra i microservizi esposti tramite API Gateway.

Obiettivi:

- uniformare la forma degli errori restituiti al frontend;
- distinguere gli errori funzionali da quelli tecnici;
- semplificare logging, debugging e gestione client-side.

## Principi

- Tutti gli errori REST devono avere una struttura JSON coerente.
- Il gateway puo' propagare l'errore del servizio oppure rimapparlo senza perdere `code`, `message` e `traceId`.
- `message` e' leggibile lato client; `details` serve per campi o contesto aggiuntivo.
- `traceId` serve per correlare frontend, gateway e microservizio nei log.
- Il body di errore non deve esporre stack trace o dettagli sensibili.

## Struttura standard

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload is invalid",
    "details": [
      {
        "field": "email",
        "reason": "must be a valid email"
      }
    ],
    "traceId": "trc_001",
    "timestamp": "2026-05-24T12:10:00Z"
  }
}
```

## Campi

- `code`: identificatore stabile dell'errore, usato da frontend e logica client.
- `message`: descrizione sintetica e leggibile del problema.
- `details`: lista opzionale di dettagli strutturati.
- `traceId`: identificatore di correlazione generato dal gateway o propagato dal servizio.
- `timestamp`: istante di emissione dell'errore.

## Mappatura status code

| HTTP Status | Code suggeriti | Significato |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR`, `INVALID_REQUEST` | Payload o parametri non validi. |
| `401` | `UNAUTHENTICATED`, `INVALID_TOKEN` | Token assente, scaduto o non valido. |
| `403` | `FORBIDDEN`, `GUEST_NOT_ALLOWED` | Utente autenticato ma non autorizzato. |
| `404` | `RESOURCE_NOT_FOUND` | Risorsa inesistente o non accessibile. |
| `409` | `RESOURCE_CONFLICT`, `VERSION_CONFLICT`, `SESSION_ALREADY_ACTIVE` | Stato corrente incompatibile con la richiesta. |
| `422` | `BUSINESS_RULE_VIOLATION` | Richiesta formalmente valida ma non ammessa dal dominio. |
| `429` | `RATE_LIMITED` | Troppe richieste in un intervallo limitato. |
| `500` | `INTERNAL_ERROR` | Errore interno inatteso. |
| `503` | `SERVICE_UNAVAILABLE` | Servizio temporaneamente indisponibile. |

## Errori tipici per categoria

### Validazione

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload is invalid",
    "details": [
      {
        "field": "password",
        "reason": "must contain at least 8 characters"
      },
      {
        "field": "email",
        "reason": "must be a valid email"
      }
    ],
    "traceId": "trc_002",
    "timestamp": "2026-05-24T12:11:00Z"
  }
}
```

### Autenticazione

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is missing or invalid",
    "traceId": "trc_003",
    "timestamp": "2026-05-24T12:12:00Z"
  }
}
```

### Autorizzazione

```json
{
  "error": {
    "code": "GUEST_NOT_ALLOWED",
    "message": "Guest users cannot access collaborative sessions",
    "traceId": "trc_004",
    "timestamp": "2026-05-24T12:13:00Z"
  }
}
```

### Risorsa non trovata

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Configuration not found",
    "details": [
      {
        "resource": "Configuration",
        "id": "cfg_999"
      }
    ],
    "traceId": "trc_005",
    "timestamp": "2026-05-24T12:14:00Z"
  }
}
```

### Conflitto di stato

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "The operation is based on an outdated configuration version",
    "details": [
      {
        "expectedVersion": 13,
        "providedVersion": 10
      }
    ],
    "traceId": "trc_006",
    "timestamp": "2026-05-24T12:15:00Z"
  }
}
```

### Violazione di business rule

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "The configuration cannot be finalized because it is incomplete",
    "details": [
      {
        "rule": "CONFIGURATION_MUST_HAVE_REQUIRED_COMPONENTS"
      }
    ],
    "traceId": "trc_007",
    "timestamp": "2026-05-24T12:16:00Z"
  }
}
```

### Errore tecnico interno

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "traceId": "trc_008",
    "timestamp": "2026-05-24T12:17:00Z"
  }
}
```

## Linee guida per servizio

- `authenticationService`: usare `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `SESSION_REVOKED` dove necessario.
- `catalogService`: usare `RESOURCE_NOT_FOUND`, `BUSINESS_RULE_VIOLATION` per prodotti non modificabili o non attivi.
- `cadService`: usare spesso `VERSION_CONFLICT`, `SESSION_ALREADY_ACTIVE`, `BUSINESS_RULE_VIOLATION`.
- `cartService`: usare `RESOURCE_NOT_FOUND`, `BUSINESS_RULE_VIOLATION` per carrello vuoto o configurazione non finalizzata.
- `notificationService`: usare `RESOURCE_NOT_FOUND` o `FORBIDDEN` per accesso a notifiche o sottoscrizioni non proprie.
- `chatbotService`: usare `RESOURCE_NOT_FOUND` per sessioni inesistenti o chiuse.
- `reportingService`: usare `FORBIDDEN` e `INVALID_REQUEST` per richieste fuori policy o range temporali non ammessi.

## Nota sul gateway

Il gateway dovrebbe:

- aggiungere o propagare `traceId`;
- mantenere lo status HTTP corretto;
- evitare di mascherare errori funzionali in `500` generici;
- uniformare la forma finale del body di errore anche se i servizi interni evolvono.
