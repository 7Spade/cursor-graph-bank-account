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
import { MatCheckboxModule } from '@angular/material/checkbox';

import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ValidationService } from '../../../core/services/validation.service';

/**
 * 團隊建立組件
 * 允許組織管理員建立新的團隊
 */
@Component({
  selector: 'app-team-create',
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
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  template: `
    <div class="team-create-container">
      <mat-card class="create-card">
        <mat-card-header>
          <mat-card-title>建立新團隊</mat-card-title>
          <mat-card-subtitle>為組織建立一個新的團隊</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form class="create-form" (ngSubmit)="onSubmit()">
            <!-- 團隊名稱 -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>團隊名稱</mat-label>
              <input 
                matInput 
                [(ngModel)]="formData.name" 
                name="name"
                required
                [disabled]="isSubmitting()"
                (blur)="validateField('name')">
              <mat-icon matSuffix>groups</mat-icon>
              @if (errors['name']) {
                <mat-error>{{ errors['name'] }}</mat-error>
              }
            </mat-form-field>

            <!-- 團隊 Slug -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>團隊 Slug</mat-label>
              <input 
                matInput 
                [(ngModel)]="formData.slug" 
                name="slug"
                required
                [disabled]="isSubmitting()"
                (blur)="validateField('slug')">
              <mat-icon matSuffix>link</mat-icon>
              <mat-hint>用於 URL 的唯一識別碼</mat-hint>
              @if (errors['slug']) {
                <mat-error>{{ errors['slug'] }}</mat-error>
              }
            </mat-form-field>

            <!-- 團隊描述 -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>團隊描述</mat-label>
              <textarea 
                matInput 
                [(ngModel)]="formData.description" 
                name="description"
                rows="3"
                [disabled]="isSubmitting()"
                (blur)="validateField('description')">
              </textarea>
              <mat-icon matSuffix>description</mat-icon>
              <mat-hint>簡短描述團隊的用途和目標</mat-hint>
              @if (errors['description']) {
                <mat-error>{{ errors['description'] }}</mat-error>
              }
            </mat-form-field>

            <!-- 團隊隱私設定 -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>團隊隱私</mat-label>
              <mat-select 
                [(ngModel)]="formData.privacy" 
                name="privacy"
                [disabled]="isSubmitting()">
                <mat-option value="open">開放</mat-option>
                <mat-option value="closed">封閉</mat-option>
              </mat-select>
              <mat-icon matSuffix>visibility</mat-icon>
              <mat-hint>控制團隊的可見性</mat-hint>
            </mat-form-field>

            <!-- 團隊權限設定 -->
            <div class="permissions-section">
              <h3>團隊權限</h3>
              
              <!-- Repository 權限 -->
              <div class="permission-group">
                <h4>Repository 權限</h4>
                <div class="permission-options">
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.repository.read"
                    name="repoRead"
                    [disabled]="isSubmitting()">
                    讀取
                  </mat-checkbox>
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.repository.write"
                    name="repoWrite"
                    [disabled]="isSubmitting()">
                    寫入
                  </mat-checkbox>
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.repository.admin"
                    name="repoAdmin"
                    [disabled]="isSubmitting()">
                    管理
                  </mat-checkbox>
                </div>
              </div>

              <!-- Issues 權限 -->
              <div class="permission-group">
                <h4>Issues 權限</h4>
                <div class="permission-options">
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.issues.read"
                    name="issuesRead"
                    [disabled]="isSubmitting()">
                    讀取
                  </mat-checkbox>
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.issues.write"
                    name="issuesWrite"
                    [disabled]="isSubmitting()">
                    寫入
                  </mat-checkbox>
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.issues.delete"
                    name="issuesDelete"
                    [disabled]="isSubmitting()">
                    刪除
                  </mat-checkbox>
                </div>
              </div>

              <!-- Pull Requests 權限 -->
              <div class="permission-group">
                <h4>Pull Requests 權限</h4>
                <div class="permission-options">
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.pullRequests.read"
                    name="prRead"
                    [disabled]="isSubmitting()">
                    讀取
                  </mat-checkbox>
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.pullRequests.write"
                    name="prWrite"
                    [disabled]="isSubmitting()">
                    寫入
                  </mat-checkbox>
                  <mat-checkbox 
                    [(ngModel)]="formData.permissions.pullRequests.merge"
                    name="prMerge"
                    [disabled]="isSubmitting()">
                    合併
                  </mat-checkbox>
                </div>
              </div>
            </div>
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
            建立團隊
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .team-create-container {
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

      .permissions-section {
        margin-top: 24px;
        
        h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 500;
        }

        .permission-group {
          margin-bottom: 16px;
          
          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 500;
            color: var(--mdc-theme-on-surface-variant);
          }

          .permission-options {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            
            mat-checkbox {
              margin: 0;
            }
          }
        }
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
      .team-create-container {
        padding: 16px;
      }
      
      .permission-options {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class TeamCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);
  private validationService = inject(ValidationService);

  // Signals
  isSubmitting = signal(false);
  errors: { [key: string]: string | undefined } = {};

  // Form data
  formData = {
    name: '',
    slug: '',
    description: '',
    privacy: 'open' as 'open' | 'closed',
    permissions: {
      repository: {
        read: true,
        write: false,
        admin: false
      },
      issues: {
        read: true,
        write: false,
        delete: false
      },
      pullRequests: {
        read: true,
        write: false,
        merge: false
      }
    }
  };

  orgId!: string;

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId')!;
    
    if (!this.orgId) {
      this.notificationService.showError('無效的組織 ID');
      this.goBack();
      return;
    }

    // 檢查權限
    if (!this.permissionService.canManageTeams()) {
      this.notificationService.showError('您沒有權限建立團隊');
      this.goBack();
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
        const nameResult = this.validationService.validateTeamName(this.formData.name);
        this.errors['name'] = nameResult.errors[0] || undefined;
        break;
      case 'slug':
        const slugResult = this.validationService.validateTeamSlug(this.formData.slug);
        this.errors['slug'] = slugResult.errors[0] || undefined;
        break;
      case 'description':
        const descResult = this.validationService.validateTeamDescription(this.formData.description);
        this.errors['description'] = descResult.errors[0] || undefined;
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
      
      const teamId = await this.orgService.createTeam(
        this.orgId,
        this.formData.name.trim(),
        this.formData.slug.trim(),
        this.formData.description.trim(),
        this.formData.privacy,
        this.formData.permissions
      );
      
      this.notificationService.showSuccess('團隊已成功建立');
      this.router.navigate(['teams', teamId], { relativeTo: this.route });
      
    } catch (error) {
      this.notificationService.showError(`建立團隊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack() {
    this.router.navigate(['teams'], { relativeTo: this.route });
  }
}
