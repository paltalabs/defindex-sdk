// import { SoroswapSDK } from '../src';
// import { QuoteRequest, QuoteResponse, SupportedProtocols, TradeType } from '../src/types';

// describe('SoroswapSDK - Quote Functions', () => {
//   let sdk: SoroswapSDK;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     // Create SDK instance
//     sdk = new SoroswapSDK({
//       email: 'test@example.com',
//       password: 'password123'
//     });
//   });

//   describe('quote', () => {
//     it('should get quote for swap', async () => {
//       const mockQuoteRequest: QuoteRequest = {
//         assetIn: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
//         assetOut: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
//         amount: 10000000n,
//         tradeType: 'EXACT_IN' as TradeType,
//         protocols: ['soroswap', 'aqua'] as SupportedProtocols[]
//       };

//       const mockQuoteResponse: QuoteResponse = {
//         assetIn: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
//         assetOut: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
//         tradeType: 'EXACT_IN' as TradeType,
//         priceImpact: {
//           numerator: '3',
//           denominator: '1000000'
//         },
//         trade: {
//           amountIn: '9950000',
//           amountOutMin: '2009972',
//           expectedAmountOut: '2020072',
//           distribution: [{
//             protocol_id: 'soroswap',
//             path: ['token1', 'token2'],
//             parts: 10,
//             is_exact_in: true
//           }]
//         }
//       };

//       // Mock the HTTP client
//       (sdk as any).httpClient.post = jest.fn().mockResolvedValue(mockQuoteResponse);

//       const result = await sdk.quote(mockQuoteRequest, 'testnet');

//       expect(result).toEqual(mockQuoteResponse);
//       expect((sdk as any).httpClient.post).toHaveBeenCalledWith(
//         '/quote?network=testnet',
//         mockQuoteRequest
//       );
//     });
//   });
// });