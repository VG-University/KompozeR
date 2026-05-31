// routes — Configurazione dei proxy verso i microservizi.
// Ogni route mappa un prefisso URL al servizio di destinazione.
// Le route non ancora implementate hanno un target placeholder che
// può essere attivato semplicemente configurando la variabile d'ambiente corretta.
// Il JWT middleware ha già iniettato gli header X-User-Id / X-User-Role / X-Session-Id
// prima che la richiesta arrivi qui — i servizi downstream leggono solo quelli.
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

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
    }),
  );

  // ── catalogService ───────────────────────────────────────────────────────────
  router.use(
    '/catalog',
    createProxyMiddleware({
      target: services.catalog,
      changeOrigin: true,
    }),
  );

  // ── cadService ───────────────────────────────────────────────────────────────
  router.use(
    '/cad',
    createProxyMiddleware({
      target: services.cad,
      changeOrigin: true,
    }),
  );

  // ── cartService ──────────────────────────────────────────────────────────────
  router.use(
    '/cart',
    createProxyMiddleware({
      target: services.cart,
      changeOrigin: true,
    }),
  );

  // ── notificationService ──────────────────────────────────────────────────────
  router.use(
    '/notifications',
    createProxyMiddleware({
      target: services.notification,
      changeOrigin: true,
    }),
  );

  // ── chatbotService ───────────────────────────────────────────────────────────
  router.use(
    '/chatbot',
    createProxyMiddleware({
      target: services.chatbot,
      changeOrigin: true,
    }),
  );

  // ── reportingService ─────────────────────────────────────────────────────────
  router.use(
    '/reports',
    createProxyMiddleware({
      target: services.reporting,
      changeOrigin: true,
    }),
  );

  return router;
}
