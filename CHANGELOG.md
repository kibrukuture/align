# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


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
