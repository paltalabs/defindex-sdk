import { AuthManager } from './auth/auth-manager';
import { HttpClient } from './clients/http-client';
import {
  AddLiquidityDto,
  AssetListDetail,
  AssetListMetadata,
  BuildQuoteDto,
  ContractResponse,
  Network,
  Pool,
  PriceData,
  QuoteRequest,
  QuoteResponse,
  RemoveLiquidityDto,
  SendResponse,
  SendXdrDto,
  SoroswapSDKConfig,
  SupportedAssetLists,
  UserPosition
} from './types';

/**
 * Main Soroswap SDK class
 * Provides access to all Soroswap API functionality with automatic authentication
 */
export class SoroswapSDK {
  private authManager: AuthManager;
  private httpClient: HttpClient;
  private defaultNetwork: Network;

  constructor(config: SoroswapSDKConfig) {
    this.defaultNetwork = config.defaultNetwork || 'mainnet';
    
    // Initialize auth manager
    this.authManager = new AuthManager({
      email: config.email,
      password: config.password
    });

    // Initialize HTTP client
    const baseURL = 'https://api.soroswap.finance';
    const timeout = config.timeout || 30000;
    
    this.httpClient = new HttpClient(
      baseURL,
      timeout,
      this.authManager.getTokenProvider()
    );

    // Inject HTTP client into auth manager
    this.authManager.setHttpClient(this.httpClient);
  }
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authManager.isAuthenticated();
  }

  /**
   * Get contract address for a specific network and contract name
   */
  async getContractAddress(
    network: Network,
    contractName: 'factory' | 'router' | 'aggregator'
  ): Promise<ContractResponse> {
    return this.httpClient.get<ContractResponse>(`/api/${network}/${contractName}`);
  }

  // ========================================
  // Quote & Trading Methods
  // ========================================

  /**
   * Get available protocols for trading
   */
  async getProtocols(network?: Network): Promise<string[]> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery('/protocols', params);
    return this.httpClient.get<string[]>(url);
  }

  /**
   * Get quote for a swap
   */
  async quote(quoteRequest: QuoteRequest, network?: Network): Promise<QuoteResponse> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery('/quote', params);
    return this.httpClient.post<QuoteResponse>(url, quoteRequest);
  }

  /**
   * Get quote for a swap
   */
  async build(buildQuoteRequest: BuildQuoteDto, network?: Network): Promise<QuoteResponse> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery('/quote/build', params);
    return this.httpClient.post<QuoteResponse>(url, buildQuoteRequest);
  }

  /**
   * Send signed transaction
   */
  async send(xdr: string, fee: number = 100, network?: Network): Promise<SendResponse> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery('/send', params);
    
    const sendData: SendXdrDto = { xdr, fee };
    return this.httpClient.post<SendResponse>(url, sendData);
  }

  // ========================================
  // Pool Methods
  // ========================================

  /**
   * Get pools for specific protocols
   */
  async getPools(
    network: Network,
    protocols: string[],
    assetList?: SupportedAssetLists[]
  ): Promise<Pool[]> {
    const params: any = {
      network,
      protocol: protocols
    };

    if (assetList) {
      params.assetList = assetList;
    }

    const url = this.httpClient.buildUrlWithQuery('/pools', params);
    return this.httpClient.get<Pool[]>(url);
  }

  /**
   * Get pool for specific token pair
   */
  async getPoolByTokens(
    tokenA: string,
    tokenB: string,
    network: Network,
    protocols: string[]
  ): Promise<Pool[]> {
    const params = {
      network,
      protocol: protocols
    };

    const url = this.httpClient.buildUrlWithQuery(`/pools/${tokenA}/${tokenB}`, params);
    return this.httpClient.get<Pool[]>(url);
  }

  // ========================================
  // Liquidity Methods
  // ========================================

  /**
   * Add liquidity to a pool
   */
  async addLiquidity(
    liquidityData: AddLiquidityDto,
    network?: Network
  ): Promise<{ xdr: string; poolInfo: any }> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery('/liquidity/add', params);
    return this.httpClient.post(url, liquidityData);
  }

  /**
   * Remove liquidity from a pool
   */
  async removeLiquidity(
    liquidityData: RemoveLiquidityDto,
    network?: Network
  ): Promise<{ xdr: string; poolInfo: any }> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery('/liquidity/remove', params);
    return this.httpClient.post(url, liquidityData);
  }

  /**
   * Get user liquidity positions
   */
  async getUserPositions(
    address: string,
    network?: Network
  ): Promise<UserPosition[]> {
    const params = this.httpClient.buildNetworkQuery(network || this.defaultNetwork);
    const url = this.httpClient.buildUrlWithQuery(`/liquidity/positions/${address}`, params);
    return this.httpClient.get<UserPosition[]>(url);
  }

  // ========================================
  // Asset & Price Methods
  // ========================================

  /**
   * Get asset lists metadata or specific asset list
   */
  async getAssetList(name?: SupportedAssetLists): Promise<AssetListMetadata[] | AssetListDetail> {
    const params = name ? { name } : {};
    const url = this.httpClient.buildUrlWithQuery('/asset-list', params);
    
    if (name) {
      return this.httpClient.get<AssetListDetail>(url);
    } else {
      return this.httpClient.get<AssetListMetadata[]>(url);
    }
  }

  /**
   * Get asset prices
   */
  async getPrice(
    assets: string | string[],
    network?: Network,
    referenceCurrency: string = 'USD'
  ): Promise<PriceData[]> {
    const params = {
      network: network || this.defaultNetwork,
      asset: Array.isArray(assets) ? assets : [assets],
      referenceCurrency
    };

    const url = this.httpClient.buildUrlWithQuery('/price', params);
    return this.httpClient.get<PriceData[]>(url);
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Set default network for operations
   */
  setDefaultNetwork(network: Network): void {
    this.defaultNetwork = network;
  }

  /**
   * Get current default network
   */
  getDefaultNetwork(): Network {
    return this.defaultNetwork;
  }
} 