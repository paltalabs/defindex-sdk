/**
 * DeFindex SDK - Complete Functional Example
 * 
 * This file demonstrates the use of the DeFindex SDK with typical operations
 * including authentication, vault creation, deposits, withdrawals, and management.
 * 
 * To run this example:
 * 1. Install dependencies: pnpm install
 * 2. Build the project: pnpm run build
 * 3. Configure environment variables (see .env.example)
 * 4. Execute: pnpm run example
 */

import { DefindexSDK, SupportedNetworks } from '../src';
import type {
  CreateDefindexVault,
  DepositToVaultParams,
  WithdrawFromVaultParams,
  WithdrawSharesParams,
  VaultInfoResponse
} from '../src/types';

// Example configuration
const NETWORK = SupportedNetworks.TESTNET;
const API_BASE_URL = process.env.DEFINDEX_API_URL || 'https://api.defindex.io';

// Example addresses for Testnet (replace with real addresses)
const EXAMPLE_ADDRESSES = {
  MANAGER: 'GCURWTJWQJ7CCWIBSMEJKVMJJKDK6QAARAD3JQ6GLTON7MQYBSFFQZWI',
  FEE_RECEIVER: 'GCURWTJWQJ7CCWIBSMEJKVMJJKDK6QAARAD3JQ6GLTON7MQYBSFFQZWI',
  EMERGENCY_MANAGER: 'GCURWTJWQJ7CCWIBSMEJKVMJJKDK6QAARAD3JQ6GLTON7MQYBSFFQZWI',
  REBALANCE_MANAGER: 'GCURWTJWQJ7CCWIBSMEJKVMJJKDK6QAARAD3JQ6GLTON7MQYBSFFQZWI',
  USER: 'GCURWTJWQJ7CCWIBSMEJKVMJJKDK6QAARAD3JQ6GLTON7MQYBSFFQZWI',
  XLM_ASSET: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  STRATEGY: 'CBO77JLVAT54YBRHBY4PSITLILWAAXX5JHPXGBFRW2XUFQKXZ3ZLJ7MJ'
};

/**
 * Main function that executes the complete example
 */
async function runExample(): Promise<void> {
  console.log('🚀 Starting DeFindex SDK example...\n');

  // Step 1: Initialize SDK
  const sdk = await initializeSDK();
  
  // Step 2: Check API health
  await checkAPIHealth(sdk);
  
  // Step 3: Get factory address
  await getFactoryAddress(sdk);
  
  // Step 4: Create a vault (simulated)
  const vaultAddress = await createVaultExample(sdk);
  
  // Step 5: Vault operations
  if (vaultAddress) {
    await vaultOperationsExample(sdk, vaultAddress);
  }
  
  // Step 6: Administrative management (simulated)
  await vaultManagementExample(sdk, vaultAddress || 'EXAMPLE_VAULT_ADDRESS');
  
  console.log('\n✅ Example completed successfully!');
}

/**
 * Initializes the SDK with different authentication methods
 */
async function initializeSDK(): Promise<DefindexSDK> {
  console.log('📋 Initializing SDK...');
  
  const apiKey = process.env.DEFINDEX_API_KEY;
  const email = process.env.DEFINDEX_API_EMAIL;
  const password = process.env.DEFINDEX_API_PASSWORD;
  
  let sdk: DefindexSDK;
  
  if (apiKey) {
    console.log('🔑 Using API Key authentication (recommended)');
    sdk = new DefindexSDK({
      apiKey,
      baseUrl: API_BASE_URL,
      timeout: 30000
    });
  } else if (email && password) {
    console.log('📧 Using email/password authentication (legacy)');
    sdk = new DefindexSDK({
      email,
      password,
      baseUrl: API_BASE_URL,
      timeout: 30000
    });
  } else {
    console.log('⚠️  No credentials, using basic SDK (limited functionality)');
    sdk = new DefindexSDK({
      baseUrl: API_BASE_URL,
      timeout: 30000
    });
  }
  
  console.log('✅ SDK initialized successfully\n');
  return sdk;
}

/**
 * Checks API health
 */
async function checkAPIHealth(sdk: DefindexSDK): Promise<void> {
  console.log('🔍 Checking API health...');
  
  try {
    const health = await sdk.healthCheck();
    console.log('📊 API status:', health);
    console.log('✅ API working correctly\n');
  } catch (error) {
    console.error('❌ Error checking API health:', error);
    throw error;
  }
}

