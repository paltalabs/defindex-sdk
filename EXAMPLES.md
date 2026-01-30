# DeFindex SDK - Usage Examples

This document provides comprehensive examples for using the DeFindex SDK.

## Installation

```bash
npm install @defindex/sdk
```

## ✅ Current Status

**Excellent News!** The DeFindex API is now fully operational:

- ✅ **Health Check**: Working perfectly
- ✅ **SDK Authentication**: API key authentication working
- ✅ **Factory Operations**: Factory deployed and working on testnet
- ✅ **Vault Creation**: Full vault creation with XDR generation
- ✅ **Vault Operations**: Deposits, withdrawals, balance queries all working
- ✅ **Administrative Operations**: Strategy management and emergency rescue working

## Basic Setup

```typescript
import { DefindexSDK, SupportedNetworks } from '@defindex/sdk';

// Initialize with API key (recommended)
const sdk = new DefindexSDK({
  apiKey: 'sk_your_api_key_here',
  baseUrl: 'https://api.defindex.io',
  timeout: 30000
});

// Check if API is healthy
const health = await sdk.healthCheck();
console.log('API is ready:', health.status.reachable);
```

## Running the Complete Example

For a comprehensive, working example, use the included example script:

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your API key

# Run the complete example
pnpm run example
```

## API Operations

### Health Check (✅ Working)

```typescript
try {
  const health = await sdk.healthCheck();
  console.log('API Status:', health.status.reachable);
} catch (error) {
  console.error('Health check failed:', error.message);
}
```

### Factory Operations (✅ Working)

The factory is now deployed and fully operational on testnet!

```typescript
try {
  const factory = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
  console.log('Factory address:', factory.address);
  // Returns: CCJDRCK7VBZV6KEJ433F2KXNELEGAAXYMQWFG6JGLVYATJ4SDEYLRWMD
} catch (error) {
  console.error('Failed to get factory address:', error.message);
}
```

### Create a Vault (✅ Working)

Vault creation is now fully functional! The factory generates proper XDR for signing.

```typescript
import { CreateDefindexVault, SupportedNetworks } from '@defindex/sdk';

