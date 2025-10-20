import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../services/user.service';
import { User } from '../../../core/models/auth.model';
import { ProfileBasicInfoComponent } from './components/profile-basic-info/profile-basic-info.component';
import { SocialAccountComponent } from './components/social-account/social-account.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { AvatarUploadComponent } from './components/avatar-upload/avatar-upload.component';

/**
 * 個人資料管理組件 - 重構版本
 * 使用子組件模式，遵循單一職責原則
 */
@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProfileBasicInfoComponent,
    SocialAccountComponent,
    NotificationSettingsComponent,
    AvatarUploadComponent
  ],
  template: `
    <div class="profile-management-wrapper">
      <mat-card class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <img 
              [src]="getAvatarUrl(user()?.avatar)" 
              [alt]="user()?.displayName"
              class="avatar"
            >
          </div>
          <div class="profile-info">
            <h1 class="display-name">{{ user()?.displayName || '未設定' }}</h1>
            <p class="username">@{{ user()?.username || 'username' }}</p>
            <p class="bio" *ngIf="user()?.bio">{{ user()?.bio }}</p>
          </div>
        </div>

        <mat-tab-group class="profile-tabs">
          <!-- 基本資料 -->
          <mat-tab label="基本資料">
            <app-profile-basic-info></app-profile-basic-info>
          </mat-tab>

          <!-- 頭像設定 -->
          <mat-tab label="頭像設定">
            <app-avatar-upload></app-avatar-upload>
          </mat-tab>

          <!-- 社交帳戶 -->
          <mat-tab label="社交帳戶">
            <app-social-account></app-social-account>
          </mat-tab>

          <!-- 通知設定 -->
          <mat-tab label="通知設定">
            <app-notification-settings></app-notification-settings>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-management-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .profile-card {
      margin-bottom: 24px;
      border-radius: 16px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      padding: 24px;
      gap: 24px;
    }

    .avatar-section {
      position: relative;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e0e0e0;
    }

    .profile-info {
      flex: 1;
    }

    .display-name {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .username {
      font-size: 16px;
      color: #666;
      margin: 0 0 12px 0;
    }

    .bio {
      font-size: 14px;
      color: #666;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .profile-tabs {
      margin-top: 24px;
    }
  `]
})
export class ProfileManagementComponent implements OnInit {
  private readonly userService = inject(UserService);

  // Signals for state management
  user = signal<User | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.loading.set(true);
    
    // Load user data from service
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
        this.loading.set(false);
      }
    });
  }

  getAvatarUrl(avatar?: string): string {
    if (avatar) {
      return avatar;
    }
    // Generate default avatar based on user name
    const name = this.user()?.displayName || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=120`;
  }
}