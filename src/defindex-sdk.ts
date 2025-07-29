import { HttpClient } from './clients/http-client';
import {
  CreateDefindexVault,
  CreateDefindexVaultDepositDto,
  CreateVaultDepositResponse,
  CreateVaultResponse,
  DepositToVaultParams,
  FactoryAddressResponse,
  PauseStrategyParams,
  RescueFromVaultParams,
  StellarSendTransactionResponse,
  SupportedNetworks,
  UnpauseStrategyParams,
  VaultApyResponse,
  VaultBalanceResponse,
  VaultInfoResponse,
  VaultRescueResponse,
  VaultStrategyStatusResponse,
  VaultTransactionResponse,
  WithdrawFromVaultParams,
  WithdrawSharesParams,
} from './types';

/**
 * Configuration options for the DeFindex SDK
 */
export interface DefindexSDKConfig {
  /** API key for authentication (alternative to email/password) */
  apiKey?: string;
  /** User email for automatic login (optional) */
  email?: string;
  /** User password for automatic login (optional) */
  password?: string;
  /** Custom API base URL (defaults to 'https://api.defindex.io') */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 30000) */
  timeout?: number;
}

/**
 * DeFindex SDK - TypeScript client for DeFindex API
 * 
 * @example
 * ```typescript
 * // Basic initialization
 * const sdk = new DefindexSDK({
 *   baseUrl: 'https://api.defindex.io'
 * });
 * 
 * // With API key authentication
 * const sdk = new DefindexSDK({
 *   apiKey: 'sk_your_api_key_here',
 *   baseUrl: 'https://api.defindex.io'
 * });
 * 
 * // With automatic login
 * const sdk = new DefindexSDK({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   timeout: 60000
 * });
 * 
 * // Manual login
 * await sdk.login({ email: 'user@example.com', password: 'password123' });
 * ```
 */
export class DefindexSDK {
  private httpClient: HttpClient;
  private config: DefindexSDKConfig;

  /**
   * Create a new DeFindex SDK instance
   * @param config - SDK configuration options
   */
  constructor(config: DefindexSDKConfig) {
    this.config = config;
    this.httpClient = new HttpClient(
      config.baseUrl || 'https://api.defindex.io',
      config.apiKey || '', // API key or empty string
      config.timeout || 30000
    );
  }

  //=======================================================================
  // System Operations
  //=======================================================================

  /**
   * Check API health status
   * @returns Health status information
   * @example
   * ```typescript
   * const health = await sdk.healthCheck();
   * if (health.status.reachable) {
   *   console.log('API is healthy');
   * }
   * ```
   */
  public async healthCheck(): Promise<any> {
    return this.httpClient.get<any>('/health');
  }

  //=======================================================================
  // Factory Operations
  //=======================================================================

  /**
   * Get the factory contract address for a specific network
   * @param network - Stellar network (testnet or mainnet)
   * @returns Factory contract address
   * @example
   * ```typescript
   * const factory = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
   * console.log('Factory address:', factory.address);
   * ```
   */
  public async getFactoryAddress(network: SupportedNetworks): Promise<FactoryAddressResponse> {
    return this.httpClient.get<FactoryAddressResponse>(`/factory/address?network=${network}`);
  }

  /**
   * Create a new vault (requires Vault Manager role)
   * @param vaultConfig - Vault configuration including assets, fees, and roles
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for vault creation
   * @example
   * ```typescript
   * const vaultConfig = {
   *   roles: { "0": "GMANAGER...", "1": "CFEE..." },
   *   vault_fee_bps: 100, // 1%
   *   assets: [{ address: "CASSET...", strategies: [...] }],
   *   name_symbol: { name: "My Vault", symbol: "MVLT" },
   *   upgradable: true,
   *   caller: "GCALLER..."
   * };
   * const response = await sdk.createVault(vaultConfig, SupportedNetworks.TESTNET);
   * ```
   */
  public async createVault(
    vaultConfig: CreateDefindexVault,
    network: SupportedNetworks,
  ): Promise<CreateVaultResponse> {
    return this.httpClient.post<CreateVaultResponse>(
      `/factory/create-vault?network=${network}`,
      vaultConfig,
    );
  }

