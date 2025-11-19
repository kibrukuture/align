import type { AlignConfig } from '@/core/config';
import { ALIGN_API_URLS, DEFAULT_CONFIG } from '@/core/config';
import { AlignError } from '@/core/errors';

export class HttpClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: AlignConfig) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || DEFAULT_CONFIG.timeout!;
    
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      this.baseUrl = ALIGN_API_URLS[config.environment || 'sandbox'];
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        let errorMessage = `Align API Error: ${response.status} ${response.statusText}`;
        let errorCode: string | undefined;
        
        try {
          const errorBody = await response.json() as any;
          errorMessage = errorBody.message || errorMessage;
          errorCode = errorBody.code;
        } catch {
          // Ignore if response is not JSON
        }

        throw new AlignError(errorMessage, response.status, errorCode);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      try {
        return await response.json() as T;
      } catch (error) {
        throw new AlignError('Failed to parse response', response.status, 'PARSE_ERROR');
      }
    } catch (error) {
      clearTimeout(id);
      if (error instanceof AlignError) {
        throw error;
      }
      throw new AlignError(
        error instanceof Error ? error.message : 'Unknown Error',
        0
      );
    }
  }

  public async get<T>(path: string, query?: Record<string, string | number | boolean>, options?: RequestInit): Promise<T> {
    let url = path;
    if (query) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      url += `?${params.toString()}`;
    }
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  public async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? options?.headers : {
        ...options?.headers,
        'Content-Type': 'application/json',
      }
    });
  }

  public async patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
