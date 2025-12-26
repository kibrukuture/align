import { describe, expect, test } from "bun:test";
import { VirtualAccountsResource } from "@/resources/virtual-accounts/virtual-accounts.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type {
  CreateVirtualAccountRequest,
  SourceCurrency,
  DestinationToken,
  DestinationNetwork,
} from "@/resources/virtual-accounts/virtual-accounts.types";

describe("VirtualAccountsResource Validation", () => {
  const mockClient = {
    get: async () => ({ id: "va_123" }),
    post: async () => ({ id: "va_123" }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const virtualAccounts = new VirtualAccountsResource(mockClient);

  test("should accept valid virtual account creation", async () => {
    const validData: CreateVirtualAccountRequest = {
      source_currency: "usd" as SourceCurrency,
      destination_token: "usdc" as DestinationToken,
      destination_network: "polygon" as DestinationNetwork,
      destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    };

    const result = await virtualAccounts.create("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should accept EUR currency", async () => {
    const validData: CreateVirtualAccountRequest = {
      source_currency: "eur" as SourceCurrency,
      destination_token: "usdt" as DestinationToken,
      destination_network: "ethereum" as DestinationNetwork,
      destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    };

    const result = await virtualAccounts.create("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should reject invalid currency", async () => {
    const invalidData = {
      source_currency: "gbp", // Not in enum
      destination_token: "usdc",
      destination_network: "polygon",
      destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    };

    try {
      await virtualAccounts.create(
        "cust_123",
        invalidData as CreateVirtualAccountRequest
      );
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject invalid token", async () => {
    const invalidData = {
      source_currency: "usd",
      destination_token: "dai", // Not in enum
      destination_network: "polygon",
      destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    };

    try {
      await virtualAccounts.create(
        "cust_123",
        invalidData as CreateVirtualAccountRequest
      );
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject missing destination_address", async () => {
    const invalidData = {
      source_currency: "usd",
      destination_token: "usdc",
      destination_network: "polygon",
    };

    try {
      await virtualAccounts.create(
        "cust_123",
        invalidData as CreateVirtualAccountRequest
      );
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
