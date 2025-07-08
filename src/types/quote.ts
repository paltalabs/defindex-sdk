import { SupportedAssetLists, SupportedPlatforms, SupportedProtocols, TradeType } from "./common";

// Quote types
export interface QuoteRequest {
  assetIn: string;
  assetOut: string;
  amount: bigint;
  tradeType: TradeType;
  protocols: SupportedProtocols[];
  parts?: number;
  slippageTolerance?: number;
  maxHops?: number;
  assetList?: SupportedAssetLists[];
  feeBps?: number;
  gaslessTrustline?: boolean;
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
export interface DistributionReturn {
  protocol_id: SupportedProtocols
  path: string[]
  parts: number
  is_exact_in: boolean
  poolHashes?: string[]
}

export interface BaseExactInTrade {
  amountIn: bigint
  amountOutMin: bigint
}

export interface ExactInTradeWithPath extends BaseExactInTrade {
  path: string[]
  distribution?: never
}

export interface ExactInTradeWithDistribution extends BaseExactInTrade {
  path?: never
  distribution: DistributionReturn[]
}

export type ExactInTrade = ExactInTradeWithPath | ExactInTradeWithDistribution

export interface BaseExactOutTrade {
  amountOut: bigint
  amountInMax: bigint
}

export interface ExactOutTradeWithPath extends BaseExactOutTrade {
  path: string[]
  distribution?: never
}

export interface ExactOutTradeWithDistribution extends BaseExactOutTrade {
  path?: never
  distribution: DistributionReturn[]
}

export type ExactOutTrade = ExactOutTradeWithPath | ExactOutTradeWithDistribution

export interface HorizonPath {
  asset_type: string
  asset_code: string
  asset_issuer: string
}

export interface HorizonBaseStrictPaths {
  source_asset_type: string
  source_amount: string
  max_source_amount?: string
  source_asset_code?: string
  source_asset_issuer?: string
  destination_asset_type: string
  destination_amount: string
  min_destination_amount?: string
  destination_asset_code?: string
  destination_asset_issuer?: string
  path: HorizonPath[]
}

export interface HorizonTrustlineStrictPaths extends HorizonBaseStrictPaths {
  trustlineStuff?: {
    totalOut?: string
    expectedOut?: string 
    minimumOut?: string
    swapPath?: HorizonBaseStrictPaths
    repayIn?: string // The amount of the sourceAsset to repay the trustline
    maxRepayIn?: string // The maximum amount of the sourceAsset to repay the trustline
    repayPath?: HorizonBaseStrictPaths // The repay path
    trustlineCostAssetIn?: string
    trustlineCostAssetOut?: string
  
    // EXACT OUT
    // Quote
    finalExpectedIn?: string // The final expected amount to spend in the gasless exact out
    finalMaximumIn?: string // The final maximum amount to spend in the gasless exact out
    
    // The sourceAsset to destinationAsset swap
    expectedSwapIn?: string // The expected amount to spend in the first swap
    maximumSwapIn?: string // The maximum amount to spend in the first swap
  
    // Trustline Swap?: Swap destinationAsset to 0.5 XLM
    expectedTrustlineCostIn?: string // The expected amount to spend in the gasless exact out
    maximumTrustlineCostIn?: string // The maximum amount to spend in the gasless exact out
    trustlineCostPath?: HorizonBaseStrictPaths // The path to swap the destinationAsset to 0.5 XLM
  
    // Extra info?: 
    trustlineEquivalentAssetOut?: string // The amount of destinationAsset to repay the trustline
  }
}

export type HorizonStrictPaths = HorizonBaseStrictPaths | HorizonTrustlineStrictPaths

export interface RoutePlan {
  swapInfo: {
    protocol: SupportedProtocols,
    path: string[],
  }
  percent: string
}

export interface PlatformFee {
  feeBps: number
  feeAmount: bigint
}

export interface TrustlineInfo {
  trustlineCostAssetIn: string
  trustlineCostAssetOut: string
}

interface BaseQuoteResponse {
  assetIn: string
  amountIn: bigint
  assetOut: string
  amountOut: bigint
  otherAmountThreshold: bigint
  priceImpactPct: string
  platform: SupportedPlatforms
  routePlan: RoutePlan[]
  trustlineInfo?: TrustlineInfo
  platformFee?: PlatformFee
  gaslessTrustline?: boolean
}

export interface ExactInQuoteResponse extends BaseQuoteResponse {
  tradeType: TradeType.EXACT_IN
  rawTrade: ExactInTrade | HorizonStrictPaths
}

export interface ExactOutQuoteResponse extends BaseQuoteResponse {
  tradeType: TradeType.EXACT_OUT
  rawTrade: ExactOutTrade | HorizonStrictPaths
}

export type QuoteResponse = ExactInQuoteResponse | ExactOutQuoteResponse