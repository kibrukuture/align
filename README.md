# AlignLab TypeScript SDK

**Unofficial** TypeScript/JavaScript SDK for the [AlignLab](https://docs.alignlabs.dev) API. Build powerful payment infrastructure with support for fiat-to-crypto (onramp), crypto-to-fiat (offramp), cross-chain transfers, virtual accounts, and more.

[![npm version](https://img.shields.io/npm/v/@tolbel/align.svg)](https://www.npmjs.com/package/@tolbel/align)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Built with ES modules and async/await
- ✅ **Validated**: Request validation with Zod schemas
- 🔒 **Secure**: HMAC-SHA256 webhook signature verification
- 📦 **Lightweight**: Minimal dependencies
- 🌍 **Environment Support**: Sandbox and production environments
- 🔄 **Automatic Retry**: Built-in retry mechanism with exponential backoff for transient errors
- 📝 **Logging**: Optional request/response logging with pino (disabled by default)

## Installation

```bash
npm install @tolbel/align
```

```bash
yarn add @tolbel/align
```

```bash
pnpm add @tolbel/align
```

```bash
bun add @tolbel/align
```

## Quick Start

```typescript
import Align from "@tolbel/align";

// Initialize the client
const align = new Align({
  apiKey: "your_api_key_here",
  environment: "sandbox", // or 'production'
});

// Create a customer
const customer = await align.customers.create({
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  type: "individual",
});

console.log("Customer created:", customer.customer_id);
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
- [Blockchain](#blockchain)
  - [Wallets](#blockchain-wallets)
  - [Transactions](#blockchain-transactions)
  - [Tokens](#blockchain-tokens)
  - [Contracts](#blockchain-contracts)
  - [NFTs](#blockchain-nfts)
  - [Utilities](#blockchain-utilities)
- [API Reference](#api-reference)
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
  environment?: "sandbox" | "production";

  /**
   * Custom base URL (useful for proxying)
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable logging for debugging
   * @default false
   */
  debug?: boolean;

  /**
   * Log level threshold
   * @default 'error'
   */
  logLevel?: "error" | "warn" | "info" | "debug";
}
```

### Example

```typescript
const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
  timeout: 60000, // 60 seconds
});
```

---

## Customers

Manage customer accounts for your platform.

### Types

```typescript
// Shared types
type CustomerType = "individual" | "corporate";
type KycStatus = "pending" | "approved" | "rejected" | "not_started";

interface Customer {
  customer_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  type: CustomerType;
  kycs?: {
    status_breakdown: Array<{
      currency: string;
      payment_rails: string;
      status: KycStatus;
    }>;
    kyc_flow_link: string;
  };
}

interface CreateCustomerRequest {
  email: string;
  type: CustomerType;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface UpdateCustomerRequest {
  documents: Array<{
    file_id: string;
    purpose: string;
  }>;
}

interface KycSessionResponse {
  kycs: {
    kyc_flow_link: string;
  };
}
```

### Create Customer

```typescript
const customer = await align.customers.create({
  email: "alice@example.com",
  first_name: "Alice",
  last_name: "Smith",
  type: "individual",
});

console.log(customer.customer_id); // "123e4567-e89b-12d3-a456-426614174000"
```

### Get Customer

```typescript
const customer = await align.customers.get(
  "123e4567-e89b-12d3-a456-426614174000"
);

console.log(customer.email); // "alice@example.com"
console.log(customer.kycs?.status_breakdown[0].status); // "approved"
```

### Update Customer

```typescript
const updatedCustomer = await align.customers.update("cus_abc123", {
  email: "alice.smith@example.com",
  first_name: "Alice Marie",
});

console.log(updatedCustomer.email); // "alice.smith@example.com"
```

### List Customers

```typescript
// List all customers (use with caution - no pagination support)
const customers = await align.customers.list();

console.log(customers.items.length); // Number of customers returned

// Filter by email (recommended for finding specific customer)
const filtered = await align.customers.list("alice@example.com");
console.log(filtered.items[0]?.customer_id);
```

### Create KYC Session

```typescript
const kycSession = await align.customers.createKycSession("cus_abc123");

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
  status: "active";
  destination_token: "usdc" | "usdt" | "aed";
  destination_network:
    | "polygon"
    | "ethereum"
    | "solana"
    | "base"
    | "tron"
    | "arbitrum";
  destination_address: string;
  deposit_instructions: {
    bank_name: string;
    bank_address: string;
    account_holder_name: string;
    // ... other bank details (IBAN or US)
  };
}

interface CreateVirtualAccountRequest {
  source_currency: "usd" | "eur" | "aed";
  destination_token: "usdc" | "usdt";
  destination_network:
    | "polygon"
    | "ethereum"
    | "solana"
    | "base"
    | "tron"
    | "arbitrum";
  destination_address: string;
}
```

### Create Virtual Account

```typescript
const virtualAccount = await align.virtualAccounts.create(customerId, {
  source_currency: "eur",
  destination_token: "usdc",
  destination_network: "polygon",
  destination_address: "0x742d35...",
});

console.log(virtualAccount.id);
console.log(virtualAccount.deposit_instructions.bank_name);
```

### List Virtual Accounts

```typescript
const accounts = await align.virtualAccounts.list(customerId);

accounts.items.forEach((account) => {
  console.log(
    `${account.destination_token.toUpperCase()}: ${
      account.deposit_instructions.bank_name
    }`
  );
});
```

### Get Virtual Account

```typescript
const account = await align.virtualAccounts.get(customerId, "va_abc123");

console.log(account.status); // "active"
```

---

## Transfers

### Offramp (Crypto to Fiat)

Convert cryptocurrency to fiat currency.

#### Types

```typescript
type PaymentRail = "ach" | "wire" | "sepa" | "swift" | "uaefts";
type FiatCurrency = "usd" | "eur" | "aed";
type CryptoToken = "usdc" | "usdt" | "eurc";
type BlockchainNetwork =
  | "polygon"
  | "ethereum"
  | "solana"
  | "base"
  | "arbitrum"
  | "tron";

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
  status: "pending" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}
```

#### Create Offramp Quote

```typescript
// Quote with source amount (you know how much crypto to send)
const quote = await align.transfers.createOfframpQuote({
  source_amount: "100.00",
  source_token: "usdc",
  source_network: "polygon",
  destination_currency: "usd",
  destination_payment_rails: "ach",
  developer_fee_percent: "0.5", // Optional 0.5% fee
});

console.log(`Send ${quote.source_amount} USDC`);
console.log(`Receive ${quote.destination_amount} USD`);
console.log(`Exchange rate: ${quote.exchange_rate}`);
console.log(`Fee: ${quote.fee_amount}`);

// Quote with destination amount (you know how much fiat to receive)
const quote2 = await align.transfers.createOfframpQuote({
  destination_amount: "95.00",
  source_token: "usdc",
  source_network: "ethereum",
  destination_currency: "usd",
  destination_payment_rails: "wire",
});

console.log(`Send ${quote2.source_amount} USDC to receive $95 USD`);
```

### Offramp Transfers (Crypto to Fiat)

1. **Create a Quote**

   ```typescript
   const quote = await align.transfers.createOfframpQuote(
     customer.customer_id,
     {
       source_amount: "100.00",
       source_token: "usdc",
       source_network: "polygon",
       destination_currency: "usd",
       destination_payment_rails: "ach",
     }
   );
   ```

2. **Create Transfer from Quote**

   ```typescript
   const transfer = await align.transfers.createOfframpTransfer(
     customer.customer_id,
     quote.quote_id,
     {
       transfer_purpose: "commercial_investment",
       // Option A: Use existing external account
       destination_external_account_id: "ext_acc_123",

       // Option B: Provide bank details directly
       /*
       destination_bank_account: {
         bank_name: 'Chase Bank',
         account_holder_type: 'individual',
         account_holder_first_name: 'John',
         account_holder_last_name: 'Doe',
         account_holder_address: {
           country: 'US',
           city: 'San Francisco',
           street_line_1: '123 Main St',
           postal_code: '94105'
         },
         account_type: 'us',
         us: {
           account_number: '1234567890',
           routing_number: '021000021'
         }
       }
       */
     }
   );
   ```

3. **Complete Transfer (After Deposit)**

   ```typescript
   const completedTransfer = await align.transfers.completeOfframpTransfer(
     customer.customer_id,
     transfer.id,
     {
       deposit_transaction_hash: "0x1234567890abcdef...",
     }
   );
   ```

4. **List Transfers**
   ```typescript
   const transfers = await align.transfers.listOfframpTransfers(
     customer.customer_id
   );
   console.log(transfers.items);
   ```

#### Get Offramp Transfer

```typescript
const transfer = await align.transfers.getOfframpTransfer("transfer_abc123");

console.log(transfer.status); // "completed"
console.log(transfer.amount); // "95.00"
```

#### List Offramp Transfers

```typescript
const transfers = await align.transfers.listOfframpTransfers();

transfers.forEach((transfer) => {
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
const quote = await align.transfers.createOnrampQuote(
  "123e4567-e89b-12d3-a456-426614174000",
  {
    source_amount: "100.00",
    source_currency: "usd",
    source_payment_rails: "ach",
    destination_token: "usdc",
    destination_network: "polygon",
  }
);
```

#### Create Onramp Transfer

```typescript
const transfer = await align.transfers.createOnrampTransfer(
  "123e4567-e89b-12d3-a456-426614174000",
  quote.quote_id,
  {
    destination_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  }
);
```

#### Simulate Offramp Transfer (Sandbox)

```typescript
const result = await align.transfers.simulateOfframpTransfer(
  "123e4567-e89b-12d3-a456-426614174000",
  {
    action: "complete_transfer",
    transfer_id: "transfer_abc123",
  }
);
```

#### Get Onramp Transfer

```typescript
const transfer = await align.transfers.getOnrampTransfer(
  "123e4567-e89b-12d3-a456-426614174000",
  "transfer_xyz789"
);
```

#### List Onramp Transfers

```typescript
const transfers = await align.transfers.listOnrampTransfers();

transfers.forEach((transfer) => {
  console.log(`${transfer.id}: ${transfer.status}`);
});
```

#### Simulate Transfer (Sandbox Only)

```typescript
// Simulate transfer completion in sandbox
const simulatedTransfer = await align.transfers.simulate(
  "transfer_abc123",
  "completed"
);

console.log(simulatedTransfer.status); // "completed"

// Simulate transfer failure
const failedTransfer = await align.transfers.simulate(
  "transfer_xyz789",
  "failed"
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
  status: "pending" | "completed" | "failed";
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
  source_token: "usdc",
  source_network: "ethereum",
  destination_token: "usdc",
  destination_network: "polygon",
  amount: "100.00",
  is_source_amount: true,
});

console.log(`Quote ID: ${quote.quote_id}`);
console.log(`Send ${quote.source_amount} USDC on Ethereum`);
console.log(`Receive ${quote.destination_amount} USDC on Polygon`);
console.log(`Fee: ${quote.fee}`);
console.log(`Expires at: ${quote.expires_at}`);
```

### Cross-Chain Transfers

Transfer cryptocurrency across different blockchain networks.

#### Create a Cross-Chain Transfer

```typescript
const transfer = await align.crossChain.createTransfer(customerId, {
  amount: "100.00",
  source_network: "ethereum",
  source_token: "usdc",
  destination_network: "polygon",
  destination_token: "usdc",
  destination_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
});

console.log(`Transfer ID: ${transfer.id}`);
console.log(`Status: ${transfer.status}`);
console.log(
  `Fee: ${transfer.quote.fee_amount} ${transfer.quote.deposit_token}`
);
```

#### Complete a Cross-Chain Transfer

After sending the funds to the deposit address provided in the transfer response, you must complete the transfer by providing the transaction hash.

```typescript
const completedTransfer = await align.crossChain.completeTransfer(
  customerId,
  transfer.id,
  {
    deposit_transaction_hash:
      "0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b",
  }
);
```

#### Get Transfer Details

```typescript
const transfer = await align.crossChain.getTransfer(
  customerId,
  "transfer_uuid"
);
```

#### Permanent Routes

Create a permanent deposit address for recurring transfers.

```typescript
// Create a permanent route
const route = await align.crossChain.createPermanentRouteAddress(customerId, {
  destination_network: "polygon",
  destination_token: "usdc",
  destination_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
});

// List all routes
const routes = await align.crossChain.listPermanentRouteAddresses(customerId);
```

console.log(`Deposit Address: ${route.deposit_address}`);
console.log(`Route ID: ${route.id}`);

// Any USDC sent to this address on Ethereum will automatically
// be bridged to Solana and sent to the destination address

````

### List Permanent Routes

```typescript
const routes = await align.crossChain.listPermanentRoutes();

routes.forEach(route => {
  console.log(`${route.source_network} → ${route.destination_network}`);
  console.log(`Deposit: ${route.deposit_address}`);
});
````

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
  account_type: "checking" | "savings";
}

interface CreateExternalAccountRequest {
  account_holder_name: string;
  account_holder_type: "individual" | "business";
  currency: FiatCurrency;
  country: string;
  address: Address;
  iban_details?: IbanDetails;
  us_details?: UsDetails;
}

interface ExternalAccount {
  id: string;
  account_holder_name: string;
  account_holder_type: "individual" | "business";
  currency: FiatCurrency;
  country: string;
  status: "pending" | "verified" | "failed";
  created_at: string;
}
```

### Create External Account (US)

```typescript
const account = await align.externalAccounts.create({
  account_holder_name: "John Doe",
  account_holder_type: "individual",
  currency: "usd",
  country: "US",
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US",
  },
  us_details: {
    account_number: "1234567890",
    routing_number: "021000021",
    account_type: "checking",
  },
});

console.log(account.id); // "ext_acc_123"
console.log(account.status); // "pending"
```

### Create External Account (IBAN)

```typescript
const account = await align.externalAccounts.create({
  account_holder_name: "Jane Smith",
  account_holder_type: "individual",
  currency: "eur",
  country: "DE",
  address: {
    street: "Hauptstraße 1",
    city: "Berlin",
    state: "Berlin",
    postal_code: "10115",
    country: "DE",
  },
  iban_details: {
    iban: "DE89370400440532013000",
    bic: "COBADEFFXXX",
  },
});

console.log(account.id); // "ext_acc_456"
```

### Get External Account

```typescript
const account = await align.externalAccounts.get("ext_acc_123");

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
  verification_flow_link: string;
}
```

### Verify Wallet Ownership

```typescript
const verification = await align.wallets.verifyOwnership(customerId, {
  wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
});

console.log(verification.verification_flow_link);
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
// Shared type
type WebhookStatus = "active" | "inactive";

type WebhookEventType =
  | "customer.kycs.updated"
  | "onramp_transfer.status.updated"
  | "offramp_transfer.status.updated";

type WebhookEntityType = "customer" | "onramp_transfer" | "offramp_transfer";

interface Webhook {
  id: string;
  url: string;
  status: WebhookStatus;
  created_at: string;
}

interface CreateWebhookRequest {
  url: string;
}

interface WebhookListResponse {
  items: Webhook[];
}

// This is the payload you receive when a webhook is triggered
interface WebhookEvent {
  event_type: WebhookEventType;
  entity_id: string;
  entity_type: WebhookEntityType;
  created_at: string;
}
```

### Create Webhook

```typescript
const webhook = await align.webhooks.create({
  url: "https://your-domain.com/webhooks/alignlab",
});

console.log(webhook.id); // "wh_abc123"
console.log(webhook.status); // "active"
```

### List Webhooks

```typescript
const response = await align.webhooks.list();

response.items.forEach((webhook) => {
  console.log(`${webhook.id}: ${webhook.url}`);
});
```

### Delete Webhook

```typescript
await align.webhooks.delete("wh_abc123");

console.log("Webhook deleted");
```

### Verify Webhook Signature

Verify that webhook requests are genuinely from AlignLab using HMAC-SHA256 signature verification.

> [!IMPORTANT]
> The webhook signature is sent in the `x-hmac-signature` header.

```typescript
import express from "express";
import type { WebhookEvent } from "@tolbel/align";

const app = express();

app.post(
  "/webhooks/alignlab",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-hmac-signature"] as string;
    const payload = req.body.toString("utf8");
    const apiKey = process.env.ALIGNLAB_API_KEY!; // Use your API key as the secret

    // Verify the signature
    const isValid = align.webhooks.verifySignature(payload, signature, apiKey);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    // Process the webhook event
    const event: WebhookEvent = JSON.parse(payload);
    console.log("Webhook event:", event.event_type);

    switch (event.event_type) {
      case "customer.kycs.updated":
        console.log("Customer KYC updated:", event.entity_id);
        break;
      case "onramp_transfer.status.updated":
        console.log("Onramp transfer status updated:", event.entity_id);
        break;
      case "offramp_transfer.status.updated":
        console.log("Offramp transfer status updated:", event.entity_id);
        break;
    }

    res.status(200).send("OK");
  }
);
```

---

## Files

Upload files for KYC verification and compliance.

### Upload File

```typescript
import fs from "fs";

const fileBuffer = fs.readFileSync("./passport.pdf");
const formData = new FormData();
formData.append("file", new Blob([fileBuffer]), "passport.pdf");
formData.append("purpose", "kyc_document");

const file = await align.files.upload(fileInput.files[0]);

console.log(file.id); // "file_abc123"
console.log(file.name); // "passport.pdf"
console.log(file.type); // "application/pdf"
```

---

## Developers

Manage developer fees for your platform.

### Types

```typescript
interface DeveloperFeesResponse {
  developer_receivable_fees: Array<{
    service_type: "onramp" | "offramp" | "cross_chain_transfer";
    accrual_basis: "percentage";
    value: number;
  }>;
}
```

### Get Developer Fees

```typescript
const response = await align.developers.getFees();

response.developer_receivable_fees.forEach((fee) => {
  console.log(`${fee.service_type}: ${fee.value}% (${fee.accrual_basis})`);
});
```

### Update Developer Fees

```typescript
const response = await align.developers.updateFees({
  developer_receivable_fees: {
    onramp: 1,
    offramp: 1,
    cross_chain_transfer: 1,
  },
});

console.log("Fees updated successfully");
```

---

## Blockchain

> **⚠️ Important Note**
>
> The blockchain functionality is **additional functionality** provided by this SDK and is **NOT part of the AlignLab API**. It operates independently using [ethers.js](https://docs.ethers.org/) and public RPC providers. You can use it alongside AlignLab's API features or completely separately for blockchain operations.

The blockchain module provides comprehensive Web3 functionality for managing wallets, sending transactions, and interacting with tokens across multiple blockchain networks.

### Supported Networks

- **Ethereum** (`ethereum`)
- **Polygon** (`polygon`)
- **Base** (`base`)
- **Arbitrum** (`arbitrum`)
- **Optimism** (`optimism`)
- **Solana** (`solana`)
- **Tron** (`tron`)

### Configuration

```typescript
const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "sandbox",

  // Optional: Provide custom RPC URLs
  blockchain: {
    customRpcUrls: {
      polygon: "https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY",
      ethereum: "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
      base: "https://base-mainnet.g.alchemy.com/v2/YOUR_KEY",
    },
  },
});

// Access blockchain functionality
const blockchain = align.blockchain;
```

If you don't provide custom RPC URLs, the SDK will use default public RPC providers.

---

### Blockchain Wallets

Create, manage, and secure cryptocurrency wallets.

#### Types

```typescript
interface Wallet {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

interface EncryptedWallet {
  address: string;
  encrypted: string;
  iv: string;
  salt: string;
}

interface WalletBalance {
  balance: string;
  balanceFormatted: string;
  decimals: number;
  symbol: string;
}

interface WalletCreationOptions {
  mnemonic?: string;
  privateKey?: string;
  encrypted?: EncryptedWallet;
  password?: string;
}
```

#### Create a New Wallet

**Method:** `align.blockchain.wallets.create()`

**Description:** Generates a brand new cryptocurrency wallet with a random private key and mnemonic phrase. This wallet can be used across all supported blockchain networks (Ethereum, Polygon, Base, etc.) since they all use the same address format.

**Parameters:** None

**Returns:** `Promise<Wallet>`

- `address` (string): The public wallet address (e.g., `0x742d35...`)
- `privateKey` (string): The private key used to sign transactions (keep this secret!)
- `mnemonic` (string): A 12-word recovery phrase that can restore the wallet

**Use Case:** Creating a new wallet for a user when they sign up, or generating a deposit address.

```typescript
// Create a random wallet
const wallet = await align.blockchain.wallets.create();

console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", wallet.mnemonic);
// Output:
// Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
// Private Key: 0x1234567890abcdef...
// Mnemonic: abandon abandon abandon abandon abandon abandon...
```

> **⚠️ Security Warning:** Never expose the private key or mnemonic to users or store them in plain text. Always encrypt them before storage (see encryption examples below).

---

#### Create Wallet from Mnemonic

**Method:** `align.blockchain.wallets.createFromMnemonic(mnemonic: string)`

**Description:** Recovers an existing wallet from a 12 or 24-word mnemonic phrase. This is useful when users want to import an existing wallet or restore access to a wallet they created previously. The same mnemonic will always generate the same wallet address.

**Parameters:**

- `mnemonic` (string): A valid BIP39 mnemonic phrase (12 or 24 words separated by spaces)

**Returns:** `Promise<Wallet>`

- `address` (string): The wallet address derived from the mnemonic
- `privateKey` (string): The private key derived from the mnemonic
- `mnemonic` (string): The same mnemonic phrase provided

**Use Case:** Allowing users to import their existing MetaMask or hardware wallet, or recovering a wallet from backup.

```typescript
const wallet = await align.blockchain.wallets.createFromMnemonic(
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
);

console.log("Address:", wallet.address);
// Always generates the same address from the same mnemonic
// Address: 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

**Validation:** The SDK automatically validates that the mnemonic is a valid BIP39 phrase. Invalid mnemonics will throw an error.

---

#### Create Wallet from Private Key

**Method:** `align.blockchain.wallets.createFromPrivateKey(privateKey: string)`

**Description:** Imports an existing wallet using its private key. This is useful when you have a private key from another source (like a hardware wallet export or another application) and want to use it with this SDK.

**Parameters:**

- `privateKey` (string): A 64-character hexadecimal private key (with or without `0x` prefix)

**Returns:** `Promise<Wallet>`

- `address` (string): The wallet address derived from the private key
- `privateKey` (string): The same private key provided
- `mnemonic` (undefined): No mnemonic since the wallet was created from a private key

**Use Case:** Importing a wallet from a private key backup or integrating with external key management systems.

```typescript
const wallet = await align.blockchain.wallets.createFromPrivateKey(
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
);

console.log("Address:", wallet.address);
```

---

#### Get Wallet Balance

**Method:** `align.blockchain.wallets.getBalance(address: string, network: Network)`

**Description:** Retrieves the native cryptocurrency balance for a wallet address on a specific blockchain network. Native tokens are the blockchain's main currency (ETH on Ethereum, MATIC on Polygon, etc.).

**Parameters:**

- `address` (string): The wallet address to check (must be a valid Ethereum-style address)
- `network` (Network): The blockchain network (`"ethereum"`, `"polygon"`, `"base"`, `"arbitrum"`, `"optimism"`)

**Returns:** `Promise<WalletBalance>`

- `balance` (string): Raw balance in smallest unit (wei for ETH, etc.)
- `balanceFormatted` (string): Human-readable balance (e.g., "1.5")
- `decimals` (number): Number of decimals for the token (usually 18)
- `symbol` (string): Token symbol (e.g., "MATIC", "ETH")

**Use Case:** Checking if a user has enough funds before allowing a withdrawal or displaying their balance in your app.

```typescript
// Get native token balance (ETH, MATIC, etc.)
const balance = await align.blockchain.wallets.getBalance(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "polygon"
);

console.log(`Balance: ${balance.balanceFormatted} ${balance.symbol}`);
// Output: Balance: 1.5 MATIC

console.log(`Raw balance: ${balance.balance} wei`);
// Output: Raw balance: 1500000000000000000 wei
```

---

#### Get Token Balance

**Method:** `align.blockchain.wallets.getTokenBalance(address: string, tokenAddress: string, network: Network)`

**Description:** Retrieves the balance of a specific ERC-20 token (like USDC, USDT, DAI) for a wallet address. This is different from native balance - it checks how much of a specific token contract the wallet holds.

**Parameters:**

- `address` (string): The wallet address to check
- `tokenAddress` (string): The ERC-20 token contract address (e.g., USDC contract address)
- `network` (Network): The blockchain network where the token exists

**Returns:** `Promise<WalletBalance>`

- `balance` (string): Raw balance in smallest token unit
- `balanceFormatted` (string): Human-readable balance
- `decimals` (number): Token decimals (6 for USDC, 18 for most tokens)
- `symbol` (string): Token symbol (e.g., "USDC")

**Use Case:** Checking a user's stablecoin balance (USDC, USDT) before processing a payment or displaying token holdings.

```typescript
// Get ERC-20 token balance (USDC, USDT, etc.)
const usdcBalance = await align.blockchain.wallets.getTokenBalance(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
  "polygon"
);

console.log(`USDC Balance: ${usdcBalance.balanceFormatted}`);
// Output: USDC Balance: 100.50

console.log(`Decimals: ${usdcBalance.decimals}`);
// Output: Decimals: 6
```

**Note:** Each network has different token contract addresses. USDC on Polygon has a different address than USDC on Ethereum.

---

#### Send Native Token

**Method:** `align.blockchain.wallets.sendNativeToken(wallet: Wallet, to: string, amount: string, network: Network)`

**Description:** Sends native cryptocurrency (ETH, MATIC, etc.) from one wallet to another. This method handles transaction signing, gas estimation, and broadcasting to the blockchain network.

**Parameters:**

- `wallet` (Wallet): The sender's wallet object (must include `privateKey` for signing)
- `to` (string): The recipient's wallet address
- `amount` (string): Amount to send in human-readable format (e.g., "0.1" for 0.1 MATIC)
- `network` (Network): The blockchain network to use

**Returns:** `Promise<Transaction>`

- `hash` (string): Transaction hash for tracking
- `from` (string): Sender address
- `to` (string): Recipient address
- `value` (string): Amount sent
- `status` (TransactionStatus): Initial status ("pending")
- Other transaction details (gasLimit, gasPrice, nonce, etc.)

**Use Case:** Sending cryptocurrency payments, withdrawals, or transferring funds between wallets.

```typescript
// Send MATIC on Polygon
const tx = await align.blockchain.wallets.sendNativeToken(
  wallet, // Wallet object with privateKey
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Recipient address
  "0.1", // Amount in MATIC
  "polygon"
);

console.log("Transaction hash:", tx.hash);
console.log("Status:", tx.status); // "pending"

// Wait for confirmation
const receipt = await align.blockchain.transactions.waitForConfirmation(
  tx.hash,
  1, // Number of confirmations
  "polygon"
);

console.log("Confirmed in block:", receipt.blockNumber);
```

**Important:** The wallet must have enough balance to cover both the amount being sent AND the gas fees. The transaction will fail if insufficient funds.

---

#### Send ERC-20 Token

**Method:** `align.blockchain.wallets.sendToken(wallet: Wallet, tokenAddress: string, to: string, amount: string, network: Network)`

**Description:** Sends ERC-20 tokens (USDC, USDT, DAI, etc.) from one wallet to another. This interacts with the token's smart contract to transfer ownership.

**Parameters:**

- `wallet` (Wallet): The sender's wallet (must have `privateKey`)
- `tokenAddress` (string): The ERC-20 token contract address
- `to` (string): The recipient's wallet address
- `amount` (string): Amount to send in human-readable format (e.g., "10.0" for 10 USDC)
- `network` (Network): The blockchain network

**Returns:** `Promise<Transaction>`

- Same structure as `sendNativeToken`

**Use Case:** Sending stablecoin payments, token transfers, or processing withdrawals in USDC/USDT.

```typescript
// Send USDC on Polygon
const tx = await align.blockchain.wallets.sendToken(
  wallet,
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC contract address
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Recipient
  "10.0", // Amount in USDC
  "polygon"
);

console.log("Token transfer hash:", tx.hash);
```

**Gas Fees:** Even though you're sending tokens, you still need native cryptocurrency (MATIC, ETH) in the wallet to pay for gas fees.

---

#### Encrypt Wallet

**Method:** `align.blockchain.wallets.encryptWallet(wallet: Wallet, password: string)`

**Description:** Encrypts a wallet's private key and mnemonic using AES-256-GCM encryption with a password. This allows you to securely store wallet credentials in a database without exposing the private key. Uses the Web Crypto API for strong encryption.

**Parameters:**

- `wallet` (Wallet): The wallet object to encrypt (must have `privateKey` and optionally `mnemonic`)
- `password` (string): A strong password used to encrypt the wallet (user should remember this!)

**Returns:** `Promise<EncryptedWallet>`

- `address` (string): The wallet address (not encrypted, safe to store publicly)
- `encrypted` (string): The encrypted private key and mnemonic (base64 encoded)
- `iv` (string): Initialization vector for decryption (base64 encoded)
- `salt` (string): Salt used for key derivation (base64 encoded)

**Use Case:** Storing user wallets securely in your database. Even if your database is compromised, the private keys remain encrypted and useless without the password.

```typescript
// Encrypt wallet for secure storage
const encrypted = await align.blockchain.wallets.encryptWallet(
  wallet,
  "super-secure-password-123"
);

console.log("Encrypted data:", encrypted.encrypted);
console.log("IV:", encrypted.iv);
console.log("Salt:", encrypted.salt);

// Store encrypted wallet in database
await database.save({
  address: encrypted.address,
  encrypted: encrypted.encrypted,
  iv: encrypted.iv,
  salt: encrypted.salt,
});
```

**Security Note:** The password is never stored - only the user knows it. If they forget it, the wallet cannot be recovered.

---

#### Decrypt Wallet

**Method:** `align.blockchain.wallets.decryptWallet(encryptedWallet: EncryptedWallet, password: string)`

**Description:** Decrypts an encrypted wallet using the password that was used to encrypt it. This restores the wallet object with the private key, allowing you to sign transactions.

**Parameters:**

- `encryptedWallet` (EncryptedWallet): The encrypted wallet object (from database)
- `password` (string): The password used during encryption

**Returns:** `Promise<Wallet>`

- `address` (string): The wallet address
- `privateKey` (string): The decrypted private key
- `mnemonic` (string | undefined): The decrypted mnemonic (if it was encrypted)

**Use Case:** Retrieving a user's wallet when they want to send a transaction. User enters their password, you decrypt the wallet, sign the transaction, then discard the decrypted wallet from memory.

**Throws:** Error if the password is incorrect or the encrypted data is corrupted.

```typescript
// Retrieve encrypted wallet from database
const encryptedWallet = await database.getWallet(userId);

// Decrypt wallet
const decrypted = await align.blockchain.wallets.decryptWallet(
  encryptedWallet,
  "super-secure-password-123"
);

console.log("Decrypted address:", decrypted.address);
console.log("Private key:", decrypted.privateKey);

// Now you can use the decrypted wallet to send transactions
const tx = await align.blockchain.wallets.sendNativeToken(
  decrypted,
  recipientAddress,
  "0.1",
  "polygon"
);

// Clear the decrypted wallet from memory after use
decrypted.privateKey = "";
```

**Best Practice:** Always clear the decrypted private key from memory after use to minimize security risks.

---

#### Encrypt/Decrypt Private Key Only

**Encrypt Private Key**

**Method:** `align.blockchain.wallets.encryptPrivateKey(privateKey: string, password: string)`

**Description:** Encrypts only the private key (without the mnemonic). Useful when you only need to store the private key and don't have a mnemonic.

**Parameters:**

- `privateKey` (string): The private key to encrypt
- `password` (string): Password for encryption

**Returns:** `Promise<{ encrypted: string; iv: string; salt: string }>`

**Decrypt Private Key**

**Method:** `align.blockchain.wallets.decryptPrivateKey(encrypted: { encrypted: string; iv: string; salt: string }, password: string)`

**Description:** Decrypts a previously encrypted private key.

**Parameters:**

- `encrypted` (object): The encrypted private key data
- `password` (string): Password used during encryption

**Returns:** `Promise<string>` - The decrypted private key

```typescript
// Encrypt just the private key
const encryptedKey = await align.blockchain.wallets.encryptPrivateKey(
  wallet.privateKey,
  "password123"
);

console.log("Encrypted key:", encryptedKey.encrypted);

// Decrypt private key
const decryptedKey = await align.blockchain.wallets.decryptPrivateKey(
  encryptedKey,
  "password123"
);

console.log("Decrypted key:", decryptedKey);
```

---

#### Get Transaction History

**Method:** `align.blockchain.wallets.getTransactionHistory(address: string, network: Network, limit?: number)`

**Description:** Retrieves the recent transaction history for a wallet address. Shows both incoming and outgoing transactions with details like amount, block number, and confirmation count.

**Parameters:**

- `address` (string): The wallet address to get history for
- `network` (Network): The blockchain network
- `limit` (number, optional): Maximum number of transactions to return (default: 10)

**Returns:** `Promise<Transaction[]>` - Array of transaction objects

**Use Case:** Displaying a user's transaction history, showing recent payments, or tracking wallet activity.

**Note:** This uses the blockchain's RPC provider to fetch transaction history. Some public RPCs may have rate limits or may not support this feature fully.

```typescript
// Get recent transactions for an address
const history = await align.blockchain.wallets.getTransactionHistory(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "polygon",
  10 // Last 10 transactions
);

history.forEach((tx) => {
  console.log(`${tx.hash}: ${tx.value} MATIC`);
  console.log(`From: ${tx.from} → To: ${tx.to}`);
  console.log(`Block: ${tx.blockNumber}, Confirmations: ${tx.confirmations}`);
});
```

---

### Blockchain Transactions

Monitor and manage blockchain transactions.

#### Types

```typescript
type TransactionStatus = "pending" | "confirmed" | "failed";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  nonce: number;
  data: string;
  chainId: number;
  status: TransactionStatus;
}

interface TransactionReceiptData {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: string;
  status: "success" | "failed";
  confirmations: number;
}

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  gasPriceGwei: string;
  totalCost: string;
  totalCostFormatted: string;
}
```

#### Get Transaction Status

```typescript
const status = await align.blockchain.transactions.getStatus(
  "0x1234567890abcdef...",
  "polygon"
);

console.log("Status:", status); // "pending" | "confirmed" | "failed"
```

#### Get Transaction Receipt

```typescript
const receipt = await align.blockchain.transactions.getReceipt(
  "0x1234567890abcdef...",
  "polygon"
);

console.log("Block number:", receipt.blockNumber);
console.log("Gas used:", receipt.gasUsed);
console.log("Status:", receipt.status); // "success" | "failed"
console.log("Confirmations:", receipt.confirmations);
```

#### Wait for Confirmation

```typescript
// Wait for 3 confirmations
const receipt = await align.blockchain.transactions.waitForConfirmation(
  "0x1234567890abcdef...",
  3, // Number of confirmations to wait for
  "polygon",
  60000 // Optional: timeout in ms (default: 60000)
);

console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
console.log(`Gas used: ${receipt.gasUsed}`);
```

#### Monitor Transaction

```typescript
// Monitor transaction with callback
await align.blockchain.transactions.monitorTransaction(
  "0x1234567890abcdef...",
  "polygon",
  (status, receipt) => {
    console.log("Transaction status:", status);

    if (receipt) {
      console.log("Confirmations:", receipt.confirmations);
      console.log("Block:", receipt.blockNumber);
    }

    if (status === "confirmed") {
      console.log("Transaction confirmed!");
    } else if (status === "failed") {
      console.log("Transaction failed!");
    }
  },
  3 // Wait for 3 confirmations
);
```

#### Estimate Gas

```typescript
// Estimate gas for native token transfer
const estimate = await align.blockchain.transactions.estimateGas(
  "0xSenderAddress...",
  "0xRecipientAddress...",
  "0.1", // Amount
  "polygon"
);

console.log("Gas limit:", estimate.gasLimit);
console.log("Gas price:", estimate.gasPriceGwei, "Gwei");
console.log("Total cost:", estimate.totalCostFormatted, "MATIC");
```

#### Estimate Gas for Token Transfer

```typescript
// Estimate gas for ERC-20 token transfer
const estimate = await align.blockchain.transactions.estimateTokenGas(
  "0xSenderAddress...",
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
  "0xRecipientAddress...",
  "10.0", // Amount
  "polygon"
);

console.log("Estimated gas:", estimate.gasLimit);
console.log("Total cost:", estimate.totalCostFormatted, "MATIC");
```

#### Send Raw Transaction

```typescript
// Send a pre-signed transaction
const tx = await align.blockchain.transactions.sendTransaction(
  wallet,
  "0xRecipientAddress...",
  "0.1",
  "polygon",
  {
    gasLimit: "21000",
    gasPrice: "30000000000", // 30 Gwei
  }
);

console.log("Transaction sent:", tx.hash);
```

---

### Blockchain Tokens

Get token information and manage token balances.

#### Types

```typescript
type Token = "usdc" | "usdt" | "dai" | "weth" | "wbtc" | "matic" | "eth";

interface TokenBalance {
  balance: string;
  balanceFormatted: string;
  decimals: number;
  symbol: string;
  name: string;
}

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}
```

#### Get Token Address

```typescript
// Get USDC address on Polygon
const usdcAddress = await align.blockchain.tokens.getTokenAddress(
  "usdc",
  "polygon"
);

console.log("USDC on Polygon:", usdcAddress);
// Output: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

#### Get Token Balance

```typescript
// Get USDC balance
const balance = await align.blockchain.tokens.getBalance(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "usdc",
  "polygon"
);

console.log(`Balance: ${balance.balanceFormatted} ${balance.symbol}`);
console.log(`Name: ${balance.name}`);
console.log(`Decimals: ${balance.decimals}`);
```

#### Get Token Balance by Address

```typescript
// Get balance for any ERC-20 token by contract address
const balance = await align.blockchain.tokens.getBalanceByAddress(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Wallet address
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Token contract
  "polygon"
);

console.log(`Balance: ${balance.balanceFormatted}`);
```

#### Get Token Info

```typescript
// Get detailed token information
const info = await align.blockchain.tokens.getTokenInfo(
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  "polygon"
);

console.log("Name:", info.name); // "USD Coin"
console.log("Symbol:", info.symbol); // "USDC"
console.log("Decimals:", info.decimals); // 6
console.log("Total Supply:", info.totalSupply);
```

#### Format Token Amount

```typescript
// Format raw token amount to human-readable
const formatted = align.blockchain.tokens.formatAmount(
  "1000000", // 1 USDC in smallest unit (6 decimals)
  6 // USDC decimals
);

console.log(formatted); // "1.0"
```

#### Parse Token Amount

```typescript
// Parse human-readable amount to smallest unit
const parsed = align.blockchain.tokens.parseAmount(
  "10.5", // 10.5 USDC
  6 // USDC decimals
);

console.log(parsed); // "10500000"
```

---

### Blockchain Contracts

Interact with smart contracts on EVM-compatible blockchains. Read contract state, write to contracts, and monitor contract events.

#### Read from Contract

Call view/pure functions on smart contracts without spending gas.

```typescript
// Read ERC-20 token balance
const balance = await align.blockchain.contracts.read({
  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
  abi: ["function balanceOf(address) view returns (uint256)"],
  method: "balanceOf",
  args: ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"],
  network: "polygon",
});

console.log("Balance:", balance); // BigInt value
```

#### Write to Contract

Execute state-changing functions on smart contracts (requires gas).

```typescript
// Approve ERC-20 token spending
const tx = await align.blockchain.contracts.write({
  wallet: myWallet,
  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  abi: ["function approve(address spender, uint256 amount) returns (bool)"],
  method: "approve",
  args: ["0xSpenderAddress...", "1000000"], // 1 USDC (6 decimals)
  network: "polygon",
});

console.log("Transaction hash:", tx.hash);
```

#### Get Contract Events

Query historical events emitted by smart contracts.

```typescript
// Get Transfer events from ERC-20 contract
const events = await align.blockchain.contracts.getEvents({
  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  abi: [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ],
  eventName: "Transfer",
  network: "polygon",
  fromBlock: 50000000,
  toBlock: 50001000,
});

events.forEach((event) => {
  console.log(`Transfer: ${event.args.from} → ${event.args.to}`);
  console.log(`Amount: ${event.args.value}`);
});
```

---

### Blockchain NFTs

Transfer and query NFT ownership for ERC-721 and ERC-1155 tokens.

#### Transfer ERC-721 NFT

Transfer a unique NFT (ERC-721) to another address.

```typescript
// Transfer NFT #123 to recipient
const tx = await align.blockchain.nfts.transferERC721({
  wallet: myWallet,
  contractAddress: "0xNFTContractAddress...",
  to: "0xRecipientAddress...",
  tokenId: "123",
  network: "ethereum",
});

console.log("NFT transferred:", tx.hash);
```

#### Transfer ERC-1155 NFT

Transfer semi-fungible tokens (ERC-1155).

```typescript
// Transfer 5 units of token #456
const tx = await align.blockchain.nfts.transferERC1155({
  wallet: myWallet,
  contractAddress: "0xERC1155ContractAddress...",
  to: "0xRecipientAddress...",
  tokenId: "456",
  amount: "5",
  network: "polygon",
});

console.log("ERC-1155 transferred:", tx.hash);
```

#### Get NFT Owner

Check who owns a specific ERC-721 NFT.

```typescript
// Get owner of NFT #789
const owner = await align.blockchain.nfts.getOwner({
  contractAddress: "0xNFTContractAddress...",
  tokenId: "789",
  network: "ethereum",
});

console.log("NFT owner:", owner); // "0x742d35..."
```

#### Check NFT Ownership

Verify if an address owns a specific NFT.

```typescript
// Check if address owns NFT #123
const isOwner = await align.blockchain.nfts.isOwner({
  contractAddress: "0xNFTContractAddress...",
  tokenId: "123",
  ownerAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  network: "ethereum",
});

console.log("Is owner:", isOwner); // true or false
```

---

### Blockchain Utilities

Helper functions for blockchain operations.

#### Validate Address

```typescript
// Check if address is valid
const isValid = align.blockchain.utils.isValidAddress(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
);

console.log("Valid address:", isValid); // true

const invalid = align.blockchain.utils.isValidAddress("0xinvalid");
console.log("Valid address:", invalid); // false
```

#### Format Ether

```typescript
// Convert wei to ether
const formatted = align.blockchain.utils.formatEther("1500000000000000000");

console.log(formatted); // "1.5"
```

#### Parse Ether

```typescript
// Convert ether to wei
const wei = align.blockchain.utils.parseEther("1.5");

console.log(wei); // "1500000000000000000"
```

---

### Complete Blockchain Example

Here's a complete example showing how to create a wallet, fund it, and send tokens:

````typescript
import Align from "@tolbel/align";

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "sandbox",
  blockchain: {
    customRpcUrls: {
      polygon: "https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY",
    },
  },
});

