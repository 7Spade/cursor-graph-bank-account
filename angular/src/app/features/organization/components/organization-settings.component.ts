import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Organization } from '../../../core/models/auth.model';
import { NotificationService } from '../../../core/services/notification.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog.component';

/**
 * 組織設定組件
 * 允許組織管理員編輯組織的基本資訊
 */
@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="organization-settings-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入組織設定中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="loadOrganization()">重試</button>
        </div>
      } @else if (organization()) {
        <mat-card class="settings-card">
          <mat-card-header>
            <mat-card-title>組織設定</mat-card-title>
            <mat-card-subtitle>管理組織的基本資訊和設定</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form class="settings-form" (ngSubmit)="onSubmit()">
              <!-- 組織名稱 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織名稱</mat-label>
                <input
                  matInput
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                  minlength="2"
                  maxlength="50"
                  [disabled]="isSubmitting()">
                <mat-icon matSuffix>business</mat-icon>
                @if (getFieldError('name')) {
                  <mat-error>{{ getFieldError('name') }}</mat-error>
                }
              </mat-form-field>

              <!-- 組織 Slug -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織 Slug</mat-label>
                <input
                  matInput
                  [(ngModel)]="formData.slug"
                  name="slug"
                  required
                  minlength="2"
                  maxlength="30"
                  pattern="[a-z0-9-]+"
                  [disabled]="isSubmitting()">
                <mat-icon matSuffix>link</mat-icon>
                <mat-hint>用於 URL 的唯一識別碼（只能包含小寫字母、數字和連字符）</mat-hint>
                @if (getFieldError('slug')) {
                  <mat-error>{{ getFieldError('slug') }}</mat-error>
                }
              </mat-form-field>

              <!-- 組織描述 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織描述</mat-label>
                <textarea
                  matInput
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="4"
                  maxlength="500"
                  [disabled]="isSubmitting()">
                </textarea>
                <mat-icon matSuffix>description</mat-icon>
                <mat-hint>簡短描述組織的用途和目標（最多 500 個字符）</mat-hint>
                @if (getFieldError('description')) {
                  <mat-error>{{ getFieldError('description') }}</mat-error>
                }
              </mat-form-field>

              <!-- 組織可見性 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織可見性</mat-label>
                <mat-select
                  [(ngModel)]="formData.visibility"
                  name="visibility"
                  [disabled]="isSubmitting()">
                  <mat-option value="public">公開</mat-option>
                  <mat-option value="private">私有</mat-option>
                </mat-select>
                <mat-icon matSuffix>visibility</mat-icon>
                <mat-hint>控制組織的公開可見性</mat-hint>
              </mat-form-field>

              <!-- 預設成員角色 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>預設成員角色</mat-label>
                <mat-select
                  [(ngModel)]="formData.defaultMemberRole"
                  name="defaultMemberRole"
                  [disabled]="isSubmitting()">
                  <mat-option value="member">成員</mat-option>
                  <mat-option value="admin">管理員</mat-option>
                </mat-select>
                <mat-icon matSuffix>person_add</mat-icon>
                <mat-hint>新成員的預設角色</mat-hint>
              </mat-form-field>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <button
              mat-button
              (click)="goBack()"
              [disabled]="isSubmitting()">
              <mat-icon>arrow_back</mat-icon>
              返回
            </button>

            <div class="spacer"></div>

            <button
              mat-button
              (click)="resetForm()"
              [disabled]="isSubmitting()">
              <mat-icon>refresh</mat-icon>
              重置
            </button>

            <button
              mat-raised-button
              color="primary"
              (click)="onSubmit()"
              [disabled]="isSubmitting() || !isFormValid() || !hasFormChanged()">
              @if (isSubmitting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              {{ hasFormChanged() ? '儲存變更' : '已儲存' }}
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .organization-settings-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      gap: 16px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      gap: 16px;
      color: var(--mdc-theme-error);
    }

    .settings-card {
      .settings-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .full-width {
        width: 100%;
      }

      .spacer {
        flex: 1;
      }

      mat-card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    @media (max-width: 600px) {
      .organization-settings-container {
        padding: 16px;
      }
    }
  `]
})
export class OrganizationSettingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Signals
  organization = signal<Organization | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  // Form data
  formData = {
    name: '',
    slug: '',
    description: '',
    visibility: 'private' as 'public' | 'private',
    defaultMemberRole: 'member' as 'member' | 'admin'
  };

  private originalFormData = { ...this.formData };

  // 檢查表單是否有變更
  hasFormChanged(): boolean {
    return JSON.stringify(this.formData) !== JSON.stringify(this.originalFormData);
  }

  orgId!: string;

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId')!;

    if (!this.orgId) {
      this.error.set('無效的組織 ID');
      return;
    }

    // 檢查權限
    if (!this.permissionService.canManageOrganization()) {
      this.error.set('您沒有權限編輯組織設定');
      return;
    }

    await this.loadOrganization();
  }

  async loadOrganization() {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const org = await firstValueFrom(this.orgService.getOrganization(this.orgId));

      if (!org) {
        this.error.set('組織不存在或無法載入');
        return;
      }

      this.organization.set(org);

      // 填充表單數據
      this.formData = {
        name: org.profile.name,
        slug: org.login,
        description: org.description || '',
        visibility: org.settings?.organization?.visibility || 'private',
        defaultMemberRole: (org.settings?.organization?.defaultMemberRole as 'admin' | 'member') || 'member'
      };

      this.originalFormData = { ...this.formData };

    } catch (error) {
      this.error.set(`載入組織設定失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  isFormValid(): boolean {
    return this.formData.name.trim().length >= 2 &&
           this.formData.name.trim().length <= 50 &&
           this.formData.slug.trim().length >= 2 &&
           this.formData.slug.trim().length <= 30 &&
           this.isSlugValid() &&
           this.isDescriptionValid();
  }

  private isSlugValid(): boolean {
    const slug = this.formData.slug.trim();
    // Slug 只能包含小寫字母、數字和連字符
    return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
  }

  private isDescriptionValid(): boolean {
    return this.formData.description.length <= 500;
  }

  getFieldError(field: string): string {
    switch (field) {
      case 'name':
        if (this.formData.name.trim().length < 2) return '組織名稱至少需要 2 個字符';
        if (this.formData.name.trim().length > 50) return '組織名稱不能超過 50 個字符';
        break;
      case 'slug':
        if (this.formData.slug.trim().length < 2) return '組織 Slug 至少需要 2 個字符';
        if (this.formData.slug.trim().length > 30) return '組織 Slug 不能超過 30 個字符';
        if (!this.isSlugValid()) return 'Slug 只能包含小寫字母、數字和連字符，且不能以連字符開頭或結尾';
        break;
      case 'description':
        if (this.formData.description.length > 500) return '描述不能超過 500 個字符';
        break;
    }
    return '';
  }

  async onSubmit() {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    try {
      this.isSubmitting.set(true);

      // 準備 Profile 和 Settings 數據
      const profileData = {
        name: this.formData.name,
        email: '', // 組織沒有電子郵件
        avatar: this.organization()?.profile?.avatar || '',
        bio: this.formData.description,
        location: this.organization()?.profile?.location || '',
        website: this.organization()?.profile?.website || ''
      };

      const settingsData = {
        language: this.organization()?.settings?.language || 'zh-TW',
        theme: this.organization()?.settings?.theme || 'light',
        notifications: this.organization()?.settings?.notifications || { email: true, push: true, sms: false },
        privacy: this.organization()?.settings?.privacy || { profilePublic: true, showEmail: false },
        organization: {
          defaultMemberRole: this.formData.defaultMemberRole as any,
          visibility: this.formData.visibility
        }
      };

      // 使用批次更新確保事務性
      await this.orgService.updateOrganizationComplete(this.orgId, profileData, settingsData);

      this.notificationService.showSuccess('組織設定已更新');
      this.originalFormData = { ...this.formData };

    } catch (error) {
      let errorMessage = '更新失敗';
      
      if (error instanceof Error) {
        if (error.message.includes('validation')) {
          errorMessage = '表單驗證失敗，請檢查輸入的數據';
        } else if (error.message.includes('permission')) {
          errorMessage = '權限不足，無法更新組織設定';
        } else if (error.message.includes('network')) {
          errorMessage = '網路連接失敗，請檢查網路連接後重試';
        } else {
          errorMessage = `更新失敗: ${error.message}`;
        }
      } else {
        errorMessage = '更新失敗: 未知錯誤';
      }
      
      this.notificationService.showError(errorMessage);
      console.error('組織設定更新失敗:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm() {
    this.formData = { ...this.originalFormData };
  }

  async goBack() {
    if (this.hasFormChanged() && !this.isSubmitting()) {
      const dialogData: ConfirmDialogData = {
        title: '未儲存的變更',
        message: '您有未儲存的變更，確定要離開嗎？',
        confirmText: '離開',
        cancelText: '繼續編輯',
        type: 'warning'
      };

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData
      });

      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) return;
    }

    this.router.navigate(['..'], { relativeTo: this.route });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasFormChanged() && !this.isSubmitting()) {
      event.preventDefault();
      event.returnValue = '您有未儲存的變更，確定要離開嗎？';
    }
  }
}
