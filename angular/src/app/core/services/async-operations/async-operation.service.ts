import { Injectable, signal, computed } from '@angular/core';
import { Observable, from, throwError, timer, firstValueFrom, lastValueFrom } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';

export interface AsyncOperation<T = any> {
  id: string;
  name: string;
  operation: () => Promise<T> | Observable<T>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: T;
  error?: any;
  startTime?: number;
  endTime?: number;
  retryCount: number;
  maxRetries: number;
  timeout?: number;
}

export interface AsyncOperationSettings {
  defaultTimeout: number;
  defaultMaxRetries: number;
  enableRetry: boolean;
  retryDelay: number;
  enableTimeout: boolean;
  enableCancellation: boolean;
}

/**
 * AsyncOperationService - 異步操作服務
 * 使用 Angular Signals 統一管理異步操作
 * 遵循單一職責原則：只負責異步操作管理
 */
@Injectable({
  providedIn: 'root'
})
export class AsyncOperationService {
  // State signals
  private readonly _operations = signal<Map<string, AsyncOperation>>(new Map());
  private readonly _settings = signal<AsyncOperationSettings>({
    defaultTimeout: 30000, // 30 seconds
    defaultMaxRetries: 3,
    enableRetry: true,
    retryDelay: 1000,
    enableTimeout: true,
    enableCancellation: true
  });

  // Public readonly signals
  readonly operations = this._operations.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasOperations = computed(() => this._operations().size > 0);
  readonly runningOperations = computed(() => 
    Array.from(this._operations().values()).filter(op => op.status === 'running')
  );
  readonly completedOperations = computed(() => 
    Array.from(this._operations().values()).filter(op => op.status === 'completed')
  );
  readonly failedOperations = computed(() => 
    Array.from(this._operations().values()).filter(op => op.status === 'failed')
  );

  /**
   * Execute an async operation
   */
  async execute<T>(
    name: string,
    operation: () => Promise<T> | Observable<T>,
    options: Partial<AsyncOperationSettings> = {}
  ): Promise<T> {
    const operationId = this.generateId();
    const settings = { ...this._settings(), ...options };
    
    const asyncOp: AsyncOperation<T> = {
      id: operationId,
      name,
      operation,
      status: 'pending',
      retryCount: 0,
      maxRetries: settings.defaultMaxRetries,
      timeout: settings.defaultTimeout
    };

    this._operations.update(ops => {
      const newOps = new Map(ops);
      newOps.set(operationId, asyncOp);
      return newOps;
    });

    try {
      return await this.runOperation(asyncOp, settings);
    } finally {
      this.removeOperation(operationId);
    }
  }

  /**
   * Execute multiple operations in parallel
   */
  async executeParallel<T>(
    operations: Array<{ name: string; operation: () => Promise<T> | Observable<T> }>,
    options: Partial<AsyncOperationSettings> = {}
  ): Promise<T[]> {
    const promises = operations.map(({ name, operation }) => 
      this.execute(name, operation, options)
    );
    
    return Promise.all(promises);
  }

