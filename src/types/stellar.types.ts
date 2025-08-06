/* LaunchTube service response types */
export interface LaunchTubeResponse {
  status: string;
  hash: string;
  feeCharged: number;
  envelopeXdr: string;
  resultXdr: string;
  resultMetaXdr: string;
  returnValue: string;
  diagnosticEventsXdr: string[];
  txHash: string;
  latestLedger: number;
  latestLedgerCloseTime: string;
  oldestLedger: number;
  oldestLedgerCloseTime: string;
  ledger: number;
  createdAt: string;
  applicationOrder: number;
  feeBump: boolean;
}

/* LaunchTube error response */
export interface LaunchTubeErrorResponse {
  status: 'ERROR';
  type: string;
  hash?: string;
  envelopeXdr?: string;
  errorResultXdr?: string;
  latestLedger?: number;
  latestLedgerCloseTime?: string;
  sim?: boolean;
}

export interface SendTransactionResponse {
  status: string;
  txHash: string;
  latestLedger: number;
  latestLedgerCloseTime: string;
  oldestLedger: number;
  oldestLedgerCloseTime: string;
  ledger: number;
  createdAt: string;
  applicationOrder: number;
  feeBump: boolean;
  resultXdr: string;
  resultMetaXdr: string;
  envelopeXdr: string;
  returnValue: any;
}
export interface SendTransactionErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}
