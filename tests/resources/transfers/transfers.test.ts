import { describe, expect, test } from "bun:test";
import { TransfersResource } from "@/resources/transfers/transfers.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type {
  CreateOfframpQuoteRequest,
  CreateOnrampQuoteRequest,
  CreateOfframpTransferRequest,
} from "@/resources/transfers/transfers.types";

describe("TransfersResource Validation", () => {
  const mockClient = {
    get: async () => ({}),
    post: async () => ({ id: "quote_123" }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const transfers = new TransfersResource(mockClient);

  test("should accept offramp quote with source_amount", async () => {
    const validData: CreateOfframpQuoteRequest = {
      source_amount: "100.00",
      source_token: "usdc",
      source_network: "polygon",
      destination_currency: "usd",
      destination_payment_rails: "ach",
    };

    const result = await transfers.createOfframpQuote("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should accept offramp quote with destination_amount", async () => {
    const validData: CreateOfframpQuoteRequest = {
      destination_amount: "95.00",
      source_token: "usdc",
      source_network: "polygon",
      destination_currency: "usd",
      destination_payment_rails: "ach",
    };

    const result = await transfers.createOfframpQuote("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should reject quote without any amount", async () => {
    try {
      await transfers.createOfframpQuote("cust_123", {
        source_token: "usdc",
        source_network: "polygon",
        destination_currency: "usd",
        destination_payment_rails: "ach",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject invalid token", async () => {
    try {
      await transfers.createOfframpQuote("cust_123", {
        source_amount: "100.00",
        source_token: "bitcoin",
        source_network: "polygon",
        destination_currency: "usd",
        destination_payment_rails: "ach",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject invalid network", async () => {
    try {
      await transfers.createOfframpQuote("cust_123", {
        source_amount: "100.00",
        source_token: "usdc",
        source_network: "bitcoin_network",
        destination_currency: "usd",
        destination_payment_rails: "ach",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should accept valid onramp quote", async () => {
    const validData: CreateOnrampQuoteRequest = {
      source_amount: "100.00",
      source_currency: "usd",
      source_payment_rails: "ach",
      destination_token: "usdc",
      destination_network: "polygon",
    };

    const result = await transfers.createOnrampQuote("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should accept transfer with external account", async () => {
    const validData: CreateOfframpTransferRequest = {
      transfer_purpose: "commercial_investment",
      destination_external_account_id: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = await transfers.createOfframpTransfer(
      "cust_123",
      "quote_123",
      validData
    );
    expect(result).toBeDefined();
  });

  test("should reject transfer without destination", async () => {
    try {
      await transfers.createOfframpTransfer("cust_123", "quote_123", {
        transfer_purpose: "commercial_investment",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject invalid transfer purpose", async () => {
    try {
      await transfers.createOfframpTransfer("cust_123", "quote_123", {
        transfer_purpose: "buying_candy",
        destination_external_account_id: "123e4567-e89b-12d3-a456-426614174000",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