  /**
   * Execute multiple operations sequentially
   */
  async executeSequential<T>(
    operations: Array<{ name: string; operation: () => Promise<T> | Observable<T> }>,
    options: Partial<AsyncOperationSettings> = {}
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (const { name, operation } of operations) {
      const result = await this.execute(name, operation, options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Cancel an operation
   */
  cancelOperation(operationId: string): boolean {
    const operation = this._operations().get(operationId);
    if (!operation || operation.status !== 'running') {
      return false;
    }

    this._operations.update(ops => {
      const newOps = new Map(ops);
      const updatedOp = { ...operation, status: 'cancelled' as const };
      newOps.set(operationId, updatedOp);
      return newOps;
    });

    return true;
  }

  /**
   * Get operation by ID
   */
  getOperation(operationId: string): AsyncOperation | undefined {
    return this._operations().get(operationId);
  }

  /**
   * Get operations by name
   */
  getOperationsByName(name: string): AsyncOperation[] {
    return Array.from(this._operations().values())
      .filter(op => op.name === name);
  }

  /**
   * Get operations by status
   */
  getOperationsByStatus(status: AsyncOperation['status']): AsyncOperation[] {
    return Array.from(this._operations().values())
      .filter(op => op.status === status);
  }

  /**
   * Clear completed operations
   */
  clearCompleted(): void {
    this._operations.update(ops => {
      const newOps = new Map();
      ops.forEach((op, id) => {
        if (op.status !== 'completed') {
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
    this._operations.set(new Map());
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<AsyncOperationSettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  /**
   * Get operation statistics
   */
  getOperationStatistics() {
    const operations = Array.from(this._operations().values());
    
    const stats = {
      total: operations.length,
      pending: operations.filter(op => op.status === 'pending').length,
      running: operations.filter(op => op.status === 'running').length,
      completed: operations.filter(op => op.status === 'completed').length,
      failed: operations.filter(op => op.status === 'failed').length,
      cancelled: operations.filter(op => op.status === 'cancelled').length,
      averageExecutionTime: this.calculateAverageExecutionTime(operations),
      successRate: this.calculateSuccessRate(operations)
    };

    return stats;
  }

  // Private methods
  private async runOperation<T>(
    operation: AsyncOperation<T>,
    settings: AsyncOperationSettings
  ): Promise<T> {
    this.updateOperationStatus(operation.id, 'running');
    operation.startTime = Date.now();

    try {
      let observable: Observable<T>;
      
      // Convert Promise to Observable if needed
      const operationResult = operation.operation();
      if (operationResult instanceof Promise) {
        observable = from(operationResult);
      } else {
        observable = operationResult;
      }

      // Apply timeout if enabled
      if (settings.enableTimeout && operation.timeout) {
        observable = observable.pipe(
          timeout(operation.timeout)
        );
      }

      // Apply retry if enabled
      if (settings.enableRetry && operation.retryCount < operation.maxRetries) {
        observable = observable.pipe(
          retry({
            count: operation.maxRetries,
            delay: settings.retryDelay
          })
        );
      }

      // Execute the operation
      const result = await firstValueFrom(observable);
      
      operation.endTime = Date.now();
      operation.result = result;
      this.updateOperationStatus(operation.id, 'completed');
      
      return result;
    } catch (error) {
      operation.endTime = Date.now();
      operation.error = error;
      operation.retryCount++;
      
      if (operation.retryCount < operation.maxRetries && settings.enableRetry) {
        // Retry the operation
        await this.delay(settings.retryDelay);
        return this.runOperation(operation, settings);
      } else {
        this.updateOperationStatus(operation.id, 'failed');
        throw error;
      }
    }
  }

  private updateOperationStatus(operationId: string, status: AsyncOperation['status']): void {
    this._operations.update(ops => {
      const newOps = new Map(ops);
      const operation = newOps.get(operationId);
      if (operation) {
        newOps.set(operationId, { ...operation, status });
      }
      return newOps;
    });
  }

  private removeOperation(operationId: string): void {
    this._operations.update(ops => {
      const newOps = new Map(ops);
      newOps.delete(operationId);
      return newOps;
    });
  }

  private generateId(): string {
    return `async-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateAverageExecutionTime(operations: AsyncOperation[]): number {
    const completedOps = operations.filter(op => 
      op.status === 'completed' && op.startTime && op.endTime
    );
    
    if (completedOps.length === 0) return 0;
    
    const totalTime = completedOps.reduce((sum, op) => 
      sum + (op.endTime! - op.startTime!), 0
    );
    
    return Math.round(totalTime / completedOps.length);
  }

  private calculateSuccessRate(operations: AsyncOperation[]): number {
    if (operations.length === 0) return 0;
    
    const successfulOps = operations.filter(op => op.status === 'completed').length;
    return Math.round((successfulOps / operations.length) * 100);
  }
}
