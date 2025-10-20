import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ValidationService } from '../../../core/services/validation.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * 組織建立組件
 * 允許用戶建立新的組織
 */
@Component({
  selector: 'app-organization-create',
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
    <div class="organization-create-container">
      <mat-card class="create-card">
        <mat-card-header>
          <mat-card-title>建立新組織</mat-card-title>
          <mat-card-subtitle>建立一個新的組織來管理您的專案和團隊</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form class="create-form" (ngSubmit)="onSubmit()">
            <!-- 組織名稱 -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>組織名稱</mat-label>
              <input 
                matInput 
                [(ngModel)]="formData.name" 
                name="name"
                required
                [disabled]="isSubmitting()"
                (input)="validateField('name')"
                (blur)="validateField('name')">
              <mat-icon matSuffix>business</mat-icon>
              @if (errors['name']) {
                <mat-error>{{ errors['name'] }}</mat-error>
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
                [disabled]="isSubmitting()"
                (input)="validateField('slug')"
                (blur)="validateField('slug')">
              <mat-icon matSuffix>link</mat-icon>
              <mat-hint>用於 URL 的唯一識別碼</mat-hint>
              @if (errors['slug']) {
                <mat-error>{{ errors['slug'] }}</mat-error>
              }
            </mat-form-field>

            <!-- 組織描述 -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>組織描述</mat-label>
              <textarea 
                matInput 
                [(ngModel)]="formData.description" 
                name="description"
                rows="3"
                [disabled]="isSubmitting()"
                (input)="validateField('description')"
                (blur)="validateField('description')">
              </textarea>
              <mat-icon matSuffix>description</mat-icon>
              <mat-hint>簡短描述組織的用途和目標</mat-hint>
              @if (errors['description']) {
                <mat-error>{{ errors['description'] }}</mat-error>
              }
            </mat-form-field>

            <!-- 組織隱私設定 -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>組織隱私</mat-label>
              <mat-select 
                [(ngModel)]="formData.privacy" 
                name="privacy"
                [disabled]="isSubmitting()">
                <mat-option value="public">公開</mat-option>
                <mat-option value="private">私有</mat-option>
              </mat-select>
              <mat-icon matSuffix>visibility</mat-icon>
              <mat-hint>控制組織的公開可見性</mat-hint>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button 
            mat-button 
            (click)="goBack()"
            [disabled]="isSubmitting()">
            <mat-icon>arrow_back</mat-icon>
            取消
          </button>
          
          <div class="spacer"></div>
          
          <button 
            mat-raised-button 
            color="primary"
            (click)="onSubmit()"
            [disabled]="isSubmitting() || !isFormValid()">
            @if (isSubmitting()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>add</mat-icon>
            }
            建立組織
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .organization-create-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .create-card {
      .create-form {
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
      .organization-create-container {
        padding: 16px;
      }
    }
  `]
})
export class OrganizationCreateComponent implements OnInit {
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);
  private validationService = inject(ValidationService);
  private authService = inject(AuthService);

  // Signals
  isSubmitting = signal(false);
  errors: { [key: string]: string } = {};

  // Form data
  formData = {
    name: '',
    slug: '',
    description: '',
    privacy: 'private' as 'public' | 'private'
  };

  ngOnInit() {
    // 檢查用戶是否已登入
    if (!this.permissionService.hasRole('user')) {
      this.notificationService.showError('請先登入以建立組織');
      this.router.navigate(['/login']);
      return;
    }
  }

  isFormValid(): boolean {
    return this.formData.name.trim().length > 0 && 
           this.formData.slug.trim().length > 0 &&
           !this.errors['name'] &&
           !this.errors['slug'] &&
           !this.errors['description'];
  }

  validateField(field: string): void {
    switch (field) {
      case 'name':
        const nameResult = this.validationService.validateOrganizationName(this.formData.name);
        this.errors['name'] = nameResult.errors[0] || '';
        break;
      case 'slug':
        const slugResult = this.validationService.validateLogin(this.formData.slug);
        this.errors['slug'] = slugResult.errors[0] || '';
        break;
      case 'description':
        const descResult = this.validationService.validateOrganizationDescription(this.formData.description);
        this.errors['description'] = descResult.errors[0] || '';
        break;
    }
  }

  async onSubmit() {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    // 驗證所有字段
    this.validateField('name');
    this.validateField('slug');
    this.validateField('description');

    if (!this.isFormValid()) {
      this.notificationService.showValidationErrors([
        this.errors['name'],
        this.errors['slug'],
        this.errors['description']
      ].filter(error => error) as string[]);
      return;
    }

    try {
      this.isSubmitting.set(true);
      
      // 建立組織
      const orgId = await this.orgService.createOrganization(
        this.formData.name.trim(),
        this.formData.slug.trim(),
        this.authService.currentAccount()?.id || '', // 從 AuthService 獲取當前用戶 ID
        this.formData.description.trim()
      );
      
      this.notificationService.showSuccess('組織已成功建立');
      this.router.navigate(['/organizations', orgId]);
      
    } catch (error) {
      this.notificationService.showError(`建立組織失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/organizations']);
  }
}
