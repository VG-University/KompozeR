// DeleteComponent — Use case per la rimozione di un componente dal catalogo.
// Richiede ruolo ADMIN.
// Lancia ComponentNotFoundError (404) se l'ID non esiste.
// Nota: la cancellazione è hard delete. Se in futuro si vuole soft delete,
// aggiungere un campo `deletedAt` e un flag `isDeleted` all'entità.
import { ComponentRepository }    from '../domain/ports/ComponentRepository';
import { ComponentNotFoundError } from '../domain/entities/errors';
import { DeleteComponentInput }   from './types';

export class DeleteComponent {
  constructor(private readonly componentRepo: ComponentRepository) {}

  async execute(input: DeleteComponentInput): Promise<void> {
    const existing = await this.componentRepo.findById(input.id);
    if (!existing) throw new ComponentNotFoundError(input.id);
    await this.componentRepo.delete(input.id);
  }
}
