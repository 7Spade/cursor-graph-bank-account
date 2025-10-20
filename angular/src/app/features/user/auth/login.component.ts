import {
  Component,
  inject,
  runInInjectionContext,
  EnvironmentInjector
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Login</span>
        <span class="spacer"></span>
        <mat-icon>lock</mat-icon>
      </mat-toolbar>

      <mat-card class="login-card">
        <h1 class="title">Welcome Back 👋</h1>
        <form (ngSubmit)="onLogin()">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="email" name="email" required />
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Password</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" required />
          </mat-form-field>

          <button mat-stroked-button color="primary" class="action-btn" type="submit" [disabled]="isLoading()">
            @if (!isLoading()) {
              Login
            } @else {
              <mat-spinner diameter="24"></mat-spinner>
            }
          </button>

          <div class="divider">
            <span>或</span>
          </div>

          <button mat-stroked-button color="warn" class="google-btn" (click)="onGoogleLogin()" [disabled]="isLoading()">
            <mat-icon>login</mat-icon>
            <span>使用 Google 登入</span>
          </button>

          @if (error()) {
            <div class="error-message">
              <mat-icon>error</mat-icon>
              <span>{{ error() }}</span>
            </div>
          }
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .toolbar {
      background: #e3f2fd;
      color: #0d47a1;
      padding: 0 24px;
    }

    .toolbar-title {
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .login-card {
      max-width: 480px;
      margin: 48px auto;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      background: white;
    }

    .title {
      font-size: 28px;
      margin-bottom: 24px;
      font-weight: 600;
      color: #333;
      text-align: center;
    }

    .field {
      width: 100%;
      margin-bottom: 10px;
    }

    .action-btn {
      width: 100%;
      padding: 25px;
      font-weight: 500;
      font-size: 16px;
      text-transform: none;
      border-radius: 8px;
      transition: background-color 0.3s ease, border-color 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .action-btn:hover {
      background-color: rgba(25, 118, 210, 0.08);
      border-color: #1976d2;
    }

    mat-icon {
      margin-left: 12px;
    }

    .divider {
      display: flex;
      align-items: center;
      margin: 20px 0;
      text-align: center;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }

    .divider span {
      padding: 0 16px;
      color: #666;
      font-size: 14px;
    }

    .google-btn {
      width: 100%;
      padding: 25px;
      font-weight: 500;
      font-size: 16px;
      text-transform: none;
      border-radius: 8px;
      transition: background-color 0.3s ease, border-color 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      background-color: #fff;
      border: 1px solid #dadce0;
      color: #3c4043;
    }

    .google-btn:hover {
      background-color: #f8f9fa;
      border-color: #dadce0;
      box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
    }

    .google-btn mat-icon {
      margin: 0;
      color: #4285f4;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border: 1px solid #f44336;
      border-radius: 8px;
      color: #d32f2f;
      font-size: 14px;
    }

    .error-message mat-icon {
      margin: 0;
      font-size: 20px;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  // 使用 Signals 獲取狀態
  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;

  async onLogin() {
    this.authService.clearError();
    
    if (!this.email || !this.password) {
      this.authService.setError('請輸入電子郵件和密碼');
      return;
    }

    try {
      await this.authService.signInWithEmailAndPassword(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      // 錯誤處理已經在 AuthService 中完成
      console.error('Login error:', error);
    }
  }

  async onGoogleLogin() {
    this.authService.clearError();
    
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      // 錯誤處理已經在 AuthService 中完成
      console.error('Google login error:', error);
    }
  }
}
