/* Stellar transaction submission types */
export interface SendXdrDto {
  xdr: string;
}

/* Transaction result discriminated union */

/** Result for vault deposit transactions */
export interface VaultDepositResult {
  type: 'vault_deposit';
  /** DfToken shares minted to the depositor */
  sharesMinted: string;
}

/** Result for vault withdrawal transactions */
export interface VaultWithdrawResult {
  type: 'vault_withdraw';
  /** Underlying asset amounts returned to the user */
  amountsOut: string[];
}

/** Result for vault creation transactions */
export interface VaultCreateResult {
  type: 'vault_create';
  /** The new vault's contract address */
  vaultAddress: string;
}

/** Result for transactions we don't have specific parsing for */
export interface UnknownResult {
  type: 'unknown';
  /** The parsed native value from scValToNative() */
  value: unknown;
}

export type TransactionResult =
  | VaultDepositResult
  | VaultWithdrawResult
  | VaultCreateResult
  | UnknownResult;

/* Send transaction response with parsed results */
export interface SendTransactionResponse {
  /** Transaction hash */
  txHash: string;
  /** Whether the transaction succeeded */
  success: boolean;
  /** Parsed result — discriminated union based on transaction type */
  result: TransactionResult | null;
  /** Ledger the transaction was included in */
  ledger: number;
  /** When the transaction was created (ISO 8601) */
  createdAt: string;
  /** Latest ledger at response time */
  latestLedger: number;
  /** Latest ledger close time */
  latestLedgerCloseTime: string;
  /** Whether this was a fee bump transaction */
  feeBump: boolean;
  /** Fee charged in stroops */
  feeCharged: string;
}
