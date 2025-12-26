import { describe, expect, test } from "bun:test";
import { WebhooksResource } from "@/resources/webhooks/webhooks.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type { CreateWebhookRequest } from "@/resources/webhooks/webhooks.types";
import { createHmac } from "crypto";

describe("WebhooksResource", () => {
  const mockClient = {
    get: async () => ({ items: [] }),
    post: async () => ({ id: "wh_123" }),
    put: async () => ({}),
    delete: async () => {},
  } as unknown as HttpClient;

  const apiKey = "test_api_key_123";
  const webhooks = new WebhooksResource(mockClient, apiKey);

  describe("Validation", () => {
    test("should accept valid webhook creation", async () => {
      const validData: CreateWebhookRequest = {
        url: "https://api.example.com/webhooks",
      };

      const result = await webhooks.create(validData);
      expect(result).toBeDefined();
    });

    test("should reject invalid URL", async () => {
      const invalidData = {
        url: "not-a-url",
      };

      try {
        await webhooks.create(invalidData);
        throw new Error("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeInstanceOf(AlignValidationError);
      }
    });
  });

  describe("Signature Verification", () => {
    test("should verify valid HMAC signature", () => {
      const payload = JSON.stringify({ event: "payment.received", data: {} });
      const secret = "test_secret";

      // Create valid signature
      const hmac = createHmac("sha256", secret);
      const validSignature = hmac.update(payload).digest("hex");

      const isValid = webhooks.verifySignature(payload, validSignature, secret);
      expect(isValid).toBe(true);
    });

    test("should reject invalid signature", () => {
      const payload = JSON.stringify({ event: "payment.received" });
      const secret = "test_secret";
      const invalidSignature = "invalid_signature_12345";

      const isValid = webhooks.verifySignature(
        payload,
        invalidSignature,
        secret
      );
      expect(isValid).toBe(false);
    });

    test("should reject tampered payload", () => {
      const originalPayload = JSON.stringify({ event: "payment.received" });
      const tamperedPayload = JSON.stringify({ event: "payment.failed" });
      const secret = "test_secret";

      const hmac = createHmac("sha256", secret);
      const signature = hmac.update(originalPayload).digest("hex");

      const isValid = webhooks.verifySignature(
        tamperedPayload,
        signature,
        secret
      );
      expect(isValid).toBe(false);
    });

    test("should use constructor apiKey if secret not provided", () => {
      const payload = JSON.stringify({ event: "test" });
      const hmac = createHmac("sha256", apiKey);
      const signature = hmac.update(payload).digest("hex");

      const isValid = webhooks.verifySignature(payload, signature);
      expect(isValid).toBe(true);
    });

    test("should throw error if no secret available", () => {
      const webhooksNoKey = new WebhooksResource(mockClient);
      const payload = JSON.stringify({ event: "test" });

      expect(() => {
        webhooksNoKey.verifySignature(payload, "sig");
      }).toThrow("Missing secret for webhook signature verification");
    });
  });
});
