# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the official TypeScript SDK for DeFindex - a decentralized vault management system built on Stellar using Soroban smart contracts. The SDK provides server-side access to vault operations, factory deployments, authentication, and transaction management for the DeFindex ecosystem.

## Development Commands

### Build and Development
- `pnpm run build` - Compile TypeScript to JavaScript in dist/
- `pnpm run build:watch` - Watch mode compilation
- `pnpm run clean` - Remove dist/ directory

### Testing
- `pnpm test` or `pnpm run test:unit` - Run unit tests with mocked dependencies
- `pnpm run test:integration` - Run integration tests against real API (requires credentials)
- `pnpm run test:all` - Run both unit and integration tests
- `pnpm run test:watch` - Watch mode for unit tests
- `pnpm run test:coverage` - Generate coverage report

### Code Quality
- `pnpm run lint` - Run ESLint on TypeScript files
- `pnpm run lint:fix` - Fix ESLint issues automatically

### Publishing
- `pnpm run prepare` - Builds before publishing
- `pnpm run prepublishOnly` - Runs tests and linting before publishing

## Architecture

### Core Components
- **DefindexSDK** (`src/defindex-sdk.ts`) - Main SDK class that orchestrates all operations
- **HttpClient** (`src/clients/http-client.ts`) - Centralized HTTP client with Bearer token authentication

### API Operations
The SDK provides methods organized into the following categories:

**System Operations:**
- `healthCheck()` - API health monitoring

**Factory Operations:**
- `getFactoryAddress()` - Get factory contract address
- `createVault()` - Create a new vault
- `createVaultWithDeposit()` - Create vault with initial deposit

**Vault Operations:**
- `getVaultInfo()` - Get comprehensive vault information
- `getVaultBalance()` - Get user's vault balance and shares
- `getReport()` - Get vault report with transaction details
- `depositToVault()` - Deposit assets into vault
- `withdrawFromVault()` - Withdraw specific amounts
- `withdrawShares()` - Withdraw by shares
- `getVaultAPY()` - Get vault APY

**Vault Management (Admin):**
- `rebalanceVault()` - Rebalance vault strategies (Rebalance Manager)
- `emergencyRescue()` - Emergency asset rescue (Emergency Manager)
- `pauseStrategy()` - Pause a strategy (Manager)
- `unpauseStrategy()` - Unpause a strategy (Manager)

**Role Operations:**
- `getVaultRole()` - Get address for a specific role
- `setVaultRole()` - Assign new address to a role (Manager)

**Fee Management:**
- `lockVaultFees()` - Lock fees and optionally update fee rate (Manager)
- `releaseVaultFees()` - Release fees from a strategy (Manager)
- `distributeVaultFees()` - Distribute accumulated fees (Manager)

**Contract Management:**
- `upgradeVaultWasm()` - Upgrade vault WASM contract (Manager)

**Transaction Operations:**
- `sendTransaction()` - Submit signed transactions (supports LaunchTube)

### Authentication Flow
1. SDK initializes with API key for automatic authentication
2. API key provides persistent authentication with Bearer tokens
3. All authenticated requests use API key authorization
4. Role-based access control for administrative operations

### Type System
Comprehensive TypeScript types are defined in `src/types/`:
- `base.types.ts` - Core enums (SupportedNetworks) and BaseVaultTransactionResponse
- `factory.types.ts` - Vault factory configuration and response types
- `vault.types.ts` - Vault operations, roles (VaultRoles enum), fees, instructions, and management types
- `stellar.types.ts` - Transaction and blockchain interaction types
- `network.types.ts` - Network configuration types
- `index.ts` - Main type exports

## Testing Strategy

### Unit Tests
- Located in `tests/` directory
- Mock all external dependencies using Jest
- Focus on SDK logic and type safety
- Configuration in `jest.config.js`
- Excludes integration tests via `testPathIgnorePatterns`