async function completeBlockchainWorkflow() {
  // 1. Create a new wallet
  const wallet = await align.blockchain.wallets.create();
  console.log("Created wallet:", wallet.address);

  // 2. Encrypt and store wallet
  const encrypted = await align.blockchain.wallets.encryptWallet(
    wallet,
    "secure-password"
  );
  // Store encrypted wallet in your database
  await database.saveWallet(userId, encrypted);

  // 3. Later: Retrieve and decrypt wallet
  const stored = await database.getWallet(userId);
  const decrypted = await align.blockchain.wallets.decryptWallet(
    stored,
    "secure-password"
  );

  // 4. Check balance
  const balance = await align.blockchain.wallets.getBalance(
    decrypted.address,
    "polygon"
  );
  console.log(`Balance: ${balance.balanceFormatted} ${balance.symbol}`);

  // 5. Estimate gas before sending
  const gasEstimate = await align.blockchain.transactions.estimateGas(
    decrypted.address,
    "0xRecipientAddress...",
    "0.1",
    "polygon"
  );
  console.log(`Estimated cost: ${gasEstimate.totalCostFormatted} MATIC`);

  // 6. Send transaction
  const tx = await align.blockchain.wallets.sendNativeToken(
    decrypted,
    "0xRecipientAddress...",
    "0.1",
    "polygon"
  );
  console.log("Transaction sent:", tx.hash);

  // 7. Monitor transaction
  await align.blockchain.transactions.monitorTransaction(
    tx.hash,
    "polygon",
    (status, receipt) => {
      console.log("Status:", status);
      if (status === "confirmed") {
        console.log("Transaction confirmed in block:", receipt?.blockNumber);
      }
    },
    3 // Wait for 3 confirmations
  );

  // 8. Get token balance
  const usdcBalance = await align.blockchain.tokens.getBalance(
    decrypted.address,
    "usdc",
    "polygon"
  );
  console.log(`USDC Balance: ${usdcBalance.balanceFormatted}`);

  // 9. Send tokens
  const tokenTx = await align.blockchain.wallets.sendToken(
    decrypted,
    await align.blockchain.tokens.getTokenAddress("usdc", "polygon"),
    "0xRecipientAddress...",
    "10.0",
    "polygon"
  );
  console.log("Token transfer:", tokenTx.hash);
}

