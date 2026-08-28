import type { ApiErrorResponse } from '../types/article.types';

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors.length > 0 ? errors : [message];
  }
}

export interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env.VITE_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.REACT_APP_API_BASE_URL ||
      process.env.API_BASE_URL ||
      'http://localhost:3000'
    );
  }
  return 'http://localhost:3000';
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, params, headers: customHeaders, ...restOptions } = options;

  let url = `${getApiBaseUrl()}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers,
    });
  } catch (error) {
    throw new ApiClientError(
      0,
      'Network error: Unable to communicate with MedCore API',
      ['Unable to establish network connection to server.'],
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} Error`;
    let errorDetails: string[] = [];

    try {
      const errorData: ApiErrorResponse = await response.json();
      if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
        errorDetails = [errorData.error];
      } else if (errorData.error && typeof errorData.error === 'object') {
        const msg = errorData.error.message;
        if (Array.isArray(msg)) {
          errorDetails = msg;
          errorMessage = msg[0] || errorMessage;
        } else if (typeof msg === 'string') {
          errorMessage = msg;
          errorDetails = [msg];
        }
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
      errorDetails = [errorMessage];
    }

    throw new ApiClientError(response.status, errorMessage, errorDetails);
  }

  if (response.status === 24) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
