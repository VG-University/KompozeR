// routes — Configurazione dei proxy verso i microservizi.
// Ogni route mappa un prefisso URL al servizio di destinazione.
// Le route non ancora implementate hanno un target placeholder che
// può essere attivato semplicemente configurando la variabile d'ambiente corretta.
// Il JWT middleware ha già iniettato gli header X-User-Id / X-User-Role / X-Session-Id
// prima che la richiesta arrivi qui — i servizi downstream leggono solo quelli.
import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

export interface ServiceUrls {
  auth: string;
  catalog: string;
  cad: string;
  cart: string;
  notification: string;
  chatbot: string;
  reporting: string;
}

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
