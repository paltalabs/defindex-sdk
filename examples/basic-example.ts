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

import { DefindexSDK, SupportedNetworks, VaultRoles } from '../src';
import type {
  CreateDefindexVault,
  CreateVaultAutoInvestParams,
  DepositToVaultParams,
  WithdrawParams,
  WithdrawSharesParams,
  VaultInfoResponse,
  RebalanceParams,
  SetVaultRoleParams,
  LockFeesParams,
  ReleaseFeesParams,
  DistributeFeesParams,
  UpgradeWasmParams,
} from '../src/types';

// Example configuration
const NETWORK = SupportedNetworks.TESTNET;
const API_BASE_URL = process.env.DEFINDEX_API_URL || 'https://api.defindex.io';

// Example addresses for Testnet (replace with real addresses)
const EXAMPLE_ADDRESSES = {
  MANAGER: 'GBZXUKUYGXLASTLIXGIV2RJGWQHVRIS7AANR7AHXFPA67LNSAGO6WPPE',
  FEE_RECEIVER: 'GBZXUKUYGXLASTLIXGIV2RJGWQHVRIS7AANR7AHXFPA67LNSAGO6WPPE',
  EMERGENCY_MANAGER: 'GBZXUKUYGXLASTLIXGIV2RJGWQHVRIS7AANR7AHXFPA67LNSAGO6WPPE',
  REBALANCE_MANAGER: 'GBZXUKUYGXLASTLIXGIV2RJGWQHVRIS7AANR7AHXFPA67LNSAGO6WPPE',
  USER: 'GBAJGSZQRZDMHKU4DAS6FEJM7TYISAME5LNERKOT7XLMNFZ5IF5ROXOQ',
  XLM_ASSET: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  STRATEGY: 'CCEE2VAGPXKVIZXTVIT4O5B7GCUDTZTJ5RIXBPJSZ7JWJCJ2TLK75WVW',
  DEPLOYED_VAULT: 'CD3UGELRAQU5OBHUD2SCVKCNVBTWPXICLP2AF3IRSYGGEQCP2DCY27DU'
};

/**
 * Main function that executes the complete example
 */
async function runExample(): Promise<void> {
  console.log('🚀 Starting DeFindex SDK example...');

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
  await vaultManagementExample(sdk, EXAMPLE_ADDRESSES.DEPLOYED_VAULT);

  // Step 7: Test Create Vault + Rebalance flow
  await testCreateVaultWithRebalance(sdk);

  // Step 8: Test Create Vault + Auto-Invest flow
  await testCreateVaultAutoInvest(sdk);

  console.log('✅ Example completed successfully!');
}

/**
 * Initializes the SDK with different authentication methods
 */
