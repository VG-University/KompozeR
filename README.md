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
> 1. Evento dell'attore => Aggiorna il suo DB e successivamente si sincronizza a quello centralizzato. 
> 2. Evento centralizzato => Pusha l'evento all'Attore, che reagisce aggiornando il suo DB personale e solo dopo si sincronizza a quello centralizzato.

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



