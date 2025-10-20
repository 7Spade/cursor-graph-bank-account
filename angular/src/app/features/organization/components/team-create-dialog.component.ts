import { Component, inject, signal, computed, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
import { 
  TeamCreateRequest, 
  TeamCreateFormState,
  TeamCreatedEvent 
} from '../models/team-create.model';

/**
 * 團隊建立對話框組件
 * 單一職責：處理團隊建立的用戶界面和表單提交
 * 遵循單一職責原則：只負責團隊建立的 UI 和用戶交互
 */
@Component({
  selector: 'app-team-create-dialog',
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
          <mat-icon>groups</mat-icon>
          建立新團隊
        </h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-content">
        <form (ngSubmit)="onSubmit()" #teamForm="ngForm">
          <mat-card class="form-card">
            <mat-card-content>
              <!-- 團隊名稱 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>團隊名稱 *</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="formState().values.name"
                  name="name"
                  placeholder="輸入團隊名稱"
                  required
                  (blur)="validateField('name')"
                  [class.error]="formState().errors.name">
                <mat-hint>團隊的顯示名稱</mat-hint>
                @if (formState().errors.name) {
                  <mat-error>{{ formState().errors.name }}</mat-error>
                }
              </mat-form-field>

              <!-- 團隊標識符 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>團隊標識符 *</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="formState().values.slug"
                  name="slug"
                  placeholder="輸入團隊標識符"
                  required
                  (blur)="validateField('slug')"
                  [class.error]="formState().errors.slug">
                <mat-hint>用於 URL 的唯一標識符</mat-hint>
                @if (formState().errors.slug) {
                  <mat-error>{{ formState().errors.slug }}</mat-error>
                }
              </mat-form-field>

              <!-- 團隊描述 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>團隊描述</mat-label>
                <textarea 
                  matInput 
                  [(ngModel)]="formState().values.description"
                  name="description"
                  placeholder="描述團隊的職責和目標"
                  rows="3"
                  (blur)="validateField('description')"
                  [class.error]="formState().errors.description">
                </textarea>
                <mat-hint>可選的描述信息</mat-hint>
                @if (formState().errors.description) {
                  <mat-error>{{ formState().errors.description }}</mat-error>
                }
              </mat-form-field>

              <!-- 隱私設定 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>隱私設定 *</mat-label>
                <mat-select 
                  [(ngModel)]="formState().values.privacy"
                  name="privacy"
                  required>
                  <mat-option value="open">公開</mat-option>
                  <mat-option value="closed">私有</mat-option>
                </mat-select>
                <mat-hint>選擇團隊的可見性</mat-hint>
              </mat-form-field>

              <!-- 權限等級 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>權限等級 *</mat-label>
                <mat-select 
                  [(ngModel)]="formState().values.permission"
                  name="permission"
                  required>
                  <mat-option value="read">讀取</mat-option>
                  <mat-option value="write">寫入</mat-option>
                  <mat-option value="admin">管理</mat-option>
                </mat-select>
                <mat-hint>團隊的默認權限等級</mat-hint>
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
          [disabled]="formState().isSubmitting">
          取消
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          type="button"
          (click)="onSubmit()"
          [disabled]="!formState().isValid || formState().isSubmitting">
          @if (formState().isSubmitting) {
            <mat-spinner diameter="20"></mat-spinner>
            建立中...
          } @else {
            <ng-container>
              <mat-icon>add</mat-icon>
              建立團隊
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
export class TeamCreateDialogComponent {
  // 服務注入
  private organizationService = inject(OrganizationService);
  private validationService = inject(ValidationService);
  private notificationService = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<TeamCreateDialogComponent>);

  // 對話框數據注入
  constructor(@Inject(MAT_DIALOG_DATA) public data: { organizationId: string; parentTeamId?: string }) {
    // 監聽表單變化
    this.updateFormValidity();
  }

  // 事件發射器
  @Output() teamCreated = new EventEmitter<TeamCreatedEvent>();

  // 表單狀態
  formState = signal<TeamCreateFormState>({
    isSubmitting: false,
    isValid: false,
    errors: {},
    values: {
      name: '',
      slug: '',
      description: '',
      privacy: 'open',
      permission: 'read'
    }
  });

  // 計算屬性
  readonly isFormValid = computed(() => {
    const state = this.formState();
    return state.values.name.trim().length > 0 &&
           state.values.slug.trim().length > 0 &&
           !state.errors.name &&
           !state.errors.slug &&
           !state.errors.description;
  });

  /**
   * 驗證單個字段
   */
  validateField(field: string): void {
    const currentState = this.formState();
    let newState = { ...currentState };
    
    switch (field) {
      case 'name':
        const nameResult = this.validationService.validateTeamName(currentState.values.name);
        newState.errors.name = nameResult.errors[0] || undefined;
        break;
      case 'slug':
        const slugResult = this.validationService.validateTeamSlug(currentState.values.slug);
        newState.errors.slug = slugResult.errors[0] || undefined;
        break;
      case 'description':
        const descResult = this.validationService.validateTeamDescription(currentState.values.description);
        newState.errors.description = descResult.errors[0] || undefined;
        break;
    }
    
    this.formState.set(newState);
    this.updateFormValidity();
  }

  /**
   * 更新表單有效性
   */
  private updateFormValidity(): void {
    const currentState = this.formState();
    const newState = { ...currentState, isValid: this.isFormValid() };
    this.formState.set(newState);
  }

  /**
   * 提交表單
   */
  async onSubmit(): Promise<void> {
    const currentState = this.formState();
    
    if (!currentState.isValid || currentState.isSubmitting) {
      return;
    }

    // 驗證所有字段
    this.validateField('name');
    this.validateField('slug');
    this.validateField('description');

    const updatedState = this.formState();
    if (!updatedState.isValid) {
      this.notificationService.showValidationErrors([
        updatedState.errors.name,
        updatedState.errors.slug,
        updatedState.errors.description
      ].filter(error => error) as string[]);
      return;
    }

    // 設置提交狀態
    this.formState.update(state => ({ ...state, isSubmitting: true }));

    try {
      if (!this.data.organizationId) {
        throw new Error('組織 ID 不能為空');
      }

      const request: TeamCreateRequest = {
        name: updatedState.values.name.trim(),
        slug: updatedState.values.slug.trim(),
        description: updatedState.values.description.trim(),
        organizationId: this.data.organizationId,
        parentTeamId: this.data.parentTeamId,
        privacy: updatedState.values.privacy,
        permission: updatedState.values.permission
      };

      const teamId = await this.organizationService.createTeam(
        request.organizationId,
        request.name,
        request.slug
      );

      // 發射成功事件
      this.teamCreated.emit({
        team: {
          id: teamId,
          name: request.name,
          slug: request.slug,
          description: request.description,
          organizationId: request.organizationId,
          parentTeamId: request.parentTeamId,
          privacy: request.privacy,
          permission: request.permission,
          createdAt: new Date()
        },
        success: true
      });

      this.notificationService.showSuccess('團隊建立成功！');
      this.dialogRef.close({ success: true, teamId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      
      this.teamCreated.emit({
        team: {} as any,
        success: false,
        error: errorMessage
      });

      this.notificationService.showError(errorMessage);
    } finally {
      // 重置提交狀態
      this.formState.update(state => ({ ...state, isSubmitting: false }));
    }
  }

  /**
   * 取消操作
   */
  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
