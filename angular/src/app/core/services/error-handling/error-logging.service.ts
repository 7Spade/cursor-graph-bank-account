import { Injectable, signal, computed } from '@angular/core';
import { ErrorDetails } from './global-error-handler.service';

export interface ErrorLog {
  id: string;
  error: ErrorDetails;
  timestamp: number;
  resolved: boolean;
  resolution?: string;
  tags: string[];
}

export interface ErrorLogSettings {
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogs: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  enableLocalStorage: boolean;
  enableConsoleLogging: boolean;
}

export interface ErrorStatistics {
  totalErrors: number;
  errorsBySeverity: Record<string, number>;
  errorsByCategory: Record<string, number>;
  errorsByComponent: Record<string, number>;
  recentErrors: ErrorLog[];
  errorTrends: Array<{ date: string; count: number }>;
}

/**
 * ErrorLoggingService - 錯誤日誌服務
 * 負責記錄和管理應用程序錯誤日誌
 * 遵循單一職責原則：只負責錯誤日誌管理
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService {
  // State signals
  private readonly _logs = signal<ErrorLog[]>([]);
  private readonly _settings = signal<ErrorLogSettings>({
    enableLogging: true,
    logLevel: 'error',
    maxLogs: 1000,
    enableRemoteLogging: false,
    enableLocalStorage: true,
    enableConsoleLogging: true
  });

  // Public readonly signals
  readonly logs = this._logs.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasLogs = computed(() => this._logs().length > 0);
  readonly unresolvedErrors = computed(() => 
    this._logs().filter(log => !log.resolved)
  );
  readonly criticalErrors = computed(() => 
    this._logs().filter(log => log.error.severity === 'critical')
  );
  readonly recentErrors = computed(() => 
    this._logs()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
  );

  /**
   * Log an error
   */
  logError(errorDetails: ErrorDetails, tags: string[] = []): void {
    if (!this._settings().enableLogging) {
      return;
    }

    const errorLog: ErrorLog = {
      id: this.generateId(),
      error: errorDetails,
      timestamp: Date.now(),
      resolved: false,
      tags: [...tags, errorDetails.category, errorDetails.severity]
    };

    this._logs.update(logs => {
      const newLogs = [...logs, errorLog];
      
      // Limit logs based on settings
      const maxLogs = this._settings().maxLogs;
      if (newLogs.length > maxLogs) {
        return newLogs.slice(-maxLogs);
      }
      
      return newLogs;
    });

    // Log to console if enabled
    if (this._settings().enableConsoleLogging) {
      this.logToConsole(errorLog);
    }

    // Log to localStorage if enabled
    if (this._settings().enableLocalStorage) {
      this.logToLocalStorage(errorLog);
    }

    // Log to remote endpoint if enabled
    if (this._settings().enableRemoteLogging && this._settings().remoteEndpoint) {
      this.logToRemote(errorLog);
    }
  }

  /**
   * Mark an error as resolved
   */
  markAsResolved(logId: string, resolution?: string): void {
    this._logs.update(logs =>
      logs.map(log => 
        log.id === logId 
          ? { ...log, resolved: true, resolution }
          : log
      )
    );
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): ErrorStatistics {
    const logs = this._logs();
    
    const errorsBySeverity = logs.reduce((acc, log) => {
      acc[log.error.severity] = (acc[log.error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByCategory = logs.reduce((acc, log) => {
      acc[log.error.category] = (acc[log.error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByComponent = logs.reduce((acc, log) => {
      const component = log.error.context.component || 'unknown';
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorTrends = this.calculateErrorTrends(logs);

    return {
      totalErrors: logs.length,
      errorsBySeverity,
      errorsByCategory,
      errorsByComponent,
      recentErrors: this.recentErrors(),
      errorTrends
    };
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: ErrorDetails['severity']): ErrorLog[] {
    return this._logs().filter(log => log.error.severity === severity);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: ErrorDetails['category']): ErrorLog[] {
    return this._logs().filter(log => log.error.category === category);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): ErrorLog[] {
    return this._logs().filter(log => log.error.context.component === component);
  }

  /**
   * Search logs
   */
  searchLogs(query: string): ErrorLog[] {
    const lowercaseQuery = query.toLowerCase();
    return this._logs().filter(log => 
      log.error.message.toLowerCase().includes(lowercaseQuery) ||
      log.error.name.toLowerCase().includes(lowercaseQuery) ||
      log.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Clear all logs
   */
  clearAllLogs(): void {
    this._logs.set([]);
    if (this._settings().enableLocalStorage) {
      localStorage.removeItem('error-logs');
    }
  }

  /**
   * Clear resolved logs
   */
  clearResolvedLogs(): void {
    this._logs.update(logs => logs.filter(log => !log.resolved));
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    return JSON.stringify(this._logs(), null, 2);
  }

  /**
   * Import logs
   */
  importLogs(logsJson: string): void {
    try {
      const logs = JSON.parse(logsJson) as ErrorLog[];
      this._logs.set(logs);
    } catch (error) {
      console.error('Failed to import logs:', error);
    }
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<ErrorLogSettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  // Private methods
  private generateId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logToConsole(errorLog: ErrorLog): void {
    const logLevel = this._settings().logLevel;
    const message = `[${errorLog.error.severity.toUpperCase()}] ${errorLog.error.message}`;
    
    switch (logLevel) {
      case 'debug':
        console.debug(message, errorLog);
        break;
      case 'info':
        console.info(message, errorLog);
        break;
      case 'warn':
        console.warn(message, errorLog);
        break;
      case 'error':
        console.error(message, errorLog);
        break;
    }
  }

  private logToLocalStorage(errorLog: ErrorLog): void {
    try {
      const existingLogs = this.getLogsFromLocalStorage();
      const updatedLogs = [...existingLogs, errorLog];
      
      // Limit localStorage logs
      const maxLogs = this._settings().maxLogs;
      const limitedLogs = updatedLogs.slice(-maxLogs);
      
      localStorage.setItem('error-logs', JSON.stringify(limitedLogs));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  private getLogsFromLocalStorage(): ErrorLog[] {
    try {
      const logsJson = localStorage.getItem('error-logs');
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error);
      return [];
    }
  }

  private async logToRemote(errorLog: ErrorLog): Promise<void> {
    try {
      const response = await fetch(this._settings().remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog)
      });

      if (!response.ok) {
        throw new Error(`Remote logging failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to log to remote endpoint:', error);
    }
  }

  private calculateErrorTrends(logs: ErrorLog[]): Array<{ date: string; count: number }> {
    const trends: Record<string, number> = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
