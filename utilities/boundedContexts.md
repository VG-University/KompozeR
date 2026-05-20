# Domain Model

Definiamo il modello del sistema descrivento i bounded context, le relazioni che li legano, entità ed aggregati. 

## Bounded contexts 

1. Authentication (support)

	Responsabilità: gestisce identità, autenticazione e autorizzazione degli utenti del sistema. Crea account guest e account registrati, emette le credenziali di accesso e determina il ruolo dell'utente nelle varie sezioni applicative.

	Possiede: utenti, credenziali, ruoli, stato dell'account, sessioni di login o token.

	Non possiede: configurazioni CAD, carrelli, catalogo prodotti, notifiche, ordini, report.

	Note: si assume che uno o più account amministratore vengano creati dallo sviluppatore ed inseriti direttamente nel DB. L'accesso come guest resta possibile, ma non abilita salvataggio configurazioni, collaborazione, notifiche o altre funzionalità che richiedono identità persistente. Per completare un ordine da guest occorre comunque fornire una mail di contatto.

2. CAD (core)

	Responsabilità: gestisce la progettazione dello scaffale e traduce le azioni dell'utente sul configuratore in una configurazione valida dal punto di vista strutturale e commerciale. Coordina inoltre la progettazione collaborativa della stessa configurazione da parte di più utenti.

	Possiede: progetti/configurazioni, sessioni collaborative, snapshot dello stato, operazioni di modifica, regole di composizione del mobile.

	Non possiede: anagrafica utenti, prezzi ufficiali dei prodotti, disponibilità di magazzino, stato del carrello, ordini finali.

	Note: il CAD non è il catalogo. Può conoscere i componenti validi e i loro metadati minimi, ma prezzi e disponibilità restano sotto la responsabilità del Catalog. Il CAD produce una distinta dei pezzi necessari e la struttura del progetto.

3. Cart (core)

	Responsabilità: gestisce il carrello dell'utente, raccoglie gli articoli derivati da una configurazione completata e avvia il processo di ordine.

	Possiede: carrelli, righe carrello, riepiloghi economici, stato dell'ordine inviato o in preparazione.

	Non possiede: regole geometriche del configuratore, catalogo ufficiale, credenziali utente, logica di notifica, statistiche aggregate.

	Note: inizialmente l'ordine viene finalizzato via mail. In una fase successiva il servizio potrà integrarsi con il carrello esistente dell'e-commerce Kompo.

4. Catalog (support)

	Responsabilità: gestisce il catalogo dei componenti disponibili, con prezzi, disponibilità, attributi dimensionali e metadati utili al configuratore.

	Possiede: componenti/prodotti, categorie, prezzi correnti, disponibilità, attributi tecnici, eventuale storico delle modifiche di prezzo o stock.

	Non possiede: progetti utente, carrelli, identità, sessioni collaborative, report.

	Note: l'utente finale non interagisce direttamente con una pagina catalogo dedicata; il catalogo è usato indirettamente da CAD, Cart e Chatbot. L'amministratore può aggiungere nuovi pezzi e modificare prezzo o disponibilità.

5. Chatbot (core)

	Responsabilità: fornisce assistenza contestuale all'utente durante la progettazione, rispondendo a dubbi su prezzi, dimensioni, compatibilità e composizione del progetto corrente.

	Possiede: sessioni di chat, cronologia minima dei messaggi, contesto conversazionale necessario a rispondere.

	Non possiede: verità ufficiale sul catalogo, stato persistente del progetto, carrello, notifiche, identità utente complete.

	Note: il Chatbot interroga altri bounded context per ottenere informazioni aggiornate, ma non ne diventa owner.

6. Notification (core)

	Responsabilità: avvisa l'utente quando una configurazione salvata o un insieme di pezzi monitorati subisce variazioni rilevanti, ad esempio indisponibilità o cambio di prezzo.

	Possiede: sottoscrizioni, preferenze di notifica, eventi notificabili consegnati o pendenti.

	Non possiede: catalogo, configurazioni complete, carrelli, autenticazione, report.

	Note: il servizio reagisce a cambiamenti provenienti soprattutto dal Catalog e li collega agli utenti o alle configurazioni interessate.

7. Reporting (support)

	Responsabilità: raccoglie dati sugli ordini e sulle configurazioni finalizzate per produrre statistiche, grafici e report.

	Possiede: report generati, viste aggregate, snapshot statistici e metriche storiche.

	Non possiede: ordini operativi, catalogo corrente, sessioni CAD attive, credenziali utente.

	Note: è un bounded context di lettura e aggregazione. Non deve diventare il punto di verità del dominio transazionale.

