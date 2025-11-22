/**
 * Wallet Signing Handlers
 *
 * Internal handlers for signing messages and typed data using wallet private keys.
 * These functions handle cryptographic signing operations for authentication and transactions.
 *
 * **Signing Methods:**
 * - Message signing: For simple string/bytes signatures
 * - EIP-712 typed data signing: For structured data signatures
 *
 * @module wallets/handlers/sign
 */
import { Wallet as EthersWallet } from "ethers";
import type { TypedDataDomain, TypedDataField } from "ethers";
import type { Wallet } from "@/resources/blockchain/wallets/wallets.types";

/**
 * Signs a raw message using the wallet's private key.
 *
 * This function creates a signature for a plain text message or bytes.
 * The signature can be used for authentication or proof of ownership.
 *
 * **Implementation Details:**
 * - Creates a signer from the wallet's private key
 * - Signs the message using ECDSA
 * - Returns a hex-encoded signature string
 *
 * **Security:**
 * - Never sign messages from untrusted sources
 * - Verify the message content before signing
 * - Signatures can be used to authorize actions
 *
 * @param wallet - The wallet to sign with (must contain private key)
 * @param message - The message string or bytes to sign
 *
 * @returns Promise resolving to the signature as a hex string (e.g., "0x...")
 *
 * @throws {Error} If signing fails or the private key is invalid
 *
 * @internal This is an internal handler called by the Wallets resource
 *
 * @example
 * ```typescript
 * const signature = await signMessage(
 *   wallet,
 *   "Hello, World!"
 * );
 * console.log(`Signature: ${signature}`);
 * ```
 */
export async function signMessage(
  wallet: Wallet,
  message: string
): Promise<string> {
  const signer = new EthersWallet(wallet.privateKey);
  return signer.signMessage(message);
}

/**
 * Signs EIP-712 typed data using the wallet's private key.
 *
 * This function creates a signature for structured data following the EIP-712 standard.
 * EIP-712 is commonly used for signing transactions, permits, and other structured data
 * in a human-readable and secure way.
 *
 * **Implementation Details:**
 * - Creates a signer from the wallet's private key
 * - Signs the typed data according to EIP-712 specification
 * - Returns a hex-encoded signature string
 *
 * **EIP-712 Structure:**
 * - Domain: Identifies the signing domain (contract, chain ID, etc.)
 * - Types: Defines the structure of the data being signed
 * - Value: The actual data to sign
 *
 * **Security:**
 * - Always verify the domain matches the expected contract
 * - Review the types and values before signing
 * - EIP-712 signatures are binding and can authorize actions
 *
 * @param wallet - The wallet to sign with (must contain private key)
 * @param domain - The EIP-712 domain separator (contract address, chain ID, etc.)
 * @param types - The type definitions for the data structure
 * @param value - The actual data to sign
 *
 * @returns Promise resolving to the signature as a hex string (e.g., "0x...")
 *
 * @throws {Error} If signing fails, the private key is invalid, or the typed data is malformed
 *
 * @internal This is an internal handler called by the Wallets resource
 *
 * @example
 * ```typescript
 * const signature = await signTypedData(
 *   wallet,
 *   { name: 'MyDApp', version: '1', chainId: 1, verifyingContract: '0x...' },
 *   { Permit: [{ name: 'owner', type: 'address' }, ...] },
 *   { owner: '0x...', spender: '0x...', value: '1000' }
 * );
 * ```
 */
export async function signTypedData(
  wallet: Wallet,
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, unknown>
): Promise<string> {
  const signer = new EthersWallet(wallet.privateKey);
  return signer.signTypedData(domain, types, value);
}
