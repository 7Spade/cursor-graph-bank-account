import { Injectable, signal, computed } from '@angular/core';

export interface NotificationState {
  enabled: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  timestamp: number;
}

export interface NotificationHistory {
  notifications: NotificationState[];
  maxHistory: number;
}

export interface NotificationSettings {
  autoHide: boolean;
  defaultDuration: number;
  maxNotifications: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * NotificationStateService - 通知狀態管理服務
 * 使用 Angular Signals 統一管理通知狀態
 * 遵循單一職責原則：只負責通知狀態管理
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationStateService {
  // Core notification state
  private readonly _notifications = signal<NotificationState[]>([]);
  private readonly _history = signal<NotificationHistory>({
    notifications: [],
    maxHistory: 50
  });
  private readonly _settings = signal<NotificationSettings>({
    autoHide: true,
    defaultDuration: 5000,
    maxNotifications: 5,
    position: 'top-right'
  });

  // Public readonly signals
  readonly notifications = this._notifications.asReadonly();
  readonly history = this._history.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasNotifications = computed(() => this._notifications().length > 0);
  readonly notificationCount = computed(() => this._notifications().length);
  readonly latestNotification = computed(() => {
    const notifications = this._notifications();
    return notifications.length > 0 ? notifications[notifications.length - 1] : null;
  });

  // Notification management methods
  showSuccess(message: string, duration?: number) {
    this.addNotification({
      enabled: true,
      type: 'success',
      message,
      duration: duration ?? this._settings().defaultDuration,
      timestamp: Date.now()
    });
  }

  showError(message: string, duration?: number) {
    this.addNotification({
      enabled: true,
      type: 'error',
      message,
      duration: duration ?? this._settings().defaultDuration,
      timestamp: Date.now()
    });
  }

  showWarning(message: string, duration?: number) {
    this.addNotification({
      enabled: true,
      type: 'warning',
      message,
      duration: duration ?? this._settings().defaultDuration,
      timestamp: Date.now()
    });
  }

  showInfo(message: string, duration?: number) {
    this.addNotification({
      enabled: true,
      type: 'info',
      message,
      duration: duration ?? this._settings().defaultDuration,
      timestamp: Date.now()
    });
  }

  // Add notification
  private addNotification(notification: NotificationState) {
    this._notifications.update(notifications => {
      const newNotifications = [...notifications, notification];
      
      // Limit notifications based on settings
      const maxNotifications = this._settings().maxNotifications;
      if (newNotifications.length > maxNotifications) {
        return newNotifications.slice(-maxNotifications);
      }
      
      return newNotifications;
    });

    // Add to history
    this.addToHistory(notification);

    // Auto-hide if enabled
    if (this._settings().autoHide && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.timestamp);
      }, notification.duration);
    }
  }

  // Remove notification
  removeNotification(timestamp: number) {
    this._notifications.update(notifications => 
      notifications.filter(n => n.timestamp !== timestamp)
    );
  }

  // Clear all notifications
  clearAll() {
    this._notifications.set([]);
  }

  // History management
  private addToHistory(notification: NotificationState) {
    this._history.update(history => {
      const newHistory = [...history.notifications, notification];
      const maxHistory = history.maxHistory;
      
      if (newHistory.length > maxHistory) {
        return {
          notifications: newHistory.slice(-maxHistory),
          maxHistory
        };
      }
      
      return {
        notifications: newHistory,
        maxHistory
      };
    });
  }

  getHistory(): NotificationState[] {
    return this._history().notifications;
  }

  clearHistory() {
    this._history.set({
      notifications: [],
      maxHistory: this._history().maxHistory
    });
  }

  // Settings management
  updateSettings(settings: Partial<NotificationSettings>) {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  getSettings(): NotificationSettings {
    return this._settings();
  }

  // Utility methods
  getNotificationsByType(type: NotificationState['type']): NotificationState[] {
    return this._notifications().filter(n => n.type === type);
  }

  getSuccessNotifications(): NotificationState[] {
    return this.getNotificationsByType('success');
  }

  getErrorNotifications(): NotificationState[] {
    return this.getNotificationsByType('error');
  }

  getWarningNotifications(): NotificationState[] {
    return this.getNotificationsByType('warning');
  }

  getInfoNotifications(): NotificationState[] {
    return this.getNotificationsByType('info');
  }

  // Statistics
  getNotificationStats() {
    const notifications = this._notifications();
    return {
      total: notifications.length,
      success: notifications.filter(n => n.type === 'success').length,
      error: notifications.filter(n => n.type === 'error').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      info: notifications.filter(n => n.type === 'info').length
    };
  }

  // Persistence (for future implementation)
  saveSettings() {
    // TODO: Implement settings persistence
    localStorage.setItem('notification-settings', JSON.stringify(this._settings()));
  }

  loadSettings() {
    // TODO: Implement settings loading
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.updateSettings(settings);
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }
}