/**
 * Gets the factory address for the specified network
 */
async function getFactoryAddress(sdk: DefindexSDK): Promise<string> {
  console.log(`🏭 Getting factory address for ${NETWORK}...`);
  
  try {
    const factory = await sdk.getFactoryAddress(NETWORK);
    console.log('🎯 Factory address:', factory.address);
    console.log('✅ Factory found\n');
    return factory.address;
  } catch (error) {
    console.error('❌ Error getting factory:', error);
    throw error;
  }
}

/**
 * Vault creation example
 */
async function createVaultExample(sdk: DefindexSDK): Promise<string | null> {
  console.log('🏦 Creating vault example...');
  
  const vaultConfig: CreateDefindexVault = {
    roles: {
      0: EXAMPLE_ADDRESSES.EMERGENCY_MANAGER,
      1: EXAMPLE_ADDRESSES.FEE_RECEIVER,
      2: EXAMPLE_ADDRESSES.MANAGER,
      3: EXAMPLE_ADDRESSES.REBALANCE_MANAGER
    },
    vault_fee_bps: 100, // 1% fee
    assets: [{
      address: EXAMPLE_ADDRESSES.XLM_ASSET,
      strategies: [{
        address: EXAMPLE_ADDRESSES.STRATEGY,
        name: 'XLM Strategy',
        paused: false
      }]
    }],
    name_symbol: {
      name: 'My DeFi Vault',
      symbol: 'MDV'
    },
    upgradable: true,
    caller: EXAMPLE_ADDRESSES.MANAGER
  };
  
  try {
    console.log('📝 Vault configuration:', JSON.stringify(vaultConfig, null, 2));
    
    const response = await sdk.createVault(vaultConfig, NETWORK);
    
    if (response.xdr) {
      console.log('🎉 Vault created successfully!');
      console.log('🔗 XDR to sign:', response.xdr.substring(0, 50) + '...');
      console.log('📊 Simulation result:', response.simulation_result);
      
      // In a real case, you would sign the XDR and send it here
      console.log('📝 Note: In production, sign this XDR with your wallet and send it using sendTransaction()');
      
      // Simulate vault address created
      const simulatedVaultAddress = 'GVAULT123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABC';
      console.log('🏦 Simulated vault address:', simulatedVaultAddress);
      console.log('✅ Vault created\n');
      
      return simulatedVaultAddress;
    } else {
      console.log('⚠️  Could not create vault:', response.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating vault:', error);
    return null;
  }
}

/**
 * Vault operations examples
 */
async function vaultOperationsExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('💼 Running vault operations...');
  
  try {
    // Get vault information
    console.log('📊 Getting vault information...');
    const vaultInfo = await sdk.getVaultInfo(vaultAddress, NETWORK);
    displayVaultInfo(vaultInfo);
    
    // Get user balance
    console.log('💰 Getting user balance...');
    try {
      const balance = await sdk.getVaultBalance(vaultAddress, EXAMPLE_ADDRESSES.USER, NETWORK);
      console.log('🏦 Vault shares:', balance.dfTokens);
      console.log('💵 Underlying balance:', balance.underlyingBalance);
    } catch (error) {
      console.log('ℹ️  User has no balance in this vault (normal for example)');
    }
    
    // Deposit example
    await depositExample(sdk, vaultAddress);
    
    // Withdraw by amount example
    await withdrawExample(sdk, vaultAddress);
    
    // Withdraw by shares example
    await withdrawSharesExample(sdk, vaultAddress);
    
    // Get vault APY
    await getVaultAPYExample(sdk, vaultAddress);
    
  } catch (error) {
    console.error('❌ Error in vault operations:', error);
  }
}

/**
 * Displays detailed vault information
 */
function displayVaultInfo(vaultInfo: VaultInfoResponse): void {
  console.log('📋 Vault Information:');
  console.log(`   📛 Name: ${vaultInfo.name} (${vaultInfo.symbol})`);
  console.log(`   🏦 Address: ${vaultInfo.address}`);
  console.log(`   💹 Total Supply: ${vaultInfo.totalSupply}`);
  console.log(`   💰 Total Assets: ${vaultInfo.totalAssets}`);
  console.log(`   💸 Vault Fee: ${vaultInfo.feesBps.vaultFee / 100}%`);
  console.log(`   🏢 DeFindex Fee: ${vaultInfo.feesBps.defindexFee / 100}%`);
  
  console.log('   🔧 Assets and Strategies:');
  vaultInfo.assets.forEach((asset, index) => {
    console.log(`     ${index + 1}. ${asset.name} (${asset.symbol})`);
    console.log(`        📍 Address: ${asset.address}`);
    asset.strategies.forEach((strategy, stratIndex) => {
      const status = strategy.paused ? '⏸️  PAUSED' : '▶️  ACTIVE';
      console.log(`        📈 Strategy ${stratIndex + 1}: ${strategy.name} - ${status}`);
      console.log(`           📍 Address: ${strategy.address}`);
    });
  });
  
  console.log('✅ Vault information obtained\n');
}

/**
 * Vault deposit example
 */
async function depositExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('💳 Simulating vault deposit...');
  
  const depositData: DepositToVaultParams = {
    amounts: [1000000], // 1 USDC (assuming 6 decimals)
    caller: EXAMPLE_ADDRESSES.USER,
    invest: true, // Auto-invest after deposit
    slippageBps: 100 // 1% slippage tolerance
  };
  
  try {
    console.log('📝 Deposit parameters:', depositData);
    
    const response = await sdk.depositToVault(vaultAddress, depositData, NETWORK);
    
    console.log('🎉 Deposit prepared successfully!');
    console.log('🔗 XDR to sign:', response.xdr.substring(0, 50) + '...');
    console.log('📊 Simulation response:', response.simulationResponse);
    console.log('📝 Note: Sign this XDR and send it to complete the deposit');
    console.log('✅ Deposit simulated\n');
  } catch (error) {
    console.error('❌ Error in deposit:', error);
  }
}

