import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import * as Handlers from "@/resources/blockchain/wallets/handlers";
import type {
  Wallet,
  EncryptedWallet,
  Network,
} from "@/resources/blockchain/wallets/wallets.types";
import type { Transaction } from "@/resources/blockchain/transactions/transactions.types";
import type { TypedDataDomain, TypedDataField } from "ethers";
import {
  CreateWalletSchema,
  EncryptSchema,
} from "@/resources/blockchain/wallets/wallets.validator";
/**
 * Wallets
 *
 * The main entry point for all wallet-related operations in the SDK.
 * This class acts as a facade/orchestrator that:
 * 1. Validates user inputs using Zod schemas
 * 2. Manages dependencies (like Providers)
 * 3. Delegates complex business logic to specialized handlers
 * 4. Standardizes error handling
 *
 * **Key Features:**
 * - Wallet creation (random, mnemonic, private key)
 * - Encryption/Decryption (AES-256-GCM)
 * - Balance checking (Native & ERC-20)
 * - Transaction sending (Native & ERC-20)
 *
 * @example
 * Initialize the resource
 * ```typescript
 * import Align from '@tolbel/align';
 *
 * const align = new Align({ apiKey: '...' });
 * const wallets = align.blockchain.wallets;
 * ```
 */
export class Wallets {
  constructor(private providers: Providers) {}

  /**
   * Creates a new random cryptocurrency wallet
   *
   * Generates a fresh wallet with a cryptographically secure random private key.
   *
   * @returns {Promise<Wallet>} A new wallet object with address, private key, and mnemonic
   *
   * @example
   * ```typescript
   * const wallet = await align.blockchain.wallets.create();
   * console.log(wallet.address);
   * console.log(wallet.mnemonic); // Save this securely!
   * ```
   */
  public async create(): Promise<Wallet> {
    // Simple validation (if needed)
    // Call handler for complex logic
    return Handlers.createWallet();
  }

  /**
   * Restores a wallet from a mnemonic phrase (seed phrase)
   *
   * @param {string} mnemonic - The 12 or 24 word recovery phrase
   *
   * @returns {Promise<Wallet>} The restored wallet object
   *
   * @throws {AlignValidationError} If the mnemonic is invalid
   *
   * @example
   * ```typescript
   * const mnemonic = "witch collapse practice feed shame open despair creek road again ice least";
   * const wallet = await align.blockchain.wallets.createFromMnemonic(mnemonic);
   * ```
   */
  public async createFromMnemonic(mnemonic: string): Promise<Wallet> {
    // Validate mnemonic format
    const validation = CreateWalletSchema.safeParse({ mnemonic });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid mnemonic",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex logic
    return Handlers.createFromMnemonic(mnemonic);
  }

  /**
   * Imports a wallet from a private key
   *
   * @param {string} privateKey - The private key string (with or without '0x' prefix)
   *
   * @returns {Promise<Wallet>} The imported wallet object
   *
   * @throws {AlignValidationError} If the private key is invalid
   *
   * @example
   * ```typescript
   * const wallet = await align.blockchain.wallets.createFromPrivateKey("0x123...");
   * ```
   */
  public async createFromPrivateKey(privateKey: string): Promise<Wallet> {
    // Validate private key format
    const validation = CreateWalletSchema.safeParse({ privateKey });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid private key",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex logic
    return Handlers.createFromPrivateKey(privateKey);
  }

  /**
   * Decrypts and restores a wallet from an encrypted JSON string
   *
   * @param {string} encrypted - The encrypted wallet JSON string
   * @param {string} password - The password used to encrypt the wallet
   *
   * @returns {Promise<Wallet>} The decrypted wallet object
   *
   * @throws {AlignValidationError} If inputs are invalid
   * @throws {Error} If decryption fails (wrong password)
   *
   * @example
   * ```typescript
   * const wallet = await align.blockchain.wallets.createFromEncrypted(jsonString, "mySecretPass");
   * ```
   */
  public async createFromEncrypted(
    encrypted: string,
    password: string
  ): Promise<Wallet> {
    // Validate encrypted data format
    const validation = CreateWalletSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid encrypted data",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex logic
    return Handlers.createFromEncrypted(encrypted, password);
  }

