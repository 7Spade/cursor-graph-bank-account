import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

/**
 * 確認對話框組件
 * 用於顯示確認操作的對話框
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon [class]="getIconClass()">{{ getIcon() }}</mat-icon>
      {{ data.title }}
    </h2>
    
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button
        mat-button
        (click)="onCancel()">
        {{ data.cancelText || '取消' }}
      </button>
      
      <button
        mat-raised-button
        [color]="getConfirmColor()"
        (click)="onConfirm()">
        {{ data.confirmText || '確認' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    mat-dialog-content {
      padding: 16px 0;
    }

    mat-dialog-content p {
      margin: 0;
      line-height: 1.5;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      gap: 8px;
    }

    .warning-icon {
      color: #ff9800;
    }

    .danger-icon {
      color: #f44336;
    }

    .info-icon {
      color: #2196f3;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  getIconClass(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning-icon';
      case 'danger':
        return 'danger-icon';
      case 'info':
      default:
        return 'info-icon';
    }
  }

  getConfirmColor(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warn';
      case 'danger':
        return 'warn';
      case 'info':
      default:
        return 'primary';
    }
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}