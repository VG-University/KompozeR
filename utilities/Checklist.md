# KompozeR - Checklist 100% Completion

Obiettivo: completare il progetto in modo verificabile rispetto ai requisiti ASW e DS.

Stato di partenza (gia verificato):
- auth-service, catalog-service e api-gateway funzionanti e testati.
- cart-service avviato (unit + e2e base).
- frontend non implementato.
- cad/chatbot/notification/reporting non implementati.

---

## Fase 0 - Stabilizzazione baseline (P0)

### 0.1 Allineamento architetturale
- [x] Uniformare convenzioni tra servizi (error model, naming route, header identity, logging).
- [x] Verificare che tutte le route protette usino solo header identity iniettati dal gateway.
- [x] Aggiungere health endpoint coerente in ogni servizio (`/health` o prefisso servizio + `/health`).

### 0.2 Hardening CI locale
- [x] Script root per test rapidi dei servizi implementati.
- [x] Script root per e2e selettivi (auth/catalog/cart).
- [x] Report unico di pass/fail (backend + e2e).

DoD Fase 0:
- Tutti i test correnti verdi in sequenza unica.
- Nessun warning bloccante TypeScript nei servizi attivi.

---

## Fase 1 - ASW Core Backend (priorita massima)

### 1.1 Cart service completamento funzionale
- [ ] Integrare cart con catalog per validare SKU/prezzo correnti lato server.
- [ ] Gestire ricalcolo prezzi da catalog al checkout/cart refresh.
- [ ] Eventi minimi cart (item aggiunto/rimosso, carrello svuotato).

### 1.2 CAD service (configuratore backend)
- [ ] Modello configurazione scaffalatura (sessione, celle/moduli, categoria selezionata).
- [ ] Regole compatibilita categoria (no mix TONDO/QUADRO/KUBE).
- [ ] API CRUD configurazione bozza.
- [ ] API finalize configurazione -> output componenti compatibili con carrello.
- [ ] Persistenza Mongo dedicata.

### 1.3 Integrazione CAD -> Cart
- [ ] Endpoint/applicazione use case: genera carrello da configurazione finalizzata.
- [ ] Deduplicazione SKU e quantita aggregate.
- [ ] Test di integrazione tra servizi.

DoD Fase 1:
- Un utente autenticato crea/modifica/finalizza configurazione e ottiene carrello coerente.
- Vincolo compatibilita categorie rispettato server-side con test.

---

## Fase 2 - ASW Funzionalita utente/amministratore

### 2.1 Salvataggio e ripresa configurazioni
- [ ] Endpoint lista configurazioni utente.
- [ ] Endpoint salvataggio bozza.
- [ ] Endpoint riapertura/modifica bozza.
- [ ] Versioning minimo della bozza.

### 2.2 Notifiche realtime (ASW)
- [ ] notification-service con persistenza notifiche per utente.
- [ ] Sottoscrizione eventi catalog (price/availability changed).
- [ ] API read/mark-as-read notifiche.
- [ ] Canale realtime (Socket.io) per push notifiche.

### 2.3 Chatbot contestuale
- [ ] chatbot-service con endpoint domanda/risposta contestuale su prezzi/catalogo.
- [ ] Integrazione realtime nel flusso configuratore.
- [ ] Fallback testuale in assenza websocket.

### 2.4 Reporting amministrativo base
- [ ] reporting-service con metriche minime (componenti piu usati, configurazioni finalizzate, trend ordini simulati).
- [ ] Endpoint report filtrabili per periodo.

DoD Fase 2:
- Utente riceve notifica per variazione prezzo/disponibilita su configurazione salvata.
- Admin consulta almeno un report operativo.

---

## Fase 3 - Frontend ASW completo

### 3.1 Struttura SPA
- [ ] Bootstrap Vue (router, store, services client).
- [ ] Flusso auth/login/guest.
- [ ] Guard di rotta per aree protette.

### 3.2 Pagine core
- [ ] Catalogo con filtri.
- [ ] Configuratore visuale click-based.
- [ ] Carrello con totale aggiornato.
- [ ] Area configurazioni salvate.
- [ ] Centro notifiche.
- [ ] Vista report admin.

### 3.3 UX/NFR ASW
- [ ] Responsive desktop/mobile.
- [ ] Feedback immediato su azioni principali.
- [ ] Accessibilita base (semantica, focus, contrasto).

DoD Fase 3:
- Demo end-to-end completa da UI senza chiamate manuali.

