import { describe, expect, test } from "bun:test";
import { WalletsResource } from "@/resources/wallets/wallets.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";

describe("WalletsResource Validation", () => {
  const mockClient: HttpClient = {
    get: async () => ({ items: [] }),
    post: async () => ({ verified: true }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const wallets: WalletsResource = new WalletsResource(mockClient);

  test("should accept valid wallet verification", async () => {
    const result = await wallets.verifyOwnership(
      "cust_123",
      "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    );
    expect(result).toBeDefined();
  });

  test("should reject empty wallet address", async () => {
    try {
      await wallets.verifyOwnership("cust_123", "");
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject missing wallet address", async () => {
    try {
      await wallets.verifyOwnership("cust_123", undefined as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
