/**
 * Wallets Resource
 * 
 * This is a thin wrapper class that handles validation, orchestration, and error handling.
 * Complex business logic is delegated to handlers in the handlers/ folder.
 * 
 * Responsibilities:
 * - Input validation (using Zod schemas)
 * - Error handling and formatting
 * - Orchestrating handler calls
 * - Simple data preparation
 * 
 * Business logic (wallet creation, encryption, etc.) is in handlers/.
 */

import { AlignValidationError } from '@/core/errors';
import { formatZodError } from '@/core/validation';
import { ProvidersResource } from '../providers/providers.resource';
import * as Handlers from './handlers';
import type { Wallet, CreateWalletRequest, EncryptedWallet } from './wallets.types';
import { CreateWalletSchema, EncryptSchema } from './wallets.validator';

export class WalletsResource {
  constructor(private providers: ProvidersResource) {}

  /**
   * Create a new random wallet
   * Thin wrapper: validates input, calls handler, handles errors
   */
  public async create(): Promise<Wallet> {
    // Simple validation (if needed)
    // Call handler for complex logic
    return Handlers.createWalletHandler();
  }

  /**
   * Create wallet from mnemonic phrase
   */
  public async createFromMnemonic(mnemonic: string): Promise<Wallet> {
    // Validate mnemonic format
    const validation = CreateWalletSchema.safeParse({ mnemonic });
    if (!validation.success) {
      throw new AlignValidationError('Invalid mnemonic', formatZodError(validation.error));
    }

    // Call handler for complex logic
    return Handlers.createFromMnemonicHandler(mnemonic);
  }

  /**
   * Create wallet from private key
   */
  public async createFromPrivateKey(privateKey: string): Promise<Wallet> {
    // Validate private key format
    const validation = CreateWalletSchema.safeParse({ privateKey });
    if (!validation.success) {
      throw new AlignValidationError('Invalid private key', formatZodError(validation.error));
    }

    // Call handler for complex logic
    return Handlers.createFromPrivateKeyHandler(privateKey);
  }

  /**
   * Create wallet from encrypted data
   */
  public async createFromEncrypted(encrypted: string, password: string): Promise<Wallet> {
    // Validate encrypted data format
    const validation = CreateWalletSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid encrypted data', formatZodError(validation.error));
    }

    // Call handler for complex logic
    return Handlers.createFromEncryptedHandler(encrypted, password);
  }

  /**
   * Get wallet address
   */
  public getAddress(wallet: Wallet): string {
    // Simple logic: extract address from wallet object
    return Handlers.getAddressFromWalletHandler(wallet);
  }

  /**
   * Get native token balance
   */
  public async getBalance(address: string, network: string): Promise<string> {
    // Validate address format
    // Get provider from providers resource
    const provider = this.providers.getProvider(network);
    
    // Call handler for complex logic
    return Handlers.getBalanceHandler(address, network, provider);
  }

  /**
   * Get ERC-20 token balance
   */
  public async getTokenBalance(address: string, token: string, network: string): Promise<string> {
    // Validate inputs
    // Get provider and token address
    const provider = this.providers.getProvider(network);
    
    // Call handler for complex logic
    return Handlers.getTokenBalanceHandler(address, token, network, provider);
  }

  /**
   * Send native token
   */
  public async sendNativeToken(wallet: Wallet, to: string, amount: string, network: string): Promise<any> {
    // Validate inputs
    // Get provider
    const provider = this.providers.getProvider(network);
    
    // Call handler for complex logic
    return Handlers.sendNativeTokenHandler(wallet, to, amount, network, provider);
  }

  /**
   * Send ERC-20 token
   */
  public async sendToken(wallet: Wallet, token: string, to: string, amount: string, network: string): Promise<any> {
    // Validate inputs
    // Get provider
    const provider = this.providers.getProvider(network);
    
    // Call handler for complex logic
    return Handlers.sendTokenHandler(wallet, token, to, amount, network, provider);
  }

  /**
   * Encrypt private key
   */
  public async encryptPrivateKey(privateKey: string, password: string): Promise<EncryptedWallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ privateKey, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
    }

    // Call handler for complex encryption logic
    return Handlers.encryptPrivateKeyHandler(privateKey, password);
  }

  /**
   * Decrypt private key
   */
  public async decryptPrivateKey(encrypted: string, password: string): Promise<string> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
    }

    // Call handler for complex decryption logic
    return Handlers.decryptPrivateKeyHandler(encrypted, password);
  }

  /**
   * Encrypt entire wallet
   */
  public async encryptWallet(wallet: Wallet, password: string): Promise<EncryptedWallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ wallet, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
    }

    // Call handler for complex encryption logic
    return Handlers.encryptWalletHandler(wallet, password);
  }

  /**
   * Decrypt wallet
   */
  public async decryptWallet(encrypted: string, password: string): Promise<Wallet> {
    // Validate inputs
    const validation = EncryptSchema.safeParse({ encrypted, password });
    if (!validation.success) {
      throw new AlignValidationError('Invalid input', formatZodError(validation.error));
    }

    // Call handler for complex decryption logic
    return Handlers.decryptWalletHandler(encrypted, password);
  }
}

