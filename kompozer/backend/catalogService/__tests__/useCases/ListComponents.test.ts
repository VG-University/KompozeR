import { ListComponents }       from '../../src/useCases/ListComponents';
import { FakeComponentRepository, makeComponent } from '../helpers/fakes';
import { ComponentCategory }   from '../../src/domain/entities/ComponentCategory';

function makeUseCase() {
  const repo = new FakeComponentRepository();
  const uc   = new ListComponents(repo);
  return { repo, uc };
}

describe('ListComponents', () => {
  it('restituisce lista vuota se il catalogo è vuoto', async () => {
    const { uc } = makeUseCase();
    const result = await uc.execute({});
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(0);
  });

  it('restituisce tutti i componenti senza filtri', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', sku: 'SKU-A' }));
    await repo.save(makeComponent({ id: 'b', sku: 'SKU-B' }));

    const result = await uc.execute({});
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
  });

  it('filtra per categoria', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', sku: 'SKU-A', category: ComponentCategory.TONDO }));
    await repo.save(makeComponent({ id: 'b', sku: 'SKU-B', category: ComponentCategory.QUADRO }));

    const result = await uc.execute({ category: ComponentCategory.TONDO });
    expect(result.total).toBe(1);
    expect(result.items[0].category).toBe(ComponentCategory.TONDO);
  });

  it('filtra per disponibilità', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', sku: 'SKU-A', isAvailable: true }));
    await repo.save(makeComponent({ id: 'b', sku: 'SKU-B', isAvailable: false }));

    const result = await uc.execute({ available: true });
    expect(result.total).toBe(1);
    expect(result.items[0].isAvailable).toBe(true);
  });

  it('filtra per prezzo minimo e massimo', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', sku: 'SKU-A', price: 1000 }));
    await repo.save(makeComponent({ id: 'b', sku: 'SKU-B', price: 2000 }));
    await repo.save(makeComponent({ id: 'c', sku: 'SKU-C', price: 3000 }));

    const result = await uc.execute({ minPrice: 1500, maxPrice: 2500 });
    expect(result.total).toBe(1);
    expect(result.items[0].price).toBe(2000);
  });

  it('filtra per testo di ricerca (name)', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', sku: 'SKU-A', name: 'Ripiano 80cm', description: 'Ripiano classico' }));
    // Neutral description so it does not match 'ripiano'.
    await repo.save(makeComponent({ id: 'b', sku: 'SKU-B', name: 'Montante alto', description: 'Colonna verticale' }));

    const result = await uc.execute({ search: 'ripiano' });
    expect(result.total).toBe(1);
    expect(result.items[0].name).toBe('Ripiano 80cm');
  });

  it('applica paginazione correttamente', async () => {
    const { repo, uc } = makeUseCase();
    for (let i = 1; i <= 5; i++) {
      await repo.save(makeComponent({ id: `id-${i}`, sku: `SKU-${i}` }));
    }

    const page1 = await uc.execute({ page: 1, limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);

    const page3 = await uc.execute({ page: 3, limit: 2 });
    expect(page3.items).toHaveLength(1);
  });

  it('clamp limit a MAX_LIMIT (100)', async () => {
    const { uc } = makeUseCase();
    const result = await uc.execute({ limit: 9999 });
    expect(result.limit).toBe(100);
  });

  it('restituisce i campi DTO corretti', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'a', sku: 'SKU-A' }));

    const result = await uc.execute({});
    const dto = result.items[0];
    expect(dto).toHaveProperty('id');
    expect(dto).toHaveProperty('sku');
    expect(dto).toHaveProperty('price');
    expect(dto).toHaveProperty('version');
    expect(typeof dto.createdAt).toBe('string'); // ISO 8601
  });
});
