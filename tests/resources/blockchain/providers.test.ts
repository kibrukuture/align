import { describe, expect, test } from "bun:test";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import type { Network } from "@/resources/blockchain/wallets/wallets.types";

describe("Blockchain Providers", () => {
  const providers: Providers = new Providers();

  test("should get provider for Polygon", () => {
    const network: Network = "polygon";

    const provider = providers.getProvider(network);

    expect(provider).toBeDefined();
  });

  test("should get provider for Ethereum", () => {
    const network: Network = "ethereum";

    const provider = providers.getProvider(network);

    expect(provider).toBeDefined();
  });

  test("should get provider for Base", () => {
    const network: Network = "base";

    const provider = providers.getProvider(network);

    expect(provider).toBeDefined();
  });

  test("should get provider for Arbitrum", () => {
    const network: Network = "arbitrum";

    const provider = providers.getProvider(network);

    expect(provider).toBeDefined();
  });
});
