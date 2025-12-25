# Align SDK

**TypeScript/JavaScript SDK** for the [AlignLab](https://docs.alignlabs.dev) API. Build powerful payment infrastructure with fiat-to-crypto, crypto-to-fiat, cross-chain transfers, and blockchain operations.

[![npm version](https://img.shields.io/npm/v/@tolbel/align.svg)](https://www.npmjs.com/package/@tolbel/align)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Documentation

**Full documentation available at: [align.tolbel.com](https://align.tolbel.com)**

---

## Features

- 🔐 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Built with ES modules and async/await
- ✅ **Validated**: Request validation with Zod schemas
- 🔒 **Secure**: HMAC-SHA256 webhook signature verification
- ⛓️ **Blockchain**: Complete wallet, transaction, and smart contract support
- 📦 **Lightweight**: Minimal dependencies
- 🌍 **Multi-Environment**: Sandbox and production environments

## Installation

```bash
npm install @tolbel/align
# or
yarn add @tolbel/align
# or
pnpm add @tolbel/align
# or
bun add @tolbel/align
```

## Quick Start

```typescript
import Align from "@tolbel/align";

const align = new Align({
  apiKey: process.env.ALIGN_API_KEY!,
  environment: "sandbox", // or "production"
});

// Create a customer
const customer = await align.customers.create({
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  type: "individual",
});

// Create a virtual account for deposits
const virtualAccount = await align.virtualAccounts.create(
  customer.customer_id,
  {
    source_currency: "eur",
    destination_token: "usdc",
    destination_network: "polygon",
    destination_address: "0x...",
  }
);

console.log("Deposit IBAN:", virtualAccount.deposit_instructions);
```

## SDK Resources

### API Resources

| Resource                 | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `align.customers`        | Create, update, and manage customers           |
| `align.virtualAccounts`  | Virtual bank accounts for deposits             |
| `align.transfers`        | Onramp (fiat→crypto) and Offramp (crypto→fiat) |
| `align.crossChain`       | Cross-chain cryptocurrency transfers           |
| `align.externalAccounts` | Link external bank accounts                    |
| `align.wallets`          | Wallet ownership verification                  |
| `align.webhooks`         | Webhook management and signature verification  |
| `align.developers`       | Developer fee configuration                    |
| `align.files`            | File uploads for KYC                           |

### Blockchain Resources

| Resource                        | Description                                |
| ------------------------------- | ------------------------------------------ |
| `align.blockchain.wallets`      | Create, encrypt, sign, send                |
| `align.blockchain.transactions` | Send tokens, estimate gas, track status    |
| `align.blockchain.tokens`       | Token balances, addresses, formatting      |
| `align.blockchain.contracts`    | Read/write smart contracts, query events   |
| `align.blockchain.nfts`         | Transfer ERC-721/ERC-1155, check ownership |
| `align.blockchain.providers`    | RPC provider management                    |
| `align.blockchain.utils`        | Address validation, ENS, formatting        |

## Example: Complete Offramp Flow

```typescript
// 1. Create an offramp quote
const quote = await align.transfers.createOfframpQuote(customerId, {
  source_amount: "100.00",
  source_token: "usdc",
  source_network: "polygon",
  destination_currency: "usd",
  destination_payment_rails: "ach",
});

// 2. Create the transfer
const transfer = await align.transfers.createOfframpTransfer(
  customerId,
  quote.quote_id,
  {
    transfer_purpose: "commercial_investment",
    destination_external_account_id: "ext_acc_123",
  }
);

// 3. Send crypto to the deposit address, then complete
const completed = await align.transfers.completeOfframpTransfer(
  customerId,
  transfer.id,
  { deposit_transaction_hash: "0x..." }
);
```

## Example: Blockchain Wallet Operations

```typescript
// Create a new wallet
const wallet = await align.blockchain.wallets.create();
console.log("Address:", wallet.address);
console.log("Mnemonic:", wallet.mnemonic); // Save securely!

// Check balance
const balance = await align.blockchain.wallets.getBalance(
  wallet.address,
  "polygon"
);
console.log("POL Balance:", balance);

// Send tokens
const tx = await align.blockchain.transactions.sendToken(
  wallet,
  "usdc",
  "0xRecipient...",
  "50.0",
  "polygon"
);
console.log("TX Hash:", tx.hash);

// Sign a message
const signature = await align.blockchain.wallets.signMessage(
  wallet,
  "Hello, Align!"
);
```

## Webhook Verification

```typescript
import express from "express";

app.post("/webhooks", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["x-hmac-signature"] as string;
  const payload = req.body.toString("utf8");

  const isValid = align.webhooks.verifySignature(payload, signature);

  if (!isValid) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(payload);
  // Process event...

  res.status(200).send("OK");
});
```

## Error Handling

```typescript
import { AlignError, AlignValidationError } from "@tolbel/align";

try {
  const customer = await align.customers.create({
    email: "invalid-email",
    type: "individual",
  });
} catch (error) {
  if (error instanceof AlignValidationError) {
    console.error("Validation failed:", error.errors);
  } else if (error instanceof AlignError) {
    console.error("API error:", error.message, error.statusCode);
  }
}
```

## Type Exports

All types are exported for TypeScript users:

```typescript
import type {
  Customer,
  VirtualAccount,
  Transfer,
  Wallet,
  Transaction,
  // ... and many more
} from "@tolbel/align";
```

## Supported Networks

| Network  | Chain ID | Native Token |
| -------- | -------- | ------------ |
| Ethereum | 1        | ETH          |
| Polygon  | 137      | POL          |
| Base     | 8453     | ETH          |
| Arbitrum | 42161    | ETH          |
| Optimism | 10       | ETH          |
| Solana   | -        | SOL          |
| Tron     | -        | TRX          |

## Documentation

For complete API reference, guides, and examples, visit:

### 📖 **[align.tolbel.com](https://align.tolbel.com)**

---

## License

MIT © [Kibru Kuture](https://github.com/kibrukuture)