  /**
   * Extracts the public address from a wallet object
   *
   * @param {Wallet} wallet - The wallet object
   * @returns {string} The public address (e.g., "0x...")
   */
  public getAddress(wallet: Wallet): string {
    // Simple logic: extract address from wallet object
    return Handlers.getAddressFromWallet(wallet);
  }

  /**
   * Gets the native token balance (ETH, POL, etc.) for an address
   *
   * @param {string} address - The wallet address to check
   * @param {Network} network - The network to query
   *
   * @returns {Promise<string>} The balance as a formatted string (e.g., "1.5")
   *
   * @example
   * ```typescript
   * const balance = await align.blockchain.wallets.getBalance(address, "polygon");
   * console.log(`Balance: ${balance} POL`);
   * ```
   */
  public async getBalance(address: string, network: Network): Promise<string> {
    // Validate address format
    // Get provider from providers resource
    const provider = this.providers.getProvider(network);

    // Call handler for complex logic
    return Handlers.getBalance(address, provider);
  }

  /**
   * Gets the balance of an ERC-20 token
   *
   * @param {string} address - The wallet address to check
   * @param {string} token - The token contract address
   * @param {Network} network - The network to query
   *
   * @returns {Promise<string>} The balance as a formatted string (e.g., "100.0")
   *
   * @example
   * ```typescript
   * const usdcBalance = await align.blockchain.wallets.getTokenBalance(
   *   address,
   *   "0x2791...", // USDC Contract
   *   "polygon"
   * );
   * ```
   */
  public async getTokenBalance(
    address: string,
    token: string,
    network: Network
  ): Promise<string> {
    // Validate inputs
    // Get provider and token address
    const provider = this.providers.getProvider(network);

    // Call handler for complex logic
    return Handlers.getTokenBalance(address, token, provider);
  }

  /**
   * Sends a native token transaction
   *
   * @param {Wallet} wallet - The sender's wallet
   * @param {string} to - The recipient's address
   * @param {string} amount - Amount to send (e.g., "0.1")
   * @param {Network} network - The network to use
   *
   * @returns {Promise<Transaction>} The submitted transaction
   *
   * @example
   * ```typescript
   * const tx = await align.blockchain.wallets.sendNativeToken(
   *   wallet,
   *   recipient,
   *   "0.1",
   *   "ethereum"
   * );
   * ```
   */
  public async sendNativeToken(
    wallet: Wallet,
    to: string,
    amount: string,
    network: Network
  ): Promise<Transaction> {
    // Validate inputs
    // Get provider
    const provider = this.providers.getProvider(network);

    // Call handler for complex logic
    return Handlers.sendNativeToken(wallet, to, amount, provider);
  }

  /**
   * Sends an ERC-20 token transaction
   *
   * @param {Wallet} wallet - The sender's wallet
   * @param {string} token - The token contract address
   * @param {string} to - The recipient's address
   * @param {string} amount - Amount to send (e.g., "100.0")
   * @param {Network} network - The network to use
   *
   * @returns {Promise<Transaction>} The submitted transaction
   *
   * @example
   * ```typescript
   * const tx = await align.blockchain.wallets.sendToken(
   *   wallet,
   *   usdcAddress,
   *   recipient,
   *   "50.0",
   *   "polygon"
   * );
   * ```
   */
  public async sendToken(
    wallet: Wallet,
    token: string,
    to: string,
    amount: string,
    network: Network
  ): Promise<Transaction> {
    // Validate inputs
    // Get provider
    const provider = this.providers.getProvider(network);

    // Call handler for complex logic
    return Handlers.sendToken(wallet, token, to, amount, provider);
  }

