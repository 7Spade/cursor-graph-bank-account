import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

export interface TimeoutConfig {
  timeout: number;
  timeoutMessage?: string;
  onTimeout?: () => void;
}

export interface TimeoutOperation {
  id: string;
  name: string;
  timeout: number;
  startTime: number;
  endTime?: number;
  completed: boolean;
  timedOut: boolean;
  duration?: number;
}

export interface TimeoutSettings {
  defaultTimeout: number;
  enableTimeout: boolean;
  timeoutWarningThreshold: number;
  logTimeoutOperations: boolean;
  enableTimeoutRecovery: boolean;
}

/**
 * TimeoutService - 超時服務
 * 負責處理異步操作的超時邏輯
 * 遵循單一職責原則：只負責超時邏輯管理
 */
@Injectable({
  providedIn: 'root'
})
export class TimeoutService {
  // State signals
  private readonly _timeoutOperations = signal<Map<string, TimeoutOperation>>(new Map());
  private readonly _settings = signal<TimeoutSettings>({
    defaultTimeout: 30000, // 30 seconds
    enableTimeout: true,
    timeoutWarningThreshold: 5000, // 5 seconds
    logTimeoutOperations: true,
    enableTimeoutRecovery: true
  });

  // Public readonly signals
  readonly timeoutOperations = this._timeoutOperations.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasTimeoutOperations = computed(() => this._timeoutOperations().size > 0);
  readonly activeOperations = computed(() => 
    Array.from(this._timeoutOperations().values()).filter(op => !op.completed)
  );
  readonly timedOutOperations = computed(() => 
    Array.from(this._timeoutOperations().values()).filter(op => op.timedOut)
  );
  readonly completedOperations = computed(() => 
    Array.from(this._timeoutOperations().values()).filter(op => op.completed && !op.timedOut)
  );

  /**
   * Execute an operation with timeout
   */
  executeWithTimeout<T>(
    name: string,
    operation: () => Observable<T>,
    config: Partial<TimeoutConfig> = {}
  ): Observable<T> {
    const timeoutConfig = this.mergeConfig(config);
    const operationId = this.generateId();
    
    const timeoutOp: TimeoutOperation = {
      id: operationId,
      name,
      timeout: timeoutConfig.timeout,
      startTime: Date.now(),
      completed: false,
      timedOut: false
    };

    this._timeoutOperations.update(ops => {
      const newOps = new Map(ops);
      newOps.set(operationId, timeoutOp);
      return newOps;
    });

    return operation().pipe(
      timeout(timeoutConfig.timeout),
      catchError(error => {
        // Check if it's a timeout error
        if (error.name === 'TimeoutError') {
          this.handleTimeout(operationId, timeoutConfig);
          return throwError(new Error(timeoutConfig.timeoutMessage || `操作 "${name}" 超時`));
        }
        return throwError(error);
      })
    );
  }

  /**
   * Execute with custom timeout
   */
  executeWithCustomTimeout<T>(
    name: string,
    operation: () => Observable<T>,
    timeoutMs: number,
    timeoutMessage?: string
  ): Observable<T> {
    return this.executeWithTimeout(name, operation, {
      timeout: timeoutMs,
      timeoutMessage
    });
  }

