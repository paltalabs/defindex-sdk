import { SupportedAssetLists, SupportedPlatforms, SupportedProtocols, TradeType } from "./common";

// Quote types
export interface QuoteRequest {
  assetIn: string;
  assetOut: string;
  amount: bigint;
  tradeType: TradeType;
  protocols: SupportedProtocols[];
  parts?: number;
  slippageTolerance?: string;
  maxHops?: number;
  assetList?: SupportedAssetLists[];
  feeBps?: number;
}

export interface BuildQuoteRequest {
  quote: QuoteResponse;
  from?: string;
  to?: string;
  referralId?: string;
}

export interface BuildQuoteResponse {
  xdr: string;
}

export interface CommonBuildTradeReturnFields {
  assetIn: string
  assetOut: string
  priceImpact: {
    numerator: bigint
    denominator: bigint
  }
  platform: SupportedPlatforms
  feeBps?: number
  feeAmount?: bigint
}

export interface ExactInBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_IN
  trade: {
    amountIn: bigint
    amountOutMin: bigint
    expectedAmountOut?: bigint
    path: string[]
    poolHashes?: string[]
  }
}

export interface ExactOutBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_OUT
  trade: {
    amountOut: bigint
    amountInMax: bigint
    expectedAmountIn?: bigint
    path: string[]
    poolHashes?: string[]
  }
}

export interface DistributionReturn {
  protocol_id: SupportedProtocols
  path: string[]
  parts: number
  is_exact_in: boolean
  poolHashes?: string[]
}

export interface ExactInSplitBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_IN
  trade: {
    amountIn: bigint
    amountOutMin: bigint
    expectedAmountOut?: bigint
    distribution: DistributionReturn[]
  }
}

export interface ExactOutSplitBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_OUT
  trade: {
    amountOut: bigint
    amountInMax: bigint
    expectedAmountIn?: bigint
    distribution: DistributionReturn[]
  }
}

export type BuildTradeReturn = ExactInBuildTradeReturn | ExactOutBuildTradeReturn

export type BuildSplitTradeReturn = ExactInSplitBuildTradeReturn | ExactOutSplitBuildTradeReturn

export type QuoteResponse = BuildTradeReturn | BuildSplitTradeReturn