Di seguito trovi una **descrizione strutturata (HOW TO)** pensata come *input per un agente AI* che deve ricreare il sistema Kompo in un simulatore digitale (configuratore, CAD, generatore 3D, ecc.). È sintetica ma completa, basata sulla logica reale del sistema.

***

# 🧠 HOW TO – Progettazione di una “Kompo” (Sistema modulare)

## 1. Definizione del sistema (model abstraction)

**Kompo è un sistema modulare discreto** composto da elementi standard combinabili:

* **Montanti verticali** → elementi strutturali portanti (diverse altezze)
* **Ripiani orizzontali** → piani di appoggio (diverse lunghezze/profondità)
* **Terminali / piedini / fissaggi** → elementi di chiusura o stabilizzazione
* **Accessori opzionali** → elementi aggiuntivi (parete, rinforzi, ecc.)

👉 Il sistema è:

* modulare
* componibile manualmente senza attrezzi [\[soluzionekompo.com\]](https://www.soluzionekompo.com/)
* basato su **incrementi dimensionali discreti (es. step \~10 cm)** [\[soluzionekompo.com\]](https://www.soluzionekompo.com/)
* progettato per configurazioni adattabili a qualsiasi spazio [\[soluzionekompo.com\]](https://www.soluzionekompo.com/)

***

## 2. Parametri di input per l’AI

L’agente deve partire da questi input:

### 📐 Spazio

* larghezza disponibile (W)
* altezza disponibile (H)
* profondità disponibile (D)

### 🎯 Funzione d’uso

* storage (libreria, dispensa, garage)
* display (negozio)
* arredo leggero (comodino, tavolino, mensola)

### ⚖️ Vincoli

* peso stimato
* stabilità richiesta
* eventuale fissaggio a parete

### 🎨 Estetica

* tipologia (Kube → cubico, Quadro → ortogonale, Tondo → bordi arrotondati) [\[soluzionekompo.com\]](https://www.soluzionekompo.com/)

***

## 3. Logica generativa (core design rules)

### 3.1 Griglia modulare

* Lo spazio viene discretizzato in una **griglia tridimensionale**
* Dimensione cella = unità minima (≈ modulo Kompo)
* Tutti gli elementi devono allinearsi alla griglia

***

### 3.2 Regole di composizione

#### Regola 1 — Verticalità (montanti)

* Ogni struttura è definita da colonne verticali
* I montanti:
  * si sommano in altezza
  * definiscono i livelli disponibili

👉 Vincolo:

```
numero_livelli = somma_altezze_montanti / unità_base
```

***

#### Regola 2 — Orizzontalità (ripiani)

* I ripiani collegano almeno **due montanti**
* Devono avere:
  * lunghezza compatibile con interasse montanti
  * profondità coerente con uso

👉 Vincolo:

```
lunghezza_ripiano ∈ set_standard
e deve combaciare con distanza tra montanti
```

***

#### Regola 3 — Stabilità

Una configurazione è valida se:

* ogni ripiano è supportato da almeno 2 montanti
* la struttura ha:
  * base sufficientemente larga **oppure**
  * fissaggio a parete

👉 euristica:

```
altezza / base_width < soglia_stabilità
```

***

#### Regola 4 — Continuità strutturale

* I montanti devono essere connessi continui
* Non sono ammessi:
  * “floating shelves” senza supporto
  * interruzioni non collegate

***

#### Regola 5 — Modularità incrementale

* La configurazione deve poter essere:
  * espansa
  * modificata

👉 quindi:

* evitare blocchi “chiusi”
* privilegiare strutture aperte e riconfigurabili [\[SCAFFALE P...zionekompo\]](http://2018.premiocambiamenti.it/wp-content/uploads/2017/09/Catalogo_KOMPO_KOMPOKUBE_-1.pdf)

***

## 4. Workflow di progettazione (pipeline AI)

### STEP 1 — Analisi spazio

```pseudo
grid = discretizza(spazio, unità_modulare)
```

***

### STEP 2 — Scelta schema base

Template iniziali:

* LINEARE → scaffale a parete
* TORRE → colonna verticale
* MATRICE → libreria a griglia
* L-SHAPE → angolare
* ISOLA → bifacciale

***

### STEP 3 — Posizionamento montanti

```pseudo
for x in larghezza:
    posiziona montanti a distanza standard
```

***

### STEP 4 — Inserimento livelli

```pseudo
for livello in livelli:
    aggiungi ripiani tra montanti adiacenti
```

***

### STEP 5 — Verifica stabilità

```pseudo
if altezza > soglia:
    aggiungi fissaggi o allarga base
```

***

### STEP 6 — Ottimizzazione uso

* densità per storage
* aperture per design
* alternanza pieni/vuoti

***

### STEP 7 — Output

* lista componenti (BOM)
* geometria 3D
* istruzioni assemblaggio

***

## 5. Logica dei componenti (data model)

Esempio schema:

```json
{
  "montante": {
    "height": [18, 24, 38, 50],
    "connection_points": "top_bottom"
  },
  "ripiano": {
    "length": [20, 40, 70, 100],
    "depth": [20, 30, 40],
    "supports_required": 2
  },
  "accessori": ["piedini", "terminali", "fissaggio_parete"]
}
```

***

## 6. Principi progettuali chiave (da preservare)

### ✅ Semplicità

* progettazione intuitiva
* montaggio senza attrezzi [\[soluzionekompo.com\]](https://www.soluzionekompo.com/)

### ✅ Modularità pura

* combinazioni virtualmente infinite [\[SCAFFALE P...zionekompo\]](http://2018.premiocambiamenti.it/wp-content/uploads/2017/09/Catalogo_KOMPO_KOMPOKUBE_-1.pdf)

### ✅ Adattabilità

* progettato “in base allo spazio disponibile” [\[soluzionekompo.com\]](https://www.soluzionekompo.com/)

### ✅ Espandibilità

* aggiunta moduli nel tempo

### ✅ Struttura aperta

* niente vincoli rigidi → altamente riconfigurabile

***

## 7. Heuristics avanzate (per AI)

Per simulatore realistico:

* **minimizza componenti** a parità di funzione
* **massimizza simmetria** (più gradevole)
* **evita sbilanciamenti laterali**
* **preferisci interassi regolari**
* **ragiona per pattern (ripetizioni)**

***

## 8. Output atteso dell’agente AI

L’agente deve generare:

1. Configurazione strutturale
2. Lista componenti:
   * quantità per tipo
3. Layout (coordinate 3D)
4. Validazione (stabile / instabile)
5. Varianti alternative

***

## 🧩 Sintesi finale (versione corta per agent)

> Kompo è un sistema modulare discreto basato su montanti verticali e ripiani orizzontali combinabili su una griglia regolare. La progettazione consiste nel discretizzare lo spazio, posizionare montanti a interassi standard, collegarli con ripiani compatibili e verificare stabilità e continuità strutturale. Le configurazioni devono essere modulari, espandibili, simmetriche e adattate allo spazio. Il sistema genera infinite combinazioni tramite componenti standard e regole geometriche semplici.

***

Se vuoi, posso trasformare questo HOW TO direttamente in:

* prompt ottimizzato per LLM (tipo GPT agent)
* oppure schema JSON/DSL pronto per un configuratore 3D / Unity / Blender.