completeBlockchainWorkflow().catch(console.error);
---

## API Reference

Complete reference of all available methods across all resources.

### Customers

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `create()` | `data: CreateCustomerRequest` | `Promise<Customer>` | Create a new customer |
| `get()` | `customerId: string` | `Promise<Customer>` | Get customer by ID |
| `update()` | `customerId: string, data: UpdateCustomerRequest` | `Promise<Record<string, never>>` | Update customer details |
| `list()` | `email?: string` | `Promise<CustomerListResponse>` | List all customers (optionally filter by email) |
| `createKycSession()` | `customerId: string` | `Promise<KycSessionResponse>` | Create KYC verification session |

### Virtual Accounts

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `create()` | `customerId: string, data: CreateVirtualAccountRequest` | `Promise<VirtualAccount>` | Create virtual bank account |
| `get()` | `customerId: string, virtualAccountId: string` | `Promise<VirtualAccount>` | Get virtual account by ID |
| `list()` | `customerId: string` | `Promise<VirtualAccountListResponse>` | List all virtual accounts for customer |

### Transfers

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createOfframpQuote()` | `customerId: string, data: CreateOfframpQuoteRequest` | `Promise<QuoteResponse>` | Create crypto-to-fiat quote |
| `createOnrampQuote()` | `customerId: string, data: CreateOnrampQuoteRequest` | `Promise<QuoteResponse>` | Create fiat-to-crypto quote |
| `createOfframpTransfer()` | `customerId: string, quoteId: string, data: CreateOfframpTransferRequest` | `Promise<Transfer>` | Create crypto-to-fiat transfer |
| `completeOfframpTransfer()` | `customerId: string, transferId: string, data: CompleteOfframpTransferRequest` | `Promise<Transfer>` | Complete crypto-to-fiat transfer |
| `createOnrampTransfer()` | `customerId: string, quoteId: string, data: CreateOnrampTransferRequest` | `Promise<Transfer>` | Create fiat-to-crypto transfer |
| `getOfframpTransfer()` | `customerId: string, transferId: string` | `Promise<Transfer>` | Get offramp transfer by ID |
| `getOnrampTransfer()` | `customerId: string, transferId: string` | `Promise<Transfer>` | Get onramp transfer by ID |
| `listOfframpTransfers()` | `customerId: string` | `Promise<TransferListResponse>` | List all offramp transfers |
| `listOnrampTransfers()` | `customerId: string` | `Promise<TransferListResponse>` | List all onramp transfers |
| `simulateOfframpTransfer()` | `customerId: string, data: SimulateOfframpTransferRequest` | `Promise<SimulateTransferResponse>` | Simulate offramp transfer (sandbox only) |
| `simulateOnrampTransfer()` | `customerId: string, data: SimulateOnrampTransferRequest` | `Promise<SimulateTransferResponse>` | Simulate onramp transfer (sandbox only) |

### Cross-Chain

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createTransfer()` | `customerId: string, data: CreateCrossChainTransferRequest` | `Promise<CrossChainTransfer>` | Create cross-chain transfer |
| `completeTransfer()` | `customerId: string, transferId: string, data: CompleteCrossChainTransferRequest` | `Promise<CrossChainTransfer>` | Complete cross-chain transfer |
| `getTransfer()` | `customerId: string, transferId: string` | `Promise<CrossChainTransfer>` | Get cross-chain transfer by ID |
| `createPermanentRouteAddress()` | `customerId: string, data: CreatePermanentRouteRequest` | `Promise<PermanentRouteAddress>` | Create permanent route address |
| `getPermanentRouteAddress()` | `customerId: string, addressId: string` | `Promise<PermanentRouteAddress>` | Get permanent route address by ID |
| `listPermanentRouteAddresses()` | `customerId: string` | `Promise<PermanentRouteListResponse>` | List all permanent route addresses |

