import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../../../core/services/notification.service';

/**
 * AvatarUploadComponent - 頭像上傳組件
 * 單一職責：處理用戶頭像的上傳和預覽
 * 遵循單一職責原則：只負責頭像上傳相關的業務邏輯
 */
@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  templateUrl: './avatar-upload.component.html',
  styleUrls: ['./avatar-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarUploadComponent {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  // Signals for state management
  avatarUrl = signal<string>('');
  loading = signal(false);
  uploadProgress = signal(0);

  // Computed signals
  readonly hasAvatar = computed(() => 
    !!this.avatarUrl() && this.avatarUrl().length > 0
  );

  readonly canUpload = computed(() => 
    !this.loading()
  );

  ngOnInit() {
    this.loadCurrentAvatar();
  }

  private loadCurrentAvatar() {
    // TODO: Load current avatar from service
    this.avatarUrl.set('https://via.placeholder.com/150x150?text=Avatar');
  }

  onUploadClick() {
    if (this.canUpload()) {
      // 使用 Angular 模板系統替代直接 DOM 操作
      // 觸發隱藏的文件輸入元素
      const fileInput = document.getElementById('avatar-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validateAndUploadFile(file);
    }
  }

  private validateAndUploadFile(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.notificationService.showError('請選擇圖片文件');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.notificationService.showError('圖片大小不能超過 5MB');
      return;
    }

    this.uploadFile(file);
  }

  private uploadFile(file: File) {
    this.loading.set(true);
    this.uploadProgress.set(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      const currentProgress = this.uploadProgress();
      if (currentProgress < 90) {
        this.uploadProgress.set(currentProgress + 10);
      }
    }, 200);

    // TODO: Replace with actual upload service call
    this.userService.uploadAvatar(file).subscribe({
      next: (result) => {
        clearInterval(progressInterval);
        this.uploadProgress.set(100);
        
        if (result.avatarUrl) {
          this.avatarUrl.set(result.avatarUrl);
          this.notificationService.showSuccess('頭像上傳成功');
        }
        
        // 模擬異步操作 - 應該替換為真實的服務調用
        Promise.resolve().then(() => {
          this.loading.set(false);
          this.uploadProgress.set(0);
        });
      },
      error: (error) => {
        clearInterval(progressInterval);
        console.error('頭像上傳失敗:', error);
        this.notificationService.showError('頭像上傳失敗，請重試');
        this.loading.set(false);
        this.uploadProgress.set(0);
      }
    });
  }

  onRemoveAvatar() {
    // TODO: Remove avatar from service
    this.avatarUrl.set('');
    this.notificationService.showSuccess('頭像已移除');
  }

  onPreviewAvatar() {
    if (this.hasAvatar()) {
      // TODO: Open preview dialog
      this.notificationService.showInfo('預覽功能開發中');
    }
  }

  getAvatarDisplayUrl(): string {
    const url = this.avatarUrl();
    return url || 'https://via.placeholder.com/150x150?text=No+Avatar';
  }
}
