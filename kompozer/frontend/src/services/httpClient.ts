/** Shared HTTP wrapper that normalizes API calls and error handling. */
import { ApiError, type ApiErrorResponse } from '@/types/api';

const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('kompozer_token');
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) {
      return undefined as T;
    }
    return res.json() as Promise<T>;
  }

  let errorBody: ApiErrorResponse | null = null;
  try {
    errorBody = (await res.json()) as ApiErrorResponse;
  } catch {
    // non-JSON error body
  }

  throw new ApiError(
    errorBody?.error?.code ?? 'UNKNOWN_ERROR',
    errorBody?.error?.message ?? `HTTP ${res.status}`,
    res.status,
    errorBody?.error?.details,
  );
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, init);
    return handleResponse<T>(res);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'NETWORK_ERROR',
      'Servizio non raggiungibile. Verifica che API Gateway sia avviato su localhost:3000.',
      0,
    );
  }
}

export const http = {
  async get<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: 'GET',
      headers: buildHeaders(),
    });
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
  },
};
