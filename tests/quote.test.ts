import { SoroswapSDK } from '../src';
import { QuoteRequest, QuoteResponse, SupportedNetworks, SupportedPlatforms, SupportedProtocols, TradeType } from '../src/types';

describe('SoroswapSDK - Quote Functions', () => {
  let sdk: SoroswapSDK;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create SDK instance
    sdk = new SoroswapSDK({
      apiKey: 'sk_test_api_key_123'
    });
  });

  describe('constructor', () => {
    it('should use default baseUrl when not provided', () => {
      const defaultSdk = new SoroswapSDK({
        apiKey: 'sk_test_key'
      });
      
      expect(defaultSdk).toBeDefined();
    });

    it('should use custom baseUrl when provided', () => {
      const customSdk = new SoroswapSDK({
        apiKey: 'sk_test_key',
        baseUrl: 'http://localhost:3000'
      });
      
      expect(customSdk).toBeDefined();
    });
  });

  describe('quote', () => {
    it('should get quote for swap', async () => {
      const mockQuoteRequest: QuoteRequest = {
        assetIn: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
        assetOut: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
        amount: 10000000n,
        tradeType: 'EXACT_IN' as TradeType,
        protocols: ['soroswap', 'aqua'] as SupportedProtocols[]
      };

      const mockQuoteResponse: QuoteResponse = {
        assetIn: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
        amountIn: "10000000",
        assetOut: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
        amountOut: 8559560,
        otherAmountThreshold: 8559560,
        priceImpactPct: "0.00",
        platform: SupportedPlatforms.AGGREGATOR,
        routePlan: [{
          protocol: SupportedProtocols.SOROSWAP,
          path: ['CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA', 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV'],
          percentage: "100.00"
        }],
        tradeType: TradeType.EXACT_IN,
        rawTrade: {
          amountIn: "10000000",
          amountOutMin: 8559560,
          distribution: [{
            protocol_id: SupportedProtocols.SOROSWAP,
            path: ['CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA', 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV'],
            parts: 10,
            is_exact_in: true
          }]
        }
      } as any;

      // Mock the HTTP client
      (sdk as any).httpClient.post = jest.fn().mockResolvedValue(mockQuoteResponse);

      const result = await sdk.quote(mockQuoteRequest, SupportedNetworks.MAINNET);

      expect(result).toEqual(mockQuoteResponse);
      expect((sdk as any).httpClient.post).toHaveBeenCalledWith(
        '/quote?network=mainnet',
        mockQuoteRequest
      );
    });
  });
});