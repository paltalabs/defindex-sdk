

/* Base interfaces for auth domain */

export interface BaseTokenResponse {
  username: string;
  role: string;
}

/* Auth request types */
export interface RegisterParams {
  email: string;
  password: string;
  username: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RefreshParams {
  refreshToken: string;
}

/* Auth response types */
export interface RegisterResponse {
  message: string;
}

export interface LoginResponse extends BaseTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse extends LoginResponse {}

/* Auth endpoint response types - using consistent token naming */
export interface AuthLoginResponse extends BaseTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthRefreshResponse extends AuthLoginResponse {}

/* API Key management types */
/**
 * API key generation request parameters
 * @example
 * ```typescript
 * const keyRequest: ApiKeyGenerateRequest = {
 *   name: 'Production API Key'
 * };
 * const apiKey = await sdk.generateApiKey(keyRequest);
 * console.log('New API key:', apiKey.key);
 * ```
 */
export interface ApiKeyGenerateRequest {
  /** Optional descriptive name for the API key */
  name?: string;
}

export interface ApiKeyGenerateResponse {
  key: string;
  id: number;
}

/**
 * API key information
 * @example
 * ```typescript
 * const apiKeys = await sdk.getUserApiKeys();
 * apiKeys.forEach(key => {
 *   console.log(`ID: ${key.id}, Name: ${key.name || 'Unnamed'}`);
 *   console.log(`Created: ${key.createdAt}`);
 *   console.log(`Last used: ${key.lastUsedAt || 'Never'}`);
 * });
 * ```
 */
export interface ApiKeyInfo {
  /** Unique API key identifier */
  id: number;
  /** Optional descriptive name */
  name?: string;
  /** The actual API key string (truncated in list responses) */
  key: string;
  /** ISO timestamp when the key was created */
  createdAt: string;
  /** ISO timestamp when the key was last used (if ever) */
  lastUsedAt?: string;
}

export interface ApiKeyRevokeRequest {
  keyId: number;
}

export interface ApiKeyRevokeResponse {
  success: boolean;
}

export type GetUserApiKeysResponse = ApiKeyInfo[];