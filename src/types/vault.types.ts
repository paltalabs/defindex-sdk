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
  operationXDR?: string;
  isSmartWallet?: boolean;
}

/* Base parameter interfaces */
interface BaseCallerParams {
  caller: string;
}

interface BaseStrategyParams extends BaseCallerParams {
  strategy_address: string;
}

interface BaseAmountParams extends BaseCallerParams {
  amounts: number[];
  slippageBps?: number;
}

/* Vault operation parameters */
export interface DepositToVaultParams extends BaseAmountParams {
  invest: boolean;
}

export interface WithdrawParams extends BaseAmountParams {}

export interface WithdrawSharesParams extends BaseCallerParams {
  shares: number;
  slippageBps?: number;
}

export interface RescueFromVaultParams extends BaseStrategyParams {}

export interface PauseStrategyParams extends BaseStrategyParams {}

export interface UnpauseStrategyParams extends BaseStrategyParams {}

/* Fee management interfaces */
export interface LockFeesParams extends BaseCallerParams {
  new_fee_bps?: number;
}

export interface ReleaseFeesParams extends BaseStrategyParams {
  amount: number;
  strategy_address: string;
}

export interface DistributeFeesParams extends BaseCallerParams {}

/* Contract management interfaces */
export interface SetVaultRoleParams extends BaseCallerParams {
  new_address: string;
}
export interface UpgradeWasmParams extends BaseCallerParams {
  new_wasm_hash: string;
}

export interface RebalanceParams extends BaseCallerParams {
  instructions: InstructionParam[];
}

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

export interface VaultTransactionResponse extends BaseVaultTransactionResponse {}

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
