import { DefindexSDK } from '../src';
import {
  CreateDefindexVault,
  CreateDefindexVaultDepositDto,
  DepositToVaultParams,
  PauseStrategyParams,
  RescueFromVaultParams,
  SupportedNetworks,
  UnpauseStrategyParams,
  WithdrawParams,
  WithdrawSharesParams,
} from '../src/types';

// Mock axios to avoid actual HTTP calls
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Mock HttpClient
jest.mock('../src/clients/http-client', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
    setAuthorizationHeader: jest.fn(),
    setApiKey: jest.fn(),
  })),
}));

describe('DefindexSDK - Unit Tests', () => {
  let sdk: DefindexSDK;
  let mockHttpClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new DefindexSDK({
      baseUrl: 'https://api.defindex.io',
    });
    // Access the mocked HTTP client attached to the SDK instance
    mockHttpClient = (sdk as any).httpClient;
  });


  describe('System', () => {
    it('should perform a health check', async () => {
      const mockResponse = { status: 'ok' };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await sdk.healthCheck();

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/health');
    });
  });

  describe('Factory Operations', () => {
    it('should get factory address', async () => {
      const mockResponse = { address: 'FACTORY_ADDRESS' };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/factory/address?network=testnet');
    });

    it('should create a vault', async () => {
      const vaultConfig: CreateDefindexVault = { roles: { 0: 'manager_addr', 1: 'fee_addr' }, vault_fee_bps: 100, assets: [], name_symbol: { name: 'Test Vault', symbol: 'TVT' }, upgradable: true, caller: 'caller_addr' };
      const mockResponse = { xdr: 'create_vault_xdr' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.createVault(vaultConfig, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/factory/create-vault?network=testnet', vaultConfig);
    });

    it('should create a vault with initial deposit', async () => {
      const vaultConfig: CreateDefindexVaultDepositDto = { 
        roles: { 0: 'manager_addr', 1: 'fee_addr' }, 
        vault_fee_bps: 100, 
        assets: [], 
        name_symbol: { name: 'Test Vault', symbol: 'TVT' }, 
        upgradable: true, 
        caller: 'caller_addr',
        deposit_amounts: [1000, 2000]
      };
      const mockResponse = { xdr: 'create_vault_with_deposit_xdr' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.createVaultWithDeposit(vaultConfig, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/factory/create-vault-deposit?network=testnet', vaultConfig);
    });
  });

  describe('Vault Operations', () => {
    const vaultAddress = 'VAULT_ADDRESS';

    it('should get vault info', async () => {
      const mockResponse = { name: 'Test Vault', symbol: 'TVT' };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/vault/${vaultAddress}?network=testnet`);
    });

    it('should get vault balance for a user', async () => {
        const userAddress = 'USER_ADDRESS';
        const mockResponse = { shares: '1000', underlying_values: ['500', '500'] };
        mockHttpClient.get.mockResolvedValue(mockResponse);
  
        const result = await sdk.getVaultBalance(vaultAddress, userAddress, SupportedNetworks.TESTNET);
  
        expect(result).toEqual(mockResponse);
        expect(mockHttpClient.get).toHaveBeenCalledWith(`/vault/${vaultAddress}/balance?from=${userAddress}&network=testnet`);
      });

    it('should deposit to vault', async () => {
      const depositData: DepositToVaultParams = { amounts: [100], caller: 'user_addr', invest: true };
      const mockResponse = { xdr: 'deposit_xdr' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.depositToVault(vaultAddress, depositData, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(`/vault/${vaultAddress}/deposit?network=testnet`, depositData);
    });

    it('should withdraw from vault', async () => {
      const withdrawData: WithdrawParams = { amounts: [50], caller: 'user_addr' };
      const mockResponse = { xdr: 'withdraw_xdr' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.withdrawFromVault(vaultAddress, withdrawData, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(`/vault/${vaultAddress}/withdraw?network=testnet`, withdrawData);
    });

    it('should withdraw shares from vault', async () => {
      const shareData: WithdrawSharesParams = { shares: 100, caller: 'user_addr' };
      const mockResponse = { xdr: 'withdraw_shares_xdr' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.withdrawShares(vaultAddress, shareData, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(`/vault/${vaultAddress}/withdraw-shares?network=testnet`, shareData);
    });

    it('should get vault APY', async () => {
      const mockResponse = { apy: 12.5 };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await sdk.getVaultAPY(vaultAddress, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/vault/${vaultAddress}/apy?network=testnet`);
    });

  });

  describe('Vault Management', () => {
    const vaultAddress = 'VAULT_ADDRESS';

    it('should perform an emergency rescue', async () => {
      const rescueData: RescueFromVaultParams = { strategy_address: 'strategy_addr', caller: 'manager_addr' };
      const mockResponse = { xdr: 'rescue_xdr' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.emergencyRescue(vaultAddress, rescueData, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(`/vault/${vaultAddress}/rescue?network=testnet`, rescueData);
    });

    it('should pause a strategy', async () => {
      const pauseData: PauseStrategyParams = { strategy_address: 'strategy_addr', caller: 'manager_addr' };
      const mockResponse = { status: 'paused' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.pauseStrategy(vaultAddress, pauseData, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(`/vault/${vaultAddress}/pause-strategy?network=testnet`, pauseData);
    });

    it('should unpause a strategy', async () => {
      const unpauseData: UnpauseStrategyParams = { strategy_address: 'strategy_addr', caller: 'manager_addr' };
      const mockResponse = { status: 'active' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.unpauseStrategy(vaultAddress, unpauseData, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith(`/vault/${vaultAddress}/unpause-strategy?network=testnet`, unpauseData);
    });
  });

  describe('Transaction Operations', () => {
    it('should send a transaction', async () => {
      const xdr = 'signed_xdr_string';
      const mockResponse = { hash: 'tx_hash', status: 'SUCCESS' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.sendTransaction(xdr, SupportedNetworks.TESTNET);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/send?network=testnet', { xdr, launchtube: false });
    });

    it('should send a transaction with launchtube enabled', async () => {
      const xdr = 'signed_xdr_string';
      const mockResponse = { hash: 'tx_hash', status: 'SUCCESS' };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await sdk.sendTransaction(xdr, SupportedNetworks.TESTNET, true);

      expect(result).toEqual(mockResponse);
      expect(mockHttpClient.post).toHaveBeenCalledWith('/send?network=testnet', { xdr, launchtube: true });
    });
  });
});