async function initializeSDK(): Promise<DefindexSDK> {
  console.log('📋 Initializing SDK...');
  
  const apiKey = process.env.DEFINDEX_API_KEY;
  let sdk: DefindexSDK;
  
  if (apiKey) {
    console.log('🔑 Using API Key authentication (recommended)');
    sdk = new DefindexSDK({
      apiKey,
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
  
  console.log('✅ SDK initialized successfully');
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
    console.log('✅ API working correctly');
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
    console.log('✅ Factory found');
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
      console.log('🔗 XDR to sign:', response.xdr);
      console.log('📊 Simulation result:', response.simulation_result);
      
      // In a real case, you would sign the XDR and send it here
      console.log('📝 Note: In production, sign this XDR with your wallet and send it using sendTransaction()');
      
      // Simulate vault address created
      const simulatedVaultAddress = EXAMPLE_ADDRESSES.DEPLOYED_VAULT;
      console.log('🏦 Simulated vault address:', simulatedVaultAddress);
      console.log('✅ Vault created');
      
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
    
    // Get vault report
    await getVaultReportExample(sdk, vaultAddress);
    
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
  console.log(`   💰 Total Managed Funds: ${JSON.stringify(vaultInfo.totalManagedFunds)}`);
  console.log(`   💸 Vault Fee: ${vaultInfo.feesBps.vaultFee / 100}%`);
  console.log(`   🏢 DeFindex Fee: ${vaultInfo.feesBps.defindexFee / 100}%`);
  console.log(`   📈 APY: ${vaultInfo.apy}%`);
  
  console.log('   👥 Roles:');
  console.log(`     Manager: ${vaultInfo.roles.manager}`);
  console.log(`     Emergency Manager: ${vaultInfo.roles.emergencyManager}`);
  console.log(`     Rebalance Manager: ${vaultInfo.roles.rebalanceManager}`);
  console.log(`     Fee Receiver: ${vaultInfo.roles.feeReceiver}`);
  
  console.log('   🔧 Assets and Strategies:');
  vaultInfo.assets.map((asset, index) => {
    console.log(`     ${index + 1}. Asset: ${asset.name} (${asset.symbol}) - ${asset.address}`);
    console.log(`        Strategies:`);
    asset.strategies.map((strategy, idx) => {
      console.log(`          ${idx + 1}. Strategy: ${strategy.name} (${strategy.address})`);
      console.log(`             Paused: ${strategy.paused ? 'Yes' : 'No'}`);
    });
  });
  
  console.log('✅ Vault information obtained');
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
    console.log('🔗 XDR to sign:', response.xdr);
    console.log('📊 Simulation response:', response.simulationResponse);
    console.log('📝 Note: Sign this XDR and send it to complete the deposit');
    console.log('✅ Deposit simulated');
  } catch (error) {
    console.error('❌ Error in deposit:', error);
  }
}

/**
 * Withdrawal by specific amount example
 */
async function withdrawExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('💸 Simulating withdrawal by amount...');
  
  const withdrawData: WithdrawParams = {
    amounts: [500000], // 0.5 USDC
    caller: EXAMPLE_ADDRESSES.USER,
    slippageBps: 100 // 1% slippage tolerance
  };
  
  try {
    console.log('📝 Withdrawal parameters:', withdrawData);
    
    const response = await sdk.withdrawFromVault(vaultAddress, withdrawData, NETWORK);
    
    console.log('🎉 Withdrawal prepared successfully!');
    console.log('🔗 XDR to sign:', response.xdr);
    console.log('📊 Simulation response:', response.simulationResponse);
    console.log('✅ Withdrawal by amount simulated');
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
    console.log('🔗 XDR to sign:', response.xdr);
    console.log('📊 Simulation response:', response.simulationResponse);
    console.log('✅ Share withdrawal simulated');
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
    console.log(`   📈 Current APY: ${apy.apy}%`);
    console.log('✅ APY obtained');
  } catch (error) {
    console.error('❌ Error getting APY:', error);
  }
}

/**
 * Gets vault report
 */
async function getVaultReportExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('📋 Getting vault report...');
  
  try {
    const report = await sdk.getReport(vaultAddress, NETWORK);
    
    console.log('📊 Vault Report Information:');
    if (report.xdr) {
      console.log(`   🔗 Report XDR: ${report.xdr}`);
    }
    if (report.simulationResponse) {
      console.log('   ⚡ Simulation completed successfully');
    }
    console.log('✅ Vault report obtained');
  } catch (error) {
    console.error('❌ Error getting vault report:', error);
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
    console.log('vault address:', vaultAddress);
    console.log('📝 Pause parameters:', pauseData);
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
    
    // Rebalance vault example
    await rebalanceVaultExample(sdk, vaultAddress);
    
    // Role management examples
    await roleManagementExamples(sdk, vaultAddress);
    
    // Fee management examples
    await feeManagementExamples(sdk, vaultAddress);
    
    // Upgrade vault WASM example
    await upgradeVaultExample(sdk, vaultAddress);
    
  } catch (error) {
    console.error('   Details:', error);
  }
  
  console.log('✅ Vault management simulated');
}

/**
 * Rebalance vault example
 */
async function rebalanceVaultExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('⚖️ Simulating vault rebalance...');
  
  const rebalanceData: RebalanceParams = {
    caller: EXAMPLE_ADDRESSES.REBALANCE_MANAGER,
    instructions: [
      {
        type: 'Invest',
        strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
        amount: 1000000
      },
      {
        type: 'Unwind',
        strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
        amount: 500000
      },
    ]
  };
  
  try {
    console.log('📝 Rebalance parameters:', JSON.stringify(rebalanceData, null, 2));
    const response = await sdk.rebalanceVault(vaultAddress, rebalanceData, NETWORK);
    
    console.log('🎉 Rebalance prepared successfully!');
    console.log('🔗 XDR to sign:', response.xdr);
    console.log('✅ Vault rebalanced');
  } catch (error) {
    console.error('❌ Error in rebalance:', error);
  }
}

/**
 * Role management examples
 */
