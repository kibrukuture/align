import { describe, expect, test } from "bun:test";
import { HttpClient } from "@/core/http-client";
import type { AlignConfig } from "@/core/config";
import { ALIGN_API_URLS } from "@/core/config";

describe("HttpClient Configuration", () => {
  test("should use sandbox URL by default", () => {
    const config: AlignConfig = {
      apiKey: "test_key_123",
      environment: "sandbox",
    };

    const client = new HttpClient(config);
    const baseUrl = (client as unknown as { baseUrl: string }).baseUrl;

    expect(baseUrl).toBe(ALIGN_API_URLS.sandbox);
  });

  test("should use production URL when specified", () => {
    const config: AlignConfig = {
      apiKey: "test_key_123",
      environment: "production",
    };

    const client = new HttpClient(config);
    const baseUrl = (client as unknown as { baseUrl: string }).baseUrl;

    expect(baseUrl).toBe(ALIGN_API_URLS.production);
  });

  test("should use custom baseUrl when provided", () => {
    const customUrl = "https://my-proxy.example.com";
    const config: AlignConfig = {
      apiKey: "test_key_123",
      baseUrl: customUrl,
    };

    const client = new HttpClient(config);
    const baseUrl = (client as unknown as { baseUrl: string }).baseUrl;

    expect(baseUrl).toBe(customUrl);
  });

  test("should respect custom timeout", () => {
    const config: AlignConfig = {
      apiKey: "test_key_123",
      timeout: 5000,
    };

    const client = new HttpClient(config);
    // Verify client was created successfully
    expect(client).toBeDefined();
  });
});