  /**
   * Create a new vault with initial deposit in a single transaction
   * @param vaultConfig - Vault configuration with initial deposit amounts
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for vault creation and deposit
   * @example
   * ```typescript
   * const vaultConfig = {
   *   // ... vault config
   *   deposit_amounts: [1000000, 2000000] // Initial deposit amounts
   * };
   * const response = await sdk.createVaultWithDeposit(vaultConfig, SupportedNetworks.TESTNET);
   * ```
   */
  public async createVaultWithDeposit(
    vaultConfig: CreateDefindexVaultDepositDto,
    network: SupportedNetworks,
  ): Promise<CreateVaultDepositResponse> {
    return this.httpClient.post<CreateVaultDepositResponse>(
      `/factory/create-vault-deposit?network=${network}`,
      vaultConfig,
    );
  }

  //=======================================================================
  // Vault Operations
  //=======================================================================

  /**
   * Get comprehensive vault information
   * @param vaultAddress - The vault contract address
   * @param network - Stellar network (testnet or mainnet)
   * @returns Vault metadata, assets, strategies, and TVL information
   * @example
   * ```typescript
   * const vaultInfo = await sdk.getVaultInfo(
   *   'GVAULT...',
   *   SupportedNetworks.TESTNET
   * );
   * console.log(`Vault: ${vaultInfo.name} (${vaultInfo.symbol})`);
   * console.log(`Total Assets: ${vaultInfo.totalAssets}`);
   * ```
   */
  public async getVaultInfo(
    vaultAddress: string,
    network: SupportedNetworks,
  ): Promise<VaultInfoResponse> {
    return this.httpClient.get<VaultInfoResponse>(
      `/vault/${vaultAddress}?network=${network}`,
    );
  }

  /**
   * Get user's vault balance and shares
   * @param vaultAddress - The vault contract address
   * @param userAddress - User's wallet address
   * @param network - Stellar network (testnet or mainnet)
   * @returns User's vault shares and underlying asset values
   * @example
   * ```typescript
   * const balance = await sdk.getVaultBalance(
   *   'GVAULT...',
   *   'GUSER...',
   *   SupportedNetworks.TESTNET
   * );
   * console.log(`Shares: ${balance.dfTokens}`);
   * console.log(`Underlying values: ${balance.underlyingBalance}`);
   * ```
   */
  public async getVaultBalance(
    vaultAddress: string,
    userAddress: string,
    network: SupportedNetworks,
  ): Promise<VaultBalanceResponse> {
    return this.httpClient.get<VaultBalanceResponse>(
      `/vault/${vaultAddress}/balance?from=${userAddress}&network=${network}`,
    );
  }

  /**
   * Deposit assets into a vault
   * @param vaultAddress - The vault contract address
   * @param depositData - Deposit parameters including amounts and caller address
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for signing and simulation response
   */
  public async depositToVault(
    vaultAddress: string,
    depositData: DepositToVaultParams,
    network: SupportedNetworks,
  ): Promise<VaultTransactionResponse> {
    return this.httpClient.post<VaultTransactionResponse>(
      `/vault/${vaultAddress}/deposit?network=${network}`,
      depositData,
    );
  }

  /**
   * Withdraw specific asset amounts from vault
   * @param vaultAddress - The vault contract address
   * @param withdrawData - Withdrawal parameters including amounts and caller
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for signing and simulation response
   * @example
   * ```typescript
   * const withdrawData = {
   *   amounts: [500000, 1000000],
   *   caller: 'GUSER...',
   *   slippageBps: 100 // 1% slippage tolerance
   * };
   * const response = await sdk.withdrawFromVault('GVAULT...', withdrawData, SupportedNetworks.TESTNET);
   * ```
   */
  public async withdrawFromVault(
    vaultAddress: string,
    withdrawData: WithdrawFromVaultParams,
    network: SupportedNetworks,
  ): Promise<VaultTransactionResponse> {
    return this.httpClient.post<VaultTransactionResponse>(
      `/vault/${vaultAddress}/withdraw?network=${network}`,
      withdrawData,
    );
  }

  /**
   * Withdraw vault shares for underlying assets
   * @param vaultAddress - The vault contract address
   * @param shareData - Share withdrawal parameters including share amount and caller
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for signing and simulation response
   */
  public async withdrawShares(
    vaultAddress: string,
    shareData: WithdrawSharesParams,
    network: SupportedNetworks,
  ): Promise<VaultTransactionResponse> {
    return this.httpClient.post<VaultTransactionResponse>(
      `/vault/${vaultAddress}/withdraw-shares?network=${network}`,
      shareData,
    );
  }

