import { BaseVaultTransactionResponse } from "./base.types";

/* Core vault creation types */
export interface AssetStrategySet {
  address: string;
  strategies: Strategy[];
}

export interface Strategy {
  address: string;
  name: string;
  paused: boolean;
}

/**
 * Configuration for creating a DeFindex vault
 * @example
 * ```typescript
 * const vaultConfig: CreateDefindexVault = {
 *   roles: {
 *     0: "GEMERGENCY...", // Emergency Manager
 *     1: "GFEE...",      // Fee Receiver
 *     2: "GMANAGER...",  // Vault Manager
 *     3: "GREBALANCE..." // Rebalance Manager
 *   },
 *   vault_fee_bps: 100, // 1% fee
 *   assets: [{
 *     address: "CUSDC...",
 *     strategies: [{
 *       address: "GSTRATEGY...",
 *       name: "USDC Lending Strategy",
 *       paused: false
 *     }]
 *   }],
 *   name_symbol: { name: "My DeFi Vault", symbol: "MDV" },
 *   upgradable: true,
 *   caller: "GCREATOR..."
 * };
 * ```
 */
export interface CreateDefindexVault {
  /** Role assignments for vault management (0: Emergency, 1: Fee Receiver, 2: Manager, 3: Rebalance) */
  roles: Record<number, string>;
  /** Vault fee in basis points (100 = 1%, max 10000 = 100%) */
  vault_fee_bps: number;
  /** Assets and their associated strategies */
  assets: AssetStrategySet[];
  /** Optional Soroswap router address for swaps */
  soroswap_router?: string;
  /** Vault name and symbol metadata */
  name_symbol: Record<string, string>;
  /** Whether the vault contract is upgradable */
  upgradable: boolean;
  /** Address that will create and sign the vault creation transaction */
  caller: string;
  /** Optional initial deposit amounts (deprecated, use CreateDefindexVaultDepositDto) */
  amounts?: number[];
}

export interface CreateDefindexVaultResponse {
  call_params: CreateDefindexVault;
  xdr: string | null;
  simulation_result: string;
  error?: string;
}

/* Base parameter interfaces */
interface BaseCallerParams {
  /** Stellar address of the transaction caller/signer 
   * @example "GCKFBEIYTKP6RNYXDXCVN5NHQG7C37VFTCB5BBXZ4F6PUB7FFLLKSZQJ"
   */
  caller: string;
}

interface BaseStrategyParams extends BaseCallerParams {
  /** Stellar address of the strategy contract 
   * @example "GSTRATEGY123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABC"
   */
  strategy_address: string;
}

interface BaseAmountParams extends BaseCallerParams {
  /** Array of amounts for each asset. Must be non-negative numbers. */
  amounts: number[];
  /** Slippage tolerance in basis points (0-10000). 100 = 1%, 10000 = 100%. Defaults to 0. */
  slippageBps?: number;
}

/* Vault operation parameters */
export interface DepositToVaultParams extends BaseAmountParams {
  /** Whether to invest the deposited assets immediately. Defaults to true. */
  invest?: boolean;
}

export interface WithdrawFromVaultParams extends BaseAmountParams {}

export interface WithdrawSharesParams extends BaseCallerParams {
  /** Amount of vault shares to withdraw. Must be a positive number. */
  shares: number;
  /** Slippage tolerance in basis points (0-10000). 100 = 1%, 10000 = 100%. Defaults to 0. */
  slippageBps?: number;
}

export interface RescueFromVaultParams extends BaseStrategyParams {}

export interface PauseStrategyParams extends BaseStrategyParams {}

export interface UnpauseStrategyParams extends BaseStrategyParams {}

export interface SetFeeRecieverParams extends BaseCallerParams {
  fee_reciever: string;
}

export interface SetManagerParams extends BaseCallerParams {
  manager: string;
}

export interface SetEmergencyManagerParams extends BaseCallerParams {
  emergency_manager: string;
}

export interface SetRebalanceManagerParams extends BaseCallerParams {
  rebalance_manager: string;
}

/* Contract management interfaces */
export interface UpgradeContractParams extends BaseCallerParams {
  new_wasm_hash: string;
}

export interface RebalanceParams extends BaseCallerParams {
  instructions: Instruction[];
}

