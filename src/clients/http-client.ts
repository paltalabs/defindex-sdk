/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP client wrapper with automatic authentication and error handling
 */
export class HttpClient {
  private client: AxiosInstance;
  private tokenProvider: () => Promise<string | null>;

  constructor(
    baseURL: string,
    timeout: number = 30000,
    tokenProvider: () => Promise<string | null>
  ) {
    this.tokenProvider = tokenProvider;
    
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      // Add custom transformRequest to handle BigInt serialization
      transformRequest: [
        (data: any) => {
          if (data && typeof data === 'object') {
            return JSON.stringify(data, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            );
          }
          return data;
        }
      ],
    });

    // Add request interceptor to inject auth token
    this.client.interceptors.request.use(
      async (config: any) => {
        // Skip auth for authentication endpoints to prevent infinite loops
        const authEndpoints = ['/login', '/refresh', '/health'];
        const isAuthEndpoint = authEndpoints.some(endpoint => 
          config.url?.includes(endpoint)
        );
        
        if (!isAuthEndpoint) {
          const token = await this.tokenProvider();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(this.transformError(error));
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Transform axios error to APIError
   */
  private transformError(error: any) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.message,
        statusCode: error.response.status,
        timestamp: new Date().toISOString(),
        path: error.response.config?.url,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error: No response received',
        statusCode: 0,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error',
        statusCode: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Build URL with query parameters
   */
  buildUrlWithQuery(baseUrl: string, params: Record<string, any>): string {
    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }
} 