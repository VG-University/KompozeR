// healthRouter — Verifica lo stato di ogni microservizio downstream.
// Pinga in parallelo l'endpoint /health di ciascun servizio, misura la latenza
// e restituisce un report aggregato. Equivalente all'endpoint Spring Actuator
// /actuator/health con show-details: always.
//
// Risposte HTTP:
//   200 — tutti i servizi sono UP
//   207 — alcuni servizi sono DOWN (stato degraded)
//   503 — tutti i servizi sono DOWN
import { Router, Request, Response } from 'express';
import { ServiceUrls } from './index';

export interface ServiceStatus {
  status: 'up' | 'down';
  latencyMs: number;
  error?: string;
}

export interface HealthReport {
  status: 'up' | 'degraded' | 'down';
  gateway: 'up';
  timestamp: string;
  services: Record<string, ServiceStatus>;
}

// Tipo iniettabile per semplificare i test (default: global fetch di Node 24).
// Usa solo { ok, status } per evitare conflitti con Express Response.
export interface FetchResponse { ok: boolean; status: number; }
export type FetchFn = (url: string, init?: RequestInit) => Promise<FetchResponse>;

async function checkService(
  name: string,
  baseUrl: string,
  fetchFn: FetchFn,
): Promise<[string, ServiceStatus]> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3_000);

  try {
    const res = await fetchFn(`${baseUrl}/health`, { signal: controller.signal as AbortSignal });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;

    if (res.ok) {
      return [name, { status: 'up', latencyMs }];
    }
    return [name, { status: 'down', latencyMs, error: `HTTP ${res.status}` }];
  } catch (err: unknown) {
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    const error = err instanceof Error ? err.message : 'unknown error';
    return [name, { status: 'down', latencyMs, error }];
  }
}

export function buildHealthRouter(services: ServiceUrls, fetchFn: FetchFn = fetch as FetchFn): Router {
  const router = Router();

  router.get('/health', async (_req: Request, res: Response): Promise<void> => {
    const entries = Object.entries(services) as [keyof ServiceUrls, string][];

    const checks = await Promise.all(
      entries.map(([name, url]) => checkService(name, url, fetchFn)),
    );

    const serviceStatuses = Object.fromEntries(checks) as Record<string, ServiceStatus>;
    const statuses = checks.map(([, s]) => s.status);
    const allUp   = statuses.every(s => s === 'up');
    const allDown  = statuses.every(s => s === 'down');

    const overallStatus: HealthReport['status'] = allUp ? 'up' : allDown ? 'down' : 'degraded';
    const httpStatus = allUp ? 200 : allDown ? 503 : 207;

    const report: HealthReport = {
      status: overallStatus,
      gateway: 'up',
      timestamp: new Date().toISOString(),
      services: serviceStatuses,
    };

    res.status(httpStatus).json(report);
  });

  return router;
}
