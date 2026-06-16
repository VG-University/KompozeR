# Prompt per generare i mockup della SPA KompozeR

Progetta i mockup di una SPA chiamata KompozeR.

Contesto applicativo:
- KompozeR e una piattaforma per configurare scaffalature, consultare catalogo componenti, gestire carrello e ordini, ricevere notifiche e visualizzare report amministrativi.
- L'applicazione frontend deve essere una SPA con router, layout condiviso e viste collegate tra loro.
- Devono esistere route pubbliche, route protette per utenti autenticati e route riservate ad ADMIN.

Vincoli generali di design:
- Mantieni i mockup minimali e chiari.
- Prevedi un layout condiviso con header, navigazione principale, area contenuto e stato utente.
- Progetta prima il desktop layout.
- Mantieni coerenza visiva tra tutte le viste.
- Le notifiche non devono essere solo una pagina dedicata: prevedi anche un componente realtime globale tipo toast, popup o pannello rapido da header.

Nota importante sulle notifiche:
- E corretto considerare la feature notifiche anche come vista a parte, ma non solo come pagina autonoma.
- La feature deve essere progettata su due superfici UI distinte:
	1. un centro notifiche persistente per consultare storico, stato letto/non letto e dettaglio;
	2. un componente globale realtime che reagisce agli eventi e compare come popup, toast, dropdown o pannello rapido.

Viste da progettare:

1. Vista pubblica di accesso
- Route: `/`
- Scopo: permettere login, registrazione e accesso guest.
- Elementi minimi: login form, registration form, pulsante continua come guest.

2. Vista catalogo
- Route: `/catalog`
- Scopo: mostrare i componenti disponibili.
- Elementi minimi: lista prodotti, barra ricerca o filtri base, azione aggiungi al carrello.

3. Vista carrello
- Route: `/cart`
- Scopo: rivedere gli articoli selezionati e fare checkout.
- Elementi minimi: lista articoli, quantità, totale, pulsante checkout.

4. Vista configuratore CAD
- Route: `/cad`
- Scopo: creare o modificare una configurazione e finalizzarla nel carrello.
- Elementi minimi: scelta ambiente, scelta categoria, area principale di configurazione, pulsante finalize.

5. Vista configurazioni salvate
- Route: `/configurations`
- Scopo: mostrare le configurazioni dell'utente e consentire la riapertura.
- Elementi minimi: lista configurazioni, stato, azione riapri.

6. Centro notifiche persistente
- Route: `/notifications`
- Scopo: mostrare lo storico notifiche utente.
- Elementi minimi: lista notifiche, stato letto/non letto, azione segna come letto.

7. Componente globale notifiche realtime
- Scopo: reagire agli eventi in tempo reale senza cambiare route.
- Elementi minimi: badge o campanella nell'header, popup/toast o pannello rapido, messaggio breve, CTA per aprire il centro notifiche.

8. Vista report admin
- Route: `/admin/reports`
- Scopo: mostrare trend ordini per periodo.
- Elementi minimi: filtro date, grafico oppure tabella trend, riepilogo sintetico.

9. Vista gestione ordini admin
- Route: `/admin/orders`
- Scopo: monitorare ordini e avanzare lo stato a DONE.
- Elementi minimi: lista ordini, dettaglio ordine, azione update stato.

Navigazione attesa:
- Guest/base: accesso, catalogo, carrello, CAD, configurazioni, notifiche.
- Admin: tutte le viste utente piu report admin e gestione ordini.

Output desiderato:
- Un mockup separato per ogni vista.
- Un mockup dedicato anche al componente globale notifiche realtime.
- Stile moderno, ordinato, coerente e adatto a una SPA gestionale/e-commerce tecnica.

---

# Versione 2 - Prompt stilisticamente guidato

Progetta i mockup di una SPA chiamata KompozeR, ispirandoti al linguaggio visivo del sito www.soluzionekompo.com, ma reinterpretandolo in chiave piu digitale, ordinata e adatta a una web app.

