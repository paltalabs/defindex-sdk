# Soroswap SDK

Official TypeScript SDK for [Soroswap.Finance](https://soroswap.finance) - The first DEX and exchange aggregator built on Stellar, powered by smart contracts on Soroban.

## 🌟 Features

- **🔐 Automatic Authentication**: Handles login, token refresh, and session management
- **💱 Trading Operations**: Get quotes, send transactions, and access multiple protocols
- **💧 Liquidity Management**: Add/remove liquidity and track positions
- **📊 Market Data**: Access pools, prices, and asset information
- **🔒 Server-Side Focused**: Secure handling of credentials and sensitive operations
- **📝 TypeScript Support**: Full type safety with comprehensive interfaces
- **⚡ Token Caching**: In-memory token management with automatic refresh
- **🧪 Well Tested**: Comprehensive unit test coverage

## 🚀 Installation

```bash
pnpm install soroswap-sdk
```

## 📖 Quick Start

```typescript
import { SoroswapSDK } from 'soroswap-sdk';

// Initialize the SDK
const soroswapClient = new SoroswapSDK({
  email: 'your-email@example.com',
  password: 'your-password',
  defaultNetwork: 'mainnet', // or 'testnet'
});

// Get a quote for a swap
const quote = await soroswapClient.quote({
  assetIn: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
  assetOut: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
  amount: '10000000',
  tradeType: 'EXACT_IN',
  protocols: ['soroswap', 'aqua'],
  from: 'YOUR_WALLET_ADDRESS',
  to: 'RECIPIENT_ADDRESS'
});

// Sign the transaction with your preferred signer
const signedXdr = await yourSigner.sign(quote.xdr);

// Send the signed transaction
const result = await soroswapClient.send(signedXdr, 100);
console.log('Transaction hash:', result.hash);
```

## 🔧 Configuration

### SDK Configuration Options

```typescript
interface SoroswapSDKConfig {
  email: string;              // Your Soroswap account email
  password: string;           // Your Soroswap account password
  defaultNetwork?: Network;  // 'mainnet' | 'testnet' (defaults to 'mainnet')
  timeout?: number;          // Request timeout in ms (defaults to 30000)
}
```

### Environment Variables

For better security, you can use environment variables:

```typescript
const sdk = new SoroswapSDK({
  email: process.env.SOROSWAP_EMAIL!,
  password: process.env.SOROSWAP_PASSWORD!,
  defaultNetwork: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet'
});
```

## 📚 API Reference

### Authentication

The SDK handles authentication automatically, but you can also manage it manually:

```typescript
// Check authentication status
const isAuth = sdk.isAuthenticated();

// Get user information
const userInfo = sdk.getUserInfo();

// Logout (clears tokens)
sdk.logout();

// Register a new user
await sdk.register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'SecurePassword123!'
});
```

### Trading Operations

#### Get Available Protocols

```typescript
const protocols = await sdk.getProtocols('mainnet');
// Returns: ['soroswap', 'phoenix', 'aqua']
```

#### Get Quote

```typescript
const quote = await sdk.quote({
  assetIn: 'TOKEN_A_CONTRACT',
  assetOut: 'TOKEN_B_CONTRACT',
  amount: '1000000',
  tradeType: 'EXACT_IN',
  protocols: ['soroswap', 'aqua'],
  slippageTolerance: '50', // 0.5% in basis points
  maxHops: 2,
  feeBps: 30, // Optional fee in basis points
  referralId: 'REFERRAL_WALLET_ADDRESS' // Required if feeBps is provided
});
```

#### Send Signed Transaction

```typescript
const result = await sdk.send(signedXdr, 100); // fee in stroops
```

### Pool Operations

#### Get Pools

```typescript
// Get all pools for specific protocols
const pools = await sdk.getPools(
  'mainnet',
  ['soroswap', 'aqua'],
  ['SOROSWAP', 'STELLAR_EXPERT'] // Optional asset list filter
);

// Get specific pool for token pair
const pool = await sdk.getPoolByTokens(
  'TOKEN_A_CONTRACT',
  'TOKEN_B_CONTRACT',
  'mainnet',
  ['soroswap']
);
```

### Liquidity Operations

#### Add Liquidity

```typescript
const addLiquidityTx = await sdk.addLiquidity({
  assetA: 'TOKEN_A_CONTRACT',
  assetB: 'TOKEN_B_CONTRACT',
  amountA: '1000000',
  amountB: '2000000',
  to: 'YOUR_WALLET_ADDRESS',
  slippageTolerance: '50' // 0.5%
});

// Sign and send the transaction
const signedXdr = await yourSigner.sign(addLiquidityTx.xdr);
const result = await sdk.send(signedXdr, 100);
```

#### Remove Liquidity

```typescript
const removeLiquidityTx = await sdk.removeLiquidity({
  assetA: 'TOKEN_A_CONTRACT',
  assetB: 'TOKEN_B_CONTRACT',
  liquidity: '500000',
  amountA: '450000',
  amountB: '900000',
  to: 'YOUR_WALLET_ADDRESS',
  slippageTolerance: '50'
});
```

#### Get User Positions

```typescript
const positions = await sdk.getUserPositions(
  'USER_WALLET_ADDRESS',
  'mainnet'
);
```

### Market Data

#### Get Asset Prices

```typescript
// Single asset price
const price = await sdk.getPrice(
  'TOKEN_CONTRACT_ADDRESS',
  'mainnet',
  'USD'
);

// Multiple asset prices
const prices = await sdk.getPrice([
  'TOKEN_A_CONTRACT',
  'TOKEN_B_CONTRACT'
], 'mainnet', 'USD');
```

#### Get Asset Lists

```typescript
// Get all available asset lists
const assetLists = await sdk.getAssetList();

// Get specific asset list
const soroswapAssets = await sdk.getAssetList('SOROSWAP');
```

### System Information

#### Health Check

```typescript
const health = await sdk.checkHealth();
```

#### Get Contract Addresses

```typescript
const factoryAddress = await sdk.getContractAddress('mainnet', 'factory');
const routerAddress = await sdk.getContractAddress('mainnet', 'router');
const aggregatorAddress = await sdk.getContractAddress('mainnet', 'aggregator');
```

#### Get Testnet Tokens

```typescript
const testnetTokens = await sdk.getTokens();
```

## 🔐 Security Best Practices

1. **Environment Variables**: Store credentials in environment variables, not in code
2. **Server-Side Only**: This SDK is designed for server-side use only
3. **Token Management**: The SDK handles token refresh automatically
4. **Error Handling**: Always wrap API calls in try-catch blocks

```typescript
try {
  const quote = await sdk.quote(quoteParams);
  // Handle success
} catch (error) {
  console.error('Quote failed:', error.message);
  // Handle error
}
```

## 🏗️ Development

### Building

```bash
pnpm run build
```

### Testing

The SDK includes two types of tests:

#### Unit Tests (Mocked)
Fast tests that mock all external dependencies:

```bash
# Run unit tests (default)
pnpm test

# Run with coverage
pnpm run test:coverage

# Watch mode for development
pnpm run test:watch
```

#### Integration Tests (Real API)
Tests that actually call the Soroswap API:

```bash
# Set up credentials first
export SOROSWAP_EMAIL="your-email@example.com"
export SOROSWAP_PASSWORD="your-password"

# Run integration tests
pnpm run test:integration

# Run both unit and integration tests
pnpm run test:all
```

**Note**: Integration tests require valid Soroswap credentials and may fail due to network issues or API changes. See [Integration Test Documentation](./tests/integration/README.md) for detailed setup.

### Linting

```bash
pnpm run lint
pnpm run lint:fix
```

## 🌐 Frontend Integration Considerations

While this SDK is server-side focused, you can create secure frontend integrations:

### Recommended Architecture

```typescript
// Backend API endpoint
app.post('/api/quote', async (req, res) => {
  try {
    const quote = await soroswapSDK.quote(req.body);
    // Only return the XDR and quote data, not sensitive info
    res.json({
      xdr: quote.xdr,
      trade: quote.trade,
      priceImpact: quote.priceImpact
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Frontend widget
async function getQuote(quoteParams) {
  const response = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteParams)
  });
  return response.json();
}
```

## 📊 Type Definitions

The SDK exports comprehensive TypeScript types:

```typescript
import {
  SoroswapSDKConfig,
  Network,
  TradeType,
  QuoteDto,
  QuoteResponse,
  Pool,
  UserPosition,
  PriceData,
  // ... and many more
} from 'soroswap-sdk';
```

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests to help improve the SDK.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Soroswap.Finance](https://soroswap.finance)
- [Documentation](https://docs.soroswap.finance)
- [API Documentation](https://api.soroswap.finance)
- [GitHub Repository](https://github.com/soroswap/sdk)

## 📞 Support

For support and questions:
- Create an issue on [GitHub](https://github.com/soroswap/sdk/issues)
- Join our [Discord community](https://discord.gg/soroswap)
- Follow us on [Twitter](https://twitter.com/SoroswapFinance)

---

Built with ❤️ by the Soroswap team for the Stellar ecosystem. 