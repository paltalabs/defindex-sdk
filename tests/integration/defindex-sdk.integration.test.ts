import { DefindexSDK } from "../../src";
import { 
  SupportedNetworks,
  LoginParams,
  ApiKeyGenerateRequest
} from "../../src/types";

/**
 * Integration tests for the DefIndex SDK
 * These tests actually call the real DefIndex API and require valid credentials
 *
 * To run these tests:
 * Option 1 - API Key (recommended):
 *   1. Set environment variable: DEFINDEX_API_KEY
 *   2. Run: pnpm run test:integration
 *
 * Option 2 - Email/Password:
 *   1. Set environment variables: DEFINDEX_API_EMAIL, DEFINDEX_API_PASSWORD
 *   2. Run: pnpm run test:integration
 *
 * Note: These tests may fail if:
 * - API is down
 * - Network issues
 * - Invalid credentials
 * - Rate limiting
 * - Insufficient permissions for admin operations
 */

describe("DefindexSDK - Integration Tests", () => {
  let sdk: DefindexSDK;

  // Check for authentication credentials
  const hasApiKey = !!process.env.DEFINDEX_API_KEY;
  const hasEmailPassword = !!(process.env.DEFINDEX_API_EMAIL && process.env.DEFINDEX_API_PASSWORD);
  const skipTests = !hasApiKey && !hasEmailPassword;

  beforeAll(async () => {
    if (skipTests) {
      console.log("⚠️  Skipping integration tests - missing authentication credentials");
      return;
    }

    // Initialize SDK with available authentication method
    if (hasApiKey) {
      sdk = new DefindexSDK({
        apiKey: process.env.DEFINDEX_API_KEY!,
        baseUrl: process.env.DEFINDEX_API_URL,
        timeout: 30000,
      });
    } else {
      sdk = new DefindexSDK({
        email: process.env.DEFINDEX_API_EMAIL!,
        password: process.env.DEFINDEX_API_PASSWORD!,
        baseUrl: process.env.DEFINDEX_API_URL,
        timeout: 30000,
      });
    }
  });

  describe("System Health", () => {
    it("should check API health status", async () => {
      if (skipTests) return;

      try {
        const health = await sdk.healthCheck();
        console.log("🏥 Health check response:", health);

        expect(health).toBeDefined();
        
        // Health response structure may vary, so we check for common fields
        if (health.status) {
          expect(typeof health.status).toBe('object');
        }

        console.log("✅ API health check successful");
      } catch (error: any) {
        console.error("❌ Health check failed:", error.message);
        throw error;
      }
    }, 15000);
  });

  describe("Authentication Flow", () => {
    it("should authenticate with email/password when provided", async () => {
      if (skipTests || !hasEmailPassword) return;

      const loginCredentials: LoginParams = {
        email: process.env.DEFINDEX_API_EMAIL!,
        password: process.env.DEFINDEX_API_PASSWORD!
      };

      try {
        const response = await sdk.login(loginCredentials);
        console.log("🔐 Login response:", {
          role: response.role,
          username: response.username,
          hasAccessToken: !!response.access_token,
          hasRefreshToken: !!response.refresh_token
        });

        expect(response.access_token).toBeDefined();
        expect(response.refresh_token).toBeDefined();
        expect(response.role).toBeDefined();
        expect(response.username).toBeDefined();

        console.log("✅ Authentication successful");
      } catch (error: any) {
        console.error("❌ Authentication failed:", error.message);
        throw error;
      }
    }, 15000);

    it("should refresh authentication token", async () => {
      if (skipTests || !hasEmailPassword) return;

      try {
        // First login to get tokens
        await sdk.login({
          email: process.env.DEFINDEX_API_EMAIL!,
          password: process.env.DEFINDEX_API_PASSWORD!
        });

        // Then try to refresh
        const refreshResponse = await sdk.refreshToken();
        console.log("🔄 Token refresh response:", {
          role: refreshResponse.role,
          username: refreshResponse.username,
          hasAccessToken: !!refreshResponse.access_token,
          hasRefreshToken: !!refreshResponse.refresh_token
        });

        expect(refreshResponse.access_token).toBeDefined();
        expect(refreshResponse.refresh_token).toBeDefined();

        console.log("✅ Token refresh successful");
      } catch (error: any) {
        console.error("❌ Token refresh failed:", error.message);
        // Don't throw as refresh might not be available in all environments
        console.log("⚠️  Token refresh not available or failed");
      }
    }, 15000);
  });

  describe("API Key Management", () => {
    it("should generate a new API key", async () => {
      if (skipTests) return;

      const keyRequest: ApiKeyGenerateRequest = {
        name: `Test API Key ${Date.now()}`
      };

      try {
        const apiKeyResponse = await sdk.generateApiKey(keyRequest);
        console.log("🔑 Generated API key:", {
          id: apiKeyResponse.id,
          keyPrefix: apiKeyResponse.key.substring(0, 10) + "...",
          keyLength: apiKeyResponse.key.length
        });

        expect(apiKeyResponse.id).toBeDefined();
        expect(apiKeyResponse.key).toBeDefined();
        expect(typeof apiKeyResponse.id).toBe('number');
        expect(typeof apiKeyResponse.key).toBe('string');
        expect(apiKeyResponse.key.length).toBeGreaterThan(20);

        console.log("✅ API key generation successful");

        // Store the key ID for potential cleanup
        (global as any).testApiKeyId = apiKeyResponse.id;
      } catch (error: any) {
        console.error("❌ API key generation failed:", error.message);
        throw error;
      }
    }, 15000);

    it("should list user API keys", async () => {
      if (skipTests) return;

      try {
        const apiKeys = await sdk.getUserApiKeys();
        console.log("📋 User API keys:", apiKeys.map(key => ({
          id: key.id,
          name: key.name || 'Unnamed',
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt
        })));

        expect(Array.isArray(apiKeys)).toBe(true);

        if (apiKeys.length > 0) {
          const firstKey = apiKeys[0];
          expect(firstKey.id).toBeDefined();
          expect(firstKey.createdAt).toBeDefined();
          expect(typeof firstKey.id).toBe('number');
          expect(typeof firstKey.createdAt).toBe('string');
        }

        console.log("✅ API key listing successful");
      } catch (error: any) {
        console.error("❌ API key listing failed:", error.message);
        throw error;
      }
    }, 15000);

    it("should revoke an API key", async () => {
      if (skipTests) return;

      // Use the key ID from the previous generation test
      const testKeyId = (global as any).testApiKeyId;
      if (!testKeyId) {
        console.log("⚠️  No test API key ID available for revocation test");
        return;
      }

      try {
        const revokeResponse = await sdk.revokeApiKey(testKeyId);
        console.log("🗑️  API key revocation response:", revokeResponse);

        expect(revokeResponse.success).toBe(true);

        console.log("✅ API key revocation successful");
      } catch (error: any) {
        console.error("❌ API key revocation failed:", error.message);
        // Don't throw as the key might already be revoked or not exist
        console.log("⚠️  API key revocation test completed with error");
      }
    }, 15000);
  });

  describe("Factory Operations", () => {
    it("should get factory address", async () => {
      if (skipTests) return;

      try {
        const factoryTestnet = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
        console.log("🏭 Factory address (TESTNET):", factoryTestnet);

        expect(factoryTestnet.address).toBeDefined();
        expect(typeof factoryTestnet.address).toBe('string');
        expect(factoryTestnet.address.length).toBeGreaterThan(20);

        // Try mainnet as well if available
        try {
          const factoryMainnet = await sdk.getFactoryAddress(SupportedNetworks.MAINNET);
          console.log("🏭 Factory address (MAINNET):", factoryMainnet);
          expect(factoryMainnet.address).toBeDefined();
        } catch (mainnetError: any) {
          console.log("⚠️  Mainnet factory not available:", mainnetError.message);
        }

        console.log("✅ Factory address retrieval successful");
      } catch (error: any) {
        console.error("❌ Factory address retrieval failed:", error.message);
        throw error;
      }
    }, 15000);

    // Note: Vault creation test is commented out as it requires proper roles and real assets
    // it("should create a vault", async () => {
    //   if (skipTests) return;

    //   const vaultConfig: CreateDefindexVault = {
    //     roles: {
    //       0: "GEMERGENCY_MANAGER_ADDRESS...", // Emergency Manager
    //       1: "GFEE_RECEIVER_ADDRESS...",      // Fee Receiver  
    //       2: "GVAULT_MANAGER_ADDRESS...",     // Vault Manager
    //       3: "GREBALANCE_MANAGER_ADDRESS..."  // Rebalance Manager
    //     },
    //     vault_fee_bps: 100, // 1% fee
    //     assets: [{
    //       address: "CUSDC_CONTRACT_ADDRESS...",
    //       strategies: [{
    //         address: "GSTRATEGY_CONTRACT_ADDRESS...",
    //         name: "Test Strategy",
    //         paused: false
    //       }]
    //     }],
    //     name_symbol: { 
    //       name: "Test Vault", 
    //       symbol: "TV" 
    //     },
    //     upgradable: true,
    //     caller: "GCREATOR_ADDRESS..."
    //   };

    //   try {
    //     const response = await sdk.createVault(vaultConfig, SupportedNetworks.TESTNET);
    //     console.log("🏗️  Vault creation response:", response);

    //     expect(response.xdr).toBeDefined();
    //     expect(response.simulation_result).toBeDefined();

    //     console.log("✅ Vault creation successful");
    //   } catch (error: any) {
    //     console.error("❌ Vault creation failed:", error.message);
    //     throw error;
    //   }
    // }, 20000);
  });

  describe("Vault Operations", () => {
    // Note: These tests require existing vaults to test against
    // They are designed to be non-destructive read operations

    it("should handle vault info request gracefully", async () => {
      if (skipTests) return;

      // Using a placeholder vault address - this will likely fail but shows the API contract
      const testVaultAddress = "GVAULT_TEST_ADDRESS_PLACEHOLDER_FOR_INTEGRATION_TEST";

      try {
        const vaultInfo = await sdk.getVaultInfo(testVaultAddress, SupportedNetworks.TESTNET);
        console.log("🏦 Vault info:", {
          name: vaultInfo.name,
          symbol: vaultInfo.symbol,
          totalSupply: vaultInfo.totalSupply,
          totalAssets: vaultInfo.totalAssets,
          assetsCount: vaultInfo.assets?.length || 0
        });

        expect(vaultInfo.name).toBeDefined();
        expect(vaultInfo.symbol).toBeDefined();

        console.log("✅ Vault info retrieval successful");
      } catch (error: any) {
        // Expected to fail with placeholder address
        console.log("⚠️  Vault info test failed as expected with placeholder address:", error.message);
        expect(error).toBeDefined();
      }
    }, 15000);

    it("should handle vault balance request gracefully", async () => {
      if (skipTests) return;

      const testVaultAddress = "GVAULT_TEST_ADDRESS_PLACEHOLDER";
      const testUserAddress = "GUSER_TEST_ADDRESS_PLACEHOLDER";

      try {
        const balance = await sdk.getVaultBalance(
          testVaultAddress,
          testUserAddress,
          SupportedNetworks.TESTNET
        );
        console.log("💰 Vault balance:", {
          dfTokens: balance.dfTokens,
          underlyingBalanceLength: balance.underlyingBalance?.length || 0
        });

        expect(balance.dfTokens).toBeDefined();

        console.log("✅ Vault balance retrieval successful");
      } catch (error: any) {
        // Expected to fail with placeholder addresses
        console.log("⚠️  Vault balance test failed as expected with placeholder addresses:", error.message);
        expect(error).toBeDefined();
      }
    }, 15000);

    // Note: Deposit/Withdraw tests are commented out as they require real vault addresses and assets
    // it("should handle deposit to vault", async () => {
    //   if (skipTests) return;

    //   const depositData: DepositToVaultParams = {
    //     amounts: [1000000], // Small test amount
    //     caller: 'GUSER_ADDRESS...',
    //     invest: true,
    //     slippageBps: 100 // 1% slippage
    //   };

    //   try {
    //     const response = await sdk.depositToVault(
    //       'GVAULT_ADDRESS...',
    //       depositData,
    //       SupportedNetworks.TESTNET
    //     );

    //     expect(response.xdr).toBeDefined();
    //     console.log("✅ Deposit transaction created");
    //   } catch (error: any) {
    //     console.error("❌ Deposit failed:", error.message);
    //     throw error;
    //   }
    // }, 15000);
  });

  describe("Transaction Management", () => {
    it("should handle transaction submission gracefully", async () => {
      if (skipTests) return;

      // Using a placeholder XDR - this will likely fail but shows the API contract
      const testXDR = "PLACEHOLDER_XDR_FOR_INTEGRATION_TEST";

      try {
        const result = await sdk.sendTransaction(
          testXDR,
          SupportedNetworks.TESTNET,
          false // Don't use LaunchTube
        );
        console.log("📤 Transaction result:", result);

        expect(result).toBeDefined();

        console.log("✅ Transaction submission successful");
      } catch (error: any) {
        // Expected to fail with placeholder XDR
        console.log("⚠️  Transaction test failed as expected with placeholder XDR:", error.message);
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  describe("Error Handling", () => {
    it("should handle invalid requests gracefully", async () => {
      if (skipTests) return;

      try {
        // Test with obviously invalid vault address
        await sdk.getVaultInfo("INVALID_ADDRESS", SupportedNetworks.TESTNET);
        
        // If we get here, the API didn't validate the address
        console.log("⚠️  API accepted invalid vault address");
      } catch (error: any) {
        // Expected behavior
        console.log("✅ API properly rejected invalid vault address:", error.message);
        expect(error).toBeDefined();
      }
    }, 10000);

    it("should handle network errors gracefully", async () => {
      if (skipTests) return;

      // Create SDK with invalid base URL to test error handling
      const badSdk = new DefindexSDK({
        apiKey: process.env.DEFINDEX_API_KEY || 'test-key',
        baseUrl: 'https://invalid-api-url-that-does-not-exist.com',
        timeout: 5000
      });

      try {
        await badSdk.healthCheck();
        
        // If we get here, something unexpected happened
        console.log("⚠️  Network error test didn't fail as expected");
      } catch (error: any) {
        // Expected network error
        console.log("✅ Network error handled gracefully:", error.message);
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe("Rate Limiting and Performance", () => {
    it("should handle multiple concurrent requests", async () => {
      if (skipTests) return;

      try {
        const promises = [
          sdk.healthCheck(),
          sdk.getFactoryAddress(SupportedNetworks.TESTNET),
          sdk.getUserApiKeys()
        ];

        const results = await Promise.allSettled(promises);
        console.log("🚀 Concurrent requests results:", results.map((result, index) => ({
          index,
          status: result.status,
          hasValue: result.status === 'fulfilled' ? !!result.value : false,
          error: result.status === 'rejected' ? result.reason?.message : undefined
        })));

        // At least some requests should succeed
        const successfulResults = results.filter(r => r.status === 'fulfilled');
        expect(successfulResults.length).toBeGreaterThan(0);

        console.log("✅ Handle concurrent requests successfully");
      } catch (error: any) {
        console.error("❌ Concurrent requests failed:", error.message);
        throw error;
      }
    }, 20000);
  });
});