# DeFindex SDK

Official TypeScript SDK for [DeFindex](https://defindex.io) - A decentralized vault management system built on Stellar using Soroban smart contracts.

## 🌟 Features

- **🔐 API Key Authentication**: Secure API key authentication with Bearer tokens (recommended)
- **🏦 Vault Operations**: Create, deposit, withdraw, and manage decentralized vaults
- **🏭 Factory Operations**: Deploy new vaults with custom configurations
- **👑 Admin Operations**: Emergency rescue, strategy management for vault operators  
- **📊 Real-time Data**: Vault balances, APY tracking, and comprehensive vault information
- **🔒 Server-Side Focused**: Secure handling of credentials and sensitive operations
- **📝 TypeScript Support**: Full type safety with comprehensive interfaces
- **⚡ Lightweight**: Simple authentication and comprehensive error handling
- **🧪 Well Tested**: Comprehensive unit and integration test coverage
- **📚 Complete Examples**: Functional TypeScript examples and comprehensive documentation

## 🚀 Installation

```bash
pnpm install @defindex/sdk
```

## 📖 Quick Start

```typescript
import { DefindexSDK, SupportedNetworks } from '@defindex/sdk';

// Initialize with API key
const sdk = new DefindexSDK({
  apiKey: 'sk_your_api_key_here',
  baseUrl: 'https://api.defindex.io'
});

// Check API health
const health = await sdk.healthCheck();
console.log('API Status:', health.status.reachable);

// Get factory address
const factory = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
console.log('Factory Address:', factory.address);

// Get vault information
const vaultAddress = 'CVAULT_CONTRACT_ADDRESS...';
const vaultInfo = await sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET);
console.log(`Vault: ${vaultInfo.name} (${vaultInfo.symbol})`);

// Deposit to vault
const depositResponse = await sdk.depositToVault(vaultAddress, {
  amounts: [1000000], // Amount for each asset (considering decimals)
  caller: 'GUSER_ADDRESS...',
  invest: true,
  slippageBps: 100 // 1% slippage tolerance
}, SupportedNetworks.TESTNET);

// Sign the XDR with your wallet and submit
const signedXdr = await yourWallet.sign(depositResponse.xdr);
const result = await sdk.sendTransaction(signedXdr, SupportedNetworks.TESTNET, false);
```

## 🚀 Running the Example

The SDK includes a comprehensive functional example:

```bash
# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your credentials
# DEFINDEX_API_KEY=sk_your_api_key_here

# Run the example
pnpm run example
```

The example demonstrates:
- SDK initialization and authentication
- API health checking
- Factory operations
- Vault creation, deposits, and withdrawals
- Administrative vault management
- Error handling and best practices

## 🔧 Configuration

### SDK Configuration Options

```typescript
interface DefindexSDKConfig {
  apiKey?: string;         // API key for authentication (recommended)
  baseUrl?: string;        // Custom API base URL (defaults to 'https://api.defindex.io')
  timeout?: number;        // Request timeout in ms (defaults to 30000)
}
```

### Environment Variables

For better security, use environment variables:

```typescript
// Using API key (recommended)
const sdk = new DefindexSDK({
  apiKey: process.env.DEFINDEX_API_KEY,
  baseUrl: process.env.DEFINDEX_API_URL || 'https://api.defindex.io'
});
```

## ✅ Current Status

**Great News!** The DeFindex API is now fully operational on testnet:

- ✅ **Health Check**: Working correctly
- ✅ **SDK Authentication**: API key authentication implemented
- ✅ **Factory Operations**: Factory deployed and working on testnet
- ✅ **Vault Creation**: Create vaults with custom configurations
- ✅ **Vault Operations**: Full deposit, withdrawal, and balance operations
- ✅ **Vault Management**: Administrative operations (pause/unpause strategies, emergency rescue)
- ✅ **Transaction Building**: All operations return signed XDR for wallet integration
- ⚠️ **APY Calculation**: Working but some fields may be undefined for new vaults

### Recent Updates

1. ✅ **Factory Deployed**: Factory contract now available on testnet
2. ✅ **Full Vault Operations**: Create, manage, and interact with vaults
3. ✅ **Complete Example**: Run `pnpm run example` to see all functionality
4. ✅ **Ready for Production**: All core functionality is operational

## 📚 API Reference

### System Operations

#### Health Check
```typescript
const health = await sdk.healthCheck();
if (health.status.reachable) {
  console.log('API is healthy');
}
```

### Factory Operations

#### Get Factory Address
```typescript
const factory = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
console.log('Factory address:', factory.address);
```

#### Create Vault
```typescript
const vaultConfig: CreateDefindexVault = {
  roles: {
    0: "GEMERGENCY_MANAGER_ADDRESS...",  // Emergency Manager
    1: "GFEE_RECEIVER_ADDRESS...",       // Fee Receiver
    2: "GVAULT_MANAGER_ADDRESS...",      // Vault Manager
    3: "GREBALANCE_MANAGER_ADDRESS..."   // Rebalance Manager
  },
  vault_fee_bps: 100, // 1% fee
  assets: [{
    address: "CXLM_CONTRACT_ADDRESS...",
    strategies: [{
      address: "GSTRATEGY_CONTRACT_ADDRESS...",
      name: "XLM Strategy",
      paused: false
    }]
  }],
  name_symbol: { 
    name: "My DeFi Vault", 
    symbol: "MDV" 
  },
  upgradable: true,
  caller: "GCREATOR_ADDRESS..."
};

const response = await sdk.createVault(vaultConfig, SupportedNetworks.TESTNET);
console.log('Vault XDR:', response.xdr);
```

### Vault Operations

#### Get Vault Information
```typescript
const vaultInfo = await sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET);
console.log(`Total Assets: ${vaultInfo.totalAssets}`);
console.log(`Vault Fee: ${vaultInfo.feesBps.vaultFee / 100}%`);
```

#### Get Vault Balance
```typescript
const balance = await sdk.getVaultBalance(
  vaultAddress, 
  userAddress, 
  SupportedNetworks.TESTNET
);
console.log(`Vault Shares: ${balance.dfTokens}`);
```

#### Deposit to Vault
```typescript
const depositResponse = await sdk.depositToVault(vaultAddress, {
  amounts: [1000000, 2000000],
  caller: 'GUSER_ADDRESS...',
  invest: true,
  slippageBps: 100
}, SupportedNetworks.TESTNET);
```

#### Withdraw from Vault
```typescript
// Withdraw specific amounts
const withdrawResponse = await sdk.withdrawFromVault(vaultAddress, {
  amounts: [500000, 1000000],
  caller: 'GUSER_ADDRESS...',
  slippageBps: 100
}, SupportedNetworks.TESTNET);

// Withdraw by shares
const shareResponse = await sdk.withdrawShares(vaultAddress, {
  shares: 1000000,
  caller: 'GUSER_ADDRESS...',
  slippageBps: 100
}, SupportedNetworks.TESTNET);
```

#### Get Vault APY
```typescript
const apy = await sdk.getVaultAPY(vaultAddress, SupportedNetworks.TESTNET);
console.log(`Current APY: ${apy.apyPercent}%`);
```

### Vault Management (Admin Operations)

#### Emergency Rescue
```typescript
// Requires Emergency Manager role
const response = await sdk.emergencyRescue(vaultAddress, {
  strategy_address: 'GSTRATEGY_TO_RESCUE...',
  caller: 'GEMERGENCY_MANAGER_ADDRESS...'
}, SupportedNetworks.TESTNET);
```

#### Pause/Unpause Strategy
```typescript
// Requires Strategy Manager role
await sdk.pauseStrategy(vaultAddress, {
  strategy_address: 'GSTRATEGY_TO_PAUSE...',
  caller: 'GSTRATEGY_MANAGER_ADDRESS...'
}, SupportedNetworks.TESTNET);

await sdk.unpauseStrategy(vaultAddress, {
  strategy_address: 'GSTRATEGY_TO_UNPAUSE...',
  caller: 'GSTRATEGY_MANAGER_ADDRESS...'
}, SupportedNetworks.TESTNET);
```

### Transaction Management

#### Send Transaction
```typescript
// Submit via Stellar directly
const response = await sdk.sendTransaction(
  signedXDR, 
  SupportedNetworks.TESTNET,
  false // Don't use LaunchTube
);

// Submit via LaunchTube (faster, more reliable)
const response = await sdk.sendTransaction(
  signedXDR, 
  SupportedNetworks.TESTNET,
  true // Use LaunchTube
);
```

### System Operations

#### Health Check
```typescript
const health = await sdk.healthCheck();
if (health.status.reachable) {
  console.log('API is healthy');
}
```

## 🔐 Security Best Practices

1. **Environment Variables**: Store credentials in environment variables, not in code
2. **Server-Side Only**: This SDK is designed for server-side use only
3. **Credential Security**: Keep credentials secure and never commit them to version control
4. **Error Handling**: Always wrap API calls in try-catch blocks
5. **Token Management**: Use refresh tokens for long-running applications

```typescript
try {
  const vaultInfo = await sdk.getVaultInfo(vaultAddress, network);
  // Handle success
} catch (error) {
  console.error('Operation failed:', error.message);
  // Handle error appropriately
}
```

## 🔒 Vault Management Roles

The SDK supports different operational roles:
- **Vault Managers**: Can create and configure vaults
- **Emergency Managers**: Can execute emergency rescues
- **Strategy Managers**: Can pause/unpause individual strategies
- **Regular Users**: Can deposit, withdraw, and view vault information

## 🏗️ Development

### Building
```bash
pnpm run build
```

### Testing

#### Unit Tests (Mocked)
```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch

# Run integration tests
pnpm run test:integration

# Run all tests
pnpm run test:all
```

### Code Quality
```bash
pnpm run lint
pnpm run lint:fix
```

## 📊 Type Definitions

The SDK exports comprehensive TypeScript types:

```typescript
import {
  DefindexSDK,
  DefindexSDKConfig,
  SupportedNetworks,
  CreateDefindexVault,
  DepositToVaultParams,
  WithdrawFromVaultParams,
  WithdrawSharesParams,
  VaultInfo,
  VaultBalance,
  VaultAPY,
  // ... and many more
} from '@defindex/sdk';
```

## 🌐 Frontend Integration

While server-side focused, you can create secure frontend integrations:

```typescript
// Backend API endpoint using API key
app.post('/api/vault-info', async (req, res) => {
  try {
    const sdk = new DefindexSDK({
      apiKey: process.env.DEFINDEX_API_KEY
    });
    
    const vaultInfo = await sdk.getVaultInfo(req.body.vaultAddress, req.body.network);
    res.json(vaultInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📖 Documentation

For comprehensive examples and detailed API documentation, see:
- [examples/basic-example.ts](./examples/basic-example.ts) - Complete functional example
- [EXAMPLES.md](./EXAMPLES.md) - Comprehensive usage examples  
- [docs/defindex-sdk-docs.md](./docs/defindex-sdk-docs.md) - Complete SDK documentation
- [CLAUDE.md](./CLAUDE.md) - Development guidance and architecture notes
- [API Documentation](https://api.defindex.io) - Complete API reference

## 🔗 Links

- [DeFindex](https://defindex.io)
- [GitHub Repository](https://github.com/paltalabs/defindex-sdk)

---

Built with ❤️ by the PaltaLabs team.