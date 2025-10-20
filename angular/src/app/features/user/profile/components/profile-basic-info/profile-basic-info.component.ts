import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../../services/user.service';
import { User } from '../../../../../core/models/auth.model';
import { AvatarUtils } from '../../../../../core/utils/avatar.utils';

/**
 * 基本資料管理組件
 * 單一職責：處理用戶基本資料的編輯和更新
 */
@Component({
  selector: 'app-profile-basic-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="basic-info-section">
      <h3>基本資料</h3>
      <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
        <div class="form-row">
          <mat-form-field appearance="outline" class="field">
            <mat-label>顯示名稱</mat-label>
            <input matInput formControlName="displayName" placeholder="請輸入顯示名稱">
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="field">
            <mat-label>用戶名</mat-label>
            <input matInput formControlName="username" placeholder="請輸入用戶名">
            <mat-icon matSuffix>account_circle</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="field">
            <mat-label>電子郵件</mat-label>
            <input matInput formControlName="email" placeholder="請輸入電子郵件" readonly>
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="field">
            <mat-label>所在地</mat-label>
            <input matInput formControlName="location" placeholder="請輸入所在地">
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="field">
            <mat-label>公司</mat-label>
            <input matInput formControlName="company" placeholder="請輸入公司名稱">
            <mat-icon matSuffix>business</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="field">
            <mat-label>個人網站</mat-label>
            <input matInput formControlName="website" placeholder="https://example.com">
            <mat-icon matSuffix>language</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="field">
            <mat-label>部落格</mat-label>
            <input matInput formControlName="blog" placeholder="https://blog.example.com">
            <mat-icon matSuffix>article</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="field full-width">
            <mat-label>個人簡介</mat-label>
            <textarea matInput formControlName="bio" placeholder="請輸入個人簡介" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || loading()">
            <mat-icon>save</mat-icon>
            儲存變更
          </button>
          <button mat-stroked-button type="button" (click)="onResetProfile()">
            <mat-icon>refresh</mat-icon>
            重設
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .basic-info-section {
      padding: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }

    h3 {
      margin: 0 0 24px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }
  `]
})
export class ProfileBasicInfoComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  user = signal<User | null>(null);
  loading = signal(false);

  // Form
  profileForm!: FormGroup;

  ngOnInit() {
    this.initializeForm();
    this.loadUserData();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      location: [''],
      company: [''],
      website: [''],
      blog: [''],
      bio: ['']
    });
  }

  private loadUserData() {
    // Load user data from service
    // This would typically come from a user service or state management
    this.userService.getCurrentUser().subscribe(currentUser => {
      if (currentUser) {
        this.user.set(currentUser);
        this.profileForm.patchValue({
          displayName: currentUser.displayName,
          username: currentUser.username,
          email: currentUser.email,
          location: currentUser.location,
          company: currentUser.company,
          website: currentUser.website,
          blog: currentUser.blog,
          bio: currentUser.bio
        });
      }
    });
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.loading.set(true);
      
      const formValue = this.profileForm.value;
      // Update user profile
      this.userService.updateUserProfile(formValue).subscribe({
        next: (updatedUser) => {
          this.user.set(updatedUser);
          this.snackBar.open('個人資料已更新', '關閉', { duration: 3000 });
          this.loading.set(false);
        },
        error: (error) => {
          this.snackBar.open('更新失敗，請重試', '關閉', { duration: 3000 });
          this.loading.set(false);
        }
      });
    }
  }

  onResetProfile() {
    this.loadUserData();
  }
}