### External Accounts

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `create()` | `customerId: string, data: CreateExternalAccountRequest` | `Promise<ExternalAccount>` | Link external bank account |
| `list()` | `customerId: string` | `Promise<ExternalAccountListResponse>` | List all external accounts |

### Wallets

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `verifyOwnership()` | `customerId: string, walletAddress: string` | `Promise<WalletVerification>` | Verify wallet ownership |

### Webhooks

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `create()` | `data: CreateWebhookRequest` | `Promise<Webhook>` | Create webhook endpoint |
| `list()` | - | `Promise<WebhookListResponse>` | List all webhooks |
| `delete()` | `id: string` | `Promise<void>` | Delete webhook |
| `verifySignature()` | `payload: string, signature: string, secret: string` | `boolean` | Verify webhook signature |

### Files

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `upload()` | `file: File | Blob` | `Promise<UploadFileResponse>` | Upload file for KYC |

### Developers

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getFees()` | - | `Promise<DeveloperFeesResponse>` | Get developer fee configuration |
| `updateFees()` | `request: UpdateDeveloperFeesRequest` | `Promise<DeveloperFeesResponse>` | Update developer fees |

### Blockchain - Wallets

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `create()` | - | `Promise<Wallet>` | Create new random wallet |
| `createFromMnemonic()` | `mnemonic: string` | `Promise<Wallet>` | Restore wallet from mnemonic |
| `createFromPrivateKey()` | `privateKey: string` | `Promise<Wallet>` | Import wallet from private key |
| `createFromEncrypted()` | `encrypted: string, password: string` | `Promise<Wallet>` | Decrypt and restore wallet |
| `getAddress()` | `wallet: Wallet` | `string` | Extract address from wallet |
| `getBalance()` | `address: string, network: Network` | `Promise<string>` | Get native token balance |
| `getTokenBalance()` | `address: string, token: string, network: Network` | `Promise<string>` | Get ERC-20 token balance |
| `sendNativeToken()` | `wallet: Wallet, to: string, amount: string, network: Network` | `Promise<Transaction>` | Send native token |
| `sendToken()` | `wallet: Wallet, token: string, to: string, amount: string, network: Network` | `Promise<Transaction>` | Send ERC-20 token |
| `encryptPrivateKey()` | `privateKey: string, password: string` | `Promise<EncryptedWallet>` | Encrypt private key |
| `decryptPrivateKey()` | `encrypted: EncryptedWallet, password: string` | `Promise<string>` | Decrypt private key |
| `encryptWallet()` | `wallet: Wallet, password: string` | `Promise<EncryptedWallet>` | Encrypt entire wallet |
| `decryptWallet()` | `encrypted: EncryptedWallet, password: string` | `Promise<Wallet>` | Decrypt entire wallet |
| `signMessage()` | `wallet: Wallet, message: string` | `Promise<string>` | Sign message with wallet |
| `signTypedData()` | `wallet: Wallet, domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, unknown>` | `Promise<string>` | Sign EIP-712 typed data |

### Blockchain - Transactions

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `sendNativeToken()` | `wallet: Wallet, to: string, amount: string, network: Network` | `Promise<Transaction>` | Send native token (ETH, MATIC, etc.) |
| `sendToken()` | `wallet: Wallet, token: Token, to: string, amount: string, network: Network` | `Promise<Transaction>` | Send ERC-20 token |
| `estimateGas()` | `from: string, to: string, amount: string, network: Network, data?: string` | `Promise<GasEstimate>` | Estimate transaction gas cost |
| `getStatus()` | `txHash: string, network: Network` | `Promise<TransactionStatus>` | Get transaction status |
| `waitForConfirmation()` | `txHash: string, network: Network, confirmations?: number` | `Promise<TransactionReceiptData>` | Wait for transaction confirmation |

### Blockchain - Tokens

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getBalance()` | `address: string, token: Token, network: Network` | `Promise<string>` | Get token balance |
| `getAddress()` | `token: Token, network: Network` | `string` | Get token contract address |
| `formatAmount()` | `amount: string, decimals: number` | `string` | Format token amount (wei → human) |
| `parseAmount()` | `amount: string, decimals: number` | `string` | Parse token amount (human → wei) |
| `getTokenInfo()` | `address: string, network: Network` | `Promise<TokenInfo>` | Get token metadata (name, symbol, decimals) |

