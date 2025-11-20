import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { AlignConfig } from "@/core/config";
import { ALIGN_API_URLS, DEFAULT_CONFIG } from "@/core/config";
import { AlignError, type AlignApiErrorResponse } from "@/core/errors";
import { createLogger, type LogLevel } from "@/core/logger";
import type pino from "pino";

export class HttpClient {
  private client: AxiosInstance;
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

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || DEFAULT_CONFIG.timeout!,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(
          { url: config.url, method: config.method },
          "Making request"
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(
          {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
          },
          "Request completed"
        );
        return response;
      },
      async (error) => {
        return Promise.reject(error);
      }
    );

    // Retry plugin
    axiosRetry(this.client, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status !== undefined &&
            [408, 413, 429, 500, 502, 503, 504].includes(error.response.status))
        );
      },
    });
  }

  private async handleError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AlignApiErrorResponse>;
      const response = axiosError.response;
      let errorMessage = `Align API Error: ${response?.status || 0} ${
        response?.statusText || "Unknown"
      }`;
      let errorCode: string | undefined;

      if (response?.data) {
        errorMessage = response.data.message || errorMessage;
        errorCode = response.data.code;
      }

      this.logger.error(
        {
          status: response?.status || 0,
          code: errorCode,
          message: errorMessage,
        },
        "API request failed"
      );

      throw new AlignError(errorMessage, response?.status || 0, errorCode);
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
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(path, {
        ...options,
        params: query,
      });

      if (response.status === 204) {
        return {} as T;
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async post<T>(
    path: string,
    body?: unknown,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(path, body, options);

      if (response.status === 204) {
        return {} as T;
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async put<T>(
    path: string,
    body?: unknown,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(path, body, options);

      if (response.status === 204) {
        return {} as T;
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async patch<T>(
    path: string,
    body?: unknown,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.patch<T>(path, body, options);

      if (response.status === 204) {
        return {} as T;
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async delete<T>(
    path: string,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.delete<T>(path, options);

      if (response.status === 204) {
        return {} as T;
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
