// CatalogEventPublisher — [DS] Porta di dominio per la pubblicazione di eventi di catalogo.
// Astrae il canale di messaggistica (Redis Pub/Sub in produzione, Noop in dev, Fake nei test).
//
// Questa porta è il confine tra il dominio e il mondo esterno per quanto riguarda
// la comunicazione event-driven. Il notificationService è il subscriber che reagisce
// agli eventi pubblicati qui per avvertire gli utenti delle variazioni di prezzo/disponibilità.
import { CatalogEvent } from '../entities/CatalogEvent';

export interface CatalogEventPublisher {
  publish(event: CatalogEvent): Promise<void>;
}