async function roleManagementExamples(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('👥 Simulating role management...');
  
  try {
    // Get current manager
    console.log('📋 Getting current vault manager...');
    const managerRole = await sdk.getVaultRole(vaultAddress, VaultRoles.MANAGER, NETWORK);
    console.log(`   Current manager: ${managerRole.address}`);
    
    // Set new role example (simulated)
    console.log('👤 Simulating role assignment...');
    const roleData: SetVaultRoleParams = {
      caller: EXAMPLE_ADDRESSES.MANAGER,
      new_address: EXAMPLE_ADDRESSES.FEE_RECEIVER // Example new address
    };
    
    const roleResponse = await sdk.setVaultRole(vaultAddress, VaultRoles.FEE_RECEIVER, roleData, NETWORK);
    console.log('✅ Role assignment:', roleResponse.xdr ? 'XDR generated' : 'Error');
  } catch (error) {
    console.error('❌ Error in role management:', error);
  }
}

/**
 * Fee management examples
 */
async function feeManagementExamples(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('💰 Simulating fee management...');
  
  try {
    // Lock fees with new rate
    console.log('🔒 Simulating fee lock with new rate...');
    const lockData: LockFeesParams = {
      caller: EXAMPLE_ADDRESSES.MANAGER,
      new_fee_bps: 150 // 1.5%
    };
    
    const lockResponse = await sdk.lockVaultFees(vaultAddress, lockData, NETWORK);
    console.log('✅ Fee lock:', lockResponse.xdr ? 'XDR generated' : 'Error');
    
    // Release fees from strategy
    console.log('💸 Simulating fee release...');
    const releaseData: ReleaseFeesParams = {
      caller: EXAMPLE_ADDRESSES.MANAGER,
      strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
      amount: 100000
    };
    
    const releaseResponse = await sdk.releaseVaultFees(vaultAddress, releaseData, NETWORK);
    console.log('✅ Fee release:', releaseResponse.xdr ? 'XDR generated' : 'Error');
    
    // Distribute accumulated fees
    console.log('📤 Simulating fee distribution...');
    const distributeData: DistributeFeesParams = {
      caller: EXAMPLE_ADDRESSES.MANAGER
    };
    
    const distributeResponse = await sdk.distributeVaultFees(vaultAddress, distributeData, NETWORK);
    console.log('✅ Fee distribution:', distributeResponse.xdr ? 'XDR generated' : 'Error');
  } catch (error) {
    console.error('❌ Error in fee management:', error);
  }
}

/**
 * Upgrade vault WASM example
 */
async function upgradeVaultExample(sdk: DefindexSDK, vaultAddress: string): Promise<void> {
  console.log('🔄 Simulating vault WASM upgrade...');

  const upgradeData: UpgradeWasmParams = {
    caller: EXAMPLE_ADDRESSES.MANAGER,
    new_wasm_hash: 'ae3409a4090bc087b86b4e9b444d2b8017ccd97b90b069d44d005ab9f8e1468b'
  };

  try {
    console.log('📝 Upgrade parameters:', upgradeData);
    const response = await sdk.upgradeVaultWasm(vaultAddress, upgradeData, NETWORK);

    console.log('🎉 Upgrade prepared successfully!');
    console.log('🔗 XDR to sign:', response.xdr);
    console.log('✅ Vault upgrade simulated');
  } catch (error) {
    console.error('❌ Error in vault upgrade:', error);
  }
}

/**
 * Test: Create Vault + Rebalance Flow
 * Demonstrates the complete flow of creating a vault and then rebalancing it
 */
