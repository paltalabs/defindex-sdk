/* Vault types - Using flat interfaces for better developer experience */

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

export interface CreateDefindexVault {
  roles: Record<number, string>;
  vault_fee_bps: number;
  assets: AssetStrategySet[];
  soroswap_router?: string;
  name_symbol: Record<string, string>;
  upgradable: boolean;
  caller: string;
  amounts?: number[];
}

export interface CreateDefindexVaultResponse {
  call_params: CreateDefindexVault;
  xdr: string | null;
  simulation_result: string;
  error?: string;
}

/* Vault operation parameters - Flat interfaces for better DX */

/**
 * Parameters for depositing assets into a vault
 */
export interface DepositParams {
  /** Caller address initiating the deposit */
  caller: string;
  /** Array of amounts to deposit (one per vault asset, in stroops) */
  amounts: number[];
  /** Whether to immediately invest deposited funds into strategies */
  invest: boolean;
  /** Optional slippage tolerance in basis points (100 = 1%) */
  slippageBps?: number;
}

/**
 * Parameters for withdrawing specific asset amounts from a vault
 */
export interface WithdrawParams {
  /** Caller address initiating the withdrawal */
  caller: string;
  /** Array of amounts to withdraw (one per vault asset, in stroops) */
  amounts: number[];
  /** Optional slippage tolerance in basis points (100 = 1%) */
  slippageBps?: number;
}

/**
 * Parameters for withdrawing vault shares
 */
export interface WithdrawSharesParams {
  /** Caller address initiating the withdrawal */
  caller: string;
  /** Number of vault shares to withdraw */
  shares: number;
  /** Optional slippage tolerance in basis points (100 = 1%) */
  slippageBps?: number;
}

/**
 * Parameters for emergency rescue operation
 */
export interface RescueParams {
  /** Caller address (must be Emergency Manager) */
  caller: string;
  /** Strategy address to rescue funds from */
  strategy_address: string;
}

/**
 * Parameters for pausing a strategy
 */
export interface PauseStrategyParams {
  /** Caller address (must be Manager) */
  caller: string;
  /** Strategy address to pause */
  strategy_address: string;
}

/**
 * Parameters for unpausing a strategy
 */
export interface UnpauseStrategyParams {
  /** Caller address (must be Manager) */
  caller: string;
  /** Strategy address to unpause */
  strategy_address: string;
}

/* Fee management interfaces */

/**
 * Parameters for locking vault fees
 */
export interface LockFeesParams {
  /** Caller address (must be Manager) */
  caller: string;
  /** Optional new fee rate in basis points (100 = 1%) */
  new_fee_bps?: number;
}

/**
 * Parameters for releasing fees from a strategy
 */
export interface ReleaseFeesParams {
  /** Caller address (must be Manager) */
  caller: string;
  /** Strategy address to release fees from */
  strategy_address: string;
  /** Amount of fees to release (in stroops) */
  amount: number;
}

/**
 * Parameters for distributing accumulated fees
 */
export interface DistributeFeesParams {
  /** Caller address (must be Manager) */
  caller: string;
}

/* Contract management interfaces */

/**
 * Parameters for setting a vault role
 */
export interface SetVaultRoleParams {
  /** Caller address (must be Manager) */
  caller: string;
  /** New address to assign to the role */
  new_address: string;
}

/**
 * Parameters for upgrading vault WASM contract
 */
export interface UpgradeWasmParams {
  /** Caller address (must be Manager) */
  caller: string;
  /** New WASM hash to upgrade to */
  new_wasm_hash: string;
}

/**
 * Parameters for rebalancing vault strategies
 */
export interface RebalanceParams {
  /** Caller address (must be Rebalance Manager) */
  caller: string;
  /** Array of rebalance instructions to execute */
  instructions: InstructionParam[];
}

/* Deprecated type aliases for backwards compatibility */

/** @deprecated Use DepositParams instead */
export type DepositToVaultParams = DepositParams;

/** @deprecated Use RescueParams instead */
export type RescueFromVaultParams = RescueParams;

export type Instruction =
  | { type: "Unwind"; strategy_address: string; amount: number }
  | { type: "Invest"; strategy_address: string; amount: number }
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

