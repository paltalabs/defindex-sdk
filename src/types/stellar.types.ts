/* Stellar transaction submission types */
export interface SendXdrDto {
  xdr: string;
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
