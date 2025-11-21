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
 * const sdk = new AlignSDK({ apiKey: '...' });
 * const wallets = sdk.blockchain.wallets;
 * ```
 */
import { AlignValidationError } from '@/core/errors';
import { formatZodError } from '@/core/validation';
import { Providers } from '@/resources/blockchain/providers/providers.resource';
import * as Handlers from '@/resources/blockchain/wallets/handlers';
import type { Wallet, EncryptedWallet, Network } from '@/resources/blockchain/wallets/wallets.types';
import type { Transaction } from '@/resources/blockchain/transactions/transactions.types';
import { CreateWalletSchema, EncryptSchema } from '@/resources/blockchain/wallets/wallets.validator';

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
   * const wallet = await sdk.blockchain.wallets.create();
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
   * const wallet = await sdk.blockchain.wallets.createFromMnemonic(mnemonic);
   * ```
   */
  public async createFromMnemonic(mnemonic: string): Promise<Wallet> {
    // Validate mnemonic format
    const validation = CreateWalletSchema.safeParse({ mnemonic });
    if (!validation.success) {
      throw new AlignValidationError('Invalid mnemonic', formatZodError(validation.error));
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
   * const wallet = await sdk.blockchain.wallets.createFromPrivateKey("0x123...");
   * ```
   */
  public async createFromPrivateKey(privateKey: string): Promise<Wallet> {
    // Validate private key format
    const validation = CreateWalletSchema.safeParse({ privateKey });
    if (!validation.success) {
      throw new AlignValidationError('Invalid private key', formatZodError(validation.error));
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
   * const wallet = await sdk.blockchain.wallets.createFromEncrypted(jsonString, "mySecretPass");
   * ```
   */
  public async createFromEncrypted(encrypted: string, password: string): Promise<Wallet> {
    // Validate encrypted data format
    const validation = CreateWalletSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid encrypted data', formatZodError(validation.error));
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
   * Gets the native token balance (ETH, MATIC, etc.) for an address
   *
   * @param {string} address - The wallet address to check
   * @param {Network} network - The network to query
   *
   * @returns {Promise<string>} The balance as a formatted string (e.g., "1.5")
   *
   * @example
   * ```typescript
   * const balance = await sdk.blockchain.wallets.getBalance(address, "polygon");
   * console.log(`Balance: ${balance} MATIC`);
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
   * const usdcBalance = await sdk.blockchain.wallets.getTokenBalance(
   *   address,
   *   "0x2791...", // USDC Contract
   *   "polygon"
   * );
   * ```
   */
  public async getTokenBalance(address: string, token: string, network: Network): Promise<string> {
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
   * const tx = await sdk.blockchain.wallets.sendNativeToken(
   *   wallet,
   *   recipient,
   *   "0.1",
   *   "ethereum"
   * );
   * ```
   */
  public async sendNativeToken(wallet: Wallet, to: string, amount: string, network: Network): Promise<Transaction> {
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
   * const tx = await sdk.blockchain.wallets.sendToken(
   *   wallet,
   *   usdcAddress,
   *   recipient,
   *   "50.0",
   *   "polygon"
   * );
   * ```
   */
  public async sendToken(wallet: Wallet, token: string, to: string, amount: string, network: Network): Promise<Transaction> {
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
  public async encryptPrivateKey(privateKey: string, password: string): Promise<EncryptedWallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ privateKey, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
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
  public async decryptPrivateKey(encrypted: EncryptedWallet, password: string): Promise<string> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
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
  public async encryptWallet(wallet: Wallet, password: string): Promise<EncryptedWallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ wallet, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
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
  public async decryptWallet(encrypted: EncryptedWallet, password: string): Promise<Wallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
    }

    // Call handler for complex decryption logic
    return Handlers.decryptWallet(encrypted, password);
  }
}

