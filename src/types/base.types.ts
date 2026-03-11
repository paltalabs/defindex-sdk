/** Unified base response type for all transaction operations */
export interface TransactionResponse {
  xdr: string | null;
  simulationResponse: unknown;
  operationXDR?: string;
  isSmartWallet?: boolean;
}
