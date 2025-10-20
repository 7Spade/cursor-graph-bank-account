import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Team } from '../../../core/models/auth.model';

/**
 * 團隊編輯組件
 * 允許團隊管理員編輯團隊資訊
 */
@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="team-edit-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入團隊編輯頁面中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="loadTeam()">重試</button>
        </div>
      } @else if (team()) {
        <mat-card class="edit-card">
          <mat-card-header>
            <mat-card-title>編輯團隊</mat-card-title>
            <mat-card-subtitle>{{ team()?.name }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p>團隊編輯功能即將推出...</p>
            <p>目前可以編輯的內容包括：</p>
            <ul>
              <li>團隊名稱和描述</li>
              <li>團隊權限設定</li>
              <li>團隊成員管理</li>
            </ul>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              返回
            </button>
            
            <div class="spacer"></div>
            
            <button mat-raised-button color="primary" (click)="saveTeam()" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>save</mat-icon>
              }
              儲存變更
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .team-edit-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      gap: 16px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      gap: 16px;
      color: var(--mdc-theme-error);
    }

    .edit-card {
      .spacer {
        flex: 1;
      }

      mat-card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      ul {
        margin: 16px 0;
        padding-left: 20px;
        
        li {
          margin: 8px 0;
        }
      }
    }

    @media (max-width: 600px) {
      .team-edit-container {
        padding: 16px;
      }
    }
  `]
})
export class TeamEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);

  // Signals
  team = signal<Team | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  orgId!: string;
  teamId!: string;

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId')!;
    this.teamId = this.route.snapshot.paramMap.get('teamId')!;
    
    if (!this.orgId || !this.teamId) {
      this.error.set('無效的組織或團隊 ID');
      return;
    }

    // 檢查權限
    if (!this.permissionService.canManageTeams()) {
      this.error.set('您沒有權限編輯團隊');
      return;
    }

    await this.loadTeam();
  }

  async loadTeam() {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      
      // TODO: 實作載入團隊詳情的邏輯
      // const team = await this.orgService.getTeam(this.orgId, this.teamId).toPromise();
      // this.team.set(team || null);
      
      // 暫時使用模擬數據
      this.team.set({
        id: this.teamId,
        organizationId: this.orgId,
        name: '範例團隊',
        slug: 'example-team',
        description: '這是一個範例團隊',
        privacy: 'open',
        permission: 'read',
        permissions: {
          repository: { read: true, write: false, admin: false },
          issues: { read: true, write: false, delete: false },
          pullRequests: { read: true, write: false, merge: false }
        },
        members: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
    } catch (error) {
      this.error.set(`載入團隊詳情失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveTeam() {
    try {
      this.isSubmitting.set(true);
      
      // TODO: 實作儲存團隊變更的邏輯
      // await this.orgService.updateTeam(this.orgId, this.teamId, teamData);
      
      this.notificationService.showSuccess('團隊已更新');
      this.goBack();
      
    } catch (error) {
      this.notificationService.showError(`更新失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