### Blockchain - Contracts

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `read()` | `params: ContractCall` | `Promise<unknown>` | Call view/pure contract function |
| `write()` | `params: ContractTransaction` | `Promise<Transaction>` | Execute state-changing contract function |
| `getEvents()` | `params: ContractEventQuery` | `Promise<ContractEvent[]>` | Query contract events |

### Blockchain - NFTs

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `transferERC721()` | `params: NFTTransfer` | `Promise<Transaction>` | Transfer ERC-721 NFT |
| `transferERC1155()` | `params: NFTTransfer & { amount: string }` | `Promise<Transaction>` | Transfer ERC-1155 NFT |
| `getOwner()` | `params: { contractAddress: string, tokenId: string, network: Network }` | `Promise<string>` | Get ERC-721 NFT owner |
| `isOwner()` | `params: { contractAddress: string, tokenId: string, ownerAddress: string, network: Network }` | `Promise<boolean>` | Check if address owns NFT |

### Blockchain - Providers

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getProvider()` | `network: Network` | `JsonRpcProvider` | Get RPC provider for network |
| `setCustomRpc()` | `network: Network, rpcUrl: string` | `void` | Set custom RPC URL |
| `getNetworkInfo()` | `network: Network` | `NetworkConfig` | Get network configuration |

### Blockchain - Utils

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `isValidAddress()` | `address: string` | `boolean` | Validate Ethereum address |
| `toChecksumAddress()` | `address: string` | `string` | Convert to EIP-55 checksum format |
| `formatAddress()` | `address: string, visibleChars?: number` | `string` | Format address for display (0x1234...abcd) |
| `isZeroAddress()` | `address: string` | `boolean` | Check if address is zero address |
| `formatEther()` | `amount: string | bigint` | `string` | Convert wei to ether |
| `parseEther()` | `amount: string` | `string` | Convert ether to wei |
| `formatGwei()` | `amount: string | bigint` | `string` | Convert wei to gwei |
| `parseGwei()` | `amount: string` | `string` | Convert gwei to wei |
| `formatTransactionHash()` | `txHash: string, visibleChars?: number` | `string` | Format tx hash for display |
| `resolveName()` | `name: string, provider: JsonRpcProvider` | `Promise<string | null>` | Resolve ENS name to address |
| `lookupAddress()` | `address: string, provider: JsonRpcProvider` | `Promise<string | null>` | Reverse lookup address to ENS name |

---

## Error Handling

The SDK provides custom error classes for better error handling.

### Error Types

```typescript
import { AlignError, AlignValidationError } from "@tolbel/align";

