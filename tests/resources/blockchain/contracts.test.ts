import { describe, expect, test } from "bun:test";
import { Contracts } from "@/resources/blockchain/contracts/contracts.resource";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import type { Network } from "@/resources/blockchain/wallets/wallets.types";

describe("Blockchain Contracts", () => {
  const providers: Providers = new Providers();
  const contracts: Contracts = new Contracts(providers);

  test("should call read-only contract method", async () => {
    const network: Network = "polygon";
    const usdcAddress: string = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const abi: string[] = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
    ];

    const name = await contracts.read({
      address: usdcAddress,
      abi: abi,
      method: "name",
      args: [],
      network: network,
    });

    expect(name).toBeDefined();
    expect(typeof name).toBe("string");
  });
});
