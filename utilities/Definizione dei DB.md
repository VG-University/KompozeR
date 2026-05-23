# Definizione dei DB

Questo file raccoglie la struttura logica dei database MongoDB per ciascun microservizio.

Obiettivi della definizione:

- chiarire quale servizio possiede quali dati;
- definire le collection principali;
- fissare la forma dei documenti JSON prima dell'implementazione;
- evitare duplicazioni o scritture cross-service.

## Regole generali

- Ogni microservizio possiede il proprio database.
- I riferimenti tra microservizi avvengono solo tramite ID o snapshot minimi.
- `apiGateway` non possiede un database.
- I dati di prezzo e disponibilita' appartengono sempre al `Catalog`.
- `CAD` salva configurazioni e sessioni; `Cart` salva snapshot commerciali dei prodotti aggiunti.
- In questa fase si definisce una struttura semplice ma gia' compatibile con l'estensione futura del progetto DS.

## Mappa DB

| Microservizio | Database | Collection principali |
|---|---|---|
| `authenticationService` | `authdb` | `users`, `sessions` |
| `cadService` | `caddb` | `configurations`, `collaborativeSessions`, `editOperations`, `projectSnapshots` |
| `cartService` | `cartdb` | `carts`, `orderRequests` |
| `catalogService` | `catalogdb` | `products` |
| `chatbotService` | `chatdb` | `chatSessions`, `chatMessages` |
| `notificationService` | `notificationdb` | `notificationSubscriptions`, `notificationEvents`, `deliveredNotifications` |
| `reportingService` | `reportingdb` | `generatedReports`, `salesSnapshots` |

## Authentication Service

### Collezione `users`

Owner dell'entita' globale `User`.

```json
{
	"_id": "usr_001",
	"username": "valerio",
	"passwordHash": "$2b$10$exampleHash",
	"email": "valerio@example.com",
	"role": "BASE",
	"isActive": true,
	"createdAt": "2026-05-23T10:00:00Z",
	"updatedAt": "2026-05-23T10:00:00Z"
}
```

Campi chiave:

- `_id`: identificatore logico dell'utente
- `role`: `GUEST`, `BASE`, `ADMIN`

### Collezione `sessions`

Concetto locale del servizio, usato per login/sessioni attive.

```json
{
	"_id": "ses_001",
	"userId": "usr_001",
	"tokenId": "tok_001",
	"loggedIn": "2026-05-23T10:05:00Z",
	"expiresAt": "2026-05-23T18:05:00Z",
	"loggedOut": null,
	"isRevoked": false
}
```

Campi chiave:

- `tokenId`: identificatore del token associato alla sessione, utile per futura revoca puntuale o tracciamento
- `loggedIn`: istante di apertura della sessione
- `expiresAt`: scadenza tecnica della sessione o del token associato
- `loggedOut`: valorizzato solo quando l'utente chiude esplicitamente la sessione
- `isRevoked`: previsto per future estensioni di sicurezza, senza richiedere implementazione immediata

## Catalog Service

### Collezione `products`

Owner dell'entita' globale `Product`.

```json
{
	"_id": "prod_001",
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
	"isActive": true,
	"createdAt": "2026-05-23T10:00:00Z",
	"updatedAt": "2026-05-23T10:00:00Z"
}
```

Campi chiave:

- `systemType`: `TONDO`, `QUADRO`, `KUBE`
- `componentType`: `PIEDINO`, `TERMINALE`, `MONTANTE`, `RIPIANO`, `MENSOLA`
- `availability`: booleano coerente con il dominio attuale di KOMPO
- `soldAsPair`: booleano che identifica che `PIEDINO`, `TERMINALE`, `MONTANTE` viaggiano a coppie.

## CAD Service

### Collezione `configurations`

Owner dell'entita' globale `Configuration`.

```json
{
	"_id": "cfg_001",
	"ownerId": "usr_001",
	"systemType": "TONDO",
	"name": "Scaffale soggiorno",
	"status": "DRAFT",
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
				"y": 1,
				"z": 0
			},
			"quantity": 1
		}
	],
	"totalPriceSnapshot": {
		"amount": 129.7,
		"currency": "EUR"
	},
	"createdAt": "2026-05-23T10:00:00Z",
	"updatedAt": "2026-05-23T10:10:00Z"
}
```

Note:

- `components` contiene riferimenti a `Product` e posizione logica nella griglia.
- `totalPriceSnapshot` e' uno snapshot, non la verita' ufficiale del catalogo. Si aggiorna quando si riapre il progetto che viene ricalcolato.
- una configurazione puo' avere piu' sessioni collaborative nel tempo, ma al massimo una attiva in un dato momento.

### Collezione `collaborativeSessions`

Concetto locale del CAD per supportare il lavoro collaborativo.

```json
{
	"_id": "col_001",
	"configurationId": "cfg_001",
	"ownerId": "usr_001",
	"participants": ["usr_001", "usr_002", "usr_003"],
	"activeUsers": ["usr_001", "usr_002"],
	"status": "ACTIVE",
	"createdAt": "2026-05-23T10:15:00Z",
	"updatedAt": "2026-05-23T10:20:00Z",
	"endedAt": null
}
```

Campi chiave:

