import cors from 'cors';
import express from 'express';
import { buildCadRouter } from './adapters/http/cadRouter';
import { errorMiddleware } from './adapters/http/errorMiddleware';
import { MongoConfigurationRepository } from './adapters/persistence/MongoConfigurationRepository';
import { GetConfiguration } from './useCases/read/GetConfiguration';
import { CreateConfiguration } from './useCases/write/CreateConfiguration';

export function buildApp() {
  const configurationRepository = new MongoConfigurationRepository();

  const createConfiguration = new CreateConfiguration(configurationRepository);
  const getConfiguration = new GetConfiguration(configurationRepository);

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
    }),
  );

  app.use(errorMiddleware);

  return app;
}
