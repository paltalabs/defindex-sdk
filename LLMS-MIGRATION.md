# DeFindex SDK Migration Guide (for AI agents)

This document describes how to migrate a client that consumes the DeFindex API.

## What changed

All transaction endpoints (vault + factory) now return two additional fields:

```typescript
{
  // ...existing fields...
  operationXDR?: string;   // base64-encoded raw operation XDR
  isSmartWallet?: boolean; // true when caller is a C-address
}
```

When `isSmartWallet` is `true`, `xdr` will be `null`. The client must use `operationXDR` to build its own transaction envelope.

## Step-by-step migration

### 1. Update response types

Find every type/interface/schema that describes a transaction response from the DeFindex API and add the two new fields.

**TypeScript interfaces** — add optional fields:

```typescript
// Add to any vault or factory transaction response type
operationXDR?: string;
isSmartWallet?: boolean;
```

Make sure `xdr` is typed as `string | null` (not just `string`).

**Zod schemas** — add:

```typescript
operationXDR: z.string().optional(),
isSmartWallet: z.boolean().optional(),
```

Change `xdr: z.string()` to `xdr: z.string().nullable()`.

### 2. Update transaction handling logic

Find every place that reads `response.xdr` after calling a DeFindex API transaction endpoint and wrap it:

```typescript
// Before
const xdr = response.xdr;
signAndSubmit(xdr);

// After
if (response.isSmartWallet) {
  // Smart wallet: build transaction from operationXDR
  buildAndSubmitSmartWalletTx(response.operationXDR);
} else {
  // Classic account: use xdr directly as before
  signAndSubmit(response.xdr);
}
```

### 3. Affected endpoints

Apply the above changes to code that calls any of these endpoints:

**Vault endpoints:**
- `POST /vault/:address/deposit`
- `POST /vault/:address/withdraw`
- `POST /vault/:address/withdraw-shares`
- `POST /vault/:address/rescue`
- `POST /vault/:address/pause-strategy`
- `POST /vault/:address/unpause-strategy`
- `POST /vault/:address/set-role/:role`
- `GET  /vault/:address/report`
- `POST /vault/:address/rebalance`
- `POST /vault/:address/lock-fees`
- `POST /vault/:address/release-fees`
- `POST /vault/:address/distribute-fees`
- `POST /vault/:address/upgrade`

**Factory endpoints:**
- `POST /factory/create-vault`
- `POST /factory/create-vault-deposit`
- `POST /factory/create-vault-auto-invest`

### 4. No action needed if

- You only use classic Stellar accounts (G-addresses) as callers. The `xdr` field works exactly as before. Just make sure your schema validation doesn't reject the two new fields.

## Search patterns to find affected code

Use these patterns to locate code that needs updating:

```
# Types to update (smart wallet)
grep -rn "xdr: string" --include="*.ts"
grep -rn "xdr: z.string()" --include="*.ts"

# API calls to update (smart wallet)
grep -rn "/vault/.*deposit\|/vault/.*withdraw\|/vault/.*rebalance\|/vault/.*set-role\|/factory/create-vault" --include="*.ts"

# XDR usage to wrap with smart wallet check
grep -rn "response\.xdr\|result\.xdr\|\.xdr" --include="*.ts"

# LaunchTube references to remove
grep -rn "launchtube\|LaunchTube" --include="*.ts" --include="*.tsx"
```

---

## 0.3.0 — Type renames, response shape changes, and DX improvements

The SDK standardized naming conventions and unified response types. No new endpoints — this is a DX cleanup.

### Renamed types

```typescript
// Before → After
CreateDefindexVault            → CreateVaultParams
CreateDefindexVaultDepositDto  → CreateVaultDepositParams
DepositToVaultParams           → DepositParams
BaseTransactionResponse        → TransactionResponse
BaseVaultTransactionResponse   → removed (use TransactionResponse)
CreateDefindexVaultResponse    → removed (use TransactionResponse)
CreateVaultDepositResponse     → removed (use TransactionResponse)
SendTransactionErrorResponse   → removed
```

### Renamed request fields (factory create endpoints)

Apply these renames in every request body sent to `POST /factory/create-vault` or `POST /factory/create-vault-deposit`:

