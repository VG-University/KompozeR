import { GetComponent }         from '../../src/useCases/GetComponent';
import { FakeComponentRepository, makeComponent } from '../helpers/fakes';
import { ComponentNotFoundError } from '../../src/domain/entities/errors';

function makeUseCase() {
  const repo = new FakeComponentRepository();
  const uc   = new GetComponent(repo);
  return { repo, uc };
}

describe('GetComponent', () => {
  it('restituisce il componente se esiste', async () => {
    const { repo, uc } = makeUseCase();
    const comp = makeComponent({ id: 'comp-001', sku: 'KMP-SHELF-001' });
    await repo.save(comp);

    const dto = await uc.execute({ id: 'comp-001' });
    expect(dto.id).toBe('comp-001');
    expect(dto.sku).toBe('KMP-SHELF-001');
  });

  it('lancia ComponentNotFoundError se l\'ID non esiste', async () => {
    const { uc } = makeUseCase();
    await expect(uc.execute({ id: 'non-esistente' }))
      .rejects.toBeInstanceOf(ComponentNotFoundError);
  });

  it('restituisce date come stringhe ISO 8601', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a' }));

    const dto = await uc.execute({ id: 'a' });
    expect(typeof dto.createdAt).toBe('string');
    expect(typeof dto.updatedAt).toBe('string');
    expect(() => new Date(dto.createdAt)).not.toThrow();
  });

  it('restituisce il campo version', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', version: 3 }));

    const dto = await uc.execute({ id: 'a' });
    expect(dto.version).toBe(3);
  });

  it('restituisce il campo compatibleWith', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', compatibleWith: ['SKU-B', 'SKU-C'] }));

    const dto = await uc.execute({ id: 'a' });
    expect(dto.compatibleWith).toEqual(['SKU-B', 'SKU-C']);
  });
});