async function testCreateVaultWithRebalance(sdk: DefindexSDK): Promise<void> {
  console.log('');
  console.log('🧪 ========================================');
  console.log('🧪 TEST: Create Vault + Rebalance Flow');
  console.log('🧪 ========================================');

  try {
    // Step 1: Create vault
    console.log('');
    console.log('📦 Step 1: Creating vault...');

    const vaultConfig: CreateDefindexVault = {
      roles: {
        0: EXAMPLE_ADDRESSES.EMERGENCY_MANAGER,
        1: EXAMPLE_ADDRESSES.FEE_RECEIVER,
        2: EXAMPLE_ADDRESSES.MANAGER,
        3: EXAMPLE_ADDRESSES.REBALANCE_MANAGER
      },
      vault_fee_bps: 100,
      assets: [{
        address: EXAMPLE_ADDRESSES.XLM_ASSET,
        strategies: [{
          address: EXAMPLE_ADDRESSES.STRATEGY,
          name: 'Test Strategy',
          paused: false
        }]
      }],
      name_symbol: {
        name: 'Test Rebalance Vault',
        symbol: 'TRV'
      },
      upgradable: true,
      caller: EXAMPLE_ADDRESSES.MANAGER
    };

    const createResponse = await sdk.createVault(vaultConfig, NETWORK);

    if (createResponse.xdr) {
      console.log('✅ Vault creation XDR generated');
      console.log('   XDR length:', createResponse.xdr.length, 'chars');
    } else {
      console.log('⚠️  Vault creation failed:', createResponse.error);
      return;
    }

    // Step 2: Rebalance vault (using deployed vault for demo)
    console.log('');
    console.log('⚖️ Step 2: Rebalancing vault...');

    const rebalanceData: RebalanceParams = {
      caller: EXAMPLE_ADDRESSES.REBALANCE_MANAGER,
      instructions: [
        {
          type: 'Invest',
          strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
          amount: 5000000
        },
        {
          type: 'Unwind',
          strategy_address: EXAMPLE_ADDRESSES.STRATEGY,
          amount: 2000000
        }
      ]
    };

    const rebalanceResponse = await sdk.rebalanceVault(
      EXAMPLE_ADDRESSES.DEPLOYED_VAULT,
      rebalanceData,
      NETWORK
    );

    if (rebalanceResponse.xdr) {
      console.log('✅ Rebalance XDR generated');
      console.log('   XDR length:', rebalanceResponse.xdr.length, 'chars');
      console.log('   Instructions executed: Invest + Unwind');
    }

    // Summary
    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ Vault creation: XDR ready for signing');
    console.log('   ✅ Rebalance: XDR ready for signing');
    console.log('   📝 Next: Sign XDRs with wallet and send via sendTransaction()');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('🧪 ========================================');
  console.log('');
}

/**
 * Test: Create Vault with Auto-Invest
 * Demonstrates creating a vault and investing in strategies atomically
 */
async function testCreateVaultAutoInvest(sdk: DefindexSDK): Promise<void> {
  console.log('');
  console.log('🧪 ========================================');
  console.log('🧪 TEST: Create Vault Auto-Invest Flow');
  console.log('🧪 ========================================');

  try {
    console.log('');
    console.log('📦 Creating vault with auto-invest...');

    const params: CreateVaultAutoInvestParams = {
      caller: EXAMPLE_ADDRESSES.USER,
      roles: {
        emergencyManager: EXAMPLE_ADDRESSES.EMERGENCY_MANAGER,
        rebalanceManager: EXAMPLE_ADDRESSES.REBALANCE_MANAGER,
        feeReceiver: EXAMPLE_ADDRESSES.FEE_RECEIVER,
        manager: EXAMPLE_ADDRESSES.MANAGER
      },
      name: 'Auto-Invest',
      symbol: 'AIV',
      vaultFee: 100, // 1% fee in basis points
      upgradable: true,
      assets: [{
        address: EXAMPLE_ADDRESSES.XLM_ASSET,
        symbol: 'XLM',
        amount: 10000000, // 1 XLM (7 decimals)
        strategies: [{
          address: EXAMPLE_ADDRESSES.STRATEGY,
          name: 'XLM Strategy',
          amount: 10000000 // Invest full amount
        }]
      }]
    };

    console.log('📝 Auto-invest params:', JSON.stringify(params, null, 2));

    const response = await sdk.createVaultAutoInvest(params, NETWORK);

    if (response.xdr) {
      console.log('✅ Auto-invest XDR generated');
      console.log('   XDR length:', response.xdr.length, 'chars');
      console.log('   Predicted vault address:', response.predictedVaultAddress);
      if (response.warning) {
        console.log('   ⚠️ Warning:', response.warning);
      }
    }
    console.log(response.xdr);

    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ Vault + Deposit + Invest: XDR ready for signing');
    console.log('   📝 Next: Sign XDR with wallet and send via sendTransaction()');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('🧪 ========================================');
  console.log('');
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
    console.log('🔗 Transaction hash:', response.txHash);
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
  
  const hasApiKey = !!process.env.DEFINDEX_API_KEY;
  
  if (!hasApiKey) {
    console.log('⚠️  Warning: No authentication credentials found');
    console.log('   For full functionality, configure one of these options:');
    console.log('   1. DEFINDEX_API_KEY=your_api_key (recommended)');
    console.log('   The example will continue with limited functionality.');
  } else if (hasApiKey) {
    console.log('✅ API Key found - using recommended authentication');
  }
}

// Run the example
if (require.main === module) {
  checkEnvironmentSetup();
  
  runExample()
    .then(() => {
      console.log('🎊 Example completed successfully!');
      console.log('📚 For more information, check the documentation in docs/');
      process.exit(0);
    })
    .catch((error) => {
      handleError(error, 'example execution');
      process.exit(1);
    });
}

export { runExample };