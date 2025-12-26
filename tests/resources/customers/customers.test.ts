import { describe, expect, test } from "bun:test";
import { CustomersResource } from "@/resources/customers/customers.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";
import type { CreateCustomerRequest } from "@/resources/customers/customers.types";

describe("CustomersResource Validation", () => {
  const mockClient = {
    get: async () => ({ customer_id: "test_123" }),
    post: async () => ({ customer_id: "test_123" }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const customers = new CustomersResource(mockClient);

  test("should accept valid individual customer", async () => {
    const validData: CreateCustomerRequest = {
      email: "alice@example.com",
      type: "individual",
      first_name: "Alice",
      last_name: "Smith",
    };

    const result = await customers.create(validData);
    expect(result).toBeDefined();
    expect(result.customer_id).toBe("test_123");
  });

  test("should accept individual customer without optional fields", async () => {
    const validData: CreateCustomerRequest = {
      email: "alice@example.com",
      type: "individual",
    };

    const result = await customers.create(validData);
    expect(result).toBeDefined();
  });

  test("should reject invalid email", async () => {
    try {
      await customers.create({
        email: "not-an-email",
        type: "individual",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should reject missing required email field", async () => {
    try {
      await customers.create({
        type: "individual",
        first_name: "Alice",
      } as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });

  test("should accept valid corporate customer", async () => {
    const validData: CreateCustomerRequest = {
      email: "contact@acme.com",
      type: "corporate",
      company_name: "Acme Corporation",
    };

    const result = await customers.create(validData);
    expect(result).toBeDefined();
  });

  test("should accept corporate customer without optional company_name", async () => {
    const validData: CreateCustomerRequest = {
      email: "contact@acme.com",
      type: "corporate",
    };

    const result = await customers.create(validData);
    expect(result).toBeDefined();
  });
});