### Integration Tests
- Located in `tests/integration/` directory
- Test against real DeFindex API
- Require environment variables for authentication
- Configuration in `jest.integration.config.js`
- Extended timeout (30s) for network operations
- May be flaky due to network/API dependencies

## Environment Configuration

### Required Environment Variables for Integration Tests
```bash
# Authentication credentials for DeFindex API
export DEFINDEX_API_KEY="sk_your_api_key_here"
```

### SDK Configuration
The SDK accepts a `DefindexSDKConfig` object including:
- `apiKey` - API key for authentication (required for most operations)
- `baseUrl` - Custom API base URL (optional, defaults to 'https://api.defindex.io')
- `timeout` - Request timeout in milliseconds (default 30000)

## Build Configuration

### TypeScript
- Target: ES2020
- CommonJS modules
- Strict mode enabled
- Generates declaration files and source maps
- Output to `dist/` directory

### Package Structure
- Entry point: `dist/index.js`
- Types: `dist/index.d.ts`
- Published files: `dist/`, `README.md`, `LICENSE`

## Key Implementation Notes

### Authentication
- API key authentication with Bearer tokens
- Server-side focused - credentials should not be exposed to frontend
- API key provides persistent authentication without token refresh
- Configured via SDK constructor parameters

### HTTP Client Architecture
- Modified from original Soroswap implementation to support DeFindex authentication
- Constructor signature changed to accept baseURL, timeout parameters separately
- Uses axios with custom BigInt serialization support
- Centralized error handling with API error passthrough

### Vault Operations
- All transaction-building methods return unsigned XDR for external signing
- Network parameter required for most operations (MAINNET/TESTNET)
- Comprehensive type safety for vault configurations and responses
- Support for both regular operations and administrative management functions

### Error Handling
- All API operations can throw errors
- HTTP errors are passed through from API responses
- Network timeouts configurable per SDK instance
- Integration tests may fail due to network issues

### Network Support
- Supports both Stellar MAINNET and TESTNET networks
- Network specified per operation call
- Network-specific contract addresses handled by API

## Development Patterns

### Adding New API Methods
1. Define TypeScript interfaces in appropriate `src/types/` file
2. Add method to `DefindexSDK` class with proper grouping (use comment sections)
3. Use `this.httpClient` for HTTP calls
4. Follow existing patterns for network parameter handling
5. Add unit tests with mocked responses
6. Consider adding integration test if appropriate

### Type Safety
- All API requests/responses should have corresponding TypeScript interfaces
- Export all types from `src/types/index.ts`
- Use proper union types for different response formats
- Maintain consistency with API documentation

### Error Boundaries
- HTTP errors are handled by HttpClient and passed through as API responses
- Authentication errors should be handled gracefully
- Network timeouts should be configurable and well-documented

### Vault Management Roles
The SDK supports four operational roles defined in `VaultRoles` enum:
- **Manager**: Full vault control - can configure vault, assign roles, pause/unpause strategies, manage fees, and upgrade contracts
- **Emergency Manager**: Can execute emergency rescues to withdraw assets from strategies
- **Rebalance Manager**: Can rebalance vault strategies (invest, unwind, swap operations)
- **Fee Receiver**: Receives distributed vault fees

Regular users can deposit, withdraw, and view vault information without special roles.

## Current Project Status

The DeFindex SDK is fully operational with complete API functionality:

- SDK initialization, configuration, and API key authentication
- Factory operations (vault creation with/without initial deposit)
- Complete vault operations (deposit, withdraw, balance, APY, report)
- Vault management (rebalance, pause/unpause strategies, emergency rescue)
- Role management (get/set manager, emergency manager, rebalance manager, fee receiver)
- Fee management (lock, release, distribute fees)
- Contract upgrades (WASM upgrades)
- Transaction submission (direct and via LaunchTube)
- Full TypeScript type safety
- Unit and integration test coverage

### Example Usage
```bash
cp .env.example .env
# Edit .env with your API key: DEFINDEX_API_KEY=sk_your_api_key_here
pnpm run example
```