import cors from 'cors';
import express from 'express';
import { buildCadRouter } from './adapters/http/cadRouter';
import { HttpCatalogRulesProvider } from './adapters/http/HttpCatalogRulesProvider';
import { errorMiddleware } from './adapters/http/errorMiddleware';
import { MongoConfigurationRepository } from './adapters/persistence/MongoConfigurationRepository';
import { CatalogRulesProvider } from './domain/ports/CatalogRulesProvider';
import { ConfigurationRepository } from './domain/ports/ConfigurationRepository';
import { GetConfiguration } from './useCases/read/GetConfiguration';
import { CreateConfiguration } from './useCases/write/CreateConfiguration';
import { FinalizeConfiguration } from './useCases/write/FinalizeConfiguration';
import { SetCategory } from './useCases/write/SetCategory';
import { SetColumnPlan } from './useCases/write/SetColumnPlan';
import { SetEnvironment } from './useCases/write/SetEnvironment';
import { UpdateDesign } from './useCases/write/UpdateDesign';

export interface BuildAppDeps {
  configurationRepository?: ConfigurationRepository;
  catalogRulesProvider?: CatalogRulesProvider;
}

export function buildApp(deps: BuildAppDeps = {}) {
  const configurationRepository = deps.configurationRepository ?? new MongoConfigurationRepository();
  const catalogRulesProvider = deps.catalogRulesProvider
    ?? new HttpCatalogRulesProvider(process.env['CATALOG_BASE_URL'] || 'http://localhost:3002');

  const createConfiguration = new CreateConfiguration(configurationRepository);
  const getConfiguration = new GetConfiguration(configurationRepository);
  const setEnvironment = new SetEnvironment(configurationRepository);
  const setCategory = new SetCategory(configurationRepository);
  const setColumnPlan = new SetColumnPlan(configurationRepository, catalogRulesProvider);
  const updateDesign = new UpdateDesign(configurationRepository, catalogRulesProvider);
  const finalizeConfiguration = new FinalizeConfiguration(configurationRepository);

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/cad',
    buildCadRouter({
      createConfiguration,
      getConfiguration,
      setEnvironment,
      setCategory,
      setColumnPlan,
      updateDesign,
      finalizeConfiguration,
    }),
  );

  app.use(errorMiddleware);

  return app;
}
