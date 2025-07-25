/**
 * DeFindex SDK Backend Example
 *
 * This example demonstrates how to use the DeFindex SDK
 * in a Node.js backend environment with API key authentication.
 */

const { DefindexSDK, SupportedNetworks } = require('defindex-sdk');

async function main() {
  // Initialize the SDK with your API key from environment variables
  const sdk = new DefindexSDK({
    apiKey: process.env.DEFINDEX_API_KEY || 'sk_your_api_key_here',
    baseUrl: process.env.DEFINDEX_API_URL, // Optional: e.g., 'https://api.defindex.io'
    timeout: 30000 // 30 seconds timeout
  });

  // Common baseUrl examples:
  // - Production: 'https://api.defindex.io' (default)
  // - Development: 'http://localhost:3000'

  try {
    console.log('🚀 DeFindex SDK Example');
    console.log('======================');

    // 1. Check API Health Status
    console.log('\n1. Checking API health...');
    const health = await sdk.healthCheck();
    if (health.status.reachable) {
      console.log('✅ API is healthy and reachable.');
    } else {
      console.log('⚠️ API health issues detected.');
    }

    // 2. Get Factory Address for TESTNET
    console.log('\n2. Getting factory contract address (TESTNET)...');
    const factory = await sdk.getFactoryAddress(SupportedNetworks.TESTNET);
    console.log('Factory address:', factory.address);

    // 3. Get Vault Information
    console.log('\n3. Getting vault information...');
    const vaultAddress = 'GVAULT_CONTRACT_ADDRESS...'; // Replace with a real vault address
    console.log(`Fetching info for vault: ${vaultAddress}`);
    /*
    // This part requires a valid vault address to run
    try {
      const vaultInfo = await sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET);
      console.log(`Vault Name: ${vaultInfo.name} (${vaultInfo.symbol})`);
      console.log(`Total Assets: ${vaultInfo.totalAssets}`);
    } catch (e) {
      if (e.statusCode === 404) {
        console.log(`(Skipped: Vault address ${vaultAddress} not found. Replace it with a real one.)`);
      } else {
        throw e;
      }
    }
    */


    // 4. Deposit to a Vault (Build Transaction)
    console.log('\n4. Building a deposit transaction...');
    const depositData = {
      amounts: [10000000], // Deposit 10 units of the first asset (assuming 7 decimals)
      caller: 'GUSER_ADDRESS...', // The user's wallet address
      invest: true,
      slippageBps: 50 // 0.5% slippage
    };

    console.log('Deposit parameters:', depositData);
    console.log('(This step only builds the transaction, it does not send it)');
    /*
    // This part requires a valid vault and user address
    const depositResponse = await sdk.depositToVault(
      vaultAddress,
      depositData,
      SupportedNetworks.TESTNET
    );
    console.log('Deposit transaction XDR received:', depositResponse.xdr.substring(0, 30) + '...');
    console.log('Expected shares to mint:', depositResponse.simulation_response.sharesToMint);
    */

    // 5. At this point, you would:
    //    - Sign the received XDR with the user's wallet/keypair
    //    - Submit the signed transaction using sdk.sendTransaction()
    console.log('\n5. Next steps:');
    console.log('- Sign the transaction XDR with a wallet');
    console.log('- Send the signed XDR using sdk.sendTransaction(signedXdr, network)');

    console.log('\n✅ Example script completed successfully!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    // Handle specific error types
    if (error.statusCode === 401) {
      console.error('Authentication failed - check your API key and permissions.');
    } else if (error.statusCode === 400) {
      console.error('Bad request - check your input parameters:', error.details || '');
    } else if (error.isNetworkError) {
      console.error('A network-related error occurred.');
    }
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main().catch(err => {
    console.error("\n🚨 Unhandled Exception:", err);
  });
}

module.exports = {
  main
};