---

## Fase 4 - Test ASW end-to-end estesi

### 4.1 Test integrazione backend
- [ ] e2e CAD create/update/finalize.
- [ ] e2e Cart from CAD.
- [ ] e2e Notifications (evento catalog -> notifica utente).
- [ ] e2e Chatbot Q&A su prezzi.

### 4.2 Test frontend critici
- [ ] Smoke test UI per percorso principale.
- [ ] Test regressione su auth/logout/session.

DoD Fase 4:
- Suite e2e copre tutti i requisiti funzionali ASW principali.

---

## Fase 5 - Estensioni DS (dopo ASW)

### 5.1 Collaborative editing (CAD)
- [ ] Sessioni collaborative multiutente su stessa configurazione.
- [ ] Broadcast incrementale operazioni via WebSocket.
- [ ] Risoluzione conflitti concorrenti (strategia dichiarata e testata).

### 5.2 Causal ordering
- [ ] Metadati evento (es. vector/lamport strategy scelta).
- [ ] Ordinamento causale lato coordinatore.
- [ ] Test con operazioni concorrenti e verifica convergenza stato.

### 5.3 Checkpoint e recovery
- [ ] Snapshot periodico stato sessione collaborativa.
- [ ] Replay eventi post-checkpoint.
- [ ] Test crash/restart con recupero consistente.

### 5.4 Replica persistenza e trade-off C/A
- [ ] Mongo replica set per servizi critici DS.
- [ ] Parametri applicativi espliciti su consistenza/availability dove richiesto.
- [ ] Test failover minimo (primary down -> continuita servizio).

### 5.5 Deployment production-oriented
- [ ] Manifest Kubernetes/Minikube per servizi principali.
- [ ] Guida deploy/restart/rollback base.

DoD Fase 5:
- Scenario collaborativo concorrente dimostrabile e recuperabile da fault.

---

## Fase 6 - Chiusura progetto e relazione

### 6.1 Verifica tracciabilita requisiti
- [ ] Matrice requisito -> servizio -> test.
- [ ] Evidenze (screenshot/log/output test) per ogni requisito critico.

### 6.2 Deliverable finali
- [ ] README operativo aggiornato (setup, run, test, e2e, troubleshooting).
- [ ] Script demo rapida.
- [ ] Sezione limiti noti e lavori futuri.

DoD Fase 6:
- Pacchetto consegna completo e ripetibile su macchina pulita.

---

## Ordine esecutivo consigliato (short path)

- [ ] 1) Chiudere backend ASW core: CAD + integrazione cart.
- [ ] 2) Chiudere notification/chatbot/reporting minimi.
- [ ] 3) Implementare frontend completo sulle API stabilizzate.
- [ ] 4) Estendere e2e su tutto il flusso ASW.
- [ ] 5) Solo dopo, sviluppare blocco DS avanzato (collaborazione/causalita/recovery/replica).

---

## Piano operativo a sprint (ASW -> DS)

Assunzioni:
- Durata sprint: 1 settimana.
- Team: 1 persona.
- Effort espresso in giorni uomo (gg).

### Sprint 1 - Stabilizzazione e hardening base (ASW)

Obiettivo:
- Rendere affidabile la baseline attuale (auth, catalog, cart, gateway) per accelerare i passi successivi.

Backlog sprint:
- [x] Uniformare error model e naming route tra servizi attivi.
- [x] Completare test cart mancanti (edge case validazione input e idempotenza update).
- [x] Script unificati run/test/e2e (backend + e2e selettivi).
- [x] Healthcheck coerenti e verificati in compose dev.

Deliverable:
- Baseline stabile con test verdi in singolo comando.

Stima:
- 3-4 gg.

Exit criteria:
- Tutti i test esistenti verdi senza interventi manuali.

Stato:
- [x] Sprint 1 formalmente chiuso.
- [x] Step 2 NON avviato (nessuna attivita su CAD backend core).

### Sprint 2 - CAD backend core + integrazione cart (ASW)

Obiettivo:
- Implementare il cuore del configuratore server-side e collegarlo al carrello.

