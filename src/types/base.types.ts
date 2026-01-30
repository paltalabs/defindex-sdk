export interface BaseTransactionResponse {
  xdr: string | null;
  simulation_result: string;
  error?: string;
}

export interface BaseVaultTransactionResponse {
  xdr: string | null;
  simulationResponse: any;
  functionName: string;
  params: any[];
  operationXDR?: string;
  isSmartWallet?: boolean;
}