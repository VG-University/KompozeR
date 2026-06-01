import { UpdateComponent }      from '../../src/useCases/UpdateComponent';
import {
  FakeComponentRepository,
  FakeCatalogEventPublisher,
  FakeClock,
  FakeIdGenerator,
  makeComponent,
} from '../helpers/fakes';
import { ComponentNotFoundError, VersionConflictError } from '../../src/domain/entities/errors';

function makeUseCase() {
  const repo      = new FakeComponentRepository();
  const publisher = new FakeCatalogEventPublisher();
  const clock     = new FakeClock();
  const eventIdGen = new FakeIdGenerator('evt');
  const uc        = new UpdateComponent(repo, publisher, clock, eventIdGen);
  return { repo, publisher, clock, eventIdGen, uc };
}

describe('UpdateComponent', () => {
  it('aggiorna i campi base senza pubblicare eventi', async () => {
    const { repo, publisher, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', version: 1 }));

    const dto = await uc.execute({
      id:              'c1',
      expectedVersion: 1,
      name:            'Nuovo nome',
      requestingUserId: 'admin-001',
    });

    expect(dto.name).toBe('Nuovo nome');
    expect(dto.version).toBe(2);            // [DS] versione incrementata
    expect(publisher.published).toHaveLength(0); // nessun evento: prezzo/disponibilità invariati
  });

  it('[DS] pubblica PriceChangedEvent quando il prezzo cambia', async () => {
    const { repo, publisher, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', version: 1, price: 1000 }));

    await uc.execute({ id: 'c1', expectedVersion: 1, price: 2000, requestingUserId: 'admin-001' });

    expect(publisher.published).toHaveLength(1);
    const event = publisher.published[0];
    expect(event.type).toBe('PRICE_CHANGED');
    if (event.type === 'PRICE_CHANGED') {
      expect(event.oldPrice).toBe(1000);
      expect(event.newPrice).toBe(2000);
      expect(event.changedBy).toBe('admin-001');
    }
  });

  it('[DS] pubblica AvailabilityChangedEvent quando isAvailable cambia', async () => {
    const { repo, publisher, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', version: 1, isAvailable: true }));

    await uc.execute({ id: 'c1', expectedVersion: 1, isAvailable: false, requestingUserId: 'admin-001' });

    expect(publisher.published).toHaveLength(1);
    const event = publisher.published[0];
    expect(event.type).toBe('AVAILABILITY_CHANGED');
    if (event.type === 'AVAILABILITY_CHANGED') {
      expect(event.oldIsAvailable).toBe(true);
      expect(event.newIsAvailable).toBe(false);
    }
  });

  it('[DS] pubblica due eventi quando prezzo E disponibilità cambiano', async () => {
    const { repo, publisher, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', version: 1, price: 1000, isAvailable: true }));

    await uc.execute({
      id:              'c1',
      expectedVersion: 1,
      price:           1500,
      isAvailable:     false,
      requestingUserId: 'admin-001',
    });

    expect(publisher.published).toHaveLength(2);
    expect(publisher.published.map(e => e.type)).toEqual(
      expect.arrayContaining(['PRICE_CHANGED', 'AVAILABILITY_CHANGED']),
    );
  });

  it('[DS] lancia VersionConflictError se la versione attesa non corrisponde', async () => {
    const { repo, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', version: 3 }));

    await expect(
      uc.execute({ id: 'c1', expectedVersion: 1, name: 'x', requestingUserId: 'admin-001' }),
    ).rejects.toBeInstanceOf(VersionConflictError);
  });

  it('lancia ComponentNotFoundError se il componente non esiste', async () => {
    const { uc } = makeUseCase();
    await expect(
      uc.execute({ id: 'non-esiste', expectedVersion: 1, requestingUserId: 'admin-001' }),
    ).rejects.toBeInstanceOf(ComponentNotFoundError);
  });

  it('usa il timestamp del clock per updatedAt e occurredAt', async () => {
    const { repo, clock, publisher, uc } = makeUseCase();
    const ts = new Date('2025-06-01T10:00:00.000Z');
    clock.setNow(ts);
    await repo.save(makeComponent({ id: 'c1', version: 1, price: 100 }));

    const dto = await uc.execute({ id: 'c1', expectedVersion: 1, price: 200, requestingUserId: 'admin-001' });

    expect(dto.updatedAt).toBe(ts.toISOString());
    expect(publisher.published[0].occurredAt).toEqual(ts);
  });

  it('non pubblica eventi se i valori non cambiano', async () => {
    const { repo, publisher, uc } = makeUseCase();
    await repo.save(makeComponent({ id: 'c1', version: 1, price: 1990, isAvailable: true }));

    await uc.execute({ id: 'c1', expectedVersion: 1, price: 1990, isAvailable: true, requestingUserId: 'admin-001' });

    expect(publisher.published).toHaveLength(0);
  });
});
