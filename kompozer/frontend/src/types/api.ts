/* ── API Error Model (allineato al backend) ────────────────────────────── */

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
