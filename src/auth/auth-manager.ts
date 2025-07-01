import { TokenCache } from '../cache/token-cache';
import { HttpClient } from '../clients/http-client';
import {
  AuthLoginDto,
  AuthResponse,
  JWTData,
} from '../types';

/**
 * Authentication manager handles login, registration, and token refresh
 */
export class AuthManager {
  private tokenCache: TokenCache;
  private credentials: AuthLoginDto;
  private httpClient: HttpClient | null = null; // Will be injected

  constructor(credentials: AuthLoginDto) {
    this.credentials = credentials;
    this.tokenCache = new TokenCache();
  }

  /**
   * Set HTTP client (injected dependency)
   */
  setHttpClient(httpClient: HttpClient): void {
    this.httpClient = httpClient;
  }

  /**
   * Get current valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    // Check if we have valid tokens
    if (this.tokenCache.hasValidTokens()) {
      return this.tokenCache.getAccessToken()!;
    }

    // Check if we need to refresh
    if (this.tokenCache.needsRefresh() && this.tokenCache.getRefreshToken()) {
      try {
        await this.refreshTokens();
        const token = this.tokenCache.getAccessToken();
        if (token) {
          return token;
        }
      } catch (error) {
        console.log("🚀 | getValidAccessToken | error:", error)
        // Token refresh failed, attempting new login
      }
    }

    // Login fresh
    await this.login();
    const token = this.tokenCache.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token after login');
    }
    return token;
  }

  /**
   * Login with credentials
   */
  async login(): Promise<AuthResponse> {
    if (!this.httpClient) {
      throw new Error('HTTP client not initialized');
    }

    try {
      const response: AuthResponse = await this.httpClient.post('/login', this.credentials);
      
      //TODO: Get expiration from jwt
      // {
      //   "sub": 1,
      //   "email": "dev@paltalabs.io",
      //   "role": "ADMIN",
      //   "iat": 1751307940,
      //   "exp": 1751308840
      // }
      // Calculate expiration time (assume 1 hour if not provided)
      const expiresIn = 60 * 60 * 1000; // 1 hour in milliseconds
      const expiresAt = Date.now() + expiresIn;

      // Store tokens in cache
      const tokenData: JWTData = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_at: expiresAt,
        username: response.username,
        role: response.role,
      };
      
      this.tokenCache.setTokens(tokenData);
      return response;
    } catch (error) {
      this.tokenCache.clear();
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(): Promise<AuthResponse> {
    if (!this.httpClient) {
      throw new Error('HTTP client not initialized');
    }

    const refreshToken = this.tokenCache.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Use refresh token as bearer token
      const response: AuthResponse = await this.httpClient.post('/refresh', {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });

      // Calculate expiration time
      const expiresIn = 60 * 60 * 1000; // 1 hour in milliseconds
      const expiresAt = Date.now() + expiresIn;

      // Update tokens in cache
      const tokenData: JWTData = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_at: expiresAt,
        username: response.username,
        role: response.role,
      };
      
      this.tokenCache.setTokens(tokenData);
      return response;
    } catch (error) {
      this.tokenCache.clear();
      throw error;
    }
  }

  /**
   * Get current user information
   */
  getUserInfo(): { username: string; role: string } | null {
    return this.tokenCache.getUserInfo();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenCache.hasValidTokens();
  }

  /**
   * Logout (clear tokens)
   */
  logout(): void {
    this.tokenCache.clear();
  }

  /**
   * Get token provider function for HTTP client
   */
  getTokenProvider(): () => Promise<string | null> {
    return async () => {
      try {
        return await this.getValidAccessToken();
      } catch (error) {
        console.log("🚀 | return | error:", error)
        return null;
      }
    };
  }

  /**
   * Update credentials (for switching users)
   */
  updateCredentials(credentials: AuthLoginDto): void {
    this.credentials = credentials;
    this.tokenCache.clear(); // Clear existing tokens
  }
} 