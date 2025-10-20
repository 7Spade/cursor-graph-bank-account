import { Injectable, signal, computed } from '@angular/core';
import { ErrorDetails } from './global-error-handler.service';

export interface RecoveryAction {
  id: string;
  name: string;
  description: string;
  action: () => Promise<boolean>;
  priority: number;
  conditions: RecoveryCondition[];
}

export interface RecoveryCondition {
  type: 'severity' | 'category' | 'component' | 'message';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: string;
}

export interface RecoveryAttempt {
  id: string;
  errorId: string;
  actionId: string;
  timestamp: number;
  success: boolean;
  error?: string;
  duration: number;
}

export interface RecoverySettings {
  enableAutoRecovery: boolean;
  maxRecoveryAttempts: number;
  recoveryDelay: number;
  enableUserPrompt: boolean;
  enableFallbackActions: boolean;
}

/**
 * ErrorRecoveryService - 錯誤恢復服務
 * 負責自動或手動恢復應用程序錯誤
 * 遵循單一職責原則：只負責錯誤恢復
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorRecoveryService {
  // State signals
  private readonly _recoveryActions = signal<RecoveryAction[]>([]);
  private readonly _recoveryAttempts = signal<RecoveryAttempt[]>([]);
  private readonly _settings = signal<RecoverySettings>({
    enableAutoRecovery: true,
    maxRecoveryAttempts: 3,
    recoveryDelay: 1000,
    enableUserPrompt: true,
    enableFallbackActions: true
  });

  // Public readonly signals
  readonly recoveryActions = this._recoveryActions.asReadonly();
  readonly recoveryAttempts = this._recoveryAttempts.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasRecoveryActions = computed(() => this._recoveryActions().length > 0);
  readonly successfulRecoveries = computed(() => 
    this._recoveryAttempts().filter(attempt => attempt.success)
  );
  readonly failedRecoveries = computed(() => 
    this._recoveryAttempts().filter(attempt => !attempt.success)
  );

  constructor() {
    this.initializeDefaultRecoveryActions();
  }

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(errorDetails: ErrorDetails): Promise<boolean> {
    if (!this._settings().enableAutoRecovery) {
      return false;
    }

    const applicableActions = this.getApplicableActions(errorDetails);
    
    for (const action of applicableActions) {
      const success = await this.executeRecoveryAction(errorDetails, action);
      if (success) {
        return true;
      }
    }

    return false;
  }

  /**
   * Execute a specific recovery action
   */
  async executeRecoveryAction(errorDetails: ErrorDetails, action: RecoveryAction): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const success = await action.action();
      const duration = Date.now() - startTime;
      
      // Record the attempt
      this.recordRecoveryAttempt({
        id: this.generateId(),
        errorId: this.generateErrorId(errorDetails),
        actionId: action.id,
        timestamp: Date.now(),
        success,
        duration
      });

      return success;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record the failed attempt
      this.recordRecoveryAttempt({
        id: this.generateId(),
        errorId: this.generateErrorId(errorDetails),
        actionId: action.id,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });

      return false;
    }
  }

  /**
   * Add a custom recovery action
   */
  addRecoveryAction(action: RecoveryAction): void {
    this._recoveryActions.update(actions => [...actions, action]);
  }

  /**
   * Remove a recovery action
   */
  removeRecoveryAction(actionId: string): void {
    this._recoveryActions.update(actions => 
      actions.filter(action => action.id !== actionId)
    );
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStatistics() {
    const attempts = this._recoveryAttempts();
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.success).length;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts: totalAttempts - successfulAttempts,
      successRate: Math.round(successRate * 100) / 100,
      averageRecoveryTime: this.calculateAverageRecoveryTime(attempts)
    };
  }

  /**
   * Update recovery settings
   */
  updateSettings(settings: Partial<RecoverySettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  /**
   * Clear recovery history
   */
  clearRecoveryHistory(): void {
    this._recoveryAttempts.set([]);
  }

  // Private methods
  private initializeDefaultRecoveryActions(): void {
    const defaultActions: RecoveryAction[] = [
      {
        id: 'refresh-page',
        name: '刷新頁面',
        description: '重新載入當前頁面',
        action: async () => {
          window.location.reload();
          return true;
        },
        priority: 1,
        conditions: [
          { type: 'severity', operator: 'equals', value: 'critical' },
          { type: 'category', operator: 'equals', value: 'system' }
        ]
      },
      {
        id: 'retry-network',
        name: '重試網路請求',
        description: '重新發送失敗的網路請求',
        action: async () => {
          // TODO: Implement network retry logic
          return false;
        },
        priority: 2,
        conditions: [
          { type: 'category', operator: 'equals', value: 'network' }
        ]
      },
      {
        id: 'clear-cache',
        name: '清除快取',
        description: '清除應用程序快取',
        action: async () => {
          // TODO: Implement cache clearing logic
          return false;
        },
        priority: 3,
        conditions: [
          { type: 'category', operator: 'equals', value: 'system' }
        ]
      },
      {
        id: 'fallback-ui',
        name: '降級UI',
        description: '切換到簡化版本的用戶界面',
        action: async () => {
          // TODO: Implement fallback UI logic
          return false;
        },
        priority: 4,
        conditions: [
          { type: 'severity', operator: 'equals', value: 'high' }
        ]
      }
    ];

    this._recoveryActions.set(defaultActions);
  }

  private getApplicableActions(errorDetails: ErrorDetails): RecoveryAction[] {
    return this._recoveryActions()
      .filter(action => this.matchesConditions(errorDetails, action.conditions))
      .sort((a, b) => a.priority - b.priority);
  }

  private matchesConditions(errorDetails: ErrorDetails, conditions: RecoveryCondition[]): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'severity':
          return this.matchesValue(errorDetails.severity, condition.operator, condition.value);
        case 'category':
          return this.matchesValue(errorDetails.category, condition.operator, condition.value);
        case 'component':
          return this.matchesValue(errorDetails.context.component || '', condition.operator, condition.value);
        case 'message':
          return this.matchesValue(errorDetails.message, condition.operator, condition.value);
        default:
          return false;
      }
    });
  }

  private matchesValue(actual: string, operator: RecoveryCondition['operator'], expected: string): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'contains':
        return actual.includes(expected);
      case 'startsWith':
        return actual.startsWith(expected);
      case 'endsWith':
        return actual.endsWith(expected);
      default:
        return false;
    }
  }

  private recordRecoveryAttempt(attempt: RecoveryAttempt): void {
    this._recoveryAttempts.update(attempts => [...attempts, attempt]);
  }

  private generateId(): string {
    return `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(errorDetails: ErrorDetails): string {
    return `error-${errorDetails.context.timestamp}-${errorDetails.name}`;
  }

  private calculateAverageRecoveryTime(attempts: RecoveryAttempt[]): number {
    if (attempts.length === 0) return 0;
    
    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.duration, 0);
    return Math.round(totalTime / attempts.length);
  }
}
