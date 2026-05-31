// bff — Route di aggregazione Backend For Frontend.
// Invece di far fare N chiamate al browser, queste route aggregano in parallelo
// i dati di più microservizi e restituiscono un unico payload.
//
// Pattern: Promise.allSettled — un servizio down non blocca gli altri;
// il risultato parziale usa { data } per i successi, { error } per i fallimenti.
// Il frontend deve gestire entrambi i casi.
//
// Tutti gli endpoint /bff/* sono protetti dal JWT middleware montato in app.ts.
import { Router, Request, Response } from 'express';
import { ServiceUrls } from './index';
import {
  HttpClient,
  IdentityHeaders,
  createServiceClient,
} from '../adapters/httpClient/ServiceClient';

export type ClientFactory = (baseUrl: string, identity: IdentityHeaders) => HttpClient;

/** Estrae gli header di identità già iniettati dal jwtMiddleware. */
function extractIdentity(req: Request): IdentityHeaders {
  return {
    'x-user-id':    req.headers['x-user-id'] as string | undefined,
    'x-user-role':  req.headers['x-user-role'] as string | undefined,
    'x-session-id': req.headers['x-session-id'] as string | undefined,
  };
}

/** Normalizza il risultato di Promise.allSettled in { data } | { error }. */
function settle<T>(
  result: PromiseSettledResult<T>,
): { data: T } | { error: string } {
  if (result.status === 'fulfilled') return { data: result.value };
  const msg =
    result.reason instanceof Error
      ? result.reason.message
      : 'service unavailable';
  return { error: msg };
}

export function buildBffRouter(
  services: ServiceUrls,
  clientFactory: ClientFactory = createServiceClient,
): Router {
  const router = Router();

  // ── GET /bff/dashboard ─────────────────────────────────────────────────────
  // Usato dalla homepage post-login. Ritorna in una sola chiamata:
  //   - sommario del carrello (cart-service  GET /cart)
  //   - sessioni CAD attive  (cad-service    GET /sessions)
  //   - conteggio notifiche  (notification-service GET /notifications/unread/count)
  router.get(
    '/bff/dashboard',
    async (req: Request, res: Response): Promise<void> => {
      const identity = extractIdentity(req);

      const cartClient   = clientFactory(services.cart,         identity);
      const cadClient    = clientFactory(services.cad,          identity);
      const notifClient  = clientFactory(services.notification, identity);

      const [cart, cadSessions, notifications] = await Promise.allSettled([
        cartClient.get('/cart'),
        cadClient.get('/sessions'),
        notifClient.get('/notifications/unread/count'),
      ]);

      res.json({
        cart:          settle(cart),
        cadSessions:   settle(cadSessions),
        notifications: settle(notifications),
      });
    },
  );

  // ── GET /bff/configurator/:sessionId ──────────────────────────────────────
  // Usato dalla pagina del configuratore. Ritorna in una sola chiamata:
  //   - snapshot della sessione CAD (cad-service    GET /sessions/:id/snapshot)
  //   - lista item del catalogo     (catalog-service GET /catalog/items)
  // Il frontend usa i prezzi aggiornati del catalogo per aggiornare il preventivo
  // in tempo reale senza fare N chiamate per N componenti.
  router.get(
    '/bff/configurator/:sessionId',
    async (req: Request, res: Response): Promise<void> => {
      const { sessionId } = req.params;
      const identity = extractIdentity(req);

      const cadClient     = clientFactory(services.cad,     identity);
      const catalogClient = clientFactory(services.catalog,  identity);

      const [snapshot, catalogItems] = await Promise.allSettled([
        cadClient.get(`/sessions/${sessionId}/snapshot`),
        catalogClient.get('/catalog/items'),
      ]);

      res.json({
        snapshot:     settle(snapshot),
        catalogItems: settle(catalogItems),
      });
    },
  );

  return router;
}