try {
  const customer = await align.customers.create({
    email: "invalid-email", // Invalid email format
    first_name: "John",
    last_name: "Doe",
    type: "individual",
  });
} catch (error) {
  if (error instanceof AlignValidationError) {
    console.error("Validation error:", error.message);
    console.error("Field errors:", error.fieldErrors);
    // Field errors: { email: ['Invalid email'] }
  } else if (error instanceof AlignError) {
    console.error("API error:", error.message);
    console.error("Status code:", error.statusCode);
  } else {
    console.error("Unexpected error:", error);
  }
}
````

### Handling API Errors

```typescript
try {
  const transfer = await align.transfers.createOfframpTransfer({
    transfer_purpose: "Payment",
    destination_external_account_id: "invalid_id",
  });
} catch (error) {
  if (error instanceof AlignError) {
    switch (error.statusCode) {
      case 400:
        console.error("Bad request:", error.message);
        break;
      case 401:
        console.error("Unauthorized - check your API key");
        break;
      case 404:
        console.error("Resource not found");
        break;
      case 429:
        console.error("Rate limit exceeded");
        break;
      case 500:
        console.error("Server error");
        break;
      default:
        console.error("API error:", error.message);
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

  // Shared Types (NEW in v1.0.2)
  KycStatus,
  WebhookStatus,
  CustomerType,

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
  WebhookEventType,
  WebhookEntityType,
  WebhookListResponse,

  // Developers
  DeveloperFee,

  // Errors
  AlignError,
  AlignValidationError,
} from "@tolbel/align";
```

