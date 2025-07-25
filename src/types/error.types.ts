/**
 * Error types for DeFindex SDK
 */

/**
 * Base API error interface
 */
export interface BaseApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Error timestamp */
  timestamp?: string;
  /** Request path that caused the error */
  path?: string;
}

/**
 * Authentication related errors
 */
export interface AuthError extends BaseApiError {
  /** Error type identifier */
  error: 'Unauthorized' | 'Forbidden' | 'TokenExpired' | 'InvalidCredentials';
}

/**
 * Validation related errors
 */
export interface ValidationError extends BaseApiError {
  /** Error type identifier */
  error: 'BadRequest' | 'ValidationFailed';
  /** Detailed validation errors by field */
  details?: {
    field: string;
    message: string;
    value?: any;
  }[];
}

/**
 * Network/blockchain related errors
 */
export interface NetworkError extends BaseApiError {
  /** Error type identifier */
  error: 'NetworkError' | 'TransactionFailed' | 'ContractError';
  /** Network-specific error details */
  networkDetails?: {
    /** Stellar error code */
    stellarErrorCode?: string;
    /** Transaction result XDR */
    resultXdr?: string;
    /** Additional network context */
    context?: string;
  };
}

/**
 * Resource not found errors
 */
export interface NotFoundError extends BaseApiError {
  /** Error type identifier */
  error: 'NotFound';
  /** Resource that was not found */
  resource?: string;
}

/**
 * Rate limiting errors
 */
export interface RateLimitError extends BaseApiError {
  /** Error type identifier */
  error: 'TooManyRequests';
  /** When the rate limit resets */
  retryAfter?: number;
  /** Current rate limit */
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * Internal server errors
 */
export interface ServerError extends BaseApiError {
  /** Error type identifier */
  error: 'InternalServerError' | 'ServiceUnavailable' | 'BadGateway';
  /** Internal error reference ID */
  errorId?: string;
}

/**
 * Union type for all possible API errors
 */
export type ApiError = 
  | AuthError 
  | ValidationError 
  | NetworkError 
  | NotFoundError 
  | RateLimitError 
  | ServerError;

/**
 * Type guard to check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return error && 
         typeof error === 'object' && 
         'message' in error && 
         'statusCode' in error && 
         'error' in error;
}

/**
 * Type guard to check if an error is an authentication error
 */
export function isAuthError(error: any): error is AuthError {
  return isApiError(error) && 
         ['Unauthorized', 'Forbidden', 'TokenExpired', 'InvalidCredentials'].includes(error.error);
}

/**
 * Type guard to check if an error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return isApiError(error) && 
         ['BadRequest', 'ValidationFailed'].includes(error.error);
}

/**
 * Type guard to check if an error is a network/blockchain error
 */
export function isNetworkError(error: any): error is NetworkError {
  return isApiError(error) && 
         ['NetworkError', 'TransactionFailed', 'ContractError'].includes(error.error);
}

/**
 * Type guard to check if an error is a rate limit error
 */
export function isRateLimitError(error: any): error is RateLimitError {
  return isApiError(error) && error.error === 'TooManyRequests';
}

/**
 * Enhanced error class for SDK operations
 */
export class DefindexSDKError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: string = 'UnknownError',
    details?: any
  ) {
    super(message);
    this.name = 'DefindexSDKError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }

  /**
   * Create SDK error from API error response
   */
  static fromApiError(apiError: ApiError): DefindexSDKError {
    return new DefindexSDKError(
      apiError.message,
      apiError.statusCode,
      apiError.error,
      'details' in apiError ? apiError.details : undefined
    );
  }
}