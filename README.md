# Gestionale
Progetto di un gestionale per PACI, da usare anche come progetto combinato di Distributed System e ASW.

# Flusso di pensieri iniziale

> Server centralizzato \
> Ci serve per unificare tutte le informazioni, deve essere grande! \
> Contiene tutto

> Ogni utente viene considerato come ATTORE \
> Ogni attore ha un suo DB che contiene tutte e sole le sue informazioni. \
> Ogni attore ha un DB per ogni Microservizio. \

> Il DB centralizzato si sincronizza ad ogni evento con quello distribuito: \
> 1. Evento dell'attore => Pusha la info al DB (controllo preliminare per verificare che siano allineati)
> 2. Evento centralizzato => Pusha la info al DB degli ATTORI coinvolti (dopo verifica)

> La struttura del DB è da verificare, potrebbe aver senso sfruttare qualcosa di più "strutturato" rispetto al bellissimo MongoDB. -> Da VALUTARE le opzioni.

> Bisogna realizzare più VISTE:
> 1. Vista base dell'utente
> 2. Vista dell'admin
> 3. Vista di gestione del DB per l'utente
> 4. Vista di gestione del DB per l'admin
> 5. altro?

# PLAN

> Per fare in modo di strutturare il progetto in modo ordinato e funzionale, verrà eseguito il flusso di progettazione identificato dal DDD. \
> Solo dopo aver definito TUTTO si passerà all'implementazione. 



