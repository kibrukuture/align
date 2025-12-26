import { describe, expect, test } from "bun:test";
import { DevelopersResource } from "@/resources/developers/developers.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type { UpdateDeveloperFeesRequest } from "@/resources/developers/developers.types";

describe("DevelopersResource Validation", () => {
  const mockClient: HttpClient = {
    get: async () => ({ developer_receivable_fees: {} }),
    post: async () => ({}),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const developers: DevelopersResource = new DevelopersResource(mockClient);

  test("should accept valid fee update", async () => {
    const validData: UpdateDeveloperFeesRequest = {
      developer_receivable_fees: {
        onramp: 0.5,
        offramp: 0.3,
        cross_chain_transfer: 0.2,
      },
    };

    const result = await developers.updateFees(validData);
    expect(result).toBeDefined();
  });

  test("should accept partial fee update", async () => {
    const validData: UpdateDeveloperFeesRequest = {
      developer_receivable_fees: {
        onramp: 1.0,
      },
    };

    const result = await developers.updateFees(validData);
    expect(result).toBeDefined();
  });

  test("should reject fee above 100", async () => {
    try {
      await developers.updateFees({
        developer_receivable_fees: {
          onramp: 150,
        },
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject negative fee", async () => {
    try {
      await developers.updateFees({
        developer_receivable_fees: {
          offramp: -5,
        },
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
