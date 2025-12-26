import { describe, expect, test } from "bun:test";
import { Tokens } from "@/resources/blockchain/tokens/tokens.resource";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import type {
  Network,
  Token,
} from "@/resources/blockchain/wallets/wallets.types";

describe("Blockchain Tokens", () => {
  const providers: Providers = new Providers();
  const tokens: Tokens = new Tokens(providers);

  test("should get token balance", async () => {
    const walletAddress: string = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const token: Token = "usdc";
    const network: Network = "polygon";

    const balance: string = await tokens.getBalance(
      walletAddress,
      token,
      network
    );

    expect(balance).toBeDefined();
    expect(typeof balance).toBe("string");
  });
});
