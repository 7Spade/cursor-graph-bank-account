import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NotificationService } from '../../../../../core/services/notification.service';
import { NotificationPreferences } from '../../../../../core/models/auth.model';

/**
 * NotificationSettingsComponent - 通知設定組件
 * 單一職責：處理用戶通知偏好設定
 * 遵循單一職責原則：只負責通知設定相關的業務邏輯
 */
@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationSettingsComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  preferences = signal<NotificationPreferences>({
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
  loading = signal(false);
  isDirty = signal(false);

  // Form
  notificationForm!: FormGroup;

  // Options
  readonly emailFrequencies = [
    { value: 'immediate', label: '即時' },
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每週' },
    { value: 'never', label: '從不' }
  ];

  // Computed signals
  readonly canSave = computed(() => 
    this.isDirty() && !this.loading()
  );

  readonly canReset = computed(() => 
    this.isDirty() && !this.loading()
  );

  ngOnInit() {
    this.initializeForm();
    this.loadNotificationPreferences();
    this.setupFormChangeTracking();
  }

  private initializeForm() {
    this.notificationForm = this.fb.group({
      emailFrequency: ['daily'],
      emailMarketing: [false],
      emailUpdates: [true],
      emailSecurity: [true],
      pushEnabled: [true],
      pushMarketing: [false],
      pushUpdates: [true],
      pushSecurity: [true]
    });
  }

  private loadNotificationPreferences() {
    this.loading.set(true);
    
    // TODO: Load from service
    // 模擬異步操作 - 應該替換為真實的服務調用
    Promise.resolve().then(() => {
      const prefs = this.preferences();
      this.notificationForm.patchValue({
        emailFrequency: prefs.email.frequency,
        emailMarketing: prefs.email.marketing,
        emailUpdates: prefs.email.updates,
        emailSecurity: prefs.email.security,
        pushEnabled: prefs.push.enabled,
        pushMarketing: prefs.push.marketing,
        pushUpdates: prefs.push.updates,
        pushSecurity: prefs.push.security
      });
      
      this.isDirty.set(false);
      this.loading.set(false);
    });
  }

  private setupFormChangeTracking() {
    this.notificationForm.valueChanges.subscribe(() => {
      this.isDirty.set(true);
    });
  }

  onSave() {
    if (this.canSave()) {
      this.loading.set(true);
      
      const formValue = this.notificationForm.value;
      const newPreferences: NotificationPreferences = {
        email: {
          enabled: true,
          frequency: formValue.emailFrequency,
          types: [],
          marketing: formValue.emailMarketing,
          updates: formValue.emailUpdates,
          security: formValue.emailSecurity
        },
        push: {
          enabled: formValue.pushEnabled,
          types: [],
          marketing: formValue.pushMarketing,
          updates: formValue.pushUpdates,
          security: formValue.pushSecurity
        },
        inApp: {
          enabled: true,
          types: []
        }
      };

      // TODO: Save to service
      // 模擬異步操作 - 應該替換為真實的服務調用
      Promise.resolve().then(() => {
        this.preferences.set(newPreferences);
        this.isDirty.set(false);
        this.notificationService.showSuccess('通知設定更新成功');
        this.loading.set(false);
      });
    }
  }

  onReset() {
    if (this.canReset()) {
      this.loadNotificationPreferences();
      this.notificationService.showInfo('已重置為原始設定');
    }
  }

  onPushToggleChanged(enabled: boolean) {
    if (!enabled) {
      // Disable all push notifications when push is disabled
      this.notificationForm.patchValue({
        pushMarketing: false,
        pushUpdates: false,
        pushSecurity: false
      });
    }
  }

  getFrequencyLabel(value: string): string {
    const frequency = this.emailFrequencies.find(f => f.value === value);
    return frequency?.label || value;
  }
}
