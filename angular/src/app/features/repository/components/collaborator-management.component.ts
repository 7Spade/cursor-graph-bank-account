// src/app/features/repository/components/collaborator-management.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { RepositoryService } from '../../../core/services/repository.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import { RepositoryCollaborator } from '../../../core/models/auth.model';

@Component({
  selector: 'app-collaborator-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="collaborator-management-container">
      <div class="header">
        <div class="breadcrumb">
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            返回 Repository
          </button>
          <mat-icon>chevron_right</mat-icon>
          <span>協作者管理</span>
        </div>
        
        <button mat-raised-button color="primary" (click)="addCollaborator()">
          <mat-icon>person_add</mat-icon>
          添加協作者
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="goBack()">重試</button>
        </div>
      } @else {
        <mat-card>
          <mat-card-header>
            <mat-card-title>協作者列表</mat-card-title>
            <mat-card-subtitle>管理 Repository 的協作者權限</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            @if (collaborators().length === 0) {
              <div class="empty-state">
                <mat-icon>people</mat-icon>
                <h3>還沒有協作者</h3>
                <p>添加協作者開始協作</p>
                <button mat-raised-button color="primary" (click)="addCollaborator()">
                  <mat-icon>person_add</mat-icon>
                  添加協作者
                </button>
              </div>
            } @else {
              <div class="table-container">
                <table mat-table [dataSource]="collaborators()" class="collaborator-table">
                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>用戶</th>
                    <td mat-cell *matCellDef="let collaborator">
                      <div class="user-info">
                        <mat-icon class="user-avatar">account_circle</mat-icon>
                        <span>{{ collaborator.userId }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="permission">
                    <th mat-header-cell *matHeaderCellDef>權限</th>
                    <td mat-cell *matCellDef="let collaborator">
                      <mat-chip [class]="getPermissionClass(collaborator.permission)">
                        {{ getPermissionLabel(collaborator.permission) }}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>角色</th>
                    <td mat-cell *matCellDef="let collaborator">
                      {{ collaborator.roleName }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="invitedAt">
                    <th mat-header-cell *matHeaderCellDef>邀請時間</th>
                    <td mat-cell *matCellDef="let collaborator">
                      {{ formatDate(collaborator.invitedAt) }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>操作</th>
                    <td mat-cell *matCellDef="let collaborator">
                      <button mat-icon-button [matMenuTriggerFor]="menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="editPermission(collaborator)">
                          <mat-icon>edit</mat-icon>
                          修改權限
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item (click)="removeCollaborator(collaborator)" class="danger">
                          <mat-icon>remove_circle</mat-icon>
                          移除協作者
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>

    <!-- 添加協作者對話框 -->
    <div class="add-collaborator-dialog" *ngIf="showAddDialog">
      <div class="dialog-overlay" (click)="closeAddDialog()"></div>
      <div class="dialog-content">
        <h2>添加協作者</h2>
        <form (ngSubmit)="submitAddCollaborator()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>用戶 ID</mat-label>
            <input matInput [(ngModel)]="newCollaborator.userId" name="userId" required>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>權限</mat-label>
            <mat-select [(ngModel)]="newCollaborator.permission" name="permission" required>
              <mat-option value="read">讀取</mat-option>
              <mat-option value="triage">分類</mat-option>
              <mat-option value="write">寫入</mat-option>
              <mat-option value="maintain">維護</mat-option>
              <mat-option value="admin">管理員</mat-option>
            </mat-select>
          </mat-form-field>
          
          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeAddDialog()">取消</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                添加
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .collaborator-management-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .breadcrumb mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .error-container mat-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .collaborator-table {
      width: 100%;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      color: #666;
    }

    .permission-read { background-color: #e3f2fd; color: #1976d2; }
    .permission-triage { background-color: #fff3e0; color: #f57c00; }
    .permission-write { background-color: #e8f5e8; color: #388e3c; }
    .permission-maintain { background-color: #f3e5f5; color: #7b1fa2; }
    .permission-admin { background-color: #ffebee; color: #d32f2f; }

    .danger {
      color: #f44336;
    }

    .add-collaborator-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }

    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .dialog-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 8px;
      min-width: 400px;
      max-width: 90vw;
    }

    .dialog-content h2 {
      margin: 0 0 24px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .dialog-content {
        min-width: 300px;
        margin: 16px;
      }
    }
  `]
})
export class CollaboratorManagementComponent implements OnInit {
  private repositoryService = inject(RepositoryService);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  readonly collaborators = signal<RepositoryCollaborator[]>([]);
  readonly isLoading = this.repositoryService.isLoading;
  readonly error = this.repositoryService.error;

  // Dialog state
  showAddDialog = false;
  newCollaborator = {
    userId: '',
    permission: 'read' as 'read' | 'triage' | 'write' | 'maintain' | 'admin'
  };

  // Table columns
  displayedColumns: string[] = ['user', 'permission', 'role', 'invitedAt', 'actions'];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const repoId = params['id'];
      if (repoId) {
        this.loadCollaborators(repoId);
      }
    });
  }

  async loadCollaborators(repoId: string) {
    try {
      const collaborators$ = this.repositoryService.getRepositoryCollaborators(repoId);
      collaborators$.subscribe(collaborators => {
        this.collaborators.set(collaborators);
      });
    } catch (error) {
      console.error('Failed to load collaborators:', error);
    }
  }

  goBack() {
    this.router.navigate(['/repositories']);
  }

  addCollaborator() {
    this.showAddDialog = true;
    this.newCollaborator = {
      userId: '',
      permission: 'read'
    };
  }

  closeAddDialog() {
    this.showAddDialog = false;
  }

  async submitAddCollaborator() {
    try {
      const repoId = this.route.snapshot.params['id'];
      await this.repositoryService.addCollaborator(
        repoId,
        this.newCollaborator.userId,
        this.newCollaborator.permission
      );
      
      this.closeAddDialog();
      await this.loadCollaborators(repoId);
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    }
  }

  editPermission(collaborator: RepositoryCollaborator) {
    // TODO: 實現編輯權限功能
    // 使用適當的日誌記錄服務替代 console.log
    this.logger.debug('Edit permission for:', collaborator);
  }

  async removeCollaborator(collaborator: RepositoryCollaborator) {
    if (confirm(`確定要移除協作者 ${collaborator.userId} 嗎？`)) {
      try {
        const repoId = this.route.snapshot.params['id'];
        await this.repositoryService.removeCollaborator(repoId, collaborator.userId);
        await this.loadCollaborators(repoId);
      } catch (error) {
        console.error('Failed to remove collaborator:', error);
      }
    }
  }

  getPermissionLabel(permission: string): string {
    const labels: { [key: string]: string } = {
      'read': '讀取',
      'triage': '分類',
      'write': '寫入',
      'maintain': '維護',
      'admin': '管理員'
    };
    return labels[permission] || permission;
  }

  getPermissionClass(permission: string): string {
    return `permission-${permission}`;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days} 天前`;
    } else {
      return date.toLocaleDateString('zh-TW');
    }
  }
}
