import { describe, expect, test } from "bun:test";
import { CrossChainResource } from "@/resources/cross-chain/cross-chain.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type { CreateCrossChainTransferRequest } from "@/resources/cross-chain/cross-chain.types";

describe("CrossChainResource Validation", () => {
  const mockClient: HttpClient = {
    get: async () => ({ id: "cc_123" }),
    post: async () => ({ id: "cc_123" }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const crossChain: CrossChainResource = new CrossChainResource(mockClient);

  test("should accept valid cross-chain transfer", async () => {
    const validData: CreateCrossChainTransferRequest = {
      amount: "100.50",
      source_network: "polygon",
      source_token: "usdc",
      destination_network: "ethereum",
      destination_token: "usdt",
      destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    };

    const result = await crossChain.createTransfer("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should accept same network different token", async () => {
    const validData: CreateCrossChainTransferRequest = {
      amount: "50.00",
      source_network: "polygon",
      source_token: "usdc",
      destination_network: "polygon",
      destination_token: "usdt",
      destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    };

    const result = await crossChain.createTransfer("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should reject invalid amount format", async () => {
    try {
      await crossChain.createTransfer("cust_123", {
        customer_id: "cust_123",
        amount: "invalid",
        source_network: "polygon",
        source_token: "usdc",
        destination_network: "ethereum",
        destination_token: "usdt",
        destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject invalid source network", async () => {
    try {
      await crossChain.createTransfer("cust_123", {
        customer_id: "cust_123",
        amount: "100.00",
        source_network: "bitcoin",
        source_token: "usdc",
        destination_network: "ethereum",
        destination_token: "usdt",
        destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
