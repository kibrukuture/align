/**
 * ENS (Ethereum Name Service) Utilities
 *
 * Provides helper functions for resolving ENS names to addresses and vice versa.
 * These functions rely on the connected provider's network supporting ENS (mainly Ethereum Mainnet).
 */
import { JsonRpcProvider } from "ethers";

/**
 * Resolves an ENS name to an Ethereum address.
 *
 * @param name - The ENS name to resolve (e.g., "vitalik.eth")
 * @param provider - The connected provider
 * @returns The resolved address or null if not found
 */
export async function resolveName(
  name: string,
  provider: JsonRpcProvider
): Promise<string | null> {
  return provider.resolveName(name);
}

/**
 * Performs a reverse lookup of an address to an ENS name.
 *
 * @param address - The address to lookup
 * @param provider - The connected provider
 * @returns The ENS name or null if not found
 */
export async function lookupAddress(
  address: string,
  provider: JsonRpcProvider
): Promise<string | null> {
  return provider.lookupAddress(address);
}
