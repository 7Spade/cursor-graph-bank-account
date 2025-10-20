import { Component, Inject, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

import { Organization } from '../../../core/models/auth.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * 組織編輯對話框組件
 * 允許用戶編輯組織的基本信息
 */
@Component({
  selector: 'app-organization-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>編輯組織</h2>
    
    <mat-dialog-content>
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="32"></mat-spinner>
          <p>載入組織信息中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
        </div>
      } @else {
        <form [formGroup]="editForm" class="edit-form">
          <!-- 組織名稱 -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>組織名稱</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="輸入組織名稱"
              required>
            <mat-icon matSuffix>business</mat-icon>
            @if (editForm.get('name')?.invalid && editForm.get('name')?.touched) {
              <mat-error>組織名稱是必填項目</mat-error>
            }
          </mat-form-field>

          <!-- 組織描述 -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>組織描述</mat-label>
            <textarea
              matInput
              formControlName="description"
              placeholder="簡短描述組織的用途和目標"
              rows="3">
            </textarea>
            <mat-icon matSuffix>description</mat-icon>
            <mat-hint>可選：簡短描述組織的用途和目標</mat-hint>
          </mat-form-field>

          <!-- 組織網站 -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>組織網站</mat-label>
            <input
              matInput
              formControlName="website"
              placeholder="https://example.com"
              type="url">
            <mat-icon matSuffix>link</mat-icon>
            <mat-hint>可選：組織的官方網站</mat-hint>
          </mat-form-field>

          <!-- 組織位置 -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>組織位置</mat-label>
            <input
              matInput
              formControlName="location"
              placeholder="例如：台北市, 台灣">
            <mat-icon matSuffix>location_on</mat-icon>
            <mat-hint>可選：組織的主要位置</mat-hint>
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button
        mat-button
        (click)="onCancel()"
        [disabled]="isSubmitting()">
        取消
      </button>
      
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="!editForm.valid || isSubmitting()">
        @if (isSubmitting()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
        }
        儲存變更
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 16px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 16px;
      color: var(--mdc-theme-error);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    @media (max-width: 600px) {
      .edit-form {
        padding: 8px 0;
      }
    }
  `]
})
export class OrganizationEditDialogComponent implements OnInit {
  private fb = new FormBuilder();
  private orgService = inject(OrganizationService);
  private notificationService = inject(NotificationService);
  private firestore = inject(Firestore);

  // Signals
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  // Form
  editForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<OrganizationEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Organization
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      location: ['', [Validators.maxLength(100)]]
    });
  }

  async ngOnInit() {
    await this.loadOrganizationData();
  }

  private async loadOrganizationData() {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // 填充表單數據
      this.editForm.patchValue({
        name: this.data.profile.name,
        description: this.data.description || '',
        website: this.data.profile.website || '',
        location: this.data.profile.location || ''
      });

    } catch (error) {
      this.error.set(`載入組織數據失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSave() {
    if (!this.editForm.valid || this.isSubmitting()) {
      return;
    }

    try {
      this.isSubmitting.set(true);

      const formValue = this.editForm.value;

      // 準備更新數據
      const profileUpdate = {
        name: formValue.name,
        email: this.data.profile.email, // 保持原有電子郵件
        avatar: this.data.profile.avatar, // 保持原有頭像
        bio: formValue.description,
        location: formValue.location,
        website: formValue.website
      };

      // 更新組織檔案
      await this.orgService.updateOrganizationProfile(this.data.id, profileUpdate);

      // 如果有描述變更，也需要更新組織描述
      if (formValue.description !== this.data.description) {
        const orgRef = doc(this.firestore, `accounts/${this.data.id}`);
        await updateDoc(orgRef, {
          description: formValue.description,
          updatedAt: new Date()
        });
      }

      this.notificationService.showSuccess('組織信息已更新');
      this.dialogRef.close(true);

    } catch (error) {
      this.notificationService.showError(`更新失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}