  /**
   * Execute with warning threshold
   */
  executeWithWarning<T>(
    name: string,
    operation: () => Observable<T>,
    config: Partial<TimeoutConfig> = {}
  ): Observable<T> {
    const timeoutConfig = this.mergeConfig(config);
    const operationId = this.generateId();
    
    const timeoutOp: TimeoutOperation = {
      id: operationId,
      name,
      timeout: timeoutConfig.timeout,
      startTime: Date.now(),
      completed: false,
      timedOut: false
    };

    this._timeoutOperations.update(ops => {
      const newOps = new Map(ops);
      newOps.set(operationId, timeoutOp);
      return newOps;
    });

    // Set up warning timer
    const warningThreshold = this._settings().timeoutWarningThreshold;
    if (warningThreshold > 0 && warningThreshold < timeoutConfig.timeout) {
      setTimeout(() => {
        this.handleTimeoutWarning(operationId);
      }, warningThreshold);
    }

    return operation().pipe(
      timeout(timeoutConfig.timeout),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          this.handleTimeout(operationId, timeoutConfig);
          return throwError(new Error(timeoutConfig.timeoutMessage || `操作 "${name}" 超時`));
        }
        return throwError(error);
      })
    );
  }

  /**
   * Cancel a timeout operation
   */
  cancelOperation(operationId: string): boolean {
    const operation = this._timeoutOperations().get(operationId);
    if (!operation || operation.completed) {
      return false;
    }

    this._timeoutOperations.update(ops => {
      const newOps = new Map(ops);
      const updatedOp = { 
        ...operation, 
        completed: true, 
        endTime: Date.now(),
        duration: Date.now() - operation.startTime
      };
      newOps.set(operationId, updatedOp);
      return newOps;
    });

    return true;
  }

  /**
   * Get operation by ID
   */
  getOperation(operationId: string): TimeoutOperation | undefined {
    return this._timeoutOperations().get(operationId);
  }

  /**
   * Get operations by name
   */
  getOperationsByName(name: string): TimeoutOperation[] {
    return Array.from(this._timeoutOperations().values())
      .filter(op => op.name === name);
  }

  /**
   * Get timeout statistics
   */
  getTimeoutStatistics() {
    const operations = Array.from(this._timeoutOperations().values());
    
    const stats = {
      totalOperations: operations.length,
      completedOperations: operations.filter(op => op.completed && !op.timedOut).length,
      timedOutOperations: operations.filter(op => op.timedOut).length,
      activeOperations: operations.filter(op => !op.completed).length,
      averageExecutionTime: this.calculateAverageExecutionTime(operations),
      timeoutRate: this.calculateTimeoutRate(operations),
      operationsByTimeout: this.groupOperationsByTimeout(operations)
    };

    return stats;
  }

  /**
   * Clear completed operations
   */
  clearCompleted(): void {
    this._timeoutOperations.update(ops => {
      const newOps = new Map();
      ops.forEach((op, id) => {
        if (!op.completed) {
          newOps.set(id, op);
        }
      });
      return newOps;
    });
  }

  /**
   * Clear all operations
   */
  clearAll(): void {
    this._timeoutOperations.set(new Map());
  }

  /**
   * Update timeout settings
   */
  updateSettings(settings: Partial<TimeoutSettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  // Private methods
  private mergeConfig(config: Partial<TimeoutConfig>): TimeoutConfig {
    const settings = this._settings();
    
    return {
      timeout: config.timeout ?? settings.defaultTimeout,
      timeoutMessage: config.timeoutMessage,
      onTimeout: config.onTimeout
    };
  }

  private handleTimeout(operationId: string, config: TimeoutConfig): void {
    this._timeoutOperations.update(ops => {
      const newOps = new Map(ops);
      const operation = newOps.get(operationId);
      if (operation) {
        const updatedOp = {
          ...operation,
          completed: true,
          timedOut: true,
          endTime: Date.now(),
          duration: Date.now() - operation.startTime
        };
        newOps.set(operationId, updatedOp);
      }
      return newOps;
    });

    // Call timeout callback
    if (config.onTimeout) {
      config.onTimeout();
    }

    // Log timeout if enabled
    if (this._settings().logTimeoutOperations) {
      console.warn(`Operation "${operationId}" timed out after ${config.timeout}ms`);
    }
  }

  private handleTimeoutWarning(operationId: string): void {
    const operation = this._timeoutOperations().get(operationId);
    if (operation && !operation.completed) {
      console.warn(`Operation "${operation.name}" is taking longer than expected`);
    }
  }

  private generateId(): string {
    return `timeout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageExecutionTime(operations: TimeoutOperation[]): number {
    const completedOps = operations.filter(op => 
      op.completed && op.duration !== undefined
    );
    
    if (completedOps.length === 0) return 0;
    
    const totalTime = completedOps.reduce((sum, op) => sum + op.duration!, 0);
    return Math.round(totalTime / completedOps.length);
  }

  private calculateTimeoutRate(operations: TimeoutOperation[]): number {
    if (operations.length === 0) return 0;
    
    const timedOutOps = operations.filter(op => op.timedOut).length;
    return Math.round((timedOutOps / operations.length) * 100);
  }

  private groupOperationsByTimeout(operations: TimeoutOperation[]): Record<string, number> {
    return operations.reduce((acc, op) => {
      const timeoutKey = `${op.timeout}ms`;
      acc[timeoutKey] = (acc[timeoutKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