export type InstructionParam =
  | { type: "Unwind"; strategy_address: string; amount: number }
  | { type: "Invest"; strategy_address: string; amount: number }
  | {
      type: "SwapExactIn" | "SwapExactOut";
      token_in: string;
      token_out: string;
      amount: number;
      slippageToleranceBps?: number;
      deadline?: number;
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
export interface VaultInfoResponse {
  name: string;
  symbol: string;
  roles: VaultRole;
  assets: VaultAsset[];
  totalManagedFunds: any[];
  feesBps: VaultFees;
  apy: number;
}

export interface VaultBalanceResponse {
  dfTokens: number;
  underlyingBalance: number[];
}

/**
 * Response from vault transaction operations
 */
export interface VaultTransactionResponse {
  /** Transaction XDR to sign */
  xdr: string;
  /** Simulation response from Stellar */
  simulationResponse: unknown;
  /** Name of the contract function called */
  functionName: string;
  /** Parameters passed to the function */
  params: unknown[];
}

export interface VaultApyResponse {
  apy: number;
}

/* Comprehensive Vault Methods Enum - Based on Contract Analysis */
export enum VaultMethods {
  // Core Vault Operations (VaultTrait)
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  RESCUE = "rescue",
  PAUSE_STRATEGY = "pause_strategy",
  UNPAUSE_STRATEGY = "unpause_strategy",
  GET_ASSETS = "get_assets",
  FETCH_TOTAL_MANAGED_FUNDS = "fetch_total_managed_funds",
  GET_ASSET_AMOUNTS_PER_SHARES = "get_asset_amounts_per_shares",
  GET_FEES = "get_fees",
  REPORT = "report",

  // Admin Interface Methods (AdminInterfaceTrait)
  SET_FEE_RECEIVER = "set_fee_receiver",
  GET_FEE_RECEIVER = "get_fee_receiver",
  SET_MANAGER = "set_manager",
  GET_MANAGER = "get_manager",
  SET_EMERGENCY_MANAGER = "set_emergency_manager",
  GET_EMERGENCY_MANAGER = "get_emergency_manager",
  SET_REBALANCE_MANAGER = "set_rebalance_manager",
  GET_REBALANCE_MANAGER = "get_rebalance_manager",
  UPGRADE = "upgrade",

  // Vault Management Methods (VaultManagementTrait)
  REBALANCE = "rebalance",
  LOCK_FEES = "lock_fees",
  RELEASE_FEES = "release_fees",
  DISTRIBUTE_FEES = "distribute_fees",

  TOTAL_SUPPLY = "total_supply",
  BALANCE = "balance",
  NAME = "name",
  SYMBOL = "symbol",
}

export enum VaultInfoInvocationMethods {
  GET_ASSETS = VaultMethods.GET_ASSETS,
  FETCH_TOTAL_MANAGED_FUNDS = VaultMethods.FETCH_TOTAL_MANAGED_FUNDS,
  GET_FEES = VaultMethods.GET_FEES,
  GET_MANAGER = VaultMethods.GET_MANAGER,
  GET_EMERGENCY_MANAGER = VaultMethods.GET_EMERGENCY_MANAGER,
  GET_REBALANCE_MANAGER = VaultMethods.GET_REBALANCE_MANAGER,
  GET_FEE_RECEIVER = VaultMethods.GET_FEE_RECEIVER,
  NAME = VaultMethods.NAME,
  SYMBOL = VaultMethods.SYMBOL,
}

export enum VaultGetRoleMethods {
  GET_EMERGENCY_MANAGER = VaultMethods.GET_EMERGENCY_MANAGER,
  GET_REBALANCE_MANAGER = VaultMethods.GET_REBALANCE_MANAGER,
  GET_MANAGER = VaultMethods.GET_MANAGER,
  GET_FEE_RECEIVER = VaultMethods.GET_FEE_RECEIVER,
}

export enum VaultSetRoleMethods {
  SET_MANAGER = VaultMethods.SET_MANAGER,
  SET_EMERGENCY_MANAGER = VaultMethods.SET_EMERGENCY_MANAGER,
  SET_REBALANCE_MANAGER = VaultMethods.SET_REBALANCE_MANAGER,
  SET_FEE_RECEIVER = VaultMethods.SET_FEE_RECEIVER,
}

export interface VaultRoleResponse {
  function_called: VaultGetRoleMethods;
  address: string;
}

export enum VaultRoles {
  MANAGER = 'manager',
  EMERGENCY_MANAGER = 'emergency-manager',
  REBALANCE_MANAGER = 'rebalance-manager',
  FEE_RECEIVER = 'fee-receiver',
}
