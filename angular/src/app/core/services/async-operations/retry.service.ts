import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { retry, retryWhen, delay, take, concatMap } from 'rxjs/operators';

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface RetryAttempt {
  id: string;
  operationId: string;
  attempt: number;
  timestamp: number;
  error: any;
  success: boolean;
  duration: number;
}

export interface RetrySettings {
  defaultMaxAttempts: number;
  defaultDelay: number;
  defaultBackoffMultiplier: number;
  defaultMaxDelay: number;
  enableExponentialBackoff: boolean;
  enableJitter: boolean;
  logRetryAttempts: boolean;
}

/**
 * RetryService - 重試服務
 * 負責處理異步操作的重試邏輯
 * 遵循單一職責原則：只負責重試邏輯管理
 */
@Injectable({
  providedIn: 'root'
})
export class RetryService {
  // State signals
  private readonly _retryAttempts = signal<RetryAttempt[]>([]);
  private readonly _settings = signal<RetrySettings>({
    defaultMaxAttempts: 3,
    defaultDelay: 1000,
    defaultBackoffMultiplier: 2,
    defaultMaxDelay: 30000,
    enableExponentialBackoff: true,
    enableJitter: true,
    logRetryAttempts: true
  });

  // Public readonly signals
  readonly retryAttempts = this._retryAttempts.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasRetryAttempts = computed(() => this._retryAttempts().length > 0);
  readonly successfulRetries = computed(() => 
    this._retryAttempts().filter(attempt => attempt.success)
  );
  readonly failedRetries = computed(() => 
    this._retryAttempts().filter(attempt => !attempt.success)
  );
  readonly retrySuccessRate = computed(() => {
    const attempts = this._retryAttempts();
    if (attempts.length === 0) return 0;
    const successful = attempts.filter(a => a.success).length;
    return Math.round((successful / attempts.length) * 100);
  });

  /**
   * Retry an operation with custom configuration
   */
  retryOperation<T>(
    operation: () => Observable<T>,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const retryConfig = this.mergeConfig(config);
    const operationId = this.generateId();

    return operation().pipe(
      retryWhen(errors => 
        errors.pipe(
          concatMap((error, index) => {
            const attempt = index + 1;
            
            // Record retry attempt
            this.recordRetryAttempt({
              id: this.generateId(),
              operationId,
              attempt,
              timestamp: Date.now(),
              error,
              success: false,
              duration: 0
            });

            // Check if we should retry
            if (attempt >= retryConfig.maxAttempts) {
              return throwError(error);
            }

            // Check retry condition
            if (retryConfig.retryCondition && !retryConfig.retryCondition(error)) {
              return throwError(error);
            }

            // Call onRetry callback
            if (retryConfig.onRetry) {
              retryConfig.onRetry(attempt, error);
            }

            // Calculate delay
            const delay = this.calculateDelay(attempt, retryConfig);
            
            return timer(delay);
          })
        )
      )
    );
  }

  /**
   * Retry with exponential backoff
   */
  retryWithExponentialBackoff<T>(
    operation: () => Observable<T>,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const retryConfig = {
      ...this.mergeConfig(config),
      enableExponentialBackoff: true
    };

    return this.retryOperation(operation, retryConfig);
  }

  /**
   * Retry with fixed delay
   */
  retryWithFixedDelay<T>(
    operation: () => Observable<T>,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const retryConfig = {
      ...this.mergeConfig(config),
      enableExponentialBackoff: false
    };

    return this.retryOperation(operation, retryConfig);
  }

  /**
   * Retry with custom condition
   */
  retryWithCondition<T>(
    operation: () => Observable<T>,
    condition: (error: any) => boolean,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const retryConfig = {
      ...this.mergeConfig(config),
      retryCondition: condition
    };

    return this.retryOperation(operation, retryConfig);
  }

  /**
   * Retry network operations
   */
  retryNetworkOperation<T>(
    operation: () => Observable<T>,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const retryConfig = {
      ...this.mergeConfig(config),
      retryCondition: (error: any) => {
        // Retry on network errors
        return error.status >= 500 || error.status === 0 || !error.status;
      }
    };

    return this.retryOperation(operation, retryConfig);
  }

  /**
   * Retry authentication operations
   */
  retryAuthOperation<T>(
    operation: () => Observable<T>,
    config: Partial<RetryConfig> = {}
  ): Observable<T> {
    const retryConfig = {
      ...this.mergeConfig(config),
      retryCondition: (error: any) => {
        // Retry on authentication errors
        return error.status === 401 || error.status === 403;
      }
    };

    return this.retryOperation(operation, retryConfig);
  }

  /**
   * Get retry statistics
   */
  getRetryStatistics() {
    const attempts = this._retryAttempts();
    
    const stats = {
      totalAttempts: attempts.length,
      successfulAttempts: attempts.filter(a => a.success).length,
      failedAttempts: attempts.filter(a => !a.success).length,
      successRate: this.retrySuccessRate(),
      averageRetryTime: this.calculateAverageRetryTime(attempts),
      retriesByOperation: this.groupRetriesByOperation(attempts),
      retriesByError: this.groupRetriesByError(attempts)
    };

    return stats;
  }

  /**
   * Clear retry history
   */
  clearRetryHistory(): void {
    this._retryAttempts.set([]);
  }

  /**
   * Update retry settings
   */
  updateSettings(settings: Partial<RetrySettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  // Private methods
  private mergeConfig(config: Partial<RetryConfig>): RetryConfig {
    const settings = this._settings();
    
    return {
      maxAttempts: config.maxAttempts ?? settings.defaultMaxAttempts,
      delay: config.delay ?? settings.defaultDelay,
      backoffMultiplier: config.backoffMultiplier ?? settings.defaultBackoffMultiplier,
      maxDelay: config.maxDelay ?? settings.defaultMaxDelay,
      retryCondition: config.retryCondition,
      onRetry: config.onRetry
    };
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.delay;

    // Apply exponential backoff if enabled
    if (this._settings().enableExponentialBackoff) {
      delay = delay * Math.pow(config.backoffMultiplier, attempt - 1);
    }

    // Apply jitter if enabled
    if (this._settings().enableJitter) {
      delay = delay + (Math.random() * delay * 0.1);
    }

    // Cap at max delay
    return Math.min(delay, config.maxDelay);
  }

  private recordRetryAttempt(attempt: RetryAttempt): void {
    if (this._settings().logRetryAttempts) {
      this._retryAttempts.update(attempts => [...attempts, attempt]);
    }
  }

  private generateId(): string {
    return `retry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageRetryTime(attempts: RetryAttempt[]): number {
    if (attempts.length === 0) return 0;
    
    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.duration, 0);
    return Math.round(totalTime / attempts.length);
  }

  private groupRetriesByOperation(attempts: RetryAttempt[]): Record<string, number> {
    return attempts.reduce((acc, attempt) => {
      acc[attempt.operationId] = (acc[attempt.operationId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupRetriesByError(attempts: RetryAttempt[]): Record<string, number> {
    return attempts.reduce((acc, attempt) => {
      const errorType = attempt.error?.name || 'Unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