Backlog sprint:
- [x] Modello CAD configurazione step-based + persistenza Mongo (`environment`, `category`, `columnPlan`, `columnDesigns`).
- [x] API CAD a comandi di dominio (setup/design/finalize) al posto di CRUD generico bozza.
- [x] Regole compatibilita categoria (no mix TONDO/QUADRO/KUBE) enforce lato backend.
- [x] Vincoli geometrici backend con formula altezza completa: quota ultimo livello + spessore ripiano + terminale.
- [x] Vincolo adiacenza colonne (ripiani adiacenti non alla stessa quota).
- [x] Solver di fattibilita futura (look-ahead) per prevenire dead-end configurativi (Scenario 2).
- [x] Derivazione automatica BOM componenti (ripiani/montanti/piedini/terminali) con deduplica montanti condivisi.
- [x] Finalize configurazione -> BOM consolidata -> integrazione cart per generazione/upsert carrello.
- [x] Allineamento contratti CAD (DB/DTO/Payload) con modello a colonne/livelli.

Deliverable:
- Flusso backend completo e vincolato: setup ambiente/categoria/colonne -> design guidato -> finalize -> cart aggiornato.

Stima:
- 5-6 gg.

Exit criteria:
- Test CAD->Cart verdi con copertura minima su:
	- vincolo adiacenza colonne;
	- vincolo altezza con spessore ripiano;
	- prevenzione dead-end (look-ahead);
	- finalize con BOM coerente e carrello aggiornato.

### Sprint 3 - Notification + Chatbot + Reporting minimo (ASW)

Obiettivo:
- Coprire i moduli applicativi ASW mancanti lato backend.

Backlog sprint:
- [ ] notification-service: persistenza + API list/read + push realtime.
- [ ] Sottoscrizione eventi catalog per price/availability changed.
- [ ] chatbot-service: endpoint Q&A contestuale su catalogo/prezzi.
- [ ] reporting-service: endpoint trend base per admin.

Deliverable:
- Backend ASW completo per requisiti principali utente/admin.

Stima:
- 5-6 gg.

Exit criteria:
- Test e2e backend per notifica e chatbot almeno su scenario base.

### Sprint 4 - Frontend MVP completo (ASW)

Obiettivo:
- Portare online la SPA completa sui flussi core.

Backlog sprint:
- [ ] Bootstrap Vue (router, store, service clients).
- [ ] Pagine: login/guest, catalogo, configuratore, carrello.
- [ ] Pagine: configurazioni salvate, notifiche, report admin.
- [ ] Gestione errori UI e stati loading/empty.

Deliverable:
- Demo end-to-end completa da UI.

Stima:
- 6-7 gg.

Exit criteria:
- Percorso utente principale eseguibile solo da frontend.

### Sprint 5 - Qualita ASW (e2e full + rifinitura NFR)

Obiettivo:
- Chiudere il 100% ASW con evidenze testabili.

Backlog sprint:
- [ ] Suite e2e estesa su tutti i flussi ASW.
- [ ] Responsive + accessibilita base + feedback immediato.
- [ ] Verifica sicurezza endpoint admin/ruoli.
- [ ] Matrice tracciabilita requisito -> test.

Deliverable:
- Chiusura ASW pronta per consegna.

Stima:
- 4-5 gg.

Exit criteria:
- Requisiti ASW coperti da test/evidenze.

### Sprint 6 - DS Collaboration e causalita

Obiettivo:
- Introdurre editing collaborativo concorrente nel CAD.

Backlog sprint:
- [ ] Sessioni collaborative multiutente realtime.
- [ ] Broadcast incrementale operazioni.
- [ ] Strategia causal ordering implementata.
- [ ] Test concorrenza e convergenza stato.

Deliverable:
- Feature DS principale dimostrabile.

Stima:
- 5-6 gg.

Exit criteria:
- Test concorrenti verdi con ordine causale verificato.

### Sprint 7 - DS fault tolerance + delivery finale

Obiettivo:
- Completare resilienza DS e pacchetto finale.

Backlog sprint:
- [ ] Checkpoint/recovery stato collaborativo.
- [ ] Replica Mongo e failover test.
- [ ] Manifest Kubernetes/Minikube.
- [ ] README finale + script demo + evidenze complete.

Deliverable:
- Chiusura DS + consegna finale completa.

Stima:
- 5-6 gg.

Exit criteria:
- Scenario crash/restart e failover dimostrato.

---

## Priorita immediata (prossimi 3 passi)

- [ ] Step 1: chiudere Sprint 1 task tecnici in sospeso (stabilizzazione baseline).
- [ ] Step 2: aprire Sprint 2 con dominio CAD step-based, vincoli backend (spessore ripiano incluso) e solver look-ahead.
- [ ] Step 3: aggiungere e2e CAD iniziali prima di estendere le feature.

