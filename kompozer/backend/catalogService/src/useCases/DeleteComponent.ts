/**
 * Use case for deleting a component from the catalog.
 *
 * Requires ADMIN role.
 * Throws ComponentNotFoundError (404) if id does not exist.
 * Current behavior is hard delete.
 */
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