```typescript
// Before → After
vault_fee_bps       → vaultFeeBps
deposit_amounts     → depositAmounts
name_symbol.name    → name      // flattened to top-level
name_symbol.symbol  → symbol    // flattened to top-level
```

### Removed response fields (factory create endpoints)

`call_params` has been **removed entirely** from factory create responses. These endpoints now return a clean `TransactionResponse`:

```typescript
// Before
{
  call_params: { ... },   // REMOVED
  xdr: "AAAA...",
  simulation_result: "SUCCESS"
}

// After
{
  xdr: "AAAA...",
  simulationResponse: "SUCCESS",
  operationXDR: "AAAA...",
  isSmartWallet: false
}
```

### Response field: `simulationResponse` (unchanged)

The vault and factory response field remains `simulationResponse`. It was **not** renamed. If you were already using `simulationResponse`, no changes needed.

### Vault roles: numeric indices → named keys

```typescript
// Before
roles: Record<number, string>
// { 0: "GEMERGENCY...", 1: "GFEE...", 2: "GMANAGER...", 3: "GREBALANCE..." }

// After
roles: VaultRolesConfig
// { emergencyManager: "G...", feeReceiver: "G...", manager: "G...", rebalanceManager: "G..." }
```

### `SendTransactionResponse` redesigned

```typescript
// Before
interface SendTransactionResponse {
  status: string;
  txHash: string;
  resultXdr: string;
  resultMetaXdr: string;
  envelopeXdr: string;
  returnValue: any;
  // ...other fields
}

// After
interface SendTransactionResponse {
  txHash: string;
  success: boolean;
  result: TransactionResult | null;
  ledger: number;
  createdAt: string;
  latestLedger: number;
  latestLedgerCloseTime: string;
  feeBump: boolean;
  feeCharged: string;
}
```

`TransactionResult` is a discriminated union:

```typescript
type TransactionResult =
  | { type: 'vault_deposit'; sharesMinted: string }
  | { type: 'vault_withdraw'; amountsOut: string[] }
  | { type: 'vault_create'; vaultAddress: string }
  | { type: 'unknown'; value: unknown }
```

### Search patterns

```
# Type renames
grep -rn "CreateDefindexVault\|CreateDefindexVaultDepositDto\|DepositToVaultParams\|BaseTransactionResponse\|BaseVaultTransactionResponse" --include="*.ts"

# Request field renames (factory create bodies)
grep -rn "vault_fee_bps\|deposit_amounts\|name_symbol" --include="*.ts"

# Removed response fields
grep -rn "call_params\|callParams" --include="*.ts"

# Numeric role keys
grep -rn "roles.*\[0\]\|roles.*\[1\]\|roles.*\[2\]\|roles.*\[3\]" --include="*.ts"

# Old SendTransactionResponse fields
grep -rn "resultXdr\|resultMetaXdr\|envelopeXdr\|returnValue\|\.status\b" --include="*.ts"
```

---

## LaunchTube removal

The LaunchTube relay service has been removed from the `/send` endpoint. Transactions are now always submitted directly via Soroban RPC.

### What changed

- The `launchtube` boolean field was removed from the `POST /send` request body.
- The response type is now always `SendTransactionResponse` (Soroban RPC). The `LaunchTubeResponse` type no longer exists.

### Step-by-step migration

#### 1. Remove `launchtube` from request bodies

Find every call to `POST /send` and remove the `launchtube` field:

```typescript
// Before
await api.post('/send', { xdr: signedXdr, launchtube: true });

// After
await api.post('/send', { xdr: signedXdr });
```

#### 2. Update response types

If you have a `LaunchTubeResponse` type or a union like `SendTransactionResponse | LaunchTubeResponse`, replace it with just `SendTransactionResponse`.

The response shape is now (see 0.3.0 section above for the full updated type):

```typescript
interface SendTransactionResponse {
  txHash: string;
  success: boolean;
  result: TransactionResult | null;
  ledger: number;
  createdAt: string;
  latestLedger: number;
  latestLedgerCloseTime: string;
  feeBump: boolean;
  feeCharged: string;
}
```

#### 3. Remove LaunchTube-specific response handling

If you had branching logic based on whether LaunchTube was used, remove it:

```typescript
// Before
if (usedLaunchtube) {
  handleLaunchtubeResponse(response);
} else {
  handleStellarResponse(response);
}

// After
handleStellarResponse(response);
```