/**
 * Withdrawal by specific amount example
 */
async function withdrawExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('💸 Simulating withdrawal by amount...');
  
  const withdrawData: WithdrawFromVaultParams = {
    amounts: [500000], // 0.5 USDC
    caller: EXAMPLE_ADDRESSES.USER,
    slippageBps: 100 // 1% slippage tolerance
  };
  
  try {
    console.log('📝 Withdrawal parameters:', withdrawData);
    
    const response = await sdk.withdrawFromVault(vaultAddress, withdrawData, NETWORK);
    
    console.log('🎉 Withdrawal prepared successfully!');
    console.log('🔗 XDR to sign:', response.xdr.substring(0, 50) + '...');
    console.log('📊 Simulation response:', response.simulationResponse);
    console.log('✅ Withdrawal by amount simulated\n');
  } catch (error) {
    console.error('❌ Error in withdrawal:', error);
  }
}

/**
 * Vault shares withdrawal example
 */
async function withdrawSharesExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('🎫 Simulating shares withdrawal...');
  
  const shareData: WithdrawSharesParams = {
    shares: 1000000, // 1 vault share
    caller: EXAMPLE_ADDRESSES.USER,
    slippageBps: 100 // 1% slippage tolerance
  };
  
  try {
    console.log('📝 Share withdrawal parameters:', shareData);
    
    const response = await sdk.withdrawShares(vaultAddress, shareData, NETWORK);
    
    console.log('🎉 Share withdrawal prepared successfully!');
    console.log('🔗 XDR to sign:', response.xdr.substring(0, 50) + '...');
    console.log('📊 Simulation response:', response.simulationResponse);
    console.log('✅ Share withdrawal simulated\n');
  } catch (error) {
    console.error('❌ Error in share withdrawal:', error);
  }
}

/**
 * Gets vault APY
 */
async function getVaultAPYExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('📈 Getting vault APY...');
  
  try {
    const apy = await sdk.getVaultAPY(vaultAddress, NETWORK);
    
    console.log('📊 APY Information:');
    console.log(`   📈 Current APY: ${apy.apyPercent}%`);
    console.log(`   ⏰ Calculation period: ${apy.period}`);
    console.log(`   🕐 Last updated: ${apy.lastUpdated}`);
    console.log('✅ APY obtained\n');
  } catch (error) {
    console.error('❌ Error getting APY:', error);
  }
}

