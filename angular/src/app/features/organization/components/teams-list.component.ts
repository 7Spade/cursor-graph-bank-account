import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Team } from '../../../core/models/auth.model';

/**
 * 團隊列表組件
 * 顯示組織的所有團隊並提供管理功能
 */
@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="teams-list-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入團隊列表中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="loadTeams()">重試</button>
        </div>
      } @else {
        <mat-card class="teams-card">
          <mat-card-header>
            <mat-card-title>組織團隊</mat-card-title>
            <mat-card-subtitle>管理組織的團隊結構</mat-card-subtitle>
            
            @if (canManageTeams()) {
              <div class="card-actions">
                <button mat-raised-button color="primary" (click)="createTeam()">
                  <mat-icon>add</mat-icon>
                  建立團隊
                </button>
              </div>
            }
          </mat-card-header>

          <mat-card-content>
            @if (teams().length > 0) {
              <div class="teams-grid">
                @for (team of teams(); track team.id) {
                  <mat-card class="team-card">
                    <mat-card-header>
                      <mat-card-title>{{ team.name }}</mat-card-title>
                      <mat-card-subtitle>{{ team.slug }}</mat-card-subtitle>
                      
                      <div class="team-actions">
                        <button 
                          mat-icon-button 
                          [matMenuTriggerFor]="teamMenu"
                          (click)="$event.stopPropagation()">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        
                        <mat-menu #teamMenu="matMenu">
                          <button mat-menu-item (click)="viewTeam(team.id)">
                            <mat-icon>visibility</mat-icon>
                            <span>查看詳情</span>
                          </button>
                          @if (canManageTeams()) {
                            <button mat-menu-item (click)="editTeam(team.id)">
                              <mat-icon>edit</mat-icon>
                              <span>編輯團隊</span>
                            </button>
                            <button mat-menu-item (click)="deleteTeam(team)" class="delete-action">
                              <mat-icon>delete</mat-icon>
                              <span>刪除團隊</span>
                            </button>
                          }
                        </mat-menu>
                      </div>
                    </mat-card-header>

                    <mat-card-content>
                      @if (team.description) {
                        <p class="team-description">{{ team.description }}</p>
                      } @else {
                        <p class="team-description no-description">暫無描述</p>
                      }
                      
                      <div class="team-permissions">
                        <mat-chip-set>
                          @if (team.permissions.repository.read) {
                            <mat-chip>Repository 讀取</mat-chip>
                          }
                          @if (team.permissions.repository.write) {
                            <mat-chip>Repository 寫入</mat-chip>
                          }
                          @if (team.permissions.repository.admin) {
                            <mat-chip>Repository 管理</mat-chip>
                          }
                          @if (team.permissions.issues.read) {
                            <mat-chip>Issues 讀取</mat-chip>
                          }
                          @if (team.permissions.issues.write) {
                            <mat-chip>Issues 寫入</mat-chip>
                          }
                          @if (team.permissions.pullRequests.read) {
                            <mat-chip>PR 讀取</mat-chip>
                          }
                          @if (team.permissions.pullRequests.write) {
                            <mat-chip>PR 寫入</mat-chip>
                          }
                        </mat-chip-set>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button mat-button (click)="viewTeam(team.id)">
                        <mat-icon>visibility</mat-icon>
                        查看
                      </button>
                      @if (canManageTeams()) {
                        <button mat-button (click)="editTeam(team.id)">
                          <mat-icon>edit</mat-icon>
                          編輯
                        </button>
                      }
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>groups_outline</mat-icon>
                <p>尚未建立任何團隊</p>
                @if (canManageTeams()) {
                  <button mat-raised-button color="primary" (click)="createTeam()">
                    <mat-icon>add</mat-icon>
                    建立第一個團隊
                  </button>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .teams-list-container {
      padding: 24px;
      max-width: 1200px;
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

    .teams-card {
      .card-actions {
        position: absolute;
        top: 8px;
        right: 8px;
      }

      .teams-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .team-card {
        .team-actions {
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

        .team-permissions {
          margin: 16px 0;
          
          mat-chip-set {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            
            mat-chip {
              font-size: 12px;
              height: 24px;
            }
          }
        }

        .delete-action {
          color: var(--mdc-theme-error);
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 0;
        gap: 16px;
        color: var(--mdc-theme-on-surface-variant);
        
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }
    }

    @media (max-width: 600px) {
      .teams-list-container {
        padding: 16px;
      }
      
      .teams-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TeamsListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Signals
  teams = signal<Team[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  readonly canManageTeams = computed(() => 
    this.permissionService.canManageTeams()
  );

  orgId!: string;

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId')!;
    
    if (!this.orgId) {
      this.error.set('無效的組織 ID');
      return;
    }

    await this.loadTeams();
  }

  async loadTeams() {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      
      // 使用 getOrganizationTeams 方法載入團隊列表
      const teams = await firstValueFrom(
        this.orgService.getOrganizationTeams(this.orgId)
      );
      
      this.teams.set(teams);
      
    } catch (error) {
      this.error.set(`載入團隊列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  createTeam() {
    this.router.navigate(['teams', 'new'], { relativeTo: this.route });
  }

  viewTeam(teamId: string) {
    this.router.navigate(['teams', teamId], { relativeTo: this.route });
  }

  editTeam(teamId: string) {
    this.router.navigate(['teams', teamId, 'edit'], { relativeTo: this.route });
  }

  async deleteTeam(team: Team) {
    // 確認對話框
    const confirmed = confirm(`確定要刪除團隊 "${team.name}" 嗎？此操作無法復原。`);
    
    if (!confirmed) {
      return;
    }

    try {
      await this.orgService.deleteTeam(this.orgId, team.id);
      this.notificationService.showSuccess(`團隊 "${team.name}" 已成功刪除`);
      
      // 重新載入團隊列表
      await this.loadTeams();
      
    } catch (error) {
      this.notificationService.showError(`刪除團隊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
}
