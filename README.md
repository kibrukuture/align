# AlignLab TypeScript SDK

TypeScript/JavaScript SDK for the [AlignLab](https://alignlabs.dev) API. Build powerful payment infrastructure with support for fiat-to-crypto (onramp), crypto-to-fiat (offramp), cross-chain transfers, virtual accounts, and more.

[![npm version](https://img.shields.io/npm/v/@schnl/align.svg)](https://www.npmjs.com/package/@schnl/align)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Built with ES modules and async/await
- ✅ **Validated**: Request validation with Zod schemas
- 🔒 **Secure**: HMAC-SHA256 webhook signature verification
- 📦 **Lightweight**: Minimal dependencies
- 🌍 **Environment Support**: Sandbox and production environments

## Installation

```bash
npm install @schnl/align
```

```bash
yarn add @schnl/align
```

```bash
pnpm add @schnl/align
```

```bash
bun add @schnl/align
```

## Quick Start

```typescript
import { Align } from '@schnl/align';

// Initialize the client
const align = new Align({
  apiKey: 'your_api_key_here',
  environment: 'sandbox', // or 'production'
});

// Create a customer
const customer = await align.customers.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  type: 'individual',
});

console.log('Customer created:', customer.id);
```

---

## Table of Contents

- [Configuration](#configuration)
- [Customers](#customers)
- [Virtual Accounts](#virtual-accounts)
- [Transfers](#transfers)
  - [Offramp (Crypto to Fiat)](#offramp-crypto-to-fiat)
  - [Onramp (Fiat to Crypto)](#onramp-fiat-to-crypto)
- [Cross-Chain Transfers](#cross-chain-transfers)
- [External Accounts](#external-accounts)
- [Wallets](#wallets)
- [Webhooks](#webhooks)
- [Files](#files)
- [Developers](#developers)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

---

## Configuration

### AlignConfig

```typescript
interface AlignConfig {
  /**
   * Your AlignLab API Key
   */
  apiKey: string;

  /**
   * Environment to use
   * @default 'sandbox'
   */
  environment?: 'sandbox' | 'production';

  /**
   * Custom base URL (useful for proxying)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}
```

### Example

```typescript
const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
  timeout: 60000, // 60 seconds
});
```

---

## Customers

Manage customer accounts for your platform.

### Types

```typescript
interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  type: 'individual' | 'business';
  created_at: string;
  updated_at: string;
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_started';
}

interface CreateCustomerRequest {
  email: string;
  first_name: string;
  last_name: string;
  type: 'individual' | 'business';
}

interface UpdateCustomerRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface KycSessionResponse {
  session_id: string;
  url: string;
  status: string;
}
```

### Create Customer

```typescript
const customer = await align.customers.create({
  email: 'alice@example.com',
  first_name: 'Alice',
  last_name: 'Smith',
  type: 'individual',
});

console.log(customer.id); // "cus_abc123"
```

### Get Customer

```typescript
const customer = await align.customers.get('cus_abc123');

console.log(customer.email); // "alice@example.com"
console.log(customer.kyc_status); // "approved"
```

### Update Customer

```typescript
const updatedCustomer = await align.customers.update('cus_abc123', {
  email: 'alice.smith@example.com',
  first_name: 'Alice Marie',
});

console.log(updatedCustomer.email); // "alice.smith@example.com"
```

### List Customers

```typescript
const customers = await align.customers.list();

console.log(customers.data.length); // 10
console.log(customers.has_more); // true
console.log(customers.total_count); // 156
```

### Create KYC Session

```typescript
const kycSession = await align.customers.createKycSession('cus_abc123');

console.log(kycSession.url); // "https://kyc.alignlabs.dev/session/..."
console.log(kycSession.session_id); // "kyc_session_xyz"

// Redirect user to kycSession.url to complete KYC
```

---

## Virtual Accounts

Create virtual bank accounts for customers to receive payments.

### Types

```typescript
interface VirtualAccount {
  id: string;
  customer_id: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  currency: 'usd' | 'eur' | 'aed';
  status: 'active' | 'inactive';
  created_at: string;
}

interface CreateVirtualAccountRequest {
  currency: 'usd' | 'eur' | 'aed';
  account_type?: 'checking' | 'savings';
}
```

### Create Virtual Account

```typescript
const virtualAccount = await align.virtualAccounts.create({
  currency: 'usd',
  account_type: 'checking',
});

console.log(virtualAccount.account_number); // "1234567890"
console.log(virtualAccount.routing_number); // "021000021"
```

### List Virtual Accounts

```typescript
const accounts = await align.virtualAccounts.list();

accounts.forEach(account => {
  console.log(`${account.currency.toUpperCase()}: ${account.account_number}`);
});
```

### Get Virtual Account

```typescript
const account = await align.virtualAccounts.get('va_abc123');

console.log(account.status); // "active"
```

---

## Transfers

### Offramp (Crypto to Fiat)

Convert cryptocurrency to fiat currency.

#### Types

```typescript
type PaymentRail = 'ach' | 'wire' | 'sepa' | 'swift' | 'uaefts';
type FiatCurrency = 'usd' | 'eur' | 'aed';
type CryptoToken = 'usdc' | 'usdt' | 'eurc';
type BlockchainNetwork = 'polygon' | 'ethereum' | 'solana' | 'base' | 'arbitrum' | 'tron';

interface CreateOfframpQuoteRequest {
  source_amount?: string;
  destination_amount?: string;
  source_token: CryptoToken;
  source_network: BlockchainNetwork;
  destination_currency: FiatCurrency;
  destination_payment_rails: PaymentRail;
  developer_fee_percent?: string;
}

interface QuoteResponse {
  quote_id: string;
  source_amount: string;
  source_token?: string;
  source_network?: string;
  destination_amount: string;
  destination_currency?: string;
  destination_payment_rails?: string;
  fee_amount: string;
  exchange_rate: string;
}

interface CreateTransferFromQuoteRequest {
  transfer_purpose: string;
  destination_external_account_id?: string;
  destination_bank_account_details?: Record<string, unknown>;
}

interface Transfer {
  id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}
```

#### Create Offramp Quote

```typescript
// Quote with source amount (you know how much crypto to send)
const quote = await align.transfers.createOfframpQuote({
  source_amount: '100.00',
  source_token: 'usdc',
  source_network: 'polygon',
  destination_currency: 'usd',
  destination_payment_rails: 'ach',
  developer_fee_percent: '0.5', // Optional 0.5% fee
});

console.log(`Send ${quote.source_amount} USDC`);
console.log(`Receive ${quote.destination_amount} USD`);
console.log(`Exchange rate: ${quote.exchange_rate}`);
console.log(`Fee: ${quote.fee_amount}`);

// Quote with destination amount (you know how much fiat to receive)
const quote2 = await align.transfers.createOfframpQuote({
  destination_amount: '95.00',
  source_token: 'usdc',
  source_network: 'ethereum',
  destination_currency: 'usd',
  destination_payment_rails: 'wire',
});

console.log(`Send ${quote2.source_amount} USDC to receive $95 USD`);
```

#### Create Offramp Transfer

```typescript
// Execute the transfer from the quote
const transfer = await align.transfers.createOfframpTransfer({
  transfer_purpose: 'Payment for services',
  destination_external_account_id: 'ext_acc_123',
});

console.log(transfer.id); // "transfer_abc123"
console.log(transfer.status); // "pending"
```

#### Get Offramp Transfer

```typescript
const transfer = await align.transfers.getOfframpTransfer('transfer_abc123');

console.log(transfer.status); // "completed"
console.log(transfer.amount); // "95.00"
```

#### List Offramp Transfers

```typescript
const transfers = await align.transfers.listOfframpTransfers();

transfers.forEach(transfer => {
  console.log(`${transfer.id}: ${transfer.status} - $${transfer.amount}`);
});
```

### Onramp (Fiat to Crypto)

Convert fiat currency to cryptocurrency.

#### Types

```typescript
interface CreateOnrampQuoteRequest {
  source_amount?: string;
  destination_amount?: string;
  source_currency: FiatCurrency;
  source_payment_rails: PaymentRail;
  destination_token: CryptoToken;
  destination_network: BlockchainNetwork;
  developer_fee_percent?: string;
}
```

#### Create Onramp Quote

```typescript
const quote = await align.transfers.createOnrampQuote({
  source_amount: '100.00',
  source_currency: 'usd',
  source_payment_rails: 'ach',
  destination_token: 'usdc',
  destination_network: 'polygon',
});

console.log(`Send $${quote.source_amount} USD`);
console.log(`Receive ${quote.destination_amount} USDC`);
```

#### Create Onramp Transfer

```typescript
const transfer = await align.transfers.createOnrampTransfer({
  transfer_purpose: 'Crypto purchase',
});

console.log(transfer.id); // "transfer_xyz789"
```

#### Get Onramp Transfer

```typescript
const transfer = await align.transfers.getOnrampTransfer('transfer_xyz789');

console.log(transfer.status); // "completed"
```

#### List Onramp Transfers

```typescript
const transfers = await align.transfers.listOnrampTransfers();

transfers.forEach(transfer => {
  console.log(`${transfer.id}: ${transfer.status}`);
});
```

#### Simulate Transfer (Sandbox Only)

```typescript
// Simulate transfer completion in sandbox
const simulatedTransfer = await align.transfers.simulate(
  'transfer_abc123',
  'completed'
);

console.log(simulatedTransfer.status); // "completed"

// Simulate transfer failure
const failedTransfer = await align.transfers.simulate(
  'transfer_xyz789',
  'failed'
);

console.log(failedTransfer.status); // "failed"
```

---

## Cross-Chain Transfers

Transfer cryptocurrency across different blockchain networks.

### Types

```typescript
interface CreateCrossChainQuoteRequest {
  source_token: CryptoToken;
  source_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_network: BlockchainNetwork;
  amount: string;
  is_source_amount: boolean;
}

interface CrossChainQuote {
  quote_id: string;
  source_amount: string;
  destination_amount: string;
  exchange_rate: string;
  fee: string;
  expires_at: string;
}

interface CreateCrossChainTransferRequest {
  quote_id: string;
  destination_address: string;
}

interface CrossChainTransfer {
  id: string;
  quote_id: string;
  status: 'pending' | 'completed' | 'failed';
  source_amount: string;
  destination_amount: string;
  created_at: string;
}

interface PermanentRoute {
  id: string;
  source_token: CryptoToken;
  source_network: BlockchainNetwork;
  destination_token: CryptoToken;
  destination_network: BlockchainNetwork;
  deposit_address: string;
}
```

### Create Cross-Chain Quote

```typescript
const quote = await align.crossChain.createQuote({
  source_token: 'usdc',
  source_network: 'ethereum',
  destination_token: 'usdc',
  destination_network: 'polygon',
  amount: '100.00',
  is_source_amount: true,
});

console.log(`Quote ID: ${quote.quote_id}`);
console.log(`Send ${quote.source_amount} USDC on Ethereum`);
console.log(`Receive ${quote.destination_amount} USDC on Polygon`);
console.log(`Fee: ${quote.fee}`);
console.log(`Expires at: ${quote.expires_at}`);
```

### Create Cross-Chain Transfer

```typescript
const transfer = await align.crossChain.createTransfer({
  quote_id: quote.quote_id,
  destination_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
});

console.log(transfer.id); // "cc_transfer_123"
console.log(transfer.status); // "pending"
```

### Get Cross-Chain Transfer

```typescript
const transfer = await align.crossChain.getTransfer('cc_transfer_123');

console.log(transfer.status); // "completed"
console.log(transfer.destination_amount); // "99.50"
```

### Create Permanent Route

Create a permanent deposit address for recurring cross-chain transfers.

```typescript
const route = await align.crossChain.createPermanentRoute({
  source_token: 'usdc',
  source_network: 'ethereum',
  destination_token: 'usdc',
  destination_network: 'solana',
  deposit_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
});

console.log(`Deposit Address: ${route.deposit_address}`);
console.log(`Route ID: ${route.id}`);

// Any USDC sent to this address on Ethereum will automatically
// be bridged to Solana and sent to the destination address
```

### List Permanent Routes

```typescript
const routes = await align.crossChain.listPermanentRoutes();

routes.forEach(route => {
  console.log(`${route.source_network} → ${route.destination_network}`);
  console.log(`Deposit: ${route.deposit_address}`);
});
```

---

## External Accounts

Link external bank accounts for fiat transfers.

### Types

```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface IbanDetails {
  iban: string;
  bic?: string;
}

interface UsDetails {
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
}

interface CreateExternalAccountRequest {
  account_holder_name: string;
  account_holder_type: 'individual' | 'business';
  currency: FiatCurrency;
  country: string;
  address: Address;
  iban_details?: IbanDetails;
  us_details?: UsDetails;
}

interface ExternalAccount {
  id: string;
  account_holder_name: string;
  account_holder_type: 'individual' | 'business';
  currency: FiatCurrency;
  country: string;
  status: 'pending' | 'verified' | 'failed';
  created_at: string;
}
```

### Create External Account (US)

```typescript
const account = await align.externalAccounts.create({
  account_holder_name: 'John Doe',
  account_holder_type: 'individual',
  currency: 'usd',
  country: 'US',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US',
  },
  us_details: {
    account_number: '1234567890',
    routing_number: '021000021',
    account_type: 'checking',
  },
});

console.log(account.id); // "ext_acc_123"
console.log(account.status); // "pending"
```

### Create External Account (IBAN)

```typescript
const account = await align.externalAccounts.create({
  account_holder_name: 'Jane Smith',
  account_holder_type: 'individual',
  currency: 'eur',
  country: 'DE',
  address: {
    street: 'Hauptstraße 1',
    city: 'Berlin',
    state: 'Berlin',
    postal_code: '10115',
    country: 'DE',
  },
  iban_details: {
    iban: 'DE89370400440532013000',
    bic: 'COBADEFFXXX',
  },
});

console.log(account.id); // "ext_acc_456"
```

### Get External Account

```typescript
const account = await align.externalAccounts.get('ext_acc_123');

console.log(account.status); // "verified"
console.log(account.currency); // "usd"
```

---

## Wallets

Verify wallet ownership for cryptocurrency addresses.

### Types

```typescript
interface VerifyWalletRequest {
  wallet_address: string;
}

interface WalletVerification {
  verification_link: string;
  status: 'pending' | 'verified';
}
```

### Verify Wallet Ownership

```typescript
const verification = await align.wallets.verifyOwnership({
  wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
});

console.log(verification.verification_link);
// "https://verify.alignlabs.dev/wallet/..."

console.log(verification.status); // "pending"

// User clicks the link and signs a message with their wallet
// Status will change to "verified"
```

---

## Webhooks

Manage webhook endpoints and verify webhook signatures.

### Types

```typescript
interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

interface CreateWebhookRequest {
  url: string;
}

interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
}
```

### Create Webhook

```typescript
const webhook = await align.webhooks.create({
  url: 'https://your-domain.com/webhooks/alignlab',
});

console.log(webhook.id); // "wh_abc123"
console.log(webhook.status); // "active"
```

### List Webhooks

```typescript
const webhooks = await align.webhooks.list();

webhooks.forEach(webhook => {
  console.log(`${webhook.id}: ${webhook.url}`);
});
```

### Delete Webhook

```typescript
await align.webhooks.delete('wh_abc123');

console.log('Webhook deleted');
```

### Verify Webhook Signature

Verify that webhook requests are genuinely from AlignLab using HMAC-SHA256 signature verification.

```typescript
import express from 'express';

const app = express();

app.post('/webhooks/alignlab', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-alignlab-signature'] as string;
  const payload = req.body.toString('utf8');
  const webhookSecret = process.env.ALIGNLAB_WEBHOOK_SECRET!;

  // Verify the signature
  const isValid = align.webhooks.verifySignature(
    payload,
    signature,
    webhookSecret
  );

  if (!isValid) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook
  const event = JSON.parse(payload);
  console.log('Webhook event:', event.type);

  switch (event.type) {
    case 'transfer.completed':
      console.log('Transfer completed:', event.data.id);
      break;
    case 'transfer.failed':
      console.log('Transfer failed:', event.data.id);
      break;
    case 'customer.kyc.approved':
      console.log('KYC approved for customer:', event.data.customer_id);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

---

## Files

Upload files for KYC verification and compliance.

### Upload File

```typescript
import fs from 'fs';

const fileBuffer = fs.readFileSync('./passport.pdf');
const formData = new FormData();
formData.append('file', new Blob([fileBuffer]), 'passport.pdf');
formData.append('purpose', 'kyc_document');

const file = await align.files.upload(formData);

console.log(file.id); // "file_abc123"
console.log(file.filename); // "passport.pdf"
console.log(file.url); // "https://files.alignlabs.dev/..."
```

---

## Developers

Manage developer fees for your platform.

### Types

```typescript
interface DeveloperFee {
  id: string;
  percent: string;
  wallet_address: string;
}
```

### Get Developer Fees

```typescript
const fees = await align.developers.getFees();

fees.forEach(fee => {
  console.log(`${fee.percent}% → ${fee.wallet_address}`);
});
```

### Update Developer Fees

```typescript
const updatedFees = await align.developers.updateFees([
  {
    id: 'fee_1',
    percent: '0.5',
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  },
  {
    id: 'fee_2',
    percent: '0.3',
    wallet_address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  },
]);

console.log('Fees updated');
```

---

## Error Handling

The SDK provides custom error classes for better error handling.

### Error Types

```typescript
import { AlignError, AlignValidationError } from '@schnl/align';

try {
  const customer = await align.customers.create({
    email: 'invalid-email', // Invalid email format
    first_name: 'John',
    last_name: 'Doe',
    type: 'individual',
  });
} catch (error) {
  if (error instanceof AlignValidationError) {
    console.error('Validation error:', error.message);
    console.error('Field errors:', error.fieldErrors);
    // Field errors: { email: ['Invalid email'] }
  } else if (error instanceof AlignError) {
    console.error('API error:', error.message);
    console.error('Status code:', error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Handling API Errors

```typescript
try {
  const transfer = await align.transfers.createOfframpTransfer({
    transfer_purpose: 'Payment',
    destination_external_account_id: 'invalid_id',
  });
} catch (error) {
  if (error instanceof AlignError) {
    switch (error.statusCode) {
      case 400:
        console.error('Bad request:', error.message);
        break;
      case 401:
        console.error('Unauthorized - check your API key');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
      case 500:
        console.error('Server error');
        break;
      default:
        console.error('API error:', error.message);
    }
  }
}
```

---

## TypeScript Types

The SDK is fully typed. Import types as needed:

```typescript
import type {
  // Core
  AlignConfig,
  AlignEnvironment,
  
  // Customers
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  KycSessionResponse,
  
  // Virtual Accounts
  VirtualAccount,
  CreateVirtualAccountRequest,
  
  // Transfers
  Transfer,
  QuoteResponse,
  CreateOfframpQuoteRequest,
  CreateOnrampQuoteRequest,
  CreateTransferFromQuoteRequest,
  PaymentRail,
  FiatCurrency,
  CryptoToken,
  BlockchainNetwork,
  
  // Cross-Chain
  CrossChainQuote,
  CrossChainTransfer,
  CreateCrossChainQuoteRequest,
  CreateCrossChainTransferRequest,
  PermanentRoute,
  
  // External Accounts
  ExternalAccount,
  CreateExternalAccountRequest,
  Address,
  IbanDetails,
  UsDetails,
  
  // Wallets
  VerifyWalletRequest,
  WalletVerification,
  
  // Webhooks
  Webhook,
  CreateWebhookRequest,
  WebhookEvent,
  
  // Developers
  DeveloperFee,
  
  // Errors
  AlignError,
  AlignValidationError,
} from '@schnl/align';
```

---

## Advanced Usage

### Custom HTTP Client Configuration

```typescript
import { Align } from '@schnl/align';

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
  timeout: 60000, // 60 seconds
  baseUrl: 'https://your-proxy.com/alignlab', // Custom proxy
});
```

### Using with Next.js App Router

```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Align, type CreateCustomerRequest, AlignValidationError } from '@schnl/align';

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateCustomerRequest;
    
    // Validate required fields
    if (!body.email || !body.first_name || !body.last_name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const customer = await align.customers.create(body);
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const customers = await align.customers.list(page, limit);
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error listing customers:', error);
    return NextResponse.json(
      { error: 'Failed to list customers' },
      { status: 500 }
    );
  }
}
```

### Using with Next.js Pages Router

```typescript
// pages/api/customers/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Align, type CreateCustomerRequest, type Customer, AlignValidationError } from '@schnl/align';

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
});

type ErrorResponse = {
  error: string;
  details?: Record<string, string[]>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Customer | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as CreateCustomerRequest;
    
    const customer = await align.customers.create(body);
    
    return res.status(201).json(customer);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    
    console.error('Error creating customer:', error);
    return res.status(500).json({ error: 'Failed to create customer' });
  }
}
```

### Using with Express.js

```typescript
import express, { Request, Response } from 'express';
import { Align, type CreateCustomerRequest, AlignValidationError, AlignError } from '@schnl/align';

const app = express();
const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
});

app.use(express.json());

// Create customer
app.post('/api/customers', async (req: Request, res: Response) => {
  try {
    const customer = await align.customers.create(req.body as CreateCustomerRequest);
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    if (error instanceof AlignError) {
      return res.status(error.status).json({
        error: error.message,
        code: error.code,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer
app.get('/api/customers/:id', async (req: Request, res: Response) => {
  try {
    const customer = await align.customers.get(req.params.id);
    res.json(customer);
  } catch (error) {
    if (error instanceof AlignError && error.status === 404) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create offramp transfer
app.post('/api/transfers/offramp', async (req: Request, res: Response) => {
  try {
    const { quote, transfer_purpose, destination_account_id } = req.body;
    
    // First create a quote
    const quoteResponse = await align.transfers.createOfframpQuote(quote);
    
    // Then execute the transfer
    const transfer = await align.transfers.createOfframpTransfer({
      transfer_purpose,
      destination_external_account_id: destination_account_id,
    });
    
    res.status(201).json({ quote: quoteResponse, transfer });
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Using with Fastify

```typescript
import Fastify from 'fastify';
import { Align, type CreateCustomerRequest, AlignValidationError } from '@schnl/align';

const fastify = Fastify({ logger: true });

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
});

fastify.post<{ Body: CreateCustomerRequest }>('/api/customers', async (request, reply) => {
  try {
    const customer = await align.customers.create(request.body);
    return reply.status(201).send(customer);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    return reply.status(500).send({ error: 'Failed to create customer' });
  }
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
});
```

### Using with Hono

```typescript
import { Hono } from 'hono';
import { Align, type CreateCustomerRequest, AlignValidationError } from '@schnl/align';

const app = new Hono();

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: 'production',
});

app.post('/api/customers', async (c) => {
  try {
    const body = await c.req.json<CreateCustomerRequest>();
    const customer = await align.customers.create(body);
    
    return c.json(customer, 201);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors,
      }, 400);
    }
    return c.json({ error: 'Failed to create customer' }, 500);
  }
});

export default app;
```

### Using with React (Client-Side via API Route)

```typescript
// hooks/useAlign.ts
import { useState } from 'react';
import type { Customer, CreateCustomerRequest } from '@schnl/align';

export function useCreateCustomer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = async (data: CreateCustomerRequest): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const customer = await response.json() as Customer;
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCustomer, loading, error };
}

// Component usage
import { useCreateCustomer } from '@/hooks/useAlign';

export function CreateCustomerForm() {
  const { createCustomer, loading, error } = useCreateCustomer();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const customer = await createCustomer({
      email: formData.get('email') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      type: 'individual',
    });

    if (customer) {
      console.log('Customer created:', customer.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="first_name" required />
      <input name="last_name" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Customer'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

---

## Support

- **Documentation**: [https://docs.alignlabs.dev](https://docs.alignlabs.dev)
- **API Reference**: [https://api.alignlabs.dev/docs](https://api.alignlabs.dev/docs)
- **GitHub**: [https://github.com/kibrukuture/align](https://github.com/kibrukuture/align)
- **Issues**: [https://github.com/kibrukuture/align/issues](https://github.com/kibrukuture/align/issues)

---

## License

MIT

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request at [https://github.com/kibrukuture/align](https://github.com/kibrukuture/align).

---

## Changelog

See [CHANGELOG.md](https://github.com/kibrukuture/align/blob/main/CHANGELOG.md) for a list of changes.
