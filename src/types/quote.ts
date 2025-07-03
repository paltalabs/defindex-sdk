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

export interface HorizonPath {
  asset_type: string,
  asset_code: string,
  asset_issuer: string,
}

export interface HorizonBaseStrictPaths {
  source_asset_type: string,
  source_amount: string,
  destination_asset_type: string,
  destination_amount: string,
  path: HorizonPath[]
}

export interface HorizonStrictSendPaths extends HorizonBaseStrictPaths {
  source_asset_code: string,
  source_asset_issuer: string,
}
export interface HorizonStrictReceivePaths extends HorizonBaseStrictPaths {
  destination_asset_code: string,
  destination_asset_issuer: string,
}

export type ExactOutTrade = ExactOutTradeWithPath | ExactOutTradeWithDistribution

interface BaseQuoteResponse {
  assetIn: string
  assetOut: string
  amountIn: bigint
  amountOut: bigint
  priceImpactPct: string
  platform: SupportedPlatforms
  routePlan: {
    protocol: SupportedProtocols,
    path: string[],
    percentage: string
  }[]
  feeBps?: number
  feeAmount?: bigint
}

export interface ExactInQuoteResponse extends BaseQuoteResponse {
  tradeType: TradeType.EXACT_IN
  rawTrade: ExactInTrade | HorizonStrictSendPaths
}

export interface ExactOutQuoteResponse extends BaseQuoteResponse {
  tradeType: TradeType.EXACT_OUT
  rawTrade: ExactOutTrade | HorizonStrictReceivePaths
}

export type QuoteResponse = ExactInQuoteResponse | ExactOutQuoteResponse