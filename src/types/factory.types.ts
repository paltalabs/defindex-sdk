import { BaseTransactionResponse } from "./base.types";
import { CreateDefindexVault } from "./vault.types";


/* Factory endpoint response types */
export interface FactoryAddressResponse {
  address: string;
}

export interface CreateVaultResponse extends BaseTransactionResponse {
  call_params: CreateDefindexVault;
}

export interface CreateVaultDepositResponse extends BaseTransactionResponse {
  call_params: CreateDefindexVault;
}

export interface CreateDefindexVaultDepositDto extends CreateDefindexVault {
  deposit_amounts: number[];
}