## Context Map
Descrizione delle relazioni tra i Bounded Context.

- Authentication -> Frontend: fornisce login, logout e verifica dell'identità sia per utenti guest sia per utenti registrati. Il frontend usa questo bounded context per ottenere il token o lo stato di sessione.

- Authentication -> Admin features: fornisce autorizzazione e controllo dei ruoli per consentire all'amministratore di gestire catalogo, disponibilità, prezzi e future funzionalità di reportistica.

- CAD -> Catalog: dipende dal Catalog per conoscere i componenti validi, i vincoli dimensionali di base, i prezzi correnti e la disponibilità dei pezzi selezionati. Il CAD non scrive mai nel Catalog.

- CAD -> Authentication: usa l'identità utente per decidere se una configurazione può essere salvata, condivisa o modificata in collaborazione. Gli utenti guest possono usare il configuratore con capacità ridotte.

- CAD -> Cart: pubblica o espone la distinta finale dei componenti necessari a costruire la configurazione. Il Cart trasforma questa distinta in righe carrello.

- Cart -> Catalog: consulta prezzi e disponibilità prima di confermare il contenuto del carrello o l'invio dell'ordine. Il Cart non possiede il prezzo ufficiale dei prodotti.

- Notification -> Catalog: reagisce ai cambiamenti di prezzo e disponibilità dei componenti pubblicati dal Catalog.

- Notification -> CAD: usa i riferimenti alle configurazioni salvate per determinare quali utenti devono essere notificati quando un componente usato nel progetto cambia stato.

- Chatbot -> Catalog: recupera informazioni aggiornate su prezzi, misure e attributi dei componenti.

- Chatbot -> CAD: riceve il contesto della configurazione attiva per dare risposte pertinenti rispetto al progetto che l'utente sta costruendo.

- Reporting -> Cart: raccoglie dati sugli ordini inviati e sui carrelli finalizzati per generare statistiche di vendita.

- Reporting -> CAD: può ricevere informazioni sulle configurazioni concluse per analizzare tipologie di scaffali progettati o componenti più utilizzati.

- Frontend -> API Gateway: il frontend non dialoga direttamente con tutti i bounded context ma usa un entry point unico che instrada le richieste verso i servizi competenti.

In termini di classificazione strategica:

- CAD e Cart sono i bounded context centrali del flusso di valore dell'applicazione.
- Authentication, Catalog e Reporting sono bounded context di supporto.
- Chatbot e Notification sono bounded context trasversali, dipendenti da informazioni prodotte da altri contesti ma con una responsabilità funzionale autonoma.

## Entità e value objects

Per semplificare il modello iniziale, si distinguono:

- entita' globali del dominio, comuni al flusso principale dell'applicazione;
- concetti locali di servizio, che restano importanti ma non vengono trattati subito come entita' globali.

### Entita' globali minime

| Entita' | Descrizione | Aggregate Root | Bounded Context owner | Bounded Context che la referenziano |
|---|---|---|---|---|
| `User` | Rappresenta l'identita' dell'utente del sistema, guest o registrato, con ruolo associato. | `User` | Authentication | CAD, Cart, Notification, Reporting |
| `Product` | Rappresenta il pezzo vendibile concreto del catalogo. | `Product` | Catalog | CAD, Cart, Chatbot, Notification, Reporting |
| `Configuration` | Rappresenta un progetto di scaffale creato dall'utente nel configuratore. | `Configuration` | CAD | Cart, Notification, Reporting, Chatbot |
| `Cart` | Rappresenta la selezione acquistabile dell'utente, costruita a partire da una configurazione o manualmente. | `Cart` | Cart | Reporting |

### Struttura concettuale delle entita' globali

#### `User`

- Campi minimi: `id`, `username`, `passwordHash`, `role`
- Value Object associati: `UserId`, `Email` opzionale, `PasswordHash`, `Role`
- Note: e' l'unica entita' globale pienamente owner del contesto Authentication.

#### `Product`

- Campi minimi: `id`, `systemType`, `componentType`, `name`, `description`, `dimensions`, `material`, `finish`, `price`, `stockQuantity`, `isActive`
- Value Object associati: `ProductId`, `SystemType`, `ComponentType`, `Dimensions`, `Money`, `StockQuantity`
- Note: `Product` e' un'entita' unica. `Tondo`, `Quadro` e `Kube` non vengono modellati come aggregati separati, ma come varianti del value object `SystemType`.

#### `Configuration`

