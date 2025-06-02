import { AxiosError } from 'axios';

/**
 * Error categories for the application
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  API = 'API',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  WEBSOCKET = 'WEBSOCKET',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Interface for standardized error objects
 */
export interface IAppError {
  // Unique error code
  code: string;
  // Human-readable error message
  message: string;
  // Technical details (for developers)
  details?: string;
  // Error category
  category: ErrorCategory;
  // Original error object
  originalError?: Error | unknown;
  // Timestamp when the error occurred
  timestamp: Date;
}

/**
 * Centralized error handling service for the application
 */
class ErrorService {
  private readonly logLevels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };

  private logLevel = this.logLevels.ERROR;

  /**
   * Set the log level for the error service
   * @param level - Log level to set
   */
  setLogLevel(level: keyof typeof ErrorService.prototype.logLevels): void {
    this.logLevel = this.logLevels[level];
  }

  /**
   * Create a standardized error object
   * @param message - Human-readable error message
   * @param category - Error category
   * @param originalError - Original error object
   * @param details - Technical details
   * @returns Standardized error object
   */
  createError(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    originalError?: Error | unknown,
    details?: string
  ): IAppError {
    // Generate a unique error code based on category and timestamp
    const timestamp = new Date();
    const code = `${category}-${timestamp.getTime()}`;

    return {
      code,
      message,
      details,
      category,
      originalError,
      timestamp
    };
  }

  /**
   * Handle API errors (from Axios)
   * @param error - Axios error object
   * @returns Standardized error object
   */
  handleApiError(error: AxiosError): IAppError {
    let message = 'An error occurred while communicating with the server';
    let category = ErrorCategory.API;
    let details = '';

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      
      if (status === 401 || status === 403) {
        category = ErrorCategory.AUTH;
        message = 'Authentication error. Please log in again.';
      } else if (status === 404) {
        message = 'The requested resource was not found';
      } else if (status >= 400 && status < 500) {
        message = 'There was a problem with the request';
      } else if (status >= 500) {
        message = 'Server error. Please try again later';
      }
      
      details = `Status: ${status}, Response: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // The request was made but no response was received
      category = ErrorCategory.NETWORK;
      message = 'No response received from the server. Please check your connection';
      details = 'Request was sent but no response was received';
    } else {
      // Something happened in setting up the request that triggered an Error
      details = error.message;
    }

    const appError = this.createError(message, category, error, details);
    this.logError(appError);
    return appError;
  }

  /**
   * Handle WebSocket errors
   * @param error - WebSocket error
   * @param context - Additional context information
   * @returns Standardized error object
   */
  handleWebSocketError(error: Error | unknown, context?: string): IAppError {
    const message = 'WebSocket connection error';
    const details = context ? `Context: ${context}, Error: ${error}` : `Error: ${error}`;
    
    const appError = this.createError(message, ErrorCategory.WEBSOCKET, error, details);
    this.logError(appError);
    return appError;
  }

  /**
   * Handle validation errors
   * @param message - Validation error message
   * @param details - Validation details
   * @returns Standardized error object
   */
  handleValidationError(message: string, details?: string): IAppError {
    const appError = this.createError(message, ErrorCategory.VALIDATION, null, details);
    this.logError(appError);
    return appError;
  }

  /**
   * Handle generic errors
   * @param error - Error object or message
   * @param category - Error category
   * @returns Standardized error object
   */
  handleError(error: Error | string | unknown, category: ErrorCategory = ErrorCategory.UNKNOWN): IAppError {
    let message: string;
    let originalError: unknown;

    if (error instanceof Error) {
      message = error.message;
      originalError = error;
    } else if (typeof error === 'string') {
      message = error;
      originalError = new Error(error);
    } else {
      message = 'An unknown error occurred';
      originalError = error;
    }

    const appError = this.createError(message, category, originalError);
    this.logError(appError);
    return appError;
  }

  /**
   * Log an error to the console
   * @param error - Error to log
   * @param level - Log level
   */
  logError(error: IAppError, level: keyof typeof ErrorService.prototype.logLevels = 'ERROR'): void {
    const logLevel = this.logLevels[level];
    
    if (logLevel >= this.logLevel) {
      const logMessage = `[${error.category}] ${error.code}: ${error.message}`;
      
      switch (level) {
        case 'DEBUG':
          console.debug(logMessage, { details: error.details, originalError: error.originalError });
          break;
        case 'INFO':
          console.info(logMessage, { details: error.details });
          break;
        case 'WARN':
          console.warn(logMessage, { details: error.details, originalError: error.originalError });
          break;
        case 'ERROR':
          console.error(logMessage, { details: error.details, originalError: error.originalError });
          break;
        case 'FATAL':
          console.error(`FATAL: ${logMessage}`, { details: error.details, originalError: error.originalError });
          break;
      }
    }
  }

  /**
   * Get a user-friendly error message
   * @param error - Error object
   * @returns User-friendly error message
   */
  getUserFriendlyMessage(error: IAppError | Error | string | unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (this.isAppError(error)) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again later.';
  }

  /**
   * Check if an object is an IAppError
   * @param obj - Object to check
   * @returns True if the object is an IAppError
   */
  private isAppError(obj: unknown): obj is IAppError {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'code' in obj &&
      'message' in obj &&
      'category' in obj
    );
  }
}

// Export a singleton instance
export default new ErrorService();