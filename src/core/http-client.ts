import ky, { HTTPError, type KyInstance, type Options } from "ky";
import type { AlignConfig } from "@/core/config";
import { ALIGN_API_URLS, DEFAULT_CONFIG } from "@/core/config";
import { AlignError, type AlignApiErrorResponse } from "@/core/errors";
import { createLogger, type LogLevel } from "@/core/logger";
import type pino from "pino";

export class HttpClient {
  private client: KyInstance;
  private baseUrl: string;
  private logger: pino.Logger;

  constructor(config: AlignConfig) {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      this.baseUrl = ALIGN_API_URLS[config.environment || "sandbox"];
    }

    // Create logger
    this.logger = createLogger({
      enabled: config.debug ?? false,
      level: (config.logLevel || "error") as LogLevel,
    });

    // Create ky instance - ky handles headers automatically
    this.client = ky.create({
      prefixUrl: this.baseUrl,
      timeout: config.timeout || DEFAULT_CONFIG.timeout!,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      retry: {
        limit: 2,
        methods: ["get", "put", "head", "delete", "options", "trace"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      hooks: {
        beforeRequest: [
          (request) => {
            this.logger.debug(
              { url: request.url, method: request.method },
              "Making request"
            );
          },
        ],
        afterResponse: [
          (request, options, response) => {
            this.logger.debug(
              {
                url: request.url,
                method: request.method,
                status: response.status,
              },
              "Request completed"
            );
            return response;
          },
        ],
      },
    });
  }

  private async handleError(error: unknown): Promise<never> {
    if (error instanceof HTTPError) {
      const response = error.response;
      let errorMessage = `Align API Error: ${response.status} ${response.statusText}`;
      let errorCode: string | undefined;

      try {
        const errorBody = (await response
          .clone()
          .json()) as AlignApiErrorResponse;
        errorMessage = errorBody.message || errorMessage;
        errorCode = errorBody.code;
      } catch {
        // Ignore if response is not JSON
      }

      this.logger.error(
        { status: response.status, code: errorCode, message: errorMessage },
        "API request failed"
      );

      throw new AlignError(errorMessage, response.status, errorCode);
    }

    if (error instanceof AlignError) {
      this.logger.error({ message: error.message }, "Align error");
      throw error;
    }

    this.logger.error(
      { message: error instanceof Error ? error.message : "Unknown Error" },
      "Unexpected error"
    );

    throw new AlignError(
      error instanceof Error ? error.message : "Unknown Error",
      0
    );
  }

  public async get<T>(
    path: string,
    query?: Record<string, string | number | boolean>,
    options?: Options
  ): Promise<T> {
    try {
      const searchParams: Record<string, string> = {};
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams[key] = String(value);
          }
        });
      }

      const response = await this.client.get(path, {
        ...options,
        searchParams:
          Object.keys(searchParams).length > 0 ? searchParams : undefined,
      });

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async post<T>(
    path: string,
    body?: unknown,
    options?: Options
  ): Promise<T> {
    try {
      const kyOptions: Options = { ...options };

      if (body !== undefined) {
        if (body instanceof FormData) {
          kyOptions.body = body;
        } else {
          kyOptions.json = body;
        }
      }

      const response = await this.client.post(path, kyOptions);

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async put<T>(
    path: string,
    body?: unknown,
    options?: Options
  ): Promise<T> {
    try {
      const kyOptions: Options = { ...options };

      if (body !== undefined) {
        if (body instanceof FormData) {
          kyOptions.body = body;
        } else {
          kyOptions.json = body;
        }
      }

      const response = await this.client.put(path, kyOptions);

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async patch<T>(
    path: string,
    body?: unknown,
    options?: Options
  ): Promise<T> {
    try {
      const kyOptions: Options = { ...options };

      if (body !== undefined) {
        if (body instanceof FormData) {
          kyOptions.body = body;
        } else {
          kyOptions.json = body;
        }
      }

      const response = await this.client.patch(path, kyOptions);

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async delete<T>(path: string, options?: Options): Promise<T> {
    try {
      const response = await this.client.delete(path, options);

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      return this.handleError(error);
    }
  }
}
