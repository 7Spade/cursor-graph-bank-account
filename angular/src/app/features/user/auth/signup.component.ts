import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
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
    MatProgressSpinnerModule,
    MatCheckboxModule,
    RouterModule,
  ],
  template: `
    <div class="signup-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Sign Up</span>
        <span class="spacer"></span>
        <mat-icon>person_add</mat-icon>
      </mat-toolbar>

      <mat-card class="signup-card">
        <h1 class="title">Create Your Account ✨</h1>

        <form (ngSubmit)="onSignup()">
          <mat-form-field appearance="outline" class="field">
            <mat-label>顯示名稱</mat-label>
            <input matInput [(ngModel)]="displayName" name="displayName" required />
            <mat-hint>這是您在系統中顯示的名稱</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>電子郵件</mat-label>
            <input matInput [(ngModel)]="email" name="email" required type="email" />
            <mat-hint>請使用有效的電子郵件地址</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>密碼</mat-label>
            <input matInput type="password" [(ngModel)]="password" name="password" required />
            <mat-hint>密碼需要包含大小寫字母、數字和特殊字元</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>確認密碼</mat-label>
            <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required />
            <mat-hint>請再次輸入密碼</mat-hint>
          </mat-form-field>

          <mat-checkbox [(ngModel)]="agreeToTerms" name="agreeToTerms" class="terms-checkbox">
            我同意 <a href="/terms" target="_blank">使用條款</a> 和 <a href="/privacy" target="_blank">隱私政策</a>
          </mat-checkbox>

          <button mat-stroked-button color="primary" class="action-btn" type="submit" [disabled]="isLoading()">
            @if (!isLoading()) {
              建立帳號
            } @else {
              <mat-spinner diameter="24"></mat-spinner>
            }
          </button>

          @if (error()) {
            <div class="error-message">
              <mat-icon>error</mat-icon>
              <span [innerHTML]="error()"></span>
            </div>
          }

          <div class="login-link">
            已經有帳號？<a routerLink="/login">登入</a>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .signup-wrapper {
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

    .signup-card {
      max-width: 500px;
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
      margin-bottom: 20px;
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
      margin-right: 8px;
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

    .terms-checkbox {
      display: block;
      margin: 16px 0;
    }

    .login-link {
      margin-top: 16px;
      text-align: center;
      color: #666;
    }

    .login-link a {
      color: #1976d2;
      text-decoration: none;
      margin-left: 8px;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class SignupComponent {
  email = '';
  password = '';
  confirmPassword = '';
  displayName = '';
  agreeToTerms = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  // 使用 Signals 獲取狀態
  readonly isLoading = this.authService.isLoading;
  readonly error = this.authService.error;

  // 密碼強度要求
  private readonly passwordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
  };

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): string[] {
    const errors: string[] = [];
    
    if (password.length < this.passwordRequirements.minLength) {
      errors.push(`密碼長度至少需要 ${this.passwordRequirements.minLength} 個字元`);
    }
    
    if (this.passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密碼需要包含大寫字母');
    }
    
    if (this.passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('密碼需要包含小寫字母');
    }
    
    if (this.passwordRequirements.requireNumber && !/[0-9]/.test(password)) {
      errors.push('密碼需要包含數字');
    }
    
    if (this.passwordRequirements.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密碼需要包含特殊字元');
    }
    
    return errors;
  }

  validateForm(): string[] {
    const errors: string[] = [];
    
    if (!this.email) {
      errors.push('請輸入電子郵件');
    } else if (!this.validateEmail(this.email)) {
      errors.push('請輸入有效的電子郵件格式');
    }
    
    if (!this.password) {
      errors.push('請輸入密碼');
    } else {
      const passwordErrors = this.validatePassword(this.password);
      errors.push(...passwordErrors);
    }
    
    if (!this.confirmPassword) {
      errors.push('請確認密碼');
    } else if (this.password !== this.confirmPassword) {
      errors.push('密碼與確認密碼不符');
    }
    
    if (!this.displayName) {
      errors.push('請輸入顯示名稱');
    }
    
    if (!this.agreeToTerms) {
      errors.push('請同意使用條款和隱私政策');
    }
    
    return errors;
  }

  async onSignup() {
    this.authService.clearError();
    
    const errors = this.validateForm();
    if (errors.length > 0) {
      this.authService.setError(errors.join('\n'));
      return;
    }

    try {
      await this.authService.createUserWithEmailAndPassword(
        this.email,
        this.password,
        this.displayName
      );
      this.router.navigate(['/dashboard']);
    } catch (error) {
      // 錯誤處理已經在 AuthService 中完成
      console.error('Signup error:', error);
    }
  }
}
