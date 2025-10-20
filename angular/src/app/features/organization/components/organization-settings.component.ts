import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Organization } from '../../../core/models/auth.model';

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
                  [disabled]="isSubmitting()">
                <mat-icon matSuffix>business</mat-icon>
              </mat-form-field>

              <!-- 組織 Slug -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織 Slug</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="formData.slug" 
                  name="slug"
                  required
                  [disabled]="isSubmitting()">
                <mat-icon matSuffix>link</mat-icon>
                <mat-hint>用於 URL 的唯一識別碼</mat-hint>
              </mat-form-field>

              <!-- 組織描述 -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>組織描述</mat-label>
                <textarea 
                  matInput 
                  [(ngModel)]="formData.description" 
                  name="description"
                  rows="4"
                  [disabled]="isSubmitting()">
                </textarea>
                <mat-icon matSuffix>description</mat-icon>
                <mat-hint>簡短描述組織的用途和目標</mat-hint>
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
              [disabled]="isSubmitting() || !isFormValid()">
              @if (isSubmitting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              儲存設定
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
    return this.formData.name.trim().length > 0 && 
           this.formData.slug.trim().length > 0;
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
        avatar: this.organization()?.profile?.avatar || null,
        bio: this.formData.description,
        location: this.organization()?.profile?.location || null,
        website: this.organization()?.profile?.website || null
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
      this.notificationService.showError(`更新失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForm() {
    this.formData = { ...this.originalFormData };
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