  /**
   * Encrypts a private key with a password
   *
   * @param {string} privateKey - The private key to encrypt
   * @param {string} password - The password for encryption
   *
   * @returns {Promise<EncryptedWallet>} Encrypted data object
   */
  public async encryptPrivateKey(
    privateKey: string,
    password: string
  ): Promise<EncryptedWallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ privateKey, password });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid input",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex encryption logic
    return Handlers.encryptPrivateKey(privateKey, password);
  }

  /**
   * Decrypts a private key using a password
   *
   * @param {EncryptedWallet} encrypted - The encrypted data object
   * @param {string} password - The password for decryption
   *
   * @returns {Promise<string>} The decrypted private key
   */
  public async decryptPrivateKey(
    encrypted: EncryptedWallet,
    password: string
  ): Promise<string> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid input",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex decryption logic
    return Handlers.decryptPrivateKey(encrypted, password);
  }

  /**
   * Encrypts an entire wallet object
   *
   * @param {Wallet} wallet - The wallet to encrypt
   * @param {string} password - The password for encryption
   *
   * @returns {Promise<EncryptedWallet>} Encrypted data object
   */
  public async encryptWallet(
    wallet: Wallet,
    password: string
  ): Promise<EncryptedWallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ wallet, password });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid input",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex encryption logic
    return Handlers.encryptWallet(wallet, password);
  }

  /**
   * Decrypts a wallet object
   *
   * @param {EncryptedWallet} encrypted - The encrypted data object
   * @param {string} password - The password for decryption
   *
   * @returns {Promise<Wallet>} The decrypted wallet object
   */
  public async decryptWallet(
    encrypted: EncryptedWallet,
    password: string
  ): Promise<Wallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid input",
        formatZodError(validation.error)
      );
    }

    // Call handler for complex decryption logic
    return Handlers.decryptWallet(encrypted, password);
  }
  /**
   * Signs a raw message using the wallet's private key.
   *
   * This method creates a cryptographic signature for a plain text message or bytes.
   * The signature can be used for authentication, proof of ownership, or message verification.
   * The signing is done using ECDSA (Elliptic Curve Digital Signature Algorithm).
   *
   * **What This Does:**
   * 1. Takes your wallet and a message string
   * 2. Uses the wallet's private key to create a unique signature
   * 3. Returns a hex-encoded signature that proves you signed this exact message
   *
   * **Common Use Cases:**
   * - Proving wallet ownership ("Sign this message to prove you own this address")
   * - Authentication for dApps ("Sign in with Ethereum")
   * - Message verification (proving a message came from you)
   * - Off-chain authorization
   *
   * **Security Considerations:**
   * - ⚠️ **NEVER sign messages from untrusted sources**
   * - Always review the message content before signing
   * - Signatures can be used to authorize actions - be careful what you sign
   * - The signature is binding and can be verified by anyone
   *
   * **How Signatures Work:**
   * - Your private key creates a unique signature for the message
   * - Anyone can verify the signature using your public address
   * - The signature proves you (the address owner) signed this exact message
   * - Changing even one character in the message invalidates the signature
   *
   * @param {Wallet} wallet - The wallet to sign with (must contain private key)
   * @param {string} message - The message string to sign (can be any text)
   *
   * @returns {Promise<string>} The signature as a hex string (e.g., "0x1234...")
   *
   * @throws {Error} If signing fails or the private key is invalid
   *
   * @example
   * Basic message signing
   * ```typescript
   * const wallet = await align.blockchain.wallets.create();
   * const signature = await align.blockchain.wallets.signMessage(
   *   wallet,
   *   "Hello, World!"
   * );
   * console.log(`Signature: ${signature}`);
   * ```
   *
   * @example
   * Proof of ownership
   * ```typescript
   * // User proves they own an address
   * const message = `I own this address. Timestamp: ${Date.now()}`;
   * const signature = await align.blockchain.wallets.signMessage(wallet, message);
   *
   * // Send signature to server for verification
   * await fetch('/api/verify', {
   *   method: 'POST',
   *   body: JSON.stringify({ address: wallet.address, message, signature })
   * });
   * ```
   *
   * @example
   * Sign in with Ethereum (SIWE)
   * ```typescript
   * const siweMessage = `example.com wants you to sign in with your Ethereum account:\n${wallet.address}\n\nSign in to Example App\n\nNonce: ${nonce}`;
   * const signature = await align.blockchain.wallets.signMessage(wallet, siweMessage);
   * ```
   */
  public async signMessage(wallet: Wallet, message: string): Promise<string> {
    // No complex validation needed for message string
    return Handlers.signMessage(wallet, message);
  }

  /**
   * Signs EIP-712 typed data using the wallet's private key.
   *
   * This method creates a cryptographic signature for structured data following the EIP-712 standard.
   * EIP-712 is a standard for signing typed, structured data in a human-readable and secure way.
   * It's commonly used for permits, meta-transactions, and other advanced blockchain interactions.
   *
   * **What This Does:**
   * 1. Takes your wallet and structured data (domain, types, value)
   * 2. Formats the data according to EIP-712 specification
   * 3. Creates a signature that proves you approved this specific structured data
   * 4. Returns a hex-encoded signature
   *
   * **What is EIP-712?**
   * EIP-712 is a standard that makes signing structured data:
   * - **Human-readable**: Users can see what they're signing in a clear format
   * - **Type-safe**: Data structure is defined and validated
   * - **Secure**: Prevents signature reuse across different contracts/chains
   *
   * **Common Use Cases:**
   * - ERC-20 Permits (approve token spending without gas)
   * - Meta-transactions (gasless transactions)
   * - NFT minting signatures
   * - DAO voting
   * - Order signing for DEXs (like Uniswap permits)
   *
   * **EIP-712 Structure Explained:**
   * - **Domain**: Identifies WHERE this signature is valid (contract address, chain ID, name, version)
   * - **Types**: Defines the STRUCTURE of your data (like a schema)
   * - **Value**: The ACTUAL data you're signing
   *
   * **Security Considerations:**
   * - ⚠️ **ALWAYS verify the domain** matches the expected contract
   * - Review the types and values carefully before signing
   * - EIP-712 signatures are binding and can authorize token transfers, approvals, etc.
   * - Check the chain ID to ensure you're signing for the correct network
   *
   * @param {Wallet} wallet - The wallet to sign with (must contain private key)
   * @param {TypedDataDomain} domain - The EIP-712 domain separator defining where this signature is valid
   *        - name: Human-readable name of the signing domain (e.g., "MyDApp")
   *        - version: Version of the signing domain (e.g., "1")
   *        - chainId: The chain ID where this signature is valid (e.g., 1 for Ethereum)
   *        - verifyingContract: The contract address that will verify this signature
   * @param {Record<string, TypedDataField[]>} types - The type definitions for the data structure
   *        - Each key is a type name, value is an array of field definitions
   *        - Example: { Permit: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }] }
   * @param {Record<string, unknown>} value - The actual data to sign, must match the types structure
   *
   * @returns {Promise<string>} The signature as a hex string (e.g., "0x1234...")
   *
   * @throws {Error} If signing fails, the private key is invalid, or the typed data is malformed
   *
   * @example
   * ERC-20 Permit (gasless approval)
   * ```typescript
   * import { TypedDataDomain, TypedDataField } from 'ethers';
   *
   * const domain: TypedDataDomain = {
   *   name: 'USD Coin',
   *   version: '1',
   *   chainId: 137, // Polygon
   *   verifyingContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // USDC on Polygon
   * };
   *
   * const types: Record<string, TypedDataField[]> = {
   *   Permit: [
   *     { name: 'owner', type: 'address' },
   *     { name: 'spender', type: 'address' },
   *     { name: 'value', type: 'uint256' },
   *     { name: 'nonce', type: 'uint256' },
   *     { name: 'deadline', type: 'uint256' }
   *   ]
   * };
   *
   * const value = {
   *   owner: wallet.address,
   *   spender: '0x...', // Contract that will spend tokens
   *   value: '1000000000', // Amount to approve (1000 USDC with 6 decimals)
   *   nonce: 0,
   *   deadline: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
   * };
   *
   * const signature = await align.blockchain.wallets.signTypedData(
   *   wallet,
   *   domain,
   *   types,
   *   value
   * );
   *
   * // Use signature with permit function (gasless approval)
   * // await contract.permit(owner, spender, value, deadline, v, r, s);
   * ```
   *
   * @example
   * NFT Minting Signature
   * ```typescript
   * const domain = {
   *   name: 'MyNFT',
   *   version: '1',
   *   chainId: 1,
   *   verifyingContract: '0x...' // NFT contract address
   * };
   *
   * const types = {
   *   MintRequest: [
   *     { name: 'to', type: 'address' },
   *     { name: 'tokenId', type: 'uint256' },
   *     { name: 'uri', type: 'string' }
   *   ]
   * };
   *
   * const value = {
   *   to: wallet.address,
   *   tokenId: 123,
   *   uri: 'ipfs://...'
   * };
   *
   * const signature = await align.blockchain.wallets.signTypedData(
   *   wallet,
   *   domain,
   *   types,
   *   value
   * );
   * ```
   */
  public async signTypedData(
    wallet: Wallet,
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, unknown>
  ): Promise<string> {
    // No complex validation needed for typed data objects
    return Handlers.signTypedData(wallet, domain, types, value);
  }
}