Obiettivo stilistico:
- Trasmettere modularita, semplicita, versatilita e design essenziale.
- Far percepire il prodotto come tecnico ma non freddo.
- Unire atmosfera e-commerce/design con chiarezza da applicazione gestionale.

Ispirazione dal brand Kompo:
- tono caldo, domestico, naturale, accessibile;
- forte idea di componibilita e progettazione su misura;
- estetica essenziale, pulita, modulare;
- comunicazione semplice e rassicurante, non aggressiva.

Direzione visiva:
- Evita look enterprise troppo rigido o dashboard troppo fredda.
- Evita anche un look puramente promozionale da landing page marketing.
- La SPA deve sembrare un configuratore/shop moderno con anima editoriale e prodotto protagonista.

Palette consigliata:
- base chiara e luminosa;
- colori neutri caldi: bianco sporco, beige chiaro, sabbia, tortora molto tenue;
- colori di supporto: antracite morbido, grigio caldo, legno/naturale;
- 1 colore accento naturale e distintivo, ad esempio verde salvia, terracotta tenue oppure senape desaturato;
- usa il colore accento per CTA, stati attivi e highlights, senza rendere la UI troppo vivace.

Tipografia:
- Preferisci una combinazione elegante ma leggibile.
- Titoli con personalita, ispirati al mondo design/home decor.
- Testo UI molto chiaro, pulito, leggibile e contemporaneo.
- Evita font troppo tech o troppo corporate.

Densita e layout:
- Densita media: non troppo ariosa come un sito vetrina, non troppo compatta come un gestionale puro.
- Usa griglie pulite, card ben distanziate, blocchi modulari e gerarchia chiara.
- Mantieni forte coerenza tra le viste, con layout condiviso da SPA.

Componenti UI da privilegiare:
- header pulito con logo, navigazione, stato utente e campanella notifiche;
- sidebar leggera oppure top navigation, in base a quale soluzione mantiene piu coerenza;
- card prodotto/modulo configurazione;
- filtri semplici e leggibili;
- tabelle leggere per ordini/report, non pesanti;
- modali, drawer o pannelli laterali per azioni secondarie;
- toast/popup discreti per notifiche realtime.

Indicazioni specifiche per le notifiche:
- Progetta le notifiche su due superfici distinte:
	1. centro notifiche persistente;
	2. componente globale realtime da header.
- Il componente realtime deve essere visibile ma non invasivo.
- Deve sembrare parte naturale della SPA, non un elemento appiccicato sopra.

Indicazioni specifiche per il CAD:
- Il configuratore deve essere la vista piu caratterizzante del prodotto.
- Deve trasmettere costruzione modulare, chiarezza e controllo.
- Mantieni l'interfaccia visuale semplice, guidata e leggibile, senza sovraccaricare la schermata.

Indicazioni specifiche per report e ordini admin:
- Le viste admin devono restare coerenti col resto del brand.
- Devono essere piu strutturate e leggibili, ma non distaccarsi visivamente dall'esperienza utente.
- Grafici e tabelle devono essere puliti, sobri, leggibili e non troppo "business enterprise".

Viste da produrre:
1. accesso pubblico;
2. catalogo;
3. carrello;
4. configuratore CAD;
5. configurazioni salvate;
6. centro notifiche;
7. componente notifiche realtime;
8. report admin;
9. gestione ordini admin.

Output atteso:
- Mockup desktop coerenti tra loro.
- Ogni vista deve sembrare parte della stessa SPA.
- Il risultato deve richiamare l'identita Kompo senza copiare il sito marketing, ma traducendola in un prodotto digitale piu funzionale e interattivo.

Parole chiave estetiche finali:
- modulare
- caldo
- essenziale
- naturale
- tecnico

Da evitare:
- look enterprise freddo e generico;
- dashboard troppo densa o troppo scura;
- estetica e-commerce aggressiva;
- componenti troppo decorativi che riducono leggibilita e chiarezza.