/**
 * @schnl/align - TypeScript SDK for AlignLab API
 * 
 * Build powerful payment infrastructure with support for:
 * - Fiat-to-crypto (onramp) and crypto-to-fiat (offramp) transfers
 * - Cross-chain cryptocurrency transfers
 * - Virtual bank accounts
 * - External account linking
 * - Wallet ownership verification
 * - Webhook management
 * 
 * @example
 * ```typescript
 * import Align from '@schnl/align';
 * 
 * const align = new Align({
 *   apiKey: 'your_api_key',
 *   environment: 'sandbox',
 * });
 * 
 * const customer = await align.customers.create({
 *   email: 'user@example.com',
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   type: 'individual',
 * });
 * ```
 * 
 * @packageDocumentation
 */

// Main client export
import { Align } from '@/client';
export { Align };
export default Align;

// Core types and configuration
export type { AlignConfig, AlignEnvironment, KycStatus, WebhookStatus, CustomerType } from '@/types/common';
export { AlignError, AlignValidationError } from '@/core/errors';

// Customer types
export type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerListResponse,
  KycSessionResponse,
  CustomerAddress,
  CustomerKycs,
  KycStatusBreakdown,
  KycSubStatus,
  CustomerDocument,
} from '@/resources/customers/customers.types';

// Virtual Account types
export type {
  VirtualAccount,
  CreateVirtualAccountRequest,
} from '@/resources/virtual-accounts/virtual-accounts.types';

// Transfer types
export type {
  Transfer,
  QuoteResponse,
  CreateOfframpQuoteRequest,
  CreateOfframpTransferRequest,
  CreateOnrampQuoteRequest,
  CreateOnrampTransferRequest,
  CreateTransferFromQuoteRequest,
  CompleteOfframpTransferRequest,
  SimulateOfframpTransferRequest,
  SimulateOnrampTransferRequest,
  SimulateTransferResponse,
  TransferListResponse,
  PaymentRail,
  FiatCurrency,
  CryptoToken,
  BlockchainNetwork,
  TransferStatus,
  TransferPurpose,
  IbanAccountDetails,
  UsAccountDetails,
  DestinationBankAccount,
} from '@/resources/transfers/transfers.types';

// Cross-Chain types
export type {
  CrossChainQuote,
  CrossChainTransfer,
  CreateCrossChainTransferRequest,
  CompleteCrossChainTransferRequest,
  CreatePermanentRouteRequest,
  PermanentRouteAddress,
  PermanentRouteListResponse,
} from '@/resources/cross-chain/cross-chain.types';

// External Account types
export type {
  ExternalAccount,
  CreateExternalAccountRequest,
  ExternalAccountAddress,
  ExternalAccountListResponse,
  IbanDetails,
  UsDetails,
  IbanAccountRequest,
  UsAccountRequest,
  IbanAccountResponse,
  UsAccountResponse,
} from '@/resources/external-accounts/external-accounts.types';

// Wallet types
export type {
  VerifyWalletRequest,
  WalletVerification,
} from '@/resources/wallets/wallets.types';

// Webhook types
export type {
  Webhook,
  CreateWebhookRequest,
  WebhookEvent,
  WebhookEventType,
  WebhookEntityType,
  WebhookListResponse,
} from '@/resources/webhooks/webhooks.types';

// Developer types
export type { 
  ServiceType,
  AccrualBasis,
  DeveloperReceivableFee,
  DeveloperFeesResponse,
  UpdateDeveloperFeesRequest,
} from '@/resources/developers/developers.types';

// Files types
export type { UploadFileResponse } from '@/resources/files/files.types';

export * from '@/resources/files/files.resource';
export * from '@/resources/developers/developers.resource';
export * from '@/resources/cross-chain/cross-chain.types';
