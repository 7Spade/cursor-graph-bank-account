import { Injectable, signal, computed, inject } from '@angular/core';
import { ErrorDetails } from './global-error-handler.service';
import { LoggerService } from '../logger.service';

export interface ErrorNotification {
  id: string;
  error: ErrorDetails;
  dismissed: boolean;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorNotificationSettings {
  showNotifications: boolean;
  autoDismiss: boolean;
  dismissDelay: number;
  maxNotifications: number;
  showRetryButton: boolean;
  showDetailsButton: boolean;
}

/**
 * ErrorNotificationService - 錯誤通知服務
 * 負責向用戶顯示友好的錯誤通知
 * 遵循單一職責原則：只負責錯誤通知顯示
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {
  private logger = inject(LoggerService);
  
  // State signals
  private readonly _notifications = signal<ErrorNotification[]>([]);
  private readonly _settings = signal<ErrorNotificationSettings>({
    showNotifications: true,
    autoDismiss: true,
    dismissDelay: 5000,
    maxNotifications: 3,
    showRetryButton: true,
    showDetailsButton: false
  });

  // Public readonly signals
  readonly notifications = this._notifications.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasNotifications = computed(() => this._notifications().length > 0);
  readonly activeNotifications = computed(() => 
    this._notifications().filter(n => !n.dismissed)
  );
  readonly criticalErrors = computed(() => 
    this._notifications().filter(n => n.error.severity === 'critical' && !n.dismissed)
  );

  /**
   * Show error notification to user
   */
  showErrorNotification(errorDetails: ErrorDetails): void {
    if (!this._settings().showNotifications) {
      return;
    }

    const notification: ErrorNotification = {
      id: this.generateId(),
      error: errorDetails,
      dismissed: false,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.getMaxRetriesForSeverity(errorDetails.severity)
    };

    this._notifications.update(notifications => {
      const newNotifications = [...notifications, notification];
      
      // Limit notifications based on settings
      const maxNotifications = this._settings().maxNotifications;
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(-maxNotifications);
      }
      
      return newNotifications;
    });

    // Auto-dismiss if enabled
    if (this._settings().autoDismiss && errorDetails.severity !== 'critical') {
      setTimeout(() => {
        this.dismissNotification(notification.id);
      }, this._settings().dismissDelay);
    }
  }

  /**
   * Dismiss a notification
   */
  dismissNotification(notificationId: string): void {
    this._notifications.update(notifications =>
      notifications.map(n => 
        n.id === notificationId ? { ...n, dismissed: true } : n
      )
    );
  }

  /**
   * Retry the action that caused the error
   */
  retryAction(notificationId: string): void {
    const notification = this._notifications().find(n => n.id === notificationId);
    if (!notification || notification.retryCount >= notification.maxRetries) {
      return;
    }

    // Increment retry count
    this._notifications.update(notifications =>
      notifications.map(n => 
        n.id === notificationId 
          ? { ...n, retryCount: n.retryCount + 1 }
          : n
      )
    );

    // TODO: Implement actual retry logic based on error context
    this.performRetry(notification.error);
  }

  /**
   * Show error details
   */
  showErrorDetails(notificationId: string): void {
    const notification = this._notifications().find(n => n.id === notificationId);
    if (notification) {
      // TODO: Open error details modal/dialog
      // 使用適當的日誌記錄服務替代 console.log
      this.logger.error('Error Details:', notification.error);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this._notifications.set([]);
  }

  /**
   * Clear dismissed notifications
   */
  clearDismissed(): void {
    this._notifications.update(notifications =>
      notifications.filter(n => !n.dismissed)
    );
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Partial<ErrorNotificationSettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(errorDetails: ErrorDetails): string {
    const baseMessage = errorDetails.message;
    
    // Add context-specific information
    switch (errorDetails.category) {
      case 'network':
        return `${baseMessage}。請檢查網路連接後重試。`;
      case 'authentication':
        return `${baseMessage}。請重新登入後重試。`;
      case 'authorization':
        return `${baseMessage}。如有疑問，請聯繫管理員。`;
      case 'validation':
        return `${baseMessage}。請檢查輸入內容後重試。`;
      case 'system':
        return `${baseMessage}。我們正在處理此問題，請稍後重試。`;
      default:
        return baseMessage;
    }
  }

  /**
   * Get error severity icon
   */
  getSeverityIcon(severity: ErrorDetails['severity']): string {
    switch (severity) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error_outline';
      default:
        return 'error';
    }
  }

  /**
   * Get error severity color
   */
  getSeverityColor(severity: ErrorDetails['severity']): string {
    switch (severity) {
      case 'low':
        return 'blue';
      case 'medium':
        return 'orange';
      case 'high':
        return 'red';
      case 'critical':
        return 'dark-red';
      default:
        return 'red';
    }
  }

  /**
   * Check if retry is available
   */
  canRetry(notificationId: string): boolean {
    const notification = this._notifications().find(n => n.id === notificationId);
    return notification ? notification.retryCount < notification.maxRetries : false;
  }

  /**
   * Get retry attempts remaining
   */
  getRetryAttemptsRemaining(notificationId: string): number {
    const notification = this._notifications().find(n => n.id === notificationId);
    if (!notification) return 0;
    return Math.max(0, notification.maxRetries - notification.retryCount);
  }

  // Private methods
  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMaxRetriesForSeverity(severity: ErrorDetails['severity']): number {
    switch (severity) {
      case 'low':
        return 3;
      case 'medium':
        return 2;
      case 'high':
        return 1;
      case 'critical':
        return 0;
      default:
        return 1;
    }
  }

  private performRetry(errorDetails: ErrorDetails): void {
    // TODO: Implement actual retry logic
    // This would involve calling the original action that failed
    // 使用適當的日誌記錄服務替代 console.log
    this.logger.warn('Retrying action for error:', errorDetails);
  }
}