const vaultConfig: CreateDefindexVault = {
  roles: {
    0: "GEMERGENCY_MANAGER_ADDRESS...", // Emergency Manager
    1: "GFEE_RECEIVER_ADDRESS...",      // Fee Receiver
    2: "GVAULT_MANAGER_ADDRESS...",     // Vault Manager
    3: "GREBALANCE_MANAGER_ADDRESS..."  // Rebalance Manager
  },
  vault_fee_bps: 100, // 1% fee (1% = 100 basis points)
  assets: [{
    address: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", // XLM asset
    strategies: [{
      address: "CBO77JLVAT54YBRHBY4PSITLILWAAXX5JHPXGBFRW2XUFQKXZ3ZLJ7MJ", // Strategy contract
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

try {
  const response = await sdk.createVault(vaultConfig, SupportedNetworks.TESTNET);
  console.log('✅ Vault created successfully!');
  console.log('XDR to sign:', response.xdr);
  console.log('Simulation result:', response.simulation_result); // "SUCCESS"
  
  // Sign the XDR with your wallet and submit using sendTransaction()
  // const result = await sdk.sendTransaction(signedXDR, SupportedNetworks.TESTNET);
} catch (error) {
  console.error('Vault creation failed:', error.message);
}
```

## Vault Operations (✅ All Working)

### Get Vault Information

```typescript
const vaultAddress = 'CAEJL2XKGLSWCPKSVVRYAWLQKE4DS24YCZX53CLUMWGOVEOERSAZH5UM';

try {
  const vaultInfo = await sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET);
  
  console.log(`Vault: ${vaultInfo.name} (${vaultInfo.symbol})`);
  console.log(`Vault Fee: ${vaultInfo.feesBps.vaultFee / 100}%`); // 1%
  console.log(`DeFindex Fee: ${vaultInfo.feesBps.defindexFee / 100}%`); // 20%
  
  // Show assets and strategies
  vaultInfo.assets.forEach((asset, index) => {
    console.log(`Asset ${index + 1}: ${asset.address}`);
    asset.strategies.forEach((strategy, idx) => {
      console.log(`  Strategy: ${strategy.name} - ${strategy.paused ? 'PAUSED' : 'ACTIVE'}`);
    });
  });
} catch (error) {
  console.error('Failed to get vault info:', error.message);
}
```

### Get User Balance

```typescript
const userAddress = 'GUSER_ADDRESS...';

try {
  const balance = await sdk.getVaultBalance(vaultAddress, userAddress, SupportedNetworks.TESTNET);
  
  console.log(`Vault Shares: ${balance.dfTokens}`); // e.g., 1999000
  console.log(`Underlying Value: ${balance.underlyingBalance}`); // ['1999000']
} catch (error) {
  console.error('Failed to get balance:', error.message);
}
```

### Deposit to Vault

```typescript
import { DepositToVaultParams } from '@defindex/sdk';

const depositData: DepositToVaultParams = {
  amounts: [1000000], // 1 XLM (7 decimals)
  caller: 'GUSER_ADDRESS...',
  invest: true, // Auto-invest after deposit
  slippageBps: 100 // 1% slippage tolerance
};

try {
  const response = await sdk.depositToVault(vaultAddress, depositData, SupportedNetworks.TESTNET);
  
  console.log('✅ Deposit prepared successfully!');
  console.log('XDR to sign:', response.xdr);
  console.log('Simulation result:', response.simulationResponse); // Simulation details
  
  // Sign with wallet and submit
  // const result = await sdk.sendTransaction(signedXDR, SupportedNetworks.TESTNET);
} catch (error) {
  console.error('Deposit failed:', error.message);
}
```

### Withdraw from Vault (by Amount)

```typescript
import { WithdrawFromVaultParams } from '@defindex/sdk';

const withdrawData: WithdrawFromVaultParams = {
  amounts: [500000], // 0.5 XLM
  caller: 'GUSER_ADDRESS...',
  slippageBps: 100 // 1% slippage tolerance
};

try {
  const response = await sdk.withdrawFromVault(vaultAddress, withdrawData, SupportedNetworks.TESTNET);
  
  console.log('✅ Withdrawal prepared successfully!');
  console.log('XDR to sign:', response.xdr);
  console.log('Simulation result:', response.simulationResponse); // Withdrawal details
} catch (error) {
  console.error('Withdrawal failed:', error.message);
}
```

### Withdraw from Vault (by Shares)

```typescript
import { WithdrawSharesParams } from '@defindex/sdk';

const shareData: WithdrawSharesParams = {
  shares: 1000000, // Number of vault shares to burn
  caller: 'GUSER_ADDRESS...',
  slippageBps: 100 // 1% slippage tolerance
};

try {
  const response = await sdk.withdrawShares(vaultAddress, shareData, SupportedNetworks.TESTNET);
  
  console.log('✅ Share withdrawal prepared successfully!');
  console.log('XDR to sign:', response.xdr);
  console.log('Simulation result:', response.simulationResponse); // Share withdrawal details
} catch (error) {
  console.error('Share withdrawal failed:', error.message);
}
```

### Get User Vault Balance

```typescript
const userAddress = 'GUSER_ADDRESS...';

try {
  const balance = await sdk.getVaultBalance(
    vaultAddress, 
    userAddress, 
    SupportedNetworks.TESTNET
  );
  
  console.log(`Vault Shares: ${balance.dfTokens}`);
  console.log('Underlying Asset Values:');
  balance.underlyingBalance.forEach((value, index) => {
    console.log(`- Asset ${index}: ${value}`);
  });
} catch (error) {
  console.error('Failed to get vault balance:', error.message);
}
```

### Deposit to Vault

```typescript
import { DepositToVaultParams } from '@defindex/sdk';

const depositData: DepositToVaultParams = {
  amounts: [1000000, 2000000], // Amounts for each asset
  caller: 'GUSER_ADDRESS...',
  invest: true, // Auto-invest after deposit (default: true)
  slippageBps: 100 // 1% slippage tolerance (default: 0)
};

try {
  const response = await sdk.depositToVault(
    vaultAddress, 
    depositData, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Deposit XDR:', response.xdr);
  console.log('Simulation result:', response.simulationResponse);
  
  // Sign the XDR and submit the transaction
} catch (error) {
  console.error('Deposit failed:', error.message);
}
```

### Withdraw from Vault (by Amount)

```typescript
import { WithdrawFromVaultParams } from '@defindex/sdk';

const withdrawData: WithdrawFromVaultParams = {
  amounts: [500000, 1000000], // Specific amounts to withdraw
  caller: 'GUSER_ADDRESS...',
  slippageBps: 100 // 1% slippage tolerance
};

try {
  const response = await sdk.withdrawFromVault(
    vaultAddress, 
    withdrawData, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Withdrawal XDR:', response.xdr);
  console.log('Simulation result:', response.simulationResponse);
} catch (error) {
  console.error('Withdrawal failed:', error.message);
}
```

### Withdraw from Vault (by Shares)

```typescript
import { WithdrawSharesParams } from '@defindex/sdk';

const shareData: WithdrawSharesParams = {
  shares: 1000000, // Number of vault shares to burn
  caller: 'GUSER_ADDRESS...',
  slippageBps: 100 // 1% slippage tolerance
};

try {
  const response = await sdk.withdrawShares(
    vaultAddress, 
    shareData, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Share withdrawal XDR:', response.xdr);
  console.log('Simulation result:', response.simulationResponse);
} catch (error) {
  console.error('Share withdrawal failed:', error.message);
}
```

### Get Vault APY

```typescript
try {
  const apy = await sdk.getVaultAPY(vaultAddress, SupportedNetworks.TESTNET);
  
  console.log(`Current APY: ${apy.apyPercent}%`);
  console.log(`Calculated over: ${apy.period}`);
  console.log(`Last updated: ${apy.lastUpdated}`);
} catch (error) {
  console.error('Failed to get vault APY:', error.message);
}
```

## Vault Management (Admin Operations)

### Emergency Rescue

```typescript
import { RescueFromVaultParams } from '@defindex/sdk';

// Note: Requires Emergency Manager role
const rescueData: RescueFromVaultParams = {
  strategy_address: 'GSTRATEGY_TO_RESCUE...',
  caller: 'GEMERGENCY_MANAGER_ADDRESS...'
};

try {
  const response = await sdk.emergencyRescue(
    vaultAddress, 
    rescueData, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Emergency rescue XDR:', response.transactionXDR);
  console.log('Rescued assets:');
  response.rescuedAssets.forEach(asset => {
    console.log(`- ${asset.address}: ${asset.amount}`);
  });
} catch (error) {
  console.error('Emergency rescue failed:', error.message);
}
```

### Pause Strategy

```typescript
import { PauseStrategyParams } from '@defindex/sdk';

// Note: Requires Strategy Manager role
const pauseData: PauseStrategyParams = {
  strategy_address: 'GSTRATEGY_TO_PAUSE...',
  caller: 'GSTRATEGY_MANAGER_ADDRESS...'
};

try {
  const response = await sdk.pauseStrategy(
    vaultAddress, 
    pauseData, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Pause strategy XDR:', response.transactionXDR);
  console.log('Strategy status:', response.strategyStatus); // "paused"
} catch (error) {
  console.error('Strategy pause failed:', error.message);
}
```

### Unpause Strategy

```typescript
import { UnpauseStrategyParams } from '@defindex/sdk';

// Note: Requires Strategy Manager role
const unpauseData: UnpauseStrategyParams = {
  strategy_address: 'GSTRATEGY_TO_UNPAUSE...',
  caller: 'GSTRATEGY_MANAGER_ADDRESS...'
};

try {
  const response = await sdk.unpauseStrategy(
    vaultAddress, 
    unpauseData, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Unpause strategy XDR:', response.transactionXDR);
  console.log('Strategy status:', response.strategyStatus); // "active"
} catch (error) {
  console.error('Strategy unpause failed:', error.message);
}
```

## Transaction Submission

### Submit Transaction to Stellar

```typescript
import { SupportedNetworks } from '@defindex/sdk';

// After signing a transaction XDR with your wallet
const signedXDR = 'AAAA...'; // Your signed transaction XDR

try {
  // Submit signed transaction to the Stellar network
  const response = await sdk.sendTransaction(
    signedXDR,
    SupportedNetworks.TESTNET
  );

  console.log('Transaction hash:', response.hash);
  console.log('Transaction status:', response.status);

  if (response.status === 'SUCCESS') {
    console.log('Transaction confirmed!');
  }
} catch (error) {
  console.error('Transaction submission failed:', error.message);
}
```

## Input Validation

While the SDK doesn't include built-in validation helpers, you should validate inputs before making API calls:

```typescript
// Validate Stellar addresses (basic format check)
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

// Validate slippage tolerance
function isValidSlippage(slippageBps: number): boolean {
  return slippageBps >= 0 && slippageBps <= 10000; // 0% to 100%
}

// Example validation before deposit
if (!isValidStellarAddress(userAddress)) {
  throw new Error('Invalid Stellar address format');
}

if (!isValidSlippage(100)) {
  throw new Error('Invalid slippage tolerance');
}

// Proceed with deposit
const depositData = {
  amounts: [1000000],
  caller: userAddress,
  invest: true,
  slippageBps: 100
};

try {
  const response = await sdk.depositToVault(vaultAddress, depositData, network);
} catch (error) {
  console.error('Deposit failed:', error.message);
}
```

## Error Handling

The SDK provides specific error types for better error handling:

```typescript
import { 
  isApiError, 
  isAuthError, 
  isValidationError, 
  isNetworkError,
  DefindexSDKError 
} from '@defindex/sdk';

try {
  const response = await sdk.someOperation();
} catch (error) {
  if (isAuthError(error)) {
    console.error('Authentication error:', error.message);
    // Check API key configuration
  } else if (isValidationError(error)) {
    console.error('Validation error:', error.message);
    if (error.details) {
      error.details.forEach(detail => {
        console.error(`- ${detail.field}: ${detail.message}`);
      });
    }
  } else if (isNetworkError(error)) {
    console.error('Network/blockchain error:', error.message);
    if (error.networkDetails?.stellarErrorCode) {
      console.error('Stellar error code:', error.networkDetails.stellarErrorCode);
    }
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Health Check

```typescript
try {
  const health = await sdk.healthCheck();
  
  if (health.status.reachable) {
    console.log('API is healthy and reachable');
  } else {
    console.log('API health issues detected:');
    if (health.status.indexer) {
      console.log('Indexer status:', health.status.indexer);
    }
    if (health.status.errors) {
      health.status.errors.forEach(error => {
        console.log('- Error:', error);
      });
    }
  }
} catch (error) {
  console.error('Health check failed:', error.message);
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const response = await sdk.getVaultInfo(vaultAddress, network);

// ✅ Good
try {
  const response = await sdk.getVaultInfo(vaultAddress, network);
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error('Operation failed:', error.message);
}
```

### 2. Validate Inputs Before API Calls

```typescript
// ✅ Good - Basic validation before API calls
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

if (!isValidStellarAddress(userAddress)) {
  throw new Error('Invalid Stellar address provided');
}

try {
  const balance = await sdk.getVaultBalance(vaultAddress, userAddress, network);
} catch (error) {
  // Handle error
}
```

### 3. Use TypeScript Types

```typescript
// ✅ Good - Use provided types for better development experience
import { DepositToVaultParams, SupportedNetworks } from '@defindex/sdk';

const depositData: DepositToVaultParams = {
  amounts: [1000000],
  caller: userAddress,
  invest: true,
  slippageBps: 100
};
```

### 4. Store Credentials Securely

```typescript
// ❌ Bad - Don't hardcode credentials
const sdk = new DefindexSDK({
  apiKey: 'sk_hardcoded_key_here',
});

// ✅ Good - Use environment variables (API key recommended)
const sdk = new DefindexSDK({
  apiKey: process.env.DEFINDEX_API_KEY,
  baseUrl: process.env.DEFINDEX_API_URL || 'https://api.defindex.io'
});
```

This comprehensive guide should help you get started with the DeFindex SDK and implement all the available functionality in your applications.