# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


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
