import { SoroswapSDK } from "../../src";
import { QuoteDto, TradeType } from "../../src/types";

/**
 * Integration tests for the Soroswap SDK
 * These tests actually call the real API and require valid credentials
 *
 * To run these tests:
 * 1. Set environment variables: SOROSWAP_EMAIL and SOROSWAP_PASSWORD
 * 2. Run: pnpm run test:integration
 *
 * Note: These tests may fail if:
 * - API is down
 * - Network issues
 * - Invalid credentials
 * - Rate limiting
 */

describe("SoroswapSDK - Integration Tests", () => {
  let sdk: SoroswapSDK;

  // Skip integration tests if credentials are not provided
  const skipTests =
    !process.env.SOROSWAP_EMAIL || !process.env.SOROSWAP_PASSWORD;

  beforeAll(() => {
    if (skipTests) {
      console.log(
        "⚠️  Skipping integration tests - missing SOROSWAP_EMAIL or SOROSWAP_PASSWORD"
      );
      return;
    }

    sdk = new SoroswapSDK({
      email: process.env.SOROSWAP_EMAIL!,
      password: process.env.SOROSWAP_PASSWORD!,
      defaultNetwork: "mainnet", // Use testnet for integration tests
      timeout: 30000,
    });
  });

  describe("Authentication Flow", () => {
    it("should authenticate", async () => {
      if (skipTests) return;

      // The SDK should automatically authenticate when making first request
      const protocols = await sdk.getProtocols("mainnet");

      console.log(protocols);
      expect(Array.isArray(protocols)).toBe(true);

      // Should be authenticated now
      expect(sdk.isAuthenticated()).toBe(true);
    }, 15000);
  });

  describe("Contract Addresses", () => {
    it("should fetch contract addresses", async () => {
      if (skipTests) return;

      const contracts = ["factory", "router", "aggregator"] as const;

      for (const contractName of contracts) {
        try {
          const contract = await sdk.getContractAddress(
            "testnet",
            contractName
          );
          expect(contract.address).toBeDefined();
          expect(typeof contract.address).toBe("string");
          expect(contract.address.length).toBeGreaterThan(10);
        } catch (error) {
          // Some contracts might not be available on testnet
          console.log(`Contract ${contractName} not available on testnet`);
        }
      }
    }, 10000);
  });

  describe("Quote", () => {
    it("should get a quote for mainnet tokens", async () => {
      if (skipTests) return;

      const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
      const EURC = "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV";

      const quoteRequest: QuoteDto = {
        assetIn: USDC,
        assetOut: EURC,
        amount: "1000000000", // 1 token (7 decimals)
        tradeType: "EXACT_IN" as TradeType,
        protocols: ["soroswap", "aqua", "phoenix"],
        feeBps: 50
      };

      try {
        const quote = await sdk.quote(quoteRequest);
        const quoteBuild = await sdk.build({
          quote,
          from: "GA3CQIS2URXWHWXLM34IKLTQFOLCMC4UGWG3SPRGT67PEFDGV2FFT5SO",
          to: "GA3CQIS2URXWHWXLM34IKLTQFOLCMC4UGWG3SPRGT67PEFDGV2FFT5SO",
          referralId: "1234567890"
        });

        expect(quote).toBeDefined();
        expect(quote.assetIn).toBe(USDC);
        expect(quote.assetOut).toBe(EURC);
        expect(quote.tradeType).toBe("EXACT_IN");
        expect(quote.trade).toBeDefined();
        expect(quote.trade.expectedAmountOut).toBeDefined();
        expect(quote.priceImpact).toBeDefined();
        expect(Array.isArray(quote.trade.distribution)).toBe(true);

        console.log("✅ Quote received:", {
          expectedOutput: quote.trade.expectedAmountOut,
          priceImpact: `${(
            (parseFloat(quote.priceImpact.numerator) /
              parseFloat(quote.priceImpact.denominator)) *
            100
          ).toFixed(4)}%`,
          protocols: quote.trade.distribution.map((d) => d.protocol_id),
        });
      } catch (error: any) {
        if (
          error.message.includes("route not found") ||
          error.message.includes("insufficient liquidity")
        ) {
          console.log(
            "⚠️  No route found between these tokens (expected on testnet)"
          );
        } else {
          throw error;
        }
      }
    }, 15000);

    it("should get quote with XDR when addresses provided", async () => {
      if (skipTests) return;

      const USDC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";
      const EURC = "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV";

      const quoteRequest: QuoteDto = {
        assetIn: USDC,
        assetOut: EURC,
        amount: "10000000",
        tradeType: "EXACT_IN" as TradeType,
        protocols: ["soroswap"],
      };

      try {
        const quote = await sdk.quote(quoteRequest, "mainnet");

        if (quote.xdr) {
          expect(typeof quote.xdr).toBe("string");
          expect(quote.xdr.length).toBeGreaterThan(50);
          console.log("✅ XDR included in quote response");
        }
      } catch (error: any) {
        if (error.message.includes("route not found")) {
          console.log("⚠️  No route found for XDR test");
        } else {
          throw error;
        }
      }
    }, 15000);
  });

  describe('Pool Information', () => {
    it('should fetch pools', async () => {
      if (skipTests) return;

      try {
        const pools = await sdk.getPools('mainnet', ['soroswap']);
        console.log("🚀 | it | pools:", pools)

        expect(Array.isArray(pools)).toBe(true);

        if (pools.length > 0) {
          const firstPool = pools[0];
          expect(firstPool.protocol).toBeDefined();
          expect(firstPool.address).toBeDefined();
          expect(firstPool.tokenA).toBeDefined();
          expect(firstPool.tokenB).toBeDefined();
          expect(firstPool.reserveA).toBeDefined();
          expect(firstPool.reserveB).toBeDefined();
          expect(typeof firstPool.ledger).toBe('number');

          console.log('✅ Found pools:', pools.length);
        } else {
          console.log('⚠️  No pools found on testnet');
        }

      } catch (error: any) {
        if (error.statusCode === 400) {
          console.log('⚠️  Pool query not supported or no pools available');
        } else {
          throw error;
        }
      }
    }, 15000);

    // it('should fetch specific token pair pool', async () => {
    //   if (skipTests) return;

    //   // Get available tokens first
    //   const tokens = await sdk.getTokens();
    //   const testnetTokens = tokens.find(t => t.network === 'testnet');

    //   if (!testnetTokens || testnetTokens.assets.length < 2) {
    //     return;
    //   }

    //   const [USDC, EURC] = testnetTokens.assets;

    //   try {
    //     const pools = await sdk.getPoolByTokens(
    //       USDC.contract,
    //       EURC.contract,
    //       'testnet',
    //       ['soroswap']
    //     );

    //     expect(Array.isArray(pools)).toBe(true);

    //     if (pools.length > 0) {
    //       console.log('✅ Found specific pool for token pair');
    //     } else {
    //       console.log('⚠️  No pool found for this token pair');
    //     }

    //   } catch (error: any) {
    //     console.log('⚠️  Pool lookup failed (expected if no pool exists)');
    //   }
    // }, 15000);
  });

  // describe('Asset and Price Information', () => {
  //   it('should fetch asset lists', async () => {
  //     if (skipTests) return;

  //     const assetLists = await sdk.getAssetList();

  //     if (Array.isArray(assetLists)) {
  //       expect(assetLists.length).toBeGreaterThan(0);

  //       const firstList = assetLists[0];
  //       expect(firstList.name).toBeDefined();
  //       expect(firstList.url).toBeDefined();

  //       console.log('✅ Available asset lists:', assetLists.map(l => l.name));
  //     }
  //   }, 10000);

  //   it('should fetch specific asset list', async () => {
  //     if (skipTests) return;

  //     try {
  //       const soroswapAssets = await sdk.getAssetList('SOROSWAP');

  //       if (!Array.isArray(soroswapAssets)) {
  //         expect(soroswapAssets.name).toBeDefined();
  //         expect(soroswapAssets.provider).toBeDefined();
  //         expect(Array.isArray(soroswapAssets.assets)).toBe(true);

  //         console.log('✅ Soroswap asset list:', soroswapAssets.assets.length, 'assets');
  //       }

  //     } catch (error: any) {
  //       if (error.statusCode === 404) {
  //         console.log('⚠️  SOROSWAP asset list not found');
  //       } else {
  //         throw error;
  //       }
  //     }
  //   }, 10000);

  //   it('should fetch asset prices', async () => {
  //     if (skipTests) return;

  //     const tokens = await sdk.getTokens();
  //     const testnetTokens = tokens.find(t => t.network === 'testnet');

  //     if (!testnetTokens || testnetTokens.assets.length === 0) {
  //       return;
  //     }

  //     const firstToken = testnetTokens.assets[0];

  //     try {
  //       const prices = await sdk.getPrice(
  //         [firstToken.contract],
  //         'testnet',
  //         'USD'
  //       );

  //       expect(Array.isArray(prices)).toBe(true);

  //       if (prices.length > 0) {
  //         const price = prices[0];
  //         expect(price.asset).toBe(firstToken.contract);
  //         expect(price.referenceCurrency).toBe('USD');
  //         expect(price.price).toBeDefined();

  //         console.log('✅ Price data:', price.price, 'USD');
  //       }

  //     } catch (error: any) {
  //       console.log('⚠️  Price data not available for testnet assets');
  //     }
  //   }, 15000);
  // });

  // describe('Error Handling', () => {
  //   it('should handle invalid quote requests gracefully', async () => {
  //     if (skipTests) return;

  //     const invalidQuote: QuoteDto = {
  //       assetIn: 'INVALID_CONTRACT_ADDRESS',
  //       assetOut: 'ANOTHER_INVALID_CONTRACT',
  //       amount: '1000000',
  //       tradeType: 'EXACT_IN' as TradeType,
  //       protocols: ['soroswap']
  //     };

  //     await expect(sdk.quote(invalidQuote, 'testnet')).rejects.toThrow();
  //   }, 10000);

  //   it('should handle network errors gracefully', async () => {
  //     if (skipTests) return;

  //     // Test with invalid network (should still work as backend might default)
  //     try {
  //       const protocols = await sdk.getProtocols('mainnet');
  //       expect(Array.isArray(protocols)).toBe(true);
  //     } catch (error) {
  //       // Expected if mainnet protocols are not available
  //       expect(error).toBeDefined();
  //     }
  //   }, 10000);
  // });

  // describe('Rate Limiting and Performance', () => {
  //   it('should handle multiple concurrent requests', async () => {
  //     if (skipTests) return;

  //     const promises = [
  //       sdk.checkHealth(),
  //       sdk.getProtocols('testnet'),
  //       sdk.getTokens()
  //     ];

  //     const results = await Promise.all(promises);

  //     expect(results).toHaveLength(3);
  //     expect(results[0]).toBeDefined(); // health
  //     expect(Array.isArray(results[1])).toBe(true); // protocols
  //     expect(Array.isArray(results[2])).toBe(true); // tokens

  //     console.log('✅ Concurrent requests handled successfully');
  //   }, 15000);
  // });
});