/**
 * Vault administrative management examples
 */
async function vaultManagementExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('🔧 Simulating vault management operations...');
  
  // Note: These operations require specific roles
  console.log('⚠️  Note: The following operations require specific administrative roles');
  
  try {
    // Strategy pause example
    console.log('⏸️  Simulating strategy pause...');
    const pauseData = {
      strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
      caller: EXAMPLE_ADDRESSES.MANAGER // Requires Strategy Manager role
    };
    
    const pauseResponse = await sdk.pauseStrategy(vaultAddress, pauseData, NETWORK);
    console.log('✅ Strategy paused:', pauseResponse.xdr ? 'XDR generated' : 'Error');
    
    // Strategy reactivation example
    console.log('▶️  Simulating strategy reactivation...');
    const unpauseData = {
      strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
      caller: EXAMPLE_ADDRESSES.MANAGER // Requires Strategy Manager role
    };
    
    const unpauseResponse = await sdk.unpauseStrategy(vaultAddress, unpauseData, NETWORK);
    console.log('✅ Strategy reactivated:', unpauseResponse.xdr ? 'XDR generated' : 'Error');
    
    // Emergency rescue example
    console.log('🚨 Simulating emergency rescue...');
    const rescueData = {
      strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
      caller: EXAMPLE_ADDRESSES.EMERGENCY_MANAGER // Requires Emergency Manager role
    };
    
    const rescueResponse = await sdk.emergencyRescue(vaultAddress, rescueData, NETWORK);
    console.log('✅ Emergency rescue:', rescueResponse.xdr ? 'XDR generated' : 'Error');
    
  } catch (error) {
    console.log('ℹ️  Management operations simulated (may fail without appropriate roles)');
    console.log('   Details:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  console.log('✅ Vault management simulated\n');
}

/**
 * Transaction sending example (simulated)
 */
async function sendTransactionExample(sdk: DefindexSDK, signedXDR: string): Promise<void> {
  console.log('📤 Sending transaction to Stellar...');
  
  try {
    // Direct Stellar sending
    const response = await sdk.sendTransaction(signedXDR, NETWORK, false);
    
    console.log('🎉 Transaction sent successfully!');
    console.log('🔗 Transaction hash:', response.hash);
    console.log('✅ Status:', response.status);
    
    if (response.status === 'SUCCESS') {
      console.log('🎊 Transaction confirmed on blockchain!');
    }
  } catch (error) {
    console.error('❌ Error sending transaction:', error);
  }
}

/**
 * Utility function for error handling
 */
function handleError(error: unknown, context: string): void {
  console.error(`❌ Error in ${context}:`);
  if (error instanceof Error) {
    console.error(`   Message: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
  } else {
    console.error(`   Unknown error:`, error);
  }
}

/**
 * Initial configuration function
 */
function checkEnvironmentSetup(): void {
  console.log('🔍 Checking environment configuration...');
  
  const requiredVars = [
    'DEFINDEX_API_KEY',
    'DEFINDEX_API_EMAIL',
    'DEFINDEX_API_PASSWORD'
  ];
  
  const hasApiKey = !!process.env.DEFINDEX_API_KEY;
  const hasEmailPass = !!(process.env.DEFINDEX_API_EMAIL && process.env.DEFINDEX_API_PASSWORD);
  
  if (!hasApiKey && !hasEmailPass) {
    console.log('⚠️  Warning: No authentication credentials found');
    console.log('   For full functionality, configure one of these options:');
    console.log('   1. DEFINDEX_API_KEY=your_api_key (recommended)');
    console.log('   2. DEFINDEX_API_EMAIL=your_email and DEFINDEX_API_PASSWORD=your_password');
    console.log('   The example will continue with limited functionality.\n');
  } else if (hasApiKey) {
    console.log('✅ API Key found - using recommended authentication\n');
  } else {
    console.log('✅ Email/password credentials found - using legacy authentication\n');
  }
}

// Run the example
if (require.main === module) {
  checkEnvironmentSetup();
  
  runExample()
    .then(() => {
      console.log('\n🎊 Example completed successfully!');
      console.log('📚 For more information, check the documentation in docs/');
      process.exit(0);
    })
    .catch((error) => {
      handleError(error, 'example execution');
      process.exit(1);
    });
}

export { runExample };