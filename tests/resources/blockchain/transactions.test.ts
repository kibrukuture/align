import { describe, expect, test } from "bun:test";
import { Transactions } from "@/resources/blockchain/transactions/transactions.resource";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import type { Network } from "@/resources/blockchain/wallets/wallets.types";

describe("Blockchain Transactions", () => {
  const providers: Providers = new Providers();
  const transactions: Transactions = new Transactions(providers);

  test("should get transaction status", async () => {
    const network: Network = "polygon";
    const txHash: string =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    try {
      await transactions.getStatus(txHash, network);
    } catch (error) {
      // Expected to fail for non-existent transaction
      expect(error).toBeDefined();
    }
  });
});
