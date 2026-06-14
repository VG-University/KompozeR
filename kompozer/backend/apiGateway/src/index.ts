// index — Entry point dell'apiGateway.
// Legge le variabili d'ambiente, costruisce l'app e avvia il server HTTP.
// Termina il processo se JWT_SECRET non è configurato.
import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const app = buildApp({
  jwtSecret: JWT_SECRET,
  services: {
    auth:         process.env.AUTH_SERVICE_URL         || 'http://auth-service:3001',
    catalog:      process.env.CATALOG_SERVICE_URL      || 'http://catalog-service:3002',
    cad:          process.env.CAD_SERVICE_URL          || 'http://cad-service:3003',
    cart:         process.env.CART_SERVICE_URL         || 'http://cart-service:3004',
    order:        process.env.ORDER_SERVICE_URL        || 'http://order-service:3008',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
    chatbot:      process.env.CHATBOT_SERVICE_URL      || 'http://chatbot-service:3006',
    reporting:    process.env.REPORTING_SERVICE_URL    || 'http://reporting-service:3007',
  },
});

const server = app.listen(PORT, () => {
  console.log(`[gateway] Listening on port ${PORT}`);
});

const notificationsWsProxy = app.locals['notificationsWsProxy'] as
  | { upgrade?: (req: unknown, socket: unknown, head: unknown) => void }
  | undefined;

if (notificationsWsProxy?.upgrade) {
  server.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/ws/notifications')) {
      notificationsWsProxy.upgrade?.(req, socket, head);
    }
  });
}
