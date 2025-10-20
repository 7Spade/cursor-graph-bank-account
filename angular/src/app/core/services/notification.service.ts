import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationOptions {
  duration?: number;
  action?: string;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

/**
 * NotificationService - 通知服務
 * 提供統一的用戶通知功能
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * 顯示成功通知
   */
  showSuccess(message: string, options?: NotificationOptions): void {
    this.snackBar.open(message, options?.action || '關閉', {
      duration: options?.duration || 3000,
      horizontalPosition: options?.horizontalPosition || 'center',
      verticalPosition: options?.verticalPosition || 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * 顯示錯誤通知
   */
  showError(message: string, options?: NotificationOptions): void {
    this.snackBar.open(message, options?.action || '關閉', {
      duration: options?.duration || 5000,
      horizontalPosition: options?.horizontalPosition || 'center',
      verticalPosition: options?.verticalPosition || 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * 顯示警告通知
   */
  showWarning(message: string, options?: NotificationOptions): void {
    this.snackBar.open(message, options?.action || '關閉', {
      duration: options?.duration || 4000,
      horizontalPosition: options?.horizontalPosition || 'center',
      verticalPosition: options?.verticalPosition || 'bottom',
      panelClass: ['warning-snackbar']
    });
  }

  /**
   * 顯示信息通知
   */
  showInfo(message: string, options?: NotificationOptions): void {
    this.snackBar.open(message, options?.action || '關閉', {
      duration: options?.duration || 3000,
      horizontalPosition: options?.horizontalPosition || 'center',
      verticalPosition: options?.verticalPosition || 'bottom',
      panelClass: ['info-snackbar']
    });
  }

  // 支援現有組織管理功能的方法
  showValidationErrors(errors: string[]): void {
    const message = errors.join('\n');
    this.showError(message);
  }

  showOrganizationCreatedSuccess(organizationName: string): void {
    this.showSuccess(`組織 "${organizationName}" 創建成功！`);
  }

  showOrganizationCreatedError(errorMessage: string): void {
    this.showError(`組織創建失敗：${errorMessage}`);
  }
}