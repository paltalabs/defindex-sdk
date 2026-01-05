import { CreateDefindexVault } from "./vault.types";

/* Factory endpoint response types - Flat interfaces for better DX */

/**
 * Response containing factory contract address
 */
export interface FactoryAddressResponse {
  address: string;
}

/**
 * Response from creating a vault
 */
export interface CreateVaultResponse {
  /** Transaction XDR to sign */
  xdr: string | null;
  /** Simulation result */
  simulation_result: string;
  /** Error message if operation failed */
  error?: string;
  /** Vault creation parameters used */
  call_params: CreateDefindexVault;
}

/**
 * Response from creating a vault with initial deposit
 */
export interface CreateVaultDepositResponse {
  /** Transaction XDR to sign */
  xdr: string | null;
  /** Simulation result */
  simulation_result: string;
  /** Error message if operation failed */
  error?: string;
  /** Vault creation parameters used */
  call_params: CreateDefindexVault;
}

/**
 * Parameters for creating a vault with initial deposit
 */
export interface CreateVaultDepositParams {
  /** Role assignments (index 0: manager, 1: fee_receiver, etc.) */
  roles: Record<number, string>;
  /** Vault fee in basis points (100 = 1%) */
  vault_fee_bps: number;
  /** Asset configurations with their strategies */
  assets: import("./vault.types").AssetStrategySet[];
  /** Optional Soroswap router address for swaps */
  soroswap_router?: string;
  /** Vault name and symbol configuration */
  name_symbol: Record<string, string>;
  /** Whether vault is upgradable */
  upgradable: boolean;
  /** Caller address creating the vault */
  caller: string;
  /** Optional initial amounts (for vault creation without deposit) */
  amounts?: number[];
  /** Initial deposit amounts (one per asset, in stroops) */
  deposit_amounts: number[];
}

/* Deprecated type aliases for backwards compatibility */

/** @deprecated Use CreateVaultDepositParams instead */
export type CreateDefindexVaultDepositDto = CreateVaultDepositParams;

/* Auto-invest types */

/**
 * Strategy allocation for auto-invest operations
 */
export interface StrategyAllocation {
  /** Strategy contract address */
  address: string;
  /** Strategy name */
  name: string;
  /** Amount to invest in this strategy (in stroops) */
  amount: number;
}

/**
 * Asset configuration with strategies for auto-invest
 */
export interface AssetAllocation {
  /** Asset contract address */
  address: string;
  /** Asset symbol */
  symbol: string;
  /** Total amount to deposit for this asset (in stroops) */
  amount: number;
  /** Strategies for this asset with allocation amounts */
  strategies: StrategyAllocation[];
}

/**
 * Vault roles configuration for auto-invest
 */
export interface VaultRolesConfig {
  /** Emergency manager address */
  emergencyManager: string;
  /** Rebalance manager address */
  rebalanceManager: string;
  /** Fee receiver address */
  feeReceiver: string;
  /** Final vault manager address (will be set after auto-invest) */
  manager: string;
}

/**
 * Parameters for creating a vault with auto-invest
 * Creates vault, deposits funds, and invests in strategies atomically
 */
export interface CreateVaultAutoInvestParams {
  /** Caller address who will deposit and initially manage */
  caller: string;
  /** Vault roles configuration */
  roles: VaultRolesConfig;
  /** Vault name (1-32 characters) */
  name: string;
  /** Vault symbol (1-10 characters) */
  symbol: string;
  /** Vault fee in basis points (0-10000, where 10000 = 100%) */
  vaultFee: number;
  /** Whether vault is upgradable */
  upgradable: boolean;
  /** Asset allocations with strategies (1-10 assets) */
  assets: AssetAllocation[];
}

/**
 * Response from creating a vault with auto-invest
 */
export interface CreateVaultAutoInvestResponse {
  /** Transaction XDR to sign and submit */
  xdr: string;
  /**
   * Predicted vault address from simulation.
   * Note: actual address may differ if network state changes between simulation and execution.
   */
  predictedVaultAddress: string;
  /** Warning about address prediction reliability */
  warning?: string;
}