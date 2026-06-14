import { ListConfigurations } from '../../src/useCases/read/ListConfigurations';
import { FakeConfigurationRepository, buildConfiguration } from '../helpers/fakes';

describe('ListConfigurations', () => {
  it('returns only owner configurations ordered by updatedAt desc', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        id: 'cfg_1',
        ownerId: 'usr_1',
        updatedAt: new Date('2026-06-14T10:00:00.000Z'),
      }),
    );
    repo.seed(
      buildConfiguration({
        id: 'cfg_2',
        ownerId: 'usr_1',
        updatedAt: new Date('2026-06-14T11:00:00.000Z'),
      }),
    );
    repo.seed(
      buildConfiguration({
        id: 'cfg_3',
        ownerId: 'usr_2',
        updatedAt: new Date('2026-06-14T12:00:00.000Z'),
      }),
    );

    const useCase = new ListConfigurations(repo);
    const output = await useCase.execute({ ownerId: 'usr_1' });

    expect(output.total).toBe(2);
    expect(output.items).toHaveLength(2);
    expect(output.items.map((item) => item.id)).toEqual(['cfg_2', 'cfg_1']);
  });

  it('supports status filter and pagination', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({ id: 'cfg_1', ownerId: 'usr_1', status: 'DRAFT' }),
    );
    repo.seed(
      buildConfiguration({ id: 'cfg_2', ownerId: 'usr_1', status: 'FINALIZED' }),
    );
    repo.seed(
      buildConfiguration({ id: 'cfg_3', ownerId: 'usr_1', status: 'FINALIZED' }),
    );

    const useCase = new ListConfigurations(repo);
    const output = await useCase.execute({
      ownerId: 'usr_1',
      status: 'FINALIZED',
      page: 1,
      limit: 1,
    });

    expect(output.total).toBe(2);
    expect(output.items).toHaveLength(1);
    expect(output.totalPages).toBe(2);
    expect(output.items[0].status).toBe('FINALIZED');
  });
});
