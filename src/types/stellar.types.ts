/* Stellar transaction response types */
export interface StellarSendTransactionResponse  {
  /** Transaction hash */
  hash: string;
  /** Transaction status */
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  /** Latest ledger number */
  latestLedger: number;
  /** Latest ledger close time */
  latestLedgerCloseTime: number;
  /** Error result XDR if transaction failed */
  errorResultXdr?: string;
}

/* Union type for different transaction response formats */
export type TransactionResponse = StellarSendTransactionResponse | LaunchTubeResponse;

/* LaunchTube service response types */
export interface LaunchTubeResponse {
  hash?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorResultXdr?: string;
  envelopeXdr?: string;
  resultXdr?: string;
  resultMetaXdr?: string;
  error?: string;
  message?: string;
}

/* LaunchTube error response */
export interface LaunchTubeErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}