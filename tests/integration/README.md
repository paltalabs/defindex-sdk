# Integration Tests

These tests actually call the real Soroswap API to verify end-to-end functionality. Unlike unit tests which mock all external dependencies, integration tests:

- ✅ Test real API communication
- ✅ Verify authentication flow works
- ✅ Catch breaking API changes
- ✅ Test actual data flow
- ⚠️ Require valid credentials
- ⚠️ May fail due to network issues
- ⚠️ Slower execution than unit tests

## Setup

### 1. Get Soroswap API Credentials

You need a valid Soroswap account to run integration tests:

1. Visit [Soroswap.Finance](https://soroswap.finance)
2. Create an account or use an existing one
3. Note your email and password

### 2. Set Environment Variables

Set the required environment variables:

```bash
# Option 1: Export in your shell
export SOROSWAP_EMAIL="your-email@example.com"
export SOROSWAP_PASSWORD="your-password"

# Option 2: Create a .env file (DO NOT commit this!)
echo "SOROSWAP_EMAIL=your-email@example.com" > .env
echo "SOROSWAP_PASSWORD=your-password" >> .env
```

## Running Tests

```bash
# Run only integration tests
pnpm run test:integration

# Run both unit and integration tests
pnpm run test:all

# Run unit tests only (default, no credentials needed)
pnpm test
```

## Test Structure

The integration tests are organized into categories:

- **Authentication Flow** - Login, token management, user info
- **Health & System Info** - API health, contract addresses, available tokens
- **Protocols & Quotes** - Available protocols, quote generation, XDR creation
- **Pool Information** - Pool listings, specific token pairs
- **Asset & Price Information** - Asset lists, price data
- **Error Handling** - Invalid requests, network errors
- **Rate Limiting & Performance** - Concurrent requests, timeouts

## Important Notes

### Security
- **Never commit credentials** to version control
- Integration tests use testnet by default for safety
- Credentials are only used for authentication, not stored

### Test Environment
- Tests use Soroswap testnet to avoid real money transactions
- Some features may not be available on testnet
- Tests include graceful handling of missing data

### CI/CD
- Integration tests should be run separately from unit tests in CI
- Consider running them on a schedule rather than every commit
- Set up separate secrets management for credentials

### Debugging

If tests fail:

1. **Check credentials**: Ensure environment variables are set correctly
2. **Check network**: Verify you can reach api.soroswap.finance
3. **Check API status**: Visit the health endpoint manually
4. **Check rate limits**: Wait a few minutes if hitting rate limits

```bash
# Manual health check
curl https://api.soroswap.finance/health

# Check your environment variables
echo $SOROSWAP_EMAIL
echo $SOROSWAP_PASSWORD
```

## Example Test Run

```bash
$ pnpm run test:integration

> soroswap-sdk@1.0.0 test:integration
> jest --config=jest.integration.config.js

[2024-01-15T10:30:00.000Z] 🚀 Starting integration tests against Soroswap API...
[2024-01-15T10:30:00.000Z] 📧 Using email: test@example.com
[2024-01-15T10:30:00.000Z] 🔒 Password: [HIDDEN]

  SoroswapSDK - Integration Tests
    Authentication Flow
      ✓ should authenticate and get user info (2345ms)
    Health and System Info
      ✓ should fetch health status (1234ms)
      ✓ should fetch testnet tokens (987ms)
    [... more tests ...]

[2024-01-15T10:35:00.000Z] ✅ Integration tests completed

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        45.123s
```

## Contributing

When adding new integration tests:

1. Follow the same patterns as existing tests
2. Include graceful handling for missing data on testnet
3. Use realistic but small amounts for any transactions
4. Add appropriate timeouts for network operations
5. Include descriptive console logs for debugging 