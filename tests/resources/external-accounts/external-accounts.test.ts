import { describe, expect, test } from "bun:test";
import { ExternalAccountsResource } from "@/resources/external-accounts/external-accounts.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type { CreateExternalAccountRequest } from "@/resources/external-accounts/external-accounts.types";

describe("ExternalAccountsResource Validation", () => {
  const mockClient = {
    get: async () => ({ items: [] }),
    post: async () => ({ id: "ext_123" }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const externalAccounts = new ExternalAccountsResource(mockClient);

  test("should accept valid IBAN account", async () => {
    const validData: CreateExternalAccountRequest = {
      bank_name: "Deutsche Bank",
      account_holder_type: "individual",
      account_holder_first_name: "John",
      account_holder_last_name: "Doe",
      account_holder_address: {
        country: "DE",
        city: "Berlin",
        street_line_1: "Hauptstrasse 1",
        postal_code: "10115",
      },
      account_type: "iban",
      iban: {
        bic: "DEUTDEFF",
        iban_number: "DE89370400440532013000",
      },
    };

    const result = await externalAccounts.create("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should accept valid US account", async () => {
    const validData: CreateExternalAccountRequest = {
      bank_name: "Chase Bank",
      account_holder_type: "business",
      account_holder_business_name: "Acme Corp",
      account_holder_address: {
        country: "US",
        city: "New York",
        street_line_1: "123 Main St",
        postal_code: "10001",
      },
      account_type: "us",
      us: {
        account_number: "1234567890",
        routing_number: "021000021",
      },
    };

    const result = await externalAccounts.create("cust_123", validData);
    expect(result).toBeDefined();
  });

  test("should reject IBAN account_type without iban details", async () => {
    const invalidData = {
      customer_id: "cust_123",
      bank_name: "Test Bank",
      account_holder_type: "individual",
      account_holder_first_name: "John",
      account_holder_last_name: "Doe",
      account_holder_address: {
        country: "DE",
        city: "Berlin",
        street_line_1: "Test St",
        postal_code: "10115",
      },
      account_type: "iban",
      // Missing iban details
    };

    try {
      await externalAccounts.create(invalidData);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject invalid country code", async () => {
    const invalidData = {
      customer_id: "cust_123",
      bank_name: "Test Bank",
      account_holder_type: "individual",
      account_holder_first_name: "John",
      account_holder_last_name: "Doe",
      account_holder_address: {
        country: "USA", // Should be 2 characters
        city: "New York",
        street_line_1: "123 Main St",
        postal_code: "10001",
      },
      account_type: "us",
      us: {
        account_number: "1234567890",
        routing_number: "021000021",
      },
    };

    try {
      await externalAccounts.create(invalidData);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
