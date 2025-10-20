import { Injectable, signal, computed, effect } from '@angular/core';
import { User, SocialAccount, NotificationPreferences } from '../../../../core/models/auth.model';

export interface ProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

// SocialAccount 和 NotificationPreferences 接口已移至 core/models/auth.model.ts

/**
 * ProfileStateService - 個人資料狀態管理服務
 * 使用 Angular Signals 統一管理個人資料相關的狀態
 * 遵循單一職責原則：只負責個人資料狀態管理
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileStateService {
  // Core state signals
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _isDirty = signal(false);

  // Social accounts state
  private readonly _socialAccounts = signal<SocialAccount[]>([]);

  // Notification preferences state
  private readonly _notificationPreferences = signal<NotificationPreferences>({
    email: {
      enabled: true,
      frequency: 'daily',
      types: [],
      marketing: false,
      updates: true,
      security: true
    },
    push: {
      enabled: true,
      types: [],
      marketing: false,
      updates: true,
      security: true
    },
    inApp: {
      enabled: true,
      types: []
    }
  });

  // Avatar state
  private readonly _avatarUrl = signal<string>('');
  private readonly _uploadProgress = signal(0);

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isDirty = this._isDirty.asReadonly();
  readonly socialAccounts = this._socialAccounts.asReadonly();
  readonly notificationPreferences = this._notificationPreferences.asReadonly();
  readonly avatarUrl = this._avatarUrl.asReadonly();
  readonly uploadProgress = this._uploadProgress.asReadonly();

  // Computed signals
  readonly hasUser = computed(() => !!this._user());
  readonly hasAvatar = computed(() => !!this._avatarUrl() && this._avatarUrl().length > 0);
  readonly hasSocialAccounts = computed(() => this._socialAccounts().length > 0);
  readonly canSave = computed(() => this._isDirty() && !this._loading());
  readonly canReset = computed(() => this._isDirty() && !this._loading());

  // State management methods
  setUser(user: User | null) {
    this._user.set(user);
    this._isDirty.set(false);
    this._error.set(null);
  }

  setLoading(loading: boolean) {
    this._loading.set(loading);
  }

  setError(error: string | null) {
    this._error.set(error);
    this._loading.set(false);
  }

  setDirty(dirty: boolean) {
    this._isDirty.set(dirty);
  }

  // Social accounts management
  addSocialAccount(account: SocialAccount) {
    this._socialAccounts.update(accounts => [...accounts, account]);
    this._isDirty.set(true);
  }

  removeSocialAccount(accountId: string) {
    this._socialAccounts.update(accounts => 
      accounts.filter(acc => acc.id !== accountId)
    );
    this._isDirty.set(true);
  }

  updateSocialAccount(accountId: string, updates: Partial<SocialAccount>) {
    this._socialAccounts.update(accounts => 
      accounts.map(acc => 
        acc.id === accountId ? { ...acc, ...updates } : acc
      )
    );
    this._isDirty.set(true);
  }

  // Notification preferences management
  updateNotificationPreferences(preferences: NotificationPreferences) {
    this._notificationPreferences.set(preferences);
    this._isDirty.set(true);
  }

  // Avatar management
  setAvatarUrl(url: string) {
    this._avatarUrl.set(url);
    this._isDirty.set(true);
  }

  setUploadProgress(progress: number) {
    this._uploadProgress.set(progress);
  }

  // Reset methods
  resetUser() {
    this._user.set(null);
    this._isDirty.set(false);
    this._error.set(null);
  }

  resetSocialAccounts() {
    this._socialAccounts.set([]);
    this._isDirty.set(true);
  }

  resetNotificationPreferences() {
    this._notificationPreferences.set({
      email: {
        enabled: true,
        frequency: 'daily',
        types: [],
        marketing: false,
        updates: true,
        security: true
      },
      push: {
        enabled: true,
        types: [],
        marketing: false,
        updates: true,
        security: true
      },
      inApp: {
        enabled: true,
        types: []
      }
    });
    this._isDirty.set(true);
  }

  resetAvatar() {
    this._avatarUrl.set('');
    this._uploadProgress.set(0);
    this._isDirty.set(true);
  }

  // Clear all state
  clearAll() {
    this._user.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._isDirty.set(false);
    this._socialAccounts.set([]);
    this._notificationPreferences.set({
      email: {
        enabled: true,
        frequency: 'daily',
        types: [],
        marketing: false,
        updates: true,
        security: true
      },
      push: {
        enabled: true,
        types: [],
        marketing: false,
        updates: true,
        security: true
      },
      inApp: {
        enabled: true,
        types: []
      }
    });
    this._avatarUrl.set('');
    this._uploadProgress.set(0);
  }

  // State persistence (for future implementation)
  saveState() {
    // TODO: Implement state persistence
    this._isDirty.set(false);
  }

  loadState() {
    // TODO: Implement state loading
  }
}
