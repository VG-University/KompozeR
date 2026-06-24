/**
 * Injectable HTTP client adapter used by gateway BFF routes.
 *
 * Creates an Axios client configured with:
 * - downstream service base URL,
 * - 5-second timeout,
 * - forwarded identity headers from JWT middleware.
 *
 * The HttpClient abstraction remains intentionally small to simplify tests.
 */
declare const require: (moduleName: string) => unknown;

type AxiosResponse<T = unknown> = { data: T };
type AxiosClient = { get<T = unknown>(path: string): Promise<AxiosResponse<T>> };
type AxiosFactory = {
  create: (config: {
    baseURL: string;
    timeout: number;
    headers: Record<string, string | undefined>;
  }) => AxiosClient;
};

const axios = require('axios') as AxiosFactory;

export interface IdentityHeaders {
  'x-user-id'?: string;
  'x-user-role'?: string;
  'x-session-id'?: string;
}

export interface HttpClient {
  get<T = unknown>(path: string): Promise<T>;
}

/**
 * Creates a per-request service client that preserves caller identity context.
 */
export function createServiceClient(baseUrl: string, identity: IdentityHeaders): HttpClient {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 5_000,
    headers: {
      'x-user-id': identity['x-user-id'],
      'x-user-role': identity['x-user-role'],
      'x-session-id': identity['x-session-id'],
    },
  });

  return {
    async get<T = unknown>(path: string): Promise<T> {
      const res = await instance.get<T>(path);
      return res.data;
    },
  };
}
