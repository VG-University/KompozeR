// NoopCatalogEventPublisher — Implementazione no-op di CatalogEventPublisher.
// Usata in ambienti di sviluppo dove Redis non è configurato.
// Logga l'evento su stdout per facilitare il debugging.
import { CatalogEventPublisher } from '../domain/ports/CatalogEventPublisher';
import { CatalogEvent }          from '../domain/entities/CatalogEvent';

export class NoopCatalogEventPublisher implements CatalogEventPublisher {
  async publish(event: CatalogEvent): Promise<void> {
    console.log(`[catalog][noop-publisher] Event: ${JSON.stringify(event)}`);
  }
}
