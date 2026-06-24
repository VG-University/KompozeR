/**
 * Proxy route configuration for downstream microservices.
 *
 * Each mounted route maps a gateway prefix to a specific target service.
 * The JWT middleware has already sanitized and injected identity headers
 * before requests are forwarded from this router.
 */
import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

/**
 * Downstream service base URLs used by gateway proxy and BFF layers.
 */
export interface ServiceUrls {
  auth: string;
  catalog: string;
  cad: string;
  cart: string;
  order: string;
  notification: string;
  chatbot: string;
  reporting: string;
}

/**
 * Builds the gateway proxy router.
 *
 * All proxy routes preserve HTTP method and body while rewriting only
 * the service-local base path.
 */
export function buildRoutes(services: ServiceUrls): Router {
  const router = Router();

  // ── authenticationService ────────────────────────────────────────────────────
  router.use(
    '/auth',
    createProxyMiddleware({
      target: services.auth,
      changeOrigin: true,
      pathRewrite: (path) => `/auth${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── catalogService ───────────────────────────────────────────────────────────
  router.use(
    '/catalog',
    createProxyMiddleware({
      target: services.catalog,
      changeOrigin: true,
      pathRewrite: (path) => `/catalog${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── cadService ───────────────────────────────────────────────────────────────
  router.use(
    '/cad',
    createProxyMiddleware({
      target: services.cad,
      changeOrigin: true,
      pathRewrite: (path) => `/cad${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── cartService ──────────────────────────────────────────────────────────────
  router.use(
    '/cart',
    createProxyMiddleware({
      target: services.cart,
      changeOrigin: true,
      pathRewrite: (path) => `/cart${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── orderService ─────────────────────────────────────────────────────────────
  router.use(
    '/orders',
    createProxyMiddleware({
      target: services.order,
      changeOrigin: true,
      pathRewrite: (path) => `/orders${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── notificationService ──────────────────────────────────────────────────────
  router.use(
    '/notifications',
    createProxyMiddleware({
      target: services.notification,
      changeOrigin: true,
      pathRewrite: (path) => `/notifications${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── chatbotService ───────────────────────────────────────────────────────────
  router.use(
    '/chatbot',
    createProxyMiddleware({
      target: services.chatbot,
      changeOrigin: true,
      ws: true,
      pathRewrite: (path) => `/chatbot${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  // ── reportingService ─────────────────────────────────────────────────────────
  router.use(
    '/reports',
    createProxyMiddleware({
      target: services.reporting,
      changeOrigin: true,
      pathRewrite: (path) => `/reports${path}`,
      on: { proxyReq: fixRequestBody },
    }),
  );

  return router;
}
