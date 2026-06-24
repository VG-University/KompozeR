declare module 'express' {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  export function Router(): any;
  const express: any;
  export default express;
}

declare module 'cors' {
  const cors: (...args: any[]) => any;
  export default cors;
}

declare module 'helmet' {
  const helmet: (...args: any[]) => any;
  export default helmet;
}

declare module 'http-proxy-middleware' {
  export const fixRequestBody: any;
  export function createProxyMiddleware(config: any): any;
}

declare module 'jsonwebtoken' {
  export type SignOptions = Record<string, unknown>;
  const jwt: {
    verify: (token: string, secret: string) => any;
    sign: (payload: unknown, secret: string, options?: Record<string, unknown>) => string;
  };
  export default jwt;
}

declare module 'supertest' {
  const request: any;
  export default request;
}

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code: number) => never;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

declare const fetch: (url: string, init?: RequestInit) => Promise<{ ok: boolean; status: number }>;
declare const setTimeout: (handler: () => void, timeout: number) => unknown;
declare const clearTimeout: (timeoutId: unknown) => void;

type AbortSignal = unknown;
declare class AbortController {
  signal: AbortSignal;
  abort(): void;
}

type RequestInit = Record<string, unknown>;