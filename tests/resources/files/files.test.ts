import { describe, expect, test } from "bun:test";
import { FilesResource } from "@/resources/files/files.resource";
import { HttpClient } from "@/core/http-client";
import { AlignValidationError } from "@/core/errors";

describe("FilesResource", () => {
  const mockClient: HttpClient = {
    get: async () => ({ id: "file_123" }),
    post: async () => ({ id: "file_123" }),
    put: async () => ({}),
    delete: async () => ({}),
  } as unknown as HttpClient;

  const files: FilesResource = new FilesResource(mockClient);

  test("should accept File object", async () => {
    const file: File = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    const result = await files.upload(file);
    expect(result).toBeDefined();
  });

  test("should accept Blob object", async () => {
    const blob: Blob = new Blob(["test content"], { type: "application/pdf" });

    const result = await files.upload(blob);
    expect(result).toBeDefined();
  });

  test("should reject non-File/Blob object", async () => {
    try {
      await files.upload("not a file" as any);
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(AlignValidationError);
    }
  });
});