  /**
   * Get vault's Annual Percentage Yield (APY)
   * @param vaultAddress - The vault contract address
   * @param network - Stellar network (testnet or mainnet)
   * @returns APY information including percentage and calculation period
   * @example
   * ```typescript
   * const apy = await sdk.getVaultAPY('GVAULT...', SupportedNetworks.TESTNET);
   * console.log(`APY: ${apy.apyPercent}% (calculated over ${apy.period})`);
   * ```
   */
  public async getVaultAPY(
    vaultAddress: string,
    network: SupportedNetworks,
  ): Promise<VaultApyResponse> {
    return this.httpClient.get<VaultApyResponse>(
      `/vault/${vaultAddress}/apy?network=${network}`,
    );
  }

  //=======================================================================
  // Vault Management Operations
  //=======================================================================

  /**
   * Emergency rescue assets from strategy (Emergency Manager role required)
   * @param vaultAddress - The vault contract address
   * @param rescueData - Rescue parameters including strategy address and caller
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for Emergency Manager signing and rescued assets info
   * @example
   * ```typescript
   * const rescueData = {
   *   strategy_address: 'GSTRATEGY...',
   *   caller: 'GEMERGENCY_MANAGER...'
   * };
   * const response = await sdk.emergencyRescue('GVAULT...', rescueData, SupportedNetworks.TESTNET);
   * ```
   */
  public async emergencyRescue(
    vaultAddress: string,
    rescueData: RescueFromVaultParams,
    network: SupportedNetworks,
  ): Promise<VaultRescueResponse> {
    return this.httpClient.post<VaultRescueResponse>(
      `/vault/${vaultAddress}/rescue?network=${network}`,
      rescueData,
    );
  }

  /**
   * Pause a specific strategy (Strategy Manager role required)
   * @param vaultAddress - The vault contract address
   * @param strategyData - Strategy pause parameters
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for Strategy Manager signing
   * @example
   * ```typescript
   * const strategyData = {
   *   strategy_address: 'GSTRATEGY...',
   *   caller: 'GSTRATEGY_MANAGER...'
   * };
   * const response = await sdk.pauseStrategy('GVAULT...', strategyData, SupportedNetworks.TESTNET);
   * ```
   */
  public async pauseStrategy(
    vaultAddress: string,
    strategyData: PauseStrategyParams,
    network: SupportedNetworks,
  ): Promise<VaultStrategyStatusResponse> {
    return this.httpClient.post<VaultStrategyStatusResponse>(
      `/vault/${vaultAddress}/pause-strategy?network=${network}`,
      strategyData,
    );
  }

  /**
   * Unpause a specific strategy (Strategy Manager role required)
   * @param vaultAddress - The vault contract address
   * @param strategyData - Strategy unpause parameters
   * @param network - Stellar network (testnet or mainnet)
   * @returns Transaction XDR for Strategy Manager signing
   * @example
   * ```typescript
   * const strategyData = {
   *   strategy_address: 'GSTRATEGY...',
   *   caller: 'GSTRATEGY_MANAGER...'
   * };
   * const response = await sdk.unpauseStrategy('GVAULT...', strategyData, SupportedNetworks.TESTNET);
   * ```
   */
  public async unpauseStrategy(
    vaultAddress: string,
    strategyData: UnpauseStrategyParams,
    network: SupportedNetworks,
  ): Promise<VaultStrategyStatusResponse> {
    return this.httpClient.post<VaultStrategyStatusResponse>(
      `/vault/${vaultAddress}/unpause-strategy?network=${network}`,
      strategyData,
    );
  }

  //=======================================================================
  // Transaction Operations
  //=======================================================================

  /**
   * Submit a signed transaction to the Stellar blockchain
   * @param xdr - Base64 encoded signed transaction XDR
   * @param network - Stellar network (testnet or mainnet)
   * @param launchtube - Whether to use LaunchTube service (defaults to false)
   * @returns Transaction response with hash and status
   */
  public async sendTransaction(
    xdr: string,
    network: SupportedNetworks,
    launchtube?: boolean,
  ): Promise<StellarSendTransactionResponse> {
    const payload = { xdr, launchtube: launchtube ?? false };
    return this.httpClient.post<StellarSendTransactionResponse>(
      `/send?network=${network}`,
      payload,
    );
  }
}
