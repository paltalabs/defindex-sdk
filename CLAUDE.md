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
The SDK provides methods organized into key areas:
- **Authentication**: login(), register(), refreshToken() - User management with JWT tokens
- **Factory Operations**: getFactoryAddress(), createVault(), createVaultWithDeposit() - Vault creation and deployment
- **Vault Operations**: getVaultInfo(), depositToVault(), withdrawFromVault(), withdrawShares(), getVaultBalance(), getVaultAPY()
- **Vault Management**: emergencyRescue(), pauseStrategy(), unpauseStrategy() - Admin operations for vault managers
- **Transaction Management**: sendTransaction() - Submit signed transactions to Stellar network
- **System**: healthCheck() - API health monitoring

### Authentication Flow
1. SDK can initialize with API key for automatic authentication (recommended)
2. Alternative: Manual login sets Authorization header with Bearer token
3. API key or JWT access tokens used for all authenticated requests
4. Role-based access control for administrative operations

### Type System
Comprehensive TypeScript types are defined in `src/types/`:
- `base.types.ts` - Core enums (SupportedNetworks) and base interfaces
- `auth.types.ts` - Authentication and user management types
- `factory.types.ts` - Vault factory configuration and response types
- `vault.types.ts` - Vault operations, deposits, withdrawals, and management types
- `stellar.types.ts` - Transaction and blockchain interaction types
- `error.types.ts` - Error handling and validation types
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
export DEFINDEX_API_EMAIL="your_email@example.com"
export DEFINDEX_API_PASSWORD="your_password"
```

### SDK Configuration
The SDK accepts a `DefindexSDKConfig` object including:
- `apiKey` - API key for authentication (recommended, optional)
- `email` and `password` - Credentials for legacy support (optional, deprecated)
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
- API key authentication with Bearer tokens (recommended)
- JWT-based authentication with Bearer tokens (legacy support)
- No automatic login in SDK constructor - authentication via config only
- Server-side focused - credentials should not be exposed to frontend
- API key provides persistent authentication without token refresh

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
The SDK supports different operational roles:
- **Vault Managers**: Can create and configure vaults
- **Emergency Managers**: Can execute emergency rescues
- **Strategy Managers**: Can pause/unpause individual strategies
- **Regular Users**: Can deposit, withdraw, and view vault information

## Migration Context

This SDK has been migrated from a Soroswap-based implementation to DeFindex. Key differences:
- Authentication now primarily uses API keys, with JWT tokens as legacy support
- Vault-focused operations instead of DEX/trading operations
- Factory pattern for vault creation with role-based management
- Administrative functions for vault management (pause/unpause, emergency rescue)
- Network parameter handling per operation instead of global configuration
- Comprehensive type safety for all vault operations and responses