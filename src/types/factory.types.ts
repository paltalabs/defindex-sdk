import { VaultRolesConfig } from "./vault.types";

/* Factory endpoint response types */
export interface FactoryAddressResponse {
  address: string;
}
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
  /** Transaction XDR to sign and submit (null for smart wallets) */
  xdr: string | null;
  /**
   * Predicted vault address from simulation.
   * Note: actual address may differ if network state changes between simulation and execution.
   */
  predictedVaultAddress: string;
  /** Warning about address prediction reliability */
  warning?: string;
  /** Raw operation XDR for building custom transactions (useful for smart wallet flows) */
  operationXDR?: string;
  /** Whether the caller is a smart wallet (C-address) */
  isSmartWallet?: boolean;
}
