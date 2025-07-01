import { SoroswapSDK } from '../src';
import { QuoteRequest, QuoteResponse, SupportedNetworks, SupportedPlatforms, SupportedProtocols, TradeType } from '../src/types';

describe('SoroswapSDK - Quote Functions', () => {
  let sdk: SoroswapSDK;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create SDK instance
    sdk = new SoroswapSDK({
      email: 'test@example.com',
      password: 'password123'
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
        assetOut: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
        tradeType: TradeType.EXACT_IN,
        platform: SupportedPlatforms.AGGREGATOR,
        priceImpact: {
          numerator: 3n,
          denominator: 1000000n
        },
        trade: {
          amountIn: 9950000n,
          amountOutMin: 2009972n,
          expectedAmountOut: 2020072n,
          distribution: [{
            protocol_id: SupportedProtocols.SOROSWAP,
            path: ['CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA', 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV'],
            parts: 10,
            is_exact_in: true
          }]
        }
      };

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