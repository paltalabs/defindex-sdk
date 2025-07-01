import { SupportedProtocols } from "./common";

export interface Pool {
  protocol: SupportedProtocols;
  address: string;
  tokenA: string;
  tokenB: string;
  reserveA: bigint;
  reserveB: bigint;
  ledger?: number;
  reserveLp?: bigint;
  stakeAddress?: string;
  poolType?: string;
  fee?: bigint;
  totalFeeBps?: number;
  tokenC?: string;
  reserveC?: bigint;
  futureA?: bigint;
  futureATime?: bigint;
  initialA?: bigint;
  initialATime?: bigint;
  precisionMulA?: bigint;
  precisionMulB?: bigint;
  precisionMulC?: bigint;
  poolHash?: string;

  involvesAsset(asset: string): boolean;
}

export enum LiquidityAction {
  CREATE_POOL = 'create_pool',
  ADD_LIQUIDITY = 'add_liquidity',
  REMOVE_LIQUIDITY = 'remove_liquidity',
}

export interface AddLiquidityRequest {
  assetA: string
  assetB: string
  amountA: bigint
  amountB: bigint
  to: string
  slippageTolerance?: string
}

export interface LiquidityResponse {
  xdr: string
  type: LiquidityAction
  poolInfo: Pool
  minAmountA: bigint
  minAmountB: bigint
}

export interface RemoveLiquidityRequest {
  assetA: string
  assetB: string
  liquidity: bigint
  amountA: bigint
  amountB: bigint
  to: string
  slippageTolerance?: string
}

export interface UserPosition {
  poolInfo: Pool
  userPosition: bigint
}