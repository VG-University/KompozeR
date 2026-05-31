// app — Composition root dell'apiGateway.
// Assembla il middleware JWT, le route di proxy verso i microservizi
// e il middleware di errore. Esportato come factory per facilità di test.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { buildJwtMiddleware } from './middleware/jwtMiddleware';
import { gatewayErrorMiddleware } from './middleware/gatewayErrorMiddleware';
import { buildRoutes, ServiceUrls } from './routes/index';
import { buildHealthRouter } from './routes/health';

export interface GatewayConfig {
  jwtSecret: string;
  services: ServiceUrls;
}

export function buildApp(config: GatewayConfig) {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Health check — pubblico, prima del JWT middleware
  app.use(buildHealthRouter(config.services));

  // JWT verification — runs before every route except public ones
  app.use(buildJwtMiddleware(config.jwtSecret));

  // Proxy routes
  app.use(buildRoutes(config.services));

  app.use(gatewayErrorMiddleware);

  return app;
}
