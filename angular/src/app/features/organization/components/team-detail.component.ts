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
 * 團隊詳情組件
 * 顯示團隊的詳細資訊
 */
@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="team-detail-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入團隊詳情中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="loadTeam()">重試</button>
        </div>
      } @else if (team()) {
        <mat-card class="team-card">
          <mat-card-header>
            <mat-card-title>{{ team()?.name }}</mat-card-title>
            <mat-card-subtitle>{{ team()?.slug }}</mat-card-subtitle>
            
            <div class="card-actions">
              @if (canManageTeam()) {
                <button mat-icon-button (click)="editTeam()">
                  <mat-icon>edit</mat-icon>
                </button>
              }
            </div>
          </mat-card-header>

          <mat-card-content>
            @if (team()?.description) {
              <p class="team-description">{{ team()?.description }}</p>
            } @else {
              <p class="team-description no-description">暫無描述</p>
            }
            
            <div class="team-info">
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <span>建立時間: {{ team()?.createdAt | date: 'yyyy-MM-dd HH:mm' }}</span>
              </div>
              <div class="info-item">
                <mat-icon>update</mat-icon>
                <span>更新時間: {{ team()?.updatedAt | date: 'yyyy-MM-dd HH:mm' }}</span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              返回
            </button>
            
            @if (canManageTeam()) {
              <button mat-raised-button color="primary" (click)="editTeam()">
                <mat-icon>edit</mat-icon>
                編輯團隊
              </button>
            }
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .team-detail-container {
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

    .team-card {
      .card-actions {
        position: absolute;
        top: 8px;
        right: 8px;
      }

      .team-description {
        margin: 16px 0;
        color: var(--mdc-theme-on-surface-variant);
        line-height: 1.5;
        
        &.no-description {
          font-style: italic;
          opacity: 0.7;
        }
      }

      .team-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 16px 0;
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--mdc-theme-on-surface-variant);
          font-size: 14px;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
    }

    @media (max-width: 600px) {
      .team-detail-container {
        padding: 16px;
      }
    }
  `]
})
export class TeamDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);

  // Signals
  team = signal<Team | null>(null);
  isLoading = signal(false);
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

  canManageTeam(): boolean {
    // TODO: 實作團隊管理權限檢查
    return true;
  }

  editTeam() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
