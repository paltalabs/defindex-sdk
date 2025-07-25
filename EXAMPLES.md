# DeFindex SDK - Usage Examples

This document provides comprehensive examples for using the DeFindex SDK.

## Installation

```bash
npm install defindex-sdk
```

## Basic Setup

```typescript
import { DefindexSDK, SupportedNetworks } from 'defindex-sdk';

// With API key (recommended)
const sdk = new DefindexSDK({
  apiKey: 'sk_your_api_key_here',
  baseUrl: 'https://api.defindex.io',
  timeout: 30000
});

// Basic initialization without authentication
const sdk = new DefindexSDK({
  baseUrl: 'https://api.defindex.io',
  timeout: 30000
});

// Set API key after initialization
sdk.setApiKey('sk_your_api_key_here');

// With automatic login (alternative to API key)
const sdk = new DefindexSDK({
  email: 'user@example.com',
  password: 'securePassword123',
  baseUrl: 'https://api.defindex.io'
});
```

## Authentication Examples

### API Key Authentication

```typescript
import { DefindexSDK } from 'defindex-sdk';

// Method 1: Initialize with API key
const sdk = new DefindexSDK({
  apiKey: 'sk_your_api_key_here',
  baseUrl: 'https://api.defindex.io'
});

// Method 2: Set API key after initialization
const sdk = new DefindexSDK({
  baseUrl: 'https://api.defindex.io'
});
sdk.setApiKey('sk_your_api_key_here');

// Now you can use all SDK methods without additional authentication
const health = await sdk.healthCheck();
console.log('API is ready:', health.status.reachable);
```

### User Registration

```typescript
import { DefindexSDK, RegisterParams } from 'defindex-sdk';

const sdk = new DefindexSDK({
  baseUrl: 'https://api.defindex.io'
});

const registerData: RegisterParams = {
  email: 'newuser@example.com',
  password: 'securePassword123!',
  username: 'johndoe'
};

try {
  const response = await sdk.register(registerData);
  console.log(response.message); // "User johndoe registered"
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### User Login

```typescript
import { DefindexSDK, LoginParams } from 'defindex-sdk';

const loginData: LoginParams = {
  email: 'user@example.com',
  password: 'securePassword123!'
};