- Campi minimi: `id`, `ownerId`, `systemType`, `name`, `status`, `components`, `totalPriceSnapshot`, `createdAt`, `updatedAt`
- Value Object associati: `ConfigurationId`, `SystemType`, `ConfigurationStatus`, `PlacedComponent`, `GridCell`, `Money`
- Note: una `Configuration` appartiene sempre a uno specifico `SystemType`; le differenze tra Tondo, Quadro e Kube vivono nelle regole CAD e non in tre entita' distinte.

#### `Cart`

- Campi minimi: `id`, `ownerId`, `items`, `status`, `totalPriceSnapshot`, `createdAt`, `updatedAt`
- Value Object associati: `CartId`, `CartItem`, `CartStatus`, `Money`, `Quantity`
- Note: gli item del carrello contengono snapshot dei dati commerciali minimi del prodotto al momento dell'aggiunta.

### Value object globali principali

| Value Object | Significato |
|---|---|
| `UserId` | Identificatore logico di un utente |
| `Role` | Ruolo dell'utente, ad esempio `GUEST`, `USER`, `ADMIN` |
| `ProductId` | Identificatore logico di un prodotto |
| `SystemType` | Famiglia/configurazione del sistema: `TONDO`, `QUADRO`, `KUBE` |
| `ComponentType` | Tipo di pezzo: `PIEDINO`, `TERMINALE`, `MONTANTE`, `RIPIANO`, `MENSOLA` |
| `Dimensions` | Misure rilevanti di un prodotto o componente |
| `Money` | Valore monetario usato per prezzi e snapshot economici |
| `StockQuantity` | Quantita' disponibile a magazzino |
| `ConfigurationStatus` | Stato di una configurazione, ad esempio `DRAFT`, `SAVED`, `FINALIZED` |
| `PlacedComponent` | Riferimento a un prodotto posizionato dentro una configurazione |
| `GridCell` | Posizione logica del componente nella griglia CAD |
| `CartStatus` | Stato del carrello, ad esempio `ACTIVE`, `ORDERED`, `ABANDONED` |
| `CartItem` | Riga di carrello con prodotto, quantita' e snapshot di prezzo |

### Concetti locali di servizio non trattati come entita' globali

Questi concetti restano rilevanti, ma vengono trattati come specializzazioni locali dei bounded context e non come parte del nucleo globale minimo:

- Authentication: `AccountSession`
- CAD: `CollaborativeSession`, `EditOperation`, `ProjectSnapshot`
- Chatbot: `ChatSession`, `ChatMessage`
- Notification: `NotificationSubscription`, `NotificationEvent`, `DeliveredNotification`
- Reporting: `GeneratedReport`, `SalesSnapshot`

Questa scelta mantiene il modello iniziale semplice e concentra il nucleo del dominio sul flusso principale:

`User -> Configuration -> Cart`

con `Product` come riferimento centrale condiviso tra CAD, Catalog e Cart.

## Eventi di dominio

### Authentication

- `GuestSessionStarted`
- `UserRegistered`
- `UserLoggedIn`
- `UserLoggedOut`
- `UserRoleAssigned`

### CAD

- `ConfigurationCreated`
- `ComponentPlaced`
- `ComponentRemoved`
- `ConfigurationSaved`
- `ConfigurationShared`
- `CollaborativeSessionStarted`
- `CollaborativeEditApplied`
- `ConfigurationFinalized`

### Cart

- `CartCreated`
- `ItemAddedToCart`
- `ItemRemovedFromCart`
- `CartUpdatedFromConfiguration`
- `OrderSubmitted`
- `OrderConfirmationRequested`

### Catalog

- `ProductCreated`
- `ProductUpdated`
- `PriceChanged`
- `StockChanged`
- `ProductDisabled`

### Chatbot

- `ChatSessionOpened`
- `UserQuestionReceived`
- `ChatbotResponseGenerated`

### Notification

- `NotificationSubscriptionCreated`
- `TrackedProductChanged`
- `NotificationQueued`
- `NotificationDelivered`

### Reporting

- `ReportGenerationRequested`
- `ReportGenerated`
- `SalesMetricsUpdated`

## Note di modellazione

- Ogni bounded context possiede i propri dati e pubblica verso gli altri solo API o eventi, mai accesso diretto al DB.
- I riferimenti tra bounded context devono essere fatti per ID o riferimenti esterni, non tramite condivisione di entita'.
- I dati di prezzo e disponibilita' sono sempre di proprieta' del Catalog, anche se copiati temporaneamente in CAD o Cart come snapshot.
- Il CAD e' il contesto piu' sensibile all'estensione Distributed Systems: sessioni collaborative, operazioni e snapshot vanno modellati da subito come concetti distinti.