- `configurationId`: riferimento alla configurazione condivisa
- `ownerId`: proprietario del progetto che abilita o termina la collaborazione
- `participants`: utenti autorizzati a partecipare alla sessione
- `activeUsers`: utenti effettivamente connessi in quel momento
- `status`: lifecycle della sessione, ad esempio `PENDING`, `ACTIVE`, `CLOSED`
- `endedAt`: valorizzato alla chiusura della sessione

Lifecycle della sessione:

- nasce quando il proprietario abilita la collaborazione o condivide il progetto;
- diventa `ACTIVE` quando almeno un partecipante entra;
- si chiude quando il proprietario la termina oppure quando tutti escono e viene marcata conclusa.

### Collezione `editOperations`

Pensata per essere compatibile con l'estensione DS.

```json
{
	"_id": "op_001",
	"configurationId": "cfg_001",
	"authorId": "usr_001",
	"type": "ADD_COMPONENT",
	"baseVersion": 2,
	"payload": {
		"productId": "prod_001",
		"componentType": "RIPIANO",
		"gridCell": {
			"x": 0,
			"y": 1,
			"z": 0
		}
	},
	"createdAt": "2026-05-23T10:16:00Z"
}
```

Note:

- le operazioni restano riferite solo a `configurationId`, mantenendo il modello semplice;
- `baseVersion` serve a mantenere un minimo di compatibilita' con il futuro ordinamento e recupero delle modifiche;
- `authorId` identifica chi ha prodotto l'operazione.

### Collezione `projectSnapshots`

Salva snapshot periodici per recupero e versionamento leggero.

```json
{
	"_id": "snap_001",
	"configurationId": "cfg_001",
	"version": 3,
	"state": {
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
		]
	},
	"createdAt": "2026-05-23T10:17:00Z"
}
```

Note:

- ogni snapshot rappresenta uno stato consistente della configurazione;
- gli snapshot servono per recupero dopo crash e per evitare di ricostruire sempre l'intera configurazione da tutte le operazioni;
- il pairing `projectSnapshots` + `editOperations` rende il CAD gia' compatibile con i requisiti DS, pur mantenendo un modello semplice.

## Cart Service

### Collezione `carts`

Owner dell'entita' globale `Cart`.

```json
{
	"_id": "cart_001",
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
		},
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
		"amount": 129.7,
		"currency": "EUR"
	},
	"createdAt": "2026-05-23T10:20:00Z",
	"updatedAt": "2026-05-23T10:22:00Z"
}
```

### Collezione `orderRequests`

Rappresenta l'invio di una richiesta d'ordine, coerente con l'evento `OrderRequestSubmitted`.

```json
{
	"_id": "ordreq_001",
	"cartId": "cart_001",
	"ownerId": "usr_001",
	"contactEmail": "valerio@example.com",
	"status": "SUBMITTED",
	"submittedAt": "2026-05-23T10:30:00Z"
}
```

## Chatbot Service

### Collezione `chatSessions`

```json
{
	"_id": "chat_001",
	"userId": "usr_001",
	"configurationId": "cfg_001",
	"startedAt": "2026-05-23T10:40:00Z",
	"endedAt": null,
	"isActive": true
}
```

### Collezione `chatMessages`

```json
{
	"_id": "msg_001",
	"sessionId": "chat_001",
	"author": "USER",
	"text": "Questo ripiano e' disponibile?",
	"createdAt": "2026-05-23T10:41:00Z"
}
```

## Notification Service

### Collezione `notificationSubscriptions`

```json
{
	"_id": "sub_001",
	"userId": "usr_001",
	"configurationId": "cfg_001",
	"trackedProductIds": ["prod_001", "prod_010"],
	"channel": "IN_APP",
	"isActive": true,
	"createdAt": "2026-05-23T10:45:00Z"
}
```

### Collezione `notificationEvents`

```json
{
	"_id": "nevt_001",
	"productId": "prod_001",
	"eventType": "AVAILABILITY_CHANGED",
	"payload": {
		"availability": false
	},
	"createdAt": "2026-05-23T10:46:00Z"
}
```

### Collezione `deliveredNotifications`

```json
{
	"_id": "notif_001",
	"subscriptionId": "sub_001",
	"userId": "usr_001",
	"message": "Uno dei prodotti della tua configurazione non e' piu' disponibile.",
	"deliveredAt": "2026-05-23T10:47:00Z",
	"readAt": null
}
```

## Reporting Service

### Collezione `generatedReports`

```json
{
	"_id": "rep_001",
	"type": "SALES_SUMMARY",
	"timeRange": {
		"from": "2026-05-01T00:00:00Z",
		"to": "2026-05-31T23:59:59Z"
	},
	"generatedAt": "2026-05-23T11:00:00Z",
	"location": "/reports/rep_001.json"
}
```

### Collezione `salesSnapshots`

```json
{
	"_id": "sales_001",
	"date": "2026-05-23",
	"ordersCount": 7,
	"revenue": {
		"amount": 899.5,
		"currency": "EUR"
	},
	"topSystemType": "TONDO"
}
```

## Note finali

- I documenti mostrati sono il formato logico iniziale, non ancora lo schema tecnico definitivo di Mongoose.
- Alcuni campi potranno essere raffinati in implementazione, ma i confini di ownership non dovrebbero cambiare.
- La catena principale resta: `User -> Configuration -> Cart -> OrderRequest`.
- `Product` resta il riferimento condiviso, ma l'unica fonte di verita' per prezzo e disponibilita' e' il `Catalog`.
