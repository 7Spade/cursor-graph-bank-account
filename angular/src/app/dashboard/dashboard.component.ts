import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Dashboard</span>
        <span class="spacer"></span>
        <button mat-button color="accent" (click)="navigateToAccount()">
          <mat-icon>account_circle</mat-icon> Account
        </button>
        <button mat-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-toolbar>

      <div class="dashboard-content">
        <mat-card class="welcome-card">
          <h1 class="welcome-title">Welcome to Angular Fire RoleKit! 🎉</h1>
          <p class="welcome-subtitle">GitHub 式多層級權限系統</p>
          
          @if (currentAccount()) {
            <div class="user-info">
              <mat-divider></mat-divider>
              <h3>👤 User Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon>person</mat-icon>
                  <span><strong>Name:</strong> {{ currentAccount()?.profile?.name || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <mat-icon>email</mat-icon>
                  <span><strong>Email:</strong> {{ currentAccount()?.profile?.email || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <mat-icon>badge</mat-icon>
                  <span><strong>Type:</strong> {{ currentAccount()?.type | titlecase }}</span>
                </div>
                <div class="info-item">
                  <mat-icon>security</mat-icon>
                  <span><strong>Roles:</strong> {{ currentAccount()?.permissions?.roles?.join(', ') || 'N/A' }}</span>
                </div>
              </div>
            </div>
          }

          <mat-divider></mat-divider>
          
          <div class="quick-actions">
            <h3>🚀 Quick Actions</h3>
            <div class="action-buttons">
              <button mat-raised-button color="primary" (click)="navigateToAccount()">
                <mat-icon>account_circle</mat-icon>
                Manage Account
              </button>
              
              <button mat-raised-button color="accent" (click)="navigateToOrganizations()">
                <mat-icon>business</mat-icon>
                Organizations
              </button>
              
              <button mat-raised-button color="primary" (click)="navigateToRepositories()">
                <mat-icon>folder</mat-icon>
                Repositories
              </button>
            </div>
          </div>

          <mat-divider></mat-divider>
          
          <div class="system-info">
            <h3>ℹ️ System Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>build</mat-icon>
                <span><strong>Framework:</strong> Angular 20.1.0</span>
              </div>
              <div class="info-item">
                <mat-icon>cloud</mat-icon>
                <span><strong>Backend:</strong> Firebase 11.10.0</span>
              </div>
              <div class="info-item">
                <mat-icon>security</mat-icon>
                <span><strong>Auth:</strong> Firebase Auth + Firestore</span>
              </div>
              <div class="info-item">
                <mat-icon>palette</mat-icon>
                <span><strong>UI:</strong> Angular Material 20.1.0</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .toolbar {
      background-color: #e3f2fd;
      color: #0d47a1;
      padding: 0 24px;
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .dashboard-content {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .welcome-card {
      padding: 32px;
      border-radius: 20px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 8px;
    }

    .welcome-subtitle {
      font-size: 18px;
      color: #666;
      text-align: center;
      margin-bottom: 32px;
    }

    .user-info, .quick-actions, .system-info {
      margin: 24px 0;
    }

    .user-info h3, .quick-actions h3, .system-info h3 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .info-item mat-icon {
      color: #1976d2;
      font-size: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .action-buttons button {
      flex: 1;
      min-width: 200px;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-icon {
      vertical-align: middle;
      font-size: 20px;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 16px;
      }
      
      .welcome-card {
        padding: 24px;
      }
      
      .welcome-title {
        font-size: 24px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .action-buttons button {
        min-width: auto;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // 使用 Signals 獲取當前用戶信息
  readonly currentAccount = this.authService.currentAccount;
  readonly isAuthenticated = this.authService.isAuthenticated;

  navigateToAccount() {
    this.router.navigate(['/account']);
  }

  navigateToOrganizations() {
    this.router.navigate(['/organizations']);
  }

  navigateToRepositories() {
    this.router.navigate(['/repositories']);
  }

  logout() {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