try {
  const response = await sdk.login(loginData);
  console.log('Login successful!');
  console.log('Access token:', response.access_token);
  console.log('User role:', response.role);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Token Refresh

```typescript
try {
  const response = await sdk.refreshToken();
  console.log('Token refreshed successfully');
  console.log('New access token:', response.access_token);
} catch (error) {
  console.error('Token refresh failed:', error.message);
}
```

## API Key Management

### Generate API Key

```typescript
import { ApiKeyGenerateRequest } from 'defindex-sdk';

const keyRequest: ApiKeyGenerateRequest = {
  name: 'Production API Key'
};

try {
  const apiKey = await sdk.generateApiKey(keyRequest);
  console.log('API Key created!');
  console.log('Key ID:', apiKey.id);
  console.log('API Key:', apiKey.key);
  
  // Store the key securely - you won't be able to retrieve it again
} catch (error) {
  console.error('API key generation failed:', error.message);
}
```

### List User API Keys

```typescript
try {
  const apiKeys = await sdk.getUserApiKeys();
  
  console.log(`You have ${apiKeys.length} API keys:`);
  apiKeys.forEach(key => {
    console.log(`- ID: ${key.id}, Name: ${key.name || 'Unnamed'}`);
    console.log(`  Created: ${key.createdAt}`);
    console.log(`  Last used: ${key.lastUsedAt || 'Never'}`);
  });
} catch (error) {
  console.error('Failed to fetch API keys:', error.message);
}
```

### Revoke API Key

```typescript
const keyIdToRevoke = 123;

try {
  const response = await sdk.revokeApiKey(keyIdToRevoke);
  if (response.success) {
    console.log('API key revoked successfully');
  }
} catch (error) {
  console.error('Failed to revoke API key:', error.message);
}
```

## Factory Operations

### Get Factory Address

```typescript
try {
  const factory = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
  console.log('Factory address:', factory.address);
} catch (error) {
  console.error('Failed to get factory address:', error.message);
}
```

### Create a Vault

```typescript
import { CreateDefindexVault, SupportedNetworks } from 'defindex-sdk';

const vaultConfig: CreateDefindexVault = {
  roles: {
    0: "GEMERGENCY_MANAGER_ADDRESS...", // Emergency Manager
    1: "GFEE_RECEIVER_ADDRESS...",      // Fee Receiver
    2: "GVAULT_MANAGER_ADDRESS...",     // Vault Manager
    3: "GREBALANCE_MANAGER_ADDRESS..."  // Rebalance Manager
  },
  vault_fee_bps: 100, // 1% fee
  assets: [{
    address: "CUSDC_CONTRACT_ADDRESS...",
    strategies: [{
      address: "GSTRATEGY_CONTRACT_ADDRESS...",
      name: "USDC Lending Strategy",
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
  console.log('Vault creation XDR:', response.xdr);
  console.log('Simulation result:', response.simulation_result);
  
  // Sign the XDR with your wallet and submit it
} catch (error) {
  console.error('Vault creation failed:', error.message);
}
```

### Create Vault with Initial Deposit

```typescript
import { CreateDefindexVaultDepositDto } from 'defindex-sdk';

const vaultWithDepositConfig: CreateDefindexVaultDepositDto = {
  // ... all the vault config from above
  ...vaultConfig,
  deposit_amounts: [1000000, 2000000] // Initial deposit amounts
};

try {
  const response = await sdk.createVaultWithDeposit(
    vaultWithDepositConfig, 
    SupportedNetworks.TESTNET
  );
  
  console.log('Vault creation + deposit XDR:', response.xdr);
} catch (error) {
  console.error('Vault creation with deposit failed:', error.message);
}
```

## Vault Operations

### Get Vault Information

```typescript
const vaultAddress = 'GVAULT_CONTRACT_ADDRESS...';

try {
  const vaultInfo = await sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET);
  
  console.log(`Vault: ${vaultInfo.name} (${vaultInfo.symbol})`);
  console.log(`Total Supply: ${vaultInfo.totalSupply}`);
  console.log(`Total Assets: ${vaultInfo.totalAssets}`);
  console.log(`Vault Fee: ${vaultInfo.feesBps.vaultFee / 100}%`);
  console.log(`DeFindex Fee: ${vaultInfo.feesBps.defindexFee / 100}%`);
  
  console.log('Assets:');
  vaultInfo.assets.forEach(asset => {
    console.log(`- ${asset.name} (${asset.symbol}): ${asset.address}`);
    asset.strategies.forEach(strategy => {
      console.log(`  Strategy: ${strategy.name} - ${strategy.paused ? 'PAUSED' : 'ACTIVE'}`);
    });
  });
} catch (error) {
  console.error('Failed to get vault info:', error.message);
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
import { DepositToVaultParams } from 'defindex-sdk';

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
  console.log('Expected shares to mint:', response.simulation_response.sharesToMint);
  
  // Sign the XDR and submit the transaction
} catch (error) {
  console.error('Deposit failed:', error.message);
}
```

### Withdraw from Vault (by Amount)

```typescript
import { WithdrawFromVaultParams } from 'defindex-sdk';

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
  console.log('Shares to burn:', response.simulation_response.sharesToBurn);
} catch (error) {
  console.error('Withdrawal failed:', error.message);
}
```

### Withdraw from Vault (by Shares)

```typescript
import { WithdrawSharesParams } from 'defindex-sdk';

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
  console.log('Expected amounts:', response.simulation_response.amounts);
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
import { RescueFromVaultParams } from 'defindex-sdk';

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
import { PauseStrategyParams } from 'defindex-sdk';

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
import { UnpauseStrategyParams } from 'defindex-sdk';

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
import { SupportedNetworks } from 'defindex-sdk';

// After signing a transaction XDR with your wallet
const signedXDR = 'AAAA...'; // Your signed transaction XDR

try {
  // Submit via Stellar directly
  const response = await sdk.sendTransaction(
    signedXDR, 
    SupportedNetworks.TESTNET,
    false // Don't use LaunchTube
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

### Submit Transaction via LaunchTube

```typescript
try {
  // Submit via LaunchTube service (faster, more reliable)
  const response = await sdk.sendTransaction(
    signedXDR, 
    SupportedNetworks.TESTNET,
    true // Use LaunchTube
  );
  
  console.log('LaunchTube response:', response);
} catch (error) {
  console.error('LaunchTube submission failed:', error.message);
}
```

## Validation Helpers

The SDK includes validation helpers to check data before sending requests:

```typescript
import { 
  isStellarAddress, 
  isValidSlippage, 
  validateDepositParams,
  SDKValidationError 
} from 'defindex-sdk';

// Validate Stellar addresses
if (isStellarAddress('GCKFBEIYTKP6RNYXDXCVN5NHQG7C37VFTCB5BBXZ4F6PUB7FFLLKSZQJ')) {
  console.log('Valid Stellar address');
}

// Validate slippage
if (isValidSlippage(100)) { // 1%
  console.log('Valid slippage tolerance');
}

// Validate deposit parameters
try {
  validateDepositParams({
    amounts: [1000000, 2000000],
    caller: 'GUSER...',
    invest: true,
    slippageBps: 100
  });
  console.log('Deposit parameters are valid');
} catch (error) {
  if (error instanceof SDKValidationError) {
    console.error(`Validation error in ${error.field}: ${error.message}`);
  }
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
} from 'defindex-sdk';

try {
  const response = await sdk.someOperation();
} catch (error) {
  if (isAuthError(error)) {
    console.error('Authentication error:', error.message);
    // Maybe redirect to login
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
const response = await sdk.login(credentials);

// ✅ Good
try {
  const response = await sdk.login(credentials);
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error('Operation failed:', error.message);
}
```

### 2. Validate Inputs Before API Calls

```typescript
// ✅ Good
import { isStellarAddress, ValidationError } from 'defindex-sdk';

if (!isStellarAddress(userAddress)) {
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
import { DepositToVaultParams, SupportedNetworks } from 'defindex-sdk';

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
  email: 'user@example.com',
  password: 'password123'
});

// ✅ Good - Use environment variables (API key recommended)
const sdk = new DefindexSDK({
  apiKey: process.env.DEFINDEX_API_KEY,
  baseUrl: process.env.DEFINDEX_API_URL || 'https://api.defindex.io'
});

// ✅ Alternative - Use environment variables for email/password
const sdk = new DefindexSDK({
  email: process.env.DEFINDEX_EMAIL,
  password: process.env.DEFINDEX_PASSWORD,
  baseUrl: process.env.DEFINDEX_API_URL || 'https://api.defindex.io'
});
```

This comprehensive guide should help you get started with the DeFindex SDK and implement all the available functionality in your applications.