# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [3.4.0] - 2025-11-20

### Breaking Changes
- **Developer Fees API**:
  - Endpoint path changed from `/developers/fees` to `/v0/developer/fees`
  - `getFees()`: Response structure changed from `DeveloperFee[]` to `DeveloperFeesResponse`
  - `updateFees()`: HTTP method changed from POST to PUT, request structure completely changed
  - Removed `DeveloperFee` type (replaced with `DeveloperReceivableFee`)

### Added
- **Developer Fees API**:
  - `ServiceType`: Type for service types ('onramp' | 'offramp' | 'cross_chain_transfer')
  - `AccrualBasis`: Type for fee calculation method ('percentage')
  - `DeveloperReceivableFee`: Individual fee configuration with service_type, accrual_basis, value
  - `DeveloperFeesResponse`: Response wrapper with developer_receivable_fees array
  - `UpdateDeveloperFeesRequest`: Request structure with fees by service type

### Migration Guide
#### Developer Fees
```typescript
// Old (v3.3.0)
const fees = await align.developers.getFees();
fees.forEach(fee => {
  console.log(`${fee.percent}% → ${fee.wallet_address}`);
});

await align.developers.updateFees([
  { id: 'fee_1', percent: '0.5', wallet_address: '0x...' }
]);

// New (v3.4.0)
const response = await align.developers.getFees();
response.developer_receivable_fees.forEach(fee => {
  console.log(`${fee.service_type}: ${fee.value}%`);
});

await align.developers.updateFees({
  developer_receivable_fees: {
    onramp: 1,
    offramp: 1,
    cross_chain_transfer: 1,
  },
});
```

## [3.3.0] - 2025-11-20

### Breaking Changes
- **Cross-Chain Transfers API**:
  - Removed `createQuote` method (quote is now returned in `createTransfer` response)
  - `createTransfer`: Now requires `customerId` as first argument and takes full transfer details directly (no `quote_id`)
  - `getTransfer`: Now requires both `customerId` and `transferId`
  - `createPermanentRoute`: Renamed to `createPermanentRouteAddress`, now requires `customerId` and different request structure
  - `listPermanentRoutes`: Renamed to `listPermanentRouteAddresses`, now requires `customerId`

### Added
- **Cross-Chain Transfers API**:
  - `completeTransfer`: New method to finalize transfers by providing deposit transaction hash
  - `getPermanentRouteAddress`: New method to retrieve a specific permanent route by ID
  - `CreateCrossChainTransferRequest`: Updated to include all transfer details directly
  - `CompleteCrossChainTransferRequest`: New type for completing transfers
  - `CreatePermanentRouteRequest`: New simplified request structure
  - `PermanentRouteAddress`: New response type with `route_chain_addresses` for multiple networks
  - `PermanentRouteListResponse`: New list response wrapper

### Migration Guide
#### Cross-Chain Transfers
```typescript
// Old (v3.2.0)
const quote = await align.crossChain.createQuote({
  source_token: 'usdc',
  source_network: 'ethereum',
  destination_token: 'usdc',
  destination_network: 'polygon',
  amount: '100.00',
  is_source_amount: true,
});
const transfer = await align.crossChain.createTransfer({
  quote_id: quote.quote_id,
  destination_address: '0x742d35...',
});

// New (v3.3.0)
const transfer = await align.crossChain.createTransfer(customerId, {
  amount: '100.00',
  source_network: 'ethereum',
  source_token: 'usdc',
  destination_network: 'polygon',
  destination_token: 'usdc',
  destination_address: '0x742d35...',
});
// Quote is now in transfer.quote
console.log(transfer.quote.fee_amount);

// Complete the transfer
await align.crossChain.completeTransfer(customerId, transfer.id, {
  deposit_transaction_hash: '0x123...',
});
```

## [3.2.0] - 2025-11-20

### Breaking Changes
- **Onramp Transfers API**:
  - `createOnrampQuote`: Now requires `customerId` as the first argument.
  - `createOnrampTransfer`: Now requires `customerId` and `quoteId` as arguments. Request body now requires `destination_address` instead of `transfer_purpose`.
  - `listOnrampTransfers`: Now requires `customerId`.
  - `getOnrampTransfer`: Now requires `customerId`.
  - `simulate`: Renamed to `simulateOfframpTransfer` for consistency.

### Added
- **Transfers API**:
  - `completeOfframpTransfer`: Added to support the transfer completion flow (required after deposit).
  - `simulateOfframpTransfer`: Renamed from `simulate`.
  - `simulateOnrampTransfer`: New method for simulating onramp transfer actions in sandbox.
  - `CreateOnrampTransferRequest`: New strict type for onramp transfer creation.
  - `SimulateOnrampTransferRequest`: New type for onramp simulation.

