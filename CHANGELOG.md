# DeFindex SDK Changelog

## Smart Wallet Support

All transaction endpoints (vault and factory) now support smart wallets (C-addresses).

Every transaction response includes two new fields: `operationXDR` (base64 operation XDR) and `isSmartWallet` (boolean). When the caller is a smart wallet, `xdr` is `null` — use `operationXDR` to build the transaction client-side.

**Affected vault endpoints:** `/vault/:address/deposit`, `withdraw`, `withdraw-shares`, `rescue`, `pause-strategy`, `unpause-strategy`, `set-role/:role`, `report`, `rebalance`, `lock-fees`, `release-fees`, `distribute-fees`, `upgrade`

**Affected factory endpoints:** `/factory/create-vault`, `create-vault-deposit`, `create-vault-auto-invest`

## Remove LaunchTube

The LaunchTube integration has been removed. The `POST /send` endpoint now submits transactions directly to the Stellar network via Soroban RPC.

**Breaking changes:**

- The `launchtube` field in the request body has been removed. Passing `launchtube: true` is no longer necessary or accepted.
- The response is now always a `SendTransactionResponse` (Soroban RPC response). The `LaunchTubeResponse` type is no longer returned.

**Before:**
```json
POST /send?network=testnet
{ "xdr": "AAAAAgAAAA...", "launchtube": true }
```

**After:**
```json
POST /send?network=testnet
{ "xdr": "AAAAAgAAAA..." }
```

See [LLMS-MIGRATION.md](./LLMS-MIGRATION.md) for agent-friendly migration instructions.
