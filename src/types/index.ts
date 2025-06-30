// Network types
export type Network = 'mainnet' | 'testnet';

// Trade types
export type TradeType = 'EXACT_IN' | 'EXACT_OUT';

// Asset list types
export enum SupportedAssetLists {
  SOROSWAP = 'https://raw.githubusercontent.com/soroswap/token-list/main/tokenList.json',
  STELLAR_EXPERT = 'https://api.stellar.expert/explorer/public/asset-list/top50',
  LOBSTR = 'https://lobstr.co/api/v1/sep/assets/curated.json',
  AQUA = 'https://amm-api.aqua.network/tokens/?format=json&pooled=true&size=200',
}

export enum SupportedPlatforms {
  SDEX = 'sdex',
  AGGREGATOR = 'aggregator',
  ROUTER = 'router'
}

export enum SupportedNetworks {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
}

export enum SupportedProtocols {
  SOROSWAP = 'soroswap',
  PHOENIX = 'phoenix',
  AQUA = 'aqua',
  COMET = 'comet',
  SDEX = 'sdex',
}

// Authentication types
export interface AuthRegisterDto {
  username: string;
  password: string;
  email: string;
}

export interface AuthLoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

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

export interface BuildQuoteDto {
  quote: QuoteResponse;
  referralId?: string;
  from?: string;
  to?: string;
}

export interface PriceImpact {
  numerator: string;
  denominator: string;
}

export interface TradeDistribution {
  protocol_id: string;
  path: string[];
  parts: number;
  is_exact_in: boolean;
}

export interface Trade {
  amountIn: string;
  amountOutMin: string;
  expectedAmountOut: string;
  distribution: TradeDistribution[];
}

export interface QuoteResponse {
  assetIn: string;
  assetOut: string;
  tradeType: TradeType;
  priceImpact: PriceImpact;
  trade: Trade;
  feeBps?: number;
  feeAmount?: string;
  xdr?: string;
}

export interface SendXdrDto {
  xdr: string;
  fee: number;
}

export interface SendResponse {
  hash: string;
  status: string;
}

// Pool types
export interface Pool {
  protocol: string;
  address: string;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  ledger: number;
}

// Asset types
export interface Asset {
  name: string;
  contract: string;
  code: string;
  icon: string;
  decimals: number;
  issuer?: string;
}

export interface TokensByNetwork {
  network: string;
  assets: Asset[];
}

// Liquidity types
export interface AddLiquidityDto {
  assetA: string;
  assetB: string;
  amountA: string;
  amountB: string;
  to: string;
  slippageTolerance?: string;
}

export interface RemoveLiquidityDto {
  assetA: string;
  assetB: string;
  liquidity: string;
  amountA: string;
  amountB: string;
  to: string;
  slippageTolerance?: string;
}

export interface UserPosition {
  poolInfo: Pool;
  userPosition: string;
}

// Health types
export interface HealthStatus {
  indexer: {
    mainnet: string[];
    testnet: string[];
  };
  reachable: boolean;
}

export interface HealthResponse {
  status: HealthStatus;
}

// Contract types
export interface ContractResponse {
  address: string;
}

// Asset list types
export interface AssetListMetadata {
  name: string;
  url: string;
}

export interface AssetListDetail {
  name: string;
  provider: string;
  description: string;
  assets: Asset[];
}

// Price types
export interface PriceData {
  asset: string;
  referenceCurrency: string;
  price: string;
}

// SDK Configuration
export interface SoroswapSDKConfig {
  email: string;
  password: string;
  defaultNetwork?: Network;
  timeout?: number;
}

// Error types
export interface APIError {
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

// Token cache types
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  username: string;
  role: string;
} 