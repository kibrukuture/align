# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [1.1.0] - 2025-11-21
### Added
- Full blockchain module now exported:
  - `new Blockchain({ customRpcUrls? })`
  - `sdk.blockchain.wallets`, `sdk.blockchain.transactions`, `sdk.blockchain.tokens`, `sdk.blockchain.providers`
- New `BlockchainConfig` type for optional RPC overrides.
- Updated imports to use the `@/resources/blockchain/constants/networks` alias.
- Documentation and JSDoc updates for the new public API.


## [1.0.0] - 2025-01-20

### Initial Release

First stable release of the AlignLab TypeScript SDK.

### Features

- **Full TypeScript Support**: Comprehensive type definitions for all API endpoints
- **Customer Management**: Create, get, update, and list customers
- **Virtual Accounts**: Create and manage virtual bank accounts for deposits
- **Transfers**: Support for onramp (fiat-to-crypto) and offramp (crypto-to-fiat) transfers
- **Cross-Chain Transfers**: Transfer cryptocurrency across different blockchain networks
- **External Accounts**: Link external bank accounts (IBAN and US accounts)
- **Wallet Verification**: Verify cryptocurrency wallet ownership
- **Webhooks**: Create, list, and verify webhook signatures
- **File Uploads**: Upload documents for KYC verification
- **Developer Fees**: Manage developer fee configurations

### Technical

- **HTTP Client**: Built on axios with automatic retry logic
- **Error Handling**: Custom error classes with proper TypeScript types
- **Validation**: Request validation using Zod schemas
- **Logging**: Optional request/response logging with pino
- **Environments**: Support for sandbox and production environments
- **Retry Logic**: Automatic retry with exponential backoff for transient errors

### Dependencies

- `axios` ^1.13.2 - HTTP client
- `axios-retry` ^4.5.0 - Retry mechanism
- `pino` ^10.1.0 - Logging
- `zod` ^4.1.12 - Schema validation
