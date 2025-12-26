import { describe, expect, test } from "bun:test";
import { Wallets } from "@/resources/blockchain/wallets/wallets.resource";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import type {
  Network,
  Wallet,
} from "@/resources/blockchain/wallets/wallets.types";

describe("Blockchain Wallets", () => {
  const providers: Providers = new Providers();
  const wallets: Wallets = new Wallets(providers);

  test("should create random wallet", async () => {
    const wallet: Wallet = await wallets.create();

    expect(wallet).toBeDefined();
    expect(wallet.address).toBeDefined();
    expect(wallet.privateKey).toBeDefined();
    expect(wallet.mnemonic).toBeDefined();
    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test("should create wallet from mnemonic", async () => {
    const mnemonic: string =
      "test test test test test test test test test test test junk";

    const wallet: Wallet = await wallets.createFromMnemonic(mnemonic);

    expect(wallet).toBeDefined();
    expect(wallet.address).toBeDefined();
    expect(wallet.mnemonic).toBeDefined();
    expect(wallet?.mnemonic?.phrase).toBe(mnemonic);
  });

  test("should create wallet from private key", async () => {
    const privateKey: string =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    const wallet: Wallet = await wallets.createFromPrivateKey(privateKey);

    expect(wallet).toBeDefined();
    expect(wallet.address).toBeDefined();
    expect(wallet.privateKey).toBe(privateKey);
  });

  test("should get wallet balance", async () => {
    const address: string = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const network: Network = "polygon";

    const balance: string = await wallets.getBalance(address, network);

    expect(balance).toBeDefined();
    expect(typeof balance).toBe("string");
  });

  test("should reject invalid mnemonic", async () => {
    try {
      await wallets.createFromMnemonic("invalid mnemonic phrase");
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test("should reject invalid private key", async () => {
    try {
      await wallets.createFromPrivateKey("invalid_key");
      throw new Error("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
