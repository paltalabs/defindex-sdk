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

The response shape is:

```typescript
interface SendTransactionResponse {
  txHash: string;
  status: string;
  ledger: number;
  latestLedger: number;
  latestLedgerCloseTime: string;
  oldestLedger: number;
  oldestLedgerCloseTime: string;
  createdAt: string;
  applicationOrder: number;
  feeBump: boolean;
  envelopeXdr: string;
  resultXdr: string;
  resultMetaXdr: string;
  returnValue: any;
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