/* Fee management interfaces */
export interface LockFeesParams extends BaseCallerParams {
  new_fee_bps: number;
}

export interface ReleaseFeesParams extends BaseStrategyParams {}

export interface DistributeFeesParams extends BaseCallerParams {}

/* Rebalance instruction types */
export type Instruction =
  | { type: "Unwind"; strategy: string; amount: number }
  | { type: "Invest"; strategy: string; amount: number }
  | {
      type: "SwapExactIn";  
      token_in: string;
      token_out: string;
      amount_in: number;
      amount_out_min: number;
      deadline: number;
    }
  | {
      type: "SwapExactOut";
      token_in: string;
      token_out: string;
      amount_out: number;
      amount_in_max: number;
      deadline: number;
    };

/* Vault data structures */
export interface VaultRole {
  manager: string;
  emergencyManager: string;
  rebalanceManager: string;
  feeReceiver: string;
}

export interface VaultStrategy {
  address: string;
  name: string;
  paused: boolean;
}

export interface VaultAsset {
  address: string;
  name: string;
  symbol: string;
  strategies: VaultStrategy[];
}

export interface VaultFees {
  vaultFee: number;
  defindexFee: number;
}

/* Vault endpoint response types */
/**
 * Comprehensive vault information response
 * @example
 * ```typescript
 * const vaultInfo = await sdk.getVaultInfo('GVAULT...', SupportedNetworks.TESTNET);
 * console.log(`${vaultInfo.name} (${vaultInfo.symbol})`);
 * console.log(`Total Supply: ${vaultInfo.totalSupply}`);
 * console.log(`Total Assets: ${vaultInfo.totalAssets}`);
 * console.log(`Vault Fee: ${vaultInfo.feesBps.vaultFee / 100}%`);
 * ```
 */
export interface VaultInfoResponse {
  /** Vault contract address */
  address: string;
  /** Vault display name */
  name: string;
  /** Vault token symbol */
  symbol: string;
  /** Total vault shares in circulation */
  totalSupply: number;
  /** Total value locked in the vault */
  totalAssets: number;
  /** Assets managed by the vault */
  assets: VaultAsset[];
  /** Detailed breakdown of managed funds per asset */
  totalManagedFunds: {
    /** Asset contract address */
    asset: string;
    /** Amount not actively invested */
    idle_amount: number;
    /** Amount actively invested in strategies */
    invested_amount: number;
    /** Per-strategy allocation breakdown */
    strategy_allocations: {
      /** Amount allocated to this strategy */
      amount: number;
      /** Whether the strategy is paused */
      paused: boolean;
      /** Strategy contract address */
      strategy_address: string;
    }[];
    /** Total amount for this asset */
    total_amount: number;
  }[];
  /** Fee structure in basis points */
  feesBps: VaultFees;
}

export interface VaultBalanceResponse {
  dfTokens: number;
  underlyingBalance: number[];
}

export interface VaultTransactionResponse extends BaseVaultTransactionResponse {}

export interface VaultRescueResponse extends BaseVaultTransactionResponse {}

export interface VaultStrategyStatusResponse extends BaseVaultTransactionResponse {}

/**
 * Vault Annual Percentage Yield information
 * @example
 * ```typescript
 * const apy = await sdk.getVaultAPY('GVAULT...', SupportedNetworks.TESTNET);
 * console.log(`Current APY: ${apy.apyPercent}%`);
 * console.log(`Calculated over: ${apy.period}`);
 * console.log(`Last updated: ${apy.lastUpdated}`);
 * ```
 */
export interface VaultApyResponse {
  /** APY as decimal (0.15 = 15%) */
  apy: number;
  /** APY as percentage (15.0 = 15%) */
  apyPercent: number;
  /** Time period over which APY was calculated */
  period: string;
  /** ISO timestamp of last APY calculation */
  lastUpdated: string;
}

/* Vault service method types */
export interface VaultInfoServiceResponse extends VaultInfoResponse {}

export interface VaultBalanceServiceResponse extends VaultBalanceResponse {}

export interface VaultTransactionServiceResponse extends BaseVaultTransactionResponse {}

export interface VaultApyServiceResponse {
  apy: number;
}