### Migration Guide
#### Onramp Transfers
```typescript
// Old
const quote = await align.transfers.createOnrampQuote({...});
const transfer = await align.transfers.createOnrampTransfer({...});

// New
const quote = await align.transfers.createOnrampQuote(customerId, {...});
const transfer = await align.transfers.createOnrampTransfer(customerId, quote.quote_id, {
  destination_address: '0x...'
});
```

## [3.1.0] - 2025-11-20

### ⚠️ Breaking Changes (Offramp Transfers)

The Offramp Transfers API has been completely rewritten to align with the official AlignLab API documentation. The previous implementation was incorrect.

- **Endpoints**: All offramp endpoints now follow the `/v0/customers/{customer_id}/offramp-transfer/...` pattern.
- **Methods**:
  - `createOfframpQuote`: Now requires `customerId` as the first argument.
  - `createOfframpTransfer`: Now requires `customerId` and `quoteId` as arguments.
  - `getOnrampTransfer`: Now requires `customerId`.
  - `simulate`: Renamed to `simulateOfframpTransfer` for consistency.

### Added
- **Transfers API**:
  - `completeOfframpTransfer`: Added to support the transfer completion flow (required after deposit).
  - `simulateOfframpTransfer`: Renamed from `simulate`.
  - `simulateOnrampTransfer`: New method for simulating onramp transfer actions in sandbox.
  - `CreateOnrampTransferRequest`: New strict type for onramp transfer creation.
  - `SimulateOnrampTransferRequest`: New type for onramp simulation. actions in Sandbox.
- **Types**:
  - `CreateTransferFromQuoteRequest`: `destination_bank_account` now strictly accepts `IbanAccountDetails | UsAccountDetails`.
  - Added `CompleteOfframpTransferRequest`, `SimulateTransferRequest`, `TransferListResponse`.

### Migration Guide

#### Offramp Transfers

```typescript
// BEFORE (Incorrect)
const quote = await align.transfers.createOfframpQuote({...});
const transfer = await align.transfers.createOfframpTransfer({...});

// AFTER (Correct)
const quote = await align.transfers.createOfframpQuote(customerId, {...});
const transfer = await align.transfers.createOfframpTransfer(customerId, quote.quote_id, {...});

// NEW: Complete the transfer
await align.transfers.completeOfframpTransfer(customerId, transfer.id, {
  deposit_transaction_hash: '0x...'
});
```

## [3.0.1] - 2025-11-20

### Changed
- **BREAKING**: Customers API completely rewritten to match official AlignLab API documentation
  - `CustomerType`: Changed from `'business'` to `'corporate'`
  - Field names: `id` → `customer_id`
  - Added `company_name` field (required for corporate customers)
  - Added `address` object (available for approved KYC)
  - Added detailed `kycs` object with status breakdown and sub-status
  - `CreateCustomerRequest`: Made `first_name`/`last_name` optional (required only for individual)
  - `UpdateCustomerRequest`: Now accepts `documents` array instead of customer fields
  - Update method: Changed from PATCH to PUT
  - `CustomerListResponse`: Changed from `{ data, has_more, total_count }` to `{ items }`
  - List method: Removed pagination, added optional `email` filter parameter
  - `KycSessionResponse`: Changed from `{ session_id, url, status }` to `{ kycs: { kyc_flow_link } }`

- **BREAKING**: External Accounts API completely rewritten to match official AlignLab API documentation
  - Endpoint structure: Now requires `customer_id` in path: `/v0/customers/{customer_id}/external-accounts`
  - `create()` method: Now requires `customer_id` as first parameter
  - Added `list(customer_id)` method to retrieve all external accounts for a customer
  - `ExternalAccount` interface: Now complete with all response fields
  - Renamed `Address` to `ExternalAccountAddress`
  - Added proper IBAN/US account type discrimination with union types

### Added
- New customer types exported:
  - `CustomerAddress` - Address information for approved KYC customers
  - `CustomerKycs` - Detailed KYC status information
  - `KycStatusBreakdown` - KYC status by currency and payment rails
  - `KycSubStatus` - KYC verification sub-statuses
  - `CustomerDocument` - Document upload structure
- Added `put()` method to HttpClient for PUT requests

### Migration Guide

#### 1. Update CustomerType
```typescript
// Before
type: 'business'

// After
type: 'corporate'
```

#### 2. Update Field Names
```typescript
// Before
customer.id
customer.kyc_status

// After
customer.customer_id
customer.kycs?.sub_status
```

#### 3. Update Create Customer
```typescript
// Before - all fields required
await align.customers.create({
  email: 'contact@acme.com',
  first_name: '',  // Had to provide empty strings
  last_name: '',
  type: 'business',
});

// After - conditional fields
await align.customers.create({
  email: 'contact@acme.com',
  type: 'corporate',
  company_name: 'Acme Corporation',  // Required for corporate
});
```

#### 4. Update Customer Updates
```typescript
// Before
await align.customers.update(customerId, {
  email: 'new@email.com',
  first_name: 'John',
});

// After - now uses documents
await align.customers.update(customerId, {
  documents: [
    {
      file_id: 'file_uuid',
      purpose: 'id_document',
      description: 'Driver license',
    },
  ],
});
```

#### 5. Update List Customers
```typescript
// Before
const customers = await align.customers.list(1, 20);
console.log(customers.data);

// After
const customers = await align.customers.list();
console.log(customers.items);

// Or filter by email
const filtered = await align.customers.list('alice@example.com');
```

#### 6. Update KYC Session
```typescript
// Before
const session = await align.customers.createKycSession(customerId);
window.location.href = session.url;

// After
const session = await align.customers.createKycSession(customerId);
window.location.href = session.kycs.kyc_flow_link;
```

#### 7. Update External Account Creation
```typescript
// Before
await align.externalAccounts.create({
  bank_name: 'Chase Bank',
  account_holder_type: 'individual',
  // ...
});

// After - now requires customer_id
await align.externalAccounts.create(customerId, {
  bank_name: 'Chase Bank',
  account_holder_type: 'individual',
  // ...
});
```

#### 8. List External Accounts
```typescript
// Before - method didn't exist
// Had to use get(id) for single account

// After - new list method
const accounts = await align.externalAccounts.list(customerId);
console.log(accounts.items);
```

## [2.0.0] - 2025-11-20

### Changed
- **BREAKING**: `Align` is now the default export for cleaner import syntax
  - **Before**: `import { Align } from '@schnl/align';`
  - **After**: `import Align from '@schnl/align';`
  - Named export still available for backwards compatibility: `import { Align } from '@schnl/align';`

### Migration Guide

Update your imports from:
```typescript
import { Align } from '@schnl/align';
```

To:
```typescript
import Align from '@schnl/align';
```

You can still import types alongside the default export:
```typescript
import Align, { KycStatus, WebhookEvent } from '@schnl/align';
```

## [1.2.0] - 2025-11-20

### Added
- **Comprehensive JSDoc documentation** for all SDK resource classes (32 methods total)
  - Detailed parameter descriptions with types and constraints
  - Real-world code examples for every method
  - Return value documentation
  - Error handling documentation with `@throws` tags
  - Remarks for important implementation details
- Enhanced IDE autocomplete and IntelliSense support
- Improved developer experience with inline documentation

### Resources Documented
- `WebhooksResource` (4 methods)
- `CustomersResource` (5 methods)
- `VirtualAccountsResource` (3 methods)
- `TransfersResource` (9 methods)
- `CrossChainResource` (5 methods)
- `ExternalAccountsResource` (2 methods)
- `WalletsResource` (1 method)
- `FilesResource` (1 method)
- `DevelopersResource` (2 methods)

## [1.1.0] - 2025-11-20

### Changed
- **BREAKING**: Fixed `WebhookEvent` structure to match official AlignLab API
  - Replaced `id`, `type`, `data` fields with `event_type`, `entity_id`, `entity_type`
  - Added `WebhookEventType` union type for event types
  - Added `WebhookEntityType` union type for entity types
- **BREAKING**: `webhooks.list()` now returns `WebhookListResponse` with `{ items: Webhook[] }` structure
- Updated webhook signature verification documentation to use correct `x-hmac-signature` header
- Removed `events` field from `Webhook` interface (not in official API)

### Added
- `WebhookEventType` type export
- `WebhookEntityType` type export
- `WebhookListResponse` type export

## [1.0.3] - 2025-11-19

### Changed
- Updated README.md to document new shared type exports (`KycStatus`, `WebhookStatus`, `CustomerType`)
- Updated inline type definitions in README to use shared types for consistency

## [1.0.2] - 2025-11-19

### Changed
- **BREAKING (Type Safety)**: Replaced loose `string` types with strict union types
  - `KycSessionResponse.status` now uses `KycStatus` type
  - `Webhook.status` now uses `WebhookStatus` type
  - `Customer.type` and `CreateCustomerRequest.type` now use `CustomerType` type
- Created shared type definitions in `common.ts` (single source of truth)
- Exported `KycStatus`, `WebhookStatus`, and `CustomerType` from main package

### Fixed
- Eliminated duplicate type definitions across resources
- Improved TypeScript autocomplete and type safety

## [1.0.1] - 2025-11-19

### Changed
- Clarified SDK as non-official in README description
- Updated AlignLab documentation link to docs.alignlabs.dev

## [1.0.0] - 2025-11-19

### Added
- Initial release of @schnl/align SDK
- Customer management (create, get, update, list, KYC sessions)
- Virtual account creation and management
- Offramp transfers (crypto to fiat)
- Onramp transfers (fiat to crypto)
- Cross-chain transfers with permanent routes
- External account linking (US and IBAN)
- Wallet ownership verification
- Webhook management with HMAC-SHA256 signature verification
- File upload for KYC documents
- Developer fee management
- Full TypeScript support with comprehensive type definitions
- Request validation with Zod schemas
- Custom error classes (AlignError, AlignValidationError)
- Sandbox and production environment support
