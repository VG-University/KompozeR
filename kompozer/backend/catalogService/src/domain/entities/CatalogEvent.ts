// CatalogEvent — [DS] Discriminated union degli eventi pubblicati dal catalogService.
//
// Questi eventi vengono pubblicati su Redis Pub/Sub ogni volta che un admin
// aggiorna il prezzo o la disponibilità di un componente. Il notificationService
// è il subscriber: riceve gli eventi, individua le configurazioni CAD impattate
// e invia notifiche push agli utenti interessati.
//
// Ogni evento trasporta i valori "da" e "a" per permettere al subscriber di
// costruire messaggi leggibili dall'utente senza dover fare ulteriori query.

export type CatalogEventType = 'PRICE_CHANGED' | 'AVAILABILITY_CHANGED';

interface CatalogEventBase {
  eventId:     string;           // UUID univoco dell'evento
  occurredAt:  Date;             // timestamp di generazione (orologio del server)
  componentId: string;           // ID del componente aggiornato
  sku:         string;           // SKU del componente (duplicato per comodità del subscriber)
  changedBy:   string;           // userId dell'admin che ha eseguito la modifica
}

export interface PriceChangedEvent extends CatalogEventBase {
  type:     'PRICE_CHANGED';
  oldPrice: number;              // centesimi, valore precedente
  newPrice: number;              // centesimi, valore aggiornato
}

export interface AvailabilityChangedEvent extends CatalogEventBase {
  type:            'AVAILABILITY_CHANGED';
  oldIsAvailable:  boolean;
  newIsAvailable:  boolean;
}

// Tipo unione usato ovunque nel codice come tipo singolo per un evento di catalogo.
export type CatalogEvent = PriceChangedEvent | AvailabilityChangedEvent;