---

## Advanced Usage

### Custom HTTP Client Configuration

```typescript
import Align from "@tolbel/align";

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
  timeout: 60000, // 60 seconds
  baseUrl: "https://your-proxy.com/alignlab", // Custom proxy
});
```

### Debug Logging

Enable logging to debug requests and responses:

```typescript
import Align from "@tolbel/align";

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
  debug: true, // Enable logging
  logLevel: "debug", // Set log level: 'error' | 'warn' | 'info' | 'debug'
});

// Logs will show:
// - Request details (URL, method)
// - Response details (status code)
// - Error details (status, code, message)
```

**Note**: Logging is disabled by default for production. When `debug: false`, the logger has zero overhead.

### Using with Next.js App Router

```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  Align,
  type CreateCustomerRequest,
  AlignValidationError,
} from "@tolbel/align";

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCustomerRequest;

    // Validate required fields
    if (!body.email || !body.first_name || !body.last_name || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const customer = await align.customers.create(body);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const customers = await align.customers.list(page, limit);

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error listing customers:", error);
    return NextResponse.json(
      { error: "Failed to list customers" },
      { status: 500 }
    );
  }
}
```

### Using with Next.js Pages Router

```typescript
// pages/api/customers/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  Align,
  type CreateCustomerRequest,
  type Customer,
  AlignValidationError,
} from "@tolbel/align";

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
});

type ErrorResponse = {
  error: string;
  details?: Record<string, string[]>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Customer | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as CreateCustomerRequest;

    const customer = await align.customers.create(body);

    return res.status(201).json(customer);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    console.error("Error creating customer:", error);
    return res.status(500).json({ error: "Failed to create customer" });
  }
}
```

