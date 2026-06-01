import { DeleteComponent }      from '../../src/useCases/DeleteComponent';
import { FakeComponentRepository, makeComponent } from '../helpers/fakes';
import { ComponentNotFoundError } from '../../src/domain/entities/errors';

function makeUseCase() {
  const repo = new FakeComponentRepository();
  const uc   = new DeleteComponent(repo);
  return { repo, uc };
}

describe('DeleteComponent', () => {
  it('elimina un componente esistente', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1' }));

    await uc.execute({ id: 'c1' });

    expect(repo.size()).toBe(0);
  });

  it('lancia ComponentNotFoundError se il componente non esiste', async () => {
    const { uc } = makeUseCase();
    await expect(uc.execute({ id: 'non-esiste' }))
      .rejects.toBeInstanceOf(ComponentNotFoundError);
  });

  it('non elimina altri componenti', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', sku: 'SKU-A' }));
    await repo.save(makeComponent({ id: 'c2', sku: 'SKU-B' }));

    await uc.execute({ id: 'c1' });

    expect(repo.size()).toBe(1);
    expect(repo.all()[0].id).toBe('c2');
  });
});
