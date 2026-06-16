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

export const http = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse<T>(res);
  },
};
