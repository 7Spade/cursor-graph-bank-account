import { Component, inject, signal, computed, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { OrganizationService } from '../../../core/services/organization.service';
import { ValidationService } from '../../../core/services/validation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { 
  OrganizationCreateRequest, 
  OrganizationCreateFormState,
  OrganizationCreatedEvent 
} from '../models/organization-create.model';

/**
 * 組織建立對話框組件
 * 單一職責：處理組織建立的用戶界面和表單提交
 * 遵循單一職責原則：只負責組織建立的 UI 和用戶交互
 */
@Component({
  selector: 'app-organization-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>business</mat-icon>
          建立新組織
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-content">
        <form (ngSubmit)="onSubmit()" #organizationForm="ngForm">
          <mat-card class="form-card">
            <mat-card-content>
              <!-- 組織名稱 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織名稱 *</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="formState.values.name"
                  name="name"
                  placeholder="輸入組織名稱"
                  required
                  (input)="onInputChange()"
                  (blur)="validateField('name')"
                  [class.error]="formState.errors.name">
                <mat-hint>組織的顯示名稱</mat-hint>
                @if (formState.errors.name) {
                  <mat-error>{{ formState.errors.name }}</mat-error>
                }
              </mat-form-field>

              <!-- 組織登入名稱 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織標識符 *</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="formState.values.login"
                  name="login"
                  placeholder="輸入組織標識符"
                  required
                  (input)="onInputChange()"
                  (blur)="validateField('login')"
                  [class.error]="formState.errors.login">
                <mat-hint>用於 URL 的唯一標識符</mat-hint>
                @if (formState.errors.login) {
                  <mat-error>{{ formState.errors.login }}</mat-error>
                }
              </mat-form-field>

              <!-- 組織描述 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織描述</mat-label>
                <textarea 
                  matInput 
                  [(ngModel)]="formState.values.description"
                  name="description"
                  placeholder="描述組織的用途和目標"
                  rows="3"
                  (input)="onInputChange()"
                  (blur)="validateField('description')"
                  [class.error]="formState.errors.description">
                </textarea>
                <mat-hint>可選的描述信息</mat-hint>
                @if (formState.errors.description) {
                  <mat-error>{{ formState.errors.description }}</mat-error>
                }
              </mat-form-field>

              <!-- 隱私設定 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>隱私設定 *</mat-label>
                <mat-select 
                  [(ngModel)]="formState.values.privacy"
                  name="privacy"
                  required>
                  <mat-option value="public">公開</mat-option>
                  <mat-option value="private">私有</mat-option>
                </mat-select>
                <mat-hint>選擇組織的可見性</mat-hint>
              </mat-form-field>
            </mat-card-content>
          </mat-card>
        </form>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-actions">
        <button 
          mat-button 
          type="button" 
          (click)="onCancel()"
          [disabled]="formState.isSubmitting">
          取消
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          type="button"
          (click)="onSubmit()"
          [disabled]="!formState.isValid || formState.isSubmitting">
          @if (formState.isSubmitting) {
            <mat-spinner diameter="20"></mat-spinner>
            建立中...
          } @else {
            <ng-container>
              <mat-icon>add</mat-icon>
              建立組織
            </ng-container>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0 24px;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .close-button {
      margin-left: auto;
    }

    .dialog-content {
      padding: 24px;
    }

    .form-card {
      box-shadow: none;
      border: 1px solid #e0e0e0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
    }

    .error {
      border-color: #f44336 !important;
    }

    mat-spinner {
      margin-right: 8px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: 300px;
        max-width: 90vw;
      }
      
      .dialog-content {
        padding: 16px;
      }
      
      .dialog-actions {
        padding: 16px;
      }
    }
  `]
})
export class OrganizationCreateDialogComponent {
  // 服務注入
  private organizationService = inject(OrganizationService);
  private validationService = inject(ValidationService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<OrganizationCreateDialogComponent>);

  // 事件發射器
  @Output() organizationCreated = new EventEmitter<OrganizationCreatedEvent>();

  // 表單狀態
  formState: OrganizationCreateFormState = {
    isSubmitting: false,
    isValid: false,
    errors: {},
    values: {
      name: '',
      login: '',
      description: '',
      privacy: 'private'
    }
  };

  // 計算屬性
  readonly isFormValid = computed(() => {
    return this.formState.values.name.trim().length > 0 &&
           this.formState.values.login.trim().length > 0 &&
           !this.formState.errors.name &&
           !this.formState.errors.login &&
           !this.formState.errors.description;
  });

  constructor() {
    // 初始化表單有效性
    this.updateFormValidity();
  }

  /**
   * 驗證單個字段
   */
  validateField(field: string): void {
    switch (field) {
      case 'name':
        const nameResult = this.validationService.validateOrganizationName(this.formState.values.name);
        this.formState.errors.name = nameResult.errors[0] || '';
        break;
      case 'login':
        const loginResult = this.validationService.validateOrganizationLogin(this.formState.values.login);
        this.formState.errors.login = loginResult.errors[0] || '';
        break;
      case 'description':
        const descResult = this.validationService.validateOrganizationDescription(this.formState.values.description);
        this.formState.errors.description = descResult.errors[0] || '';
        break;
    }
    
    this.updateFormValidity();
  }

  /**
   * 更新表單有效性
   */
  private updateFormValidity(): void {
    // 直接計算表單有效性，不依賴 computed signal
    this.formState.isValid = this.formState.values.name.trim().length > 0 &&
                            this.formState.values.login.trim().length > 0 &&
                            !this.formState.errors.name &&
                            !this.formState.errors.login &&
                            !this.formState.errors.description;
  }

  /**
   * 處理輸入變化
   */
  onInputChange(): void {
    this.updateFormValidity();
  }

  /**
   * 提交表單
   */
  async onSubmit(): Promise<void> {
    if (!this.formState.isValid || this.formState.isSubmitting) {
      return;
    }

    // 驗證所有字段
    this.validateField('name');
    this.validateField('login');
    this.validateField('description');

    if (!this.formState.isValid) {
      this.notificationService.showValidationErrors([
        this.formState.errors.name,
        this.formState.errors.login,
        this.formState.errors.description
      ].filter(error => error) as string[]);
      return;
    }

    this.formState.isSubmitting = true;

    try {
      const currentUser = this.authService.currentAccount();
      if (!currentUser) {
        throw new Error('用戶未登入');
      }

      const request: OrganizationCreateRequest = {
        name: this.formState.values.name.trim(),
        login: this.formState.values.login.trim(),
        description: this.formState.values.description.trim(),
        privacy: this.formState.values.privacy,
        ownerId: currentUser.id
      };

      const organizationId = await this.organizationService.createOrganization(
        request.name,
        request.login,
        request.ownerId,
        request.description
      );

      // 發射成功事件
      this.organizationCreated.emit({
        organization: {
          id: organizationId,
          name: request.name,
          login: request.login,
          description: request.description,
          privacy: request.privacy,
          ownerId: request.ownerId,
          createdAt: new Date()
        },
        success: true
      });

      this.notificationService.showOrganizationCreatedSuccess(request.name);
      this.dialogRef.close({ success: true, organizationId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      
      this.organizationCreated.emit({
        organization: {} as any,
        success: false,
        error: errorMessage
      });

      this.notificationService.showOrganizationCreatedError(errorMessage);
    } finally {
      this.formState.isSubmitting = false;
    }
  }

  /**
   * 取消操作
   */
  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
