import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from './error-notification.service';
import { ErrorLoggingService } from './error-logging.service';
import { ErrorRecoveryService } from './error-recovery.service';

export interface ErrorContext {
  component?: string;
  action?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  name: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'authorization' | 'system' | 'unknown';
}

/**
 * GlobalErrorHandler - 全局錯誤處理器
 * 捕獲和處理應用程序中的所有未處理錯誤
 * 遵循單一職責原則：只負責全局錯誤處理
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private readonly errorNotificationService: ErrorNotificationService,
    private readonly errorLoggingService: ErrorLoggingService,
    private readonly errorRecoveryService: ErrorRecoveryService,
    private readonly ngZone: NgZone
  ) {}

  handleError(error: any): void {
    // Ensure error handling runs inside Angular zone
    this.ngZone.run(() => {
      const errorDetails = this.processError(error);
      
      // Log the error
      this.errorLoggingService.logError(errorDetails);
      
      // Show user-friendly notification
      this.errorNotificationService.showErrorNotification(errorDetails);
      
      // Attempt error recovery
      this.errorRecoveryService.attemptRecovery(errorDetails);
      
      // Log to console in development
      if (this.isDevelopmentMode()) {
        console.error('Global Error Handler:', errorDetails);
      }
    });
  }

  private processError(error: any): ErrorDetails {
    const context = this.createErrorContext();
    
    if (error instanceof HttpErrorResponse) {
      return this.processHttpError(error, context);
    }
    
    if (error instanceof Error) {
      return this.processJavaScriptError(error, context);
    }
    
    return this.processUnknownError(error, context);
  }

  private processHttpError(error: HttpErrorResponse, context: ErrorContext): ErrorDetails {
    let message: string;
    let severity: ErrorDetails['severity'];
    let category: ErrorDetails['category'];

    switch (error.status) {
      case 400:
        message = '請求參數錯誤，請檢查輸入內容';
        severity = 'medium';
        category = 'validation';
        break;
      case 401:
        message = '身份驗證失敗，請重新登入';
        severity = 'high';
        category = 'authentication';
        break;
      case 403:
        message = '權限不足，無法執行此操作';
        severity = 'high';
        category = 'authorization';
        break;
      case 404:
        message = '請求的資源不存在';
        severity = 'medium';
        category = 'network';
        break;
      case 500:
        message = '服務器內部錯誤，請稍後重試';
        severity = 'critical';
        category = 'system';
        break;
      case 503:
        message = '服務暫時不可用，請稍後重試';
        severity = 'high';
        category = 'system';
        break;
      default:
        message = `網路錯誤 (${error.status}): ${error.message}`;
        severity = 'medium';
        category = 'network';
    }

    return {
      message,
      stack: error.error?.stack || error.message,
      name: error.name || 'HttpError',
      context,
      severity,
      category
    };
  }

  private processJavaScriptError(error: Error, context: ErrorContext): ErrorDetails {
    let severity: ErrorDetails['severity'];
    let category: ErrorDetails['category'];

    // Determine severity based on error type
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      severity = 'high';
      category = 'system';
    } else if (error.name === 'SyntaxError') {
      severity = 'critical';
      category = 'system';
    } else {
      severity = 'medium';
      category = 'unknown';
    }

    return {
      message: error.message || '發生未知錯誤',
      stack: error.stack,
      name: error.name,
      context,
      severity,
      category
    };
  }

  private processUnknownError(error: any, context: ErrorContext): ErrorDetails {
    return {
      message: '發生未知錯誤',
      stack: error?.stack,
      name: 'UnknownError',
      context,
      severity: 'medium',
      category: 'unknown'
    };
  }

  private createErrorContext(): ErrorContext {
    return {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // TODO: Get current user ID from auth service
    return undefined;
  }

  private isDevelopmentMode(): boolean {
    return !environment.production;
  }
}

// Placeholder for environment
const environment = {
  production: false
};
