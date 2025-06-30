import { TokenData } from '../types';

/**
 * In-memory token cache with automatic expiration handling
 * Stores access and refresh tokens with timestamps
 */
export class TokenCache {
  private tokenData: TokenData | null = null;

  /**
   * Store token data in cache
   */
  setTokens(tokenData: TokenData): void {
    this.tokenData = tokenData;
  }

  /**
   * Get current access token if valid
   */
  getAccessToken(): string | null {
    if (!this.tokenData) {
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    
    if (this.tokenData.expires_at && (this.tokenData.expires_at - bufferTime) <= now) {
      return null; // Token is expired or about to expire
    }

    return this.tokenData.access_token;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenData?.refresh_token || null;
  }

  /**
   * Get user information
   */
  getUserInfo(): { username: string; role: string } | null {
    if (!this.tokenData) {
      return null;
    }

    return {
      username: this.tokenData.username,
      role: this.tokenData.role
    };
  }

  /**
   * Check if we have valid tokens
   */
  hasValidTokens(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Check if we need to refresh tokens
   */
  needsRefresh(): boolean {
    if (!this.tokenData) {
      return false;
    }

    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    const now = Date.now();
    
    return !!(this.tokenData.expires_at && (this.tokenData.expires_at - bufferTime) <= now);
  }

  /**
   * Clear all cached tokens
   */
  clear(): void {
    this.tokenData = null;
  }

  /**
   * Get token expiration time
   */
  getExpirationTime(): number | null {
    return this.tokenData?.expires_at || null;
  }

  /**
   * Check if tokens exist (regardless of expiration)
   */
  hasTokens(): boolean {
    return this.tokenData !== null;
  }
} 