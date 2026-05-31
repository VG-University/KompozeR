// ServiceClient — Client HTTP iniettabile per le chiamate BFF del gateway.
// Crea un'istanza Axios pre-configurata con:
//   - baseURL del servizio di destinazione
//   - timeout di 5 secondi
//   - header di identità (X-User-Id / X-User-Role / X-Session-Id) già iniettati
//     dal jwtMiddleware e forwardati al downstream
//
// L'interfaccia `HttpClient` è volutamente minimale per facilitare i test
// (basta passare un fake che implementa get<T>).
import axios, { AxiosInstance } from 'axios';

export interface IdentityHeaders {
  'x-user-id'?: string;
  'x-user-role'?: string;
  'x-session-id'?: string;
}

export interface HttpClient {
  get<T = unknown>(path: string): Promise<T>;
}

export function createServiceClient(baseUrl: string, identity: IdentityHeaders): HttpClient {
  const instance: AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 5_000,
    headers: {
      'x-user-id':    identity['x-user-id'],
      'x-user-role':  identity['x-user-role'],
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