### Using with Express.js

```typescript
import express, { Request, Response } from "express";
import {
  Align,
  type CreateCustomerRequest,
  AlignValidationError,
  AlignError,
} from "@tolbel/align";

const app = express();
const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
});

app.use(express.json());

// Create customer
app.post("/api/customers", async (req: Request, res: Response) => {
  try {
    const customer = await align.customers.create(
      req.body as CreateCustomerRequest
    );
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }
    if (error instanceof AlignError) {
      return res.status(error.status).json({
        error: error.message,
        code: error.code,
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get customer
app.get("/api/customers/:id", async (req: Request, res: Response) => {
  try {
    const customer = await align.customers.get(req.params.id);
    res.json(customer);
  } catch (error) {
    if (error instanceof AlignError && error.status === 404) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create offramp transfer
app.post("/api/transfers/offramp", async (req: Request, res: Response) => {
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
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({ error: "Failed to create transfer" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Using with Fastify

```typescript
import Fastify from "fastify";
import {
  Align,
  type CreateCustomerRequest,
  AlignValidationError,
} from "@tolbel/align";

const fastify = Fastify({ logger: true });

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
});

fastify.post<{ Body: CreateCustomerRequest }>(
  "/api/customers",
  async (request, reply) => {
    try {
      const customer = await align.customers.create(request.body);
      return reply.status(201).send(customer);
    } catch (error) {
      if (error instanceof AlignValidationError) {
        return reply.status(400).send({
          error: "Validation failed",
          details: error.errors,
        });
      }
      return reply.status(500).send({ error: "Failed to create customer" });
    }
  }
);

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
});
```

### Using with Hono

```typescript
import { Hono } from "hono";
import {
  Align,
  type CreateCustomerRequest,
  AlignValidationError,
} from "@tolbel/align";

const app = new Hono();

const align = new Align({
  apiKey: process.env.ALIGNLAB_API_KEY!,
  environment: "production",
});

app.post("/api/customers", async (c) => {
  try {
    const body = await c.req.json<CreateCustomerRequest>();
    const customer = await align.customers.create(body);

    return c.json(customer, 201);
  } catch (error) {
    if (error instanceof AlignValidationError) {
      return c.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        400
      );
    }
    return c.json({ error: "Failed to create customer" }, 500);
  }
});

export default app;
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
