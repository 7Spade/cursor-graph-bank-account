import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SecurityManager, SecurityPermission } from '../../../core/models/auth.model';
import { PermissionService } from '../../../core/services/permission.service';

/**
 * 安全管理器組件
 * 管理組織的安全權限和安全管理員
 */
@Component({
  selector: 'app-security-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="security-manager-container">
      <!-- 標題區域 -->
      <div class="header-section">
        <div class="title-section">
          <h2 class="page-title">
            <mat-icon>security</mat-icon>
            安全管理器
          </h2>
          <p class="page-description">
            管理組織的安全權限和安全管理員設定
          </p>
        </div>
        <div class="action-section">
          <button 
            mat-raised-button 
            color="primary"
            (click)="openAddSecurityManagerDialog()"
            [disabled]="isLoading()">
            <mat-icon>add</mat-icon>
            新增安全管理員
          </button>
        </div>
      </div>

      <!-- 統計卡片 -->
      <div class="stats-section">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">admin_panel_settings</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ securityManagers().length }}</div>
                <div class="stat-label">安全管理員</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">verified_user</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ totalPermissions() }}</div>
                <div class="stat-label">總權限數</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">group</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ userSecurityManagers().length }}</div>
                <div class="stat-label">用戶管理員</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">groups</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ teamSecurityManagers().length }}</div>
                <div class="stat-label">團隊管理員</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 安全管理員列表 -->
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>安全管理員列表</mat-card-title>
          <mat-card-subtitle>管理組織的安全權限設定</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="table-container" *ngIf="!isLoading(); else loadingTemplate">
            <table mat-table [dataSource]="securityManagers()" class="security-table">
              <!-- 類型欄位 -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>類型</th>
                <td mat-cell *matCellDef="let manager">
                  <mat-chip-set>
                    <mat-chip [color]="getTypeColor(manager.type)">
                      <mat-icon>{{ getTypeIcon(manager.type) }}</mat-icon>
                      {{ getTypeLabel(manager.type) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 實體欄位 -->
              <ng-container matColumnDef="entity">
                <th mat-header-cell *matHeaderCellDef>實體</th>
                <td mat-cell *matCellDef="let manager">
                  <div class="entity-info">
                    <mat-icon class="entity-icon">{{ getTypeIcon(manager.type) }}</mat-icon>
                    <span class="entity-name">{{ getEntityName(manager) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- 權限數量欄位 -->
              <ng-container matColumnDef="permissions">
                <th mat-header-cell *matHeaderCellDef>權限數量</th>
                <td mat-cell *matCellDef="let manager">
                  <mat-chip-set>
                    <mat-chip color="accent">
                      {{ manager.permissions.length }} 個權限
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 指派時間欄位 -->
              <ng-container matColumnDef="assignedAt">
                <th mat-header-cell *matHeaderCellDef>指派時間</th>
                <td mat-cell *matCellDef="let manager">
                  {{ formatDate(manager.assignedAt) }}
                </td>
              </ng-container>

              <!-- 指派者欄位 -->
              <ng-container matColumnDef="assignedBy">
                <th mat-header-cell *matHeaderCellDef>指派者</th>
                <td mat-cell *matCellDef="let manager">
                  <div class="assigned-by">
                    <mat-icon class="user-icon">person</mat-icon>
                    {{ manager.assignedBy }}
                  </div>
                </td>
              </ng-container>

              <!-- 操作欄位 -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let manager">
                  <button 
                    mat-icon-button 
                    [matMenuTriggerFor]="actionMenu"
                    [matTooltip]="'更多操作'">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="viewPermissions(manager)">
                      <mat-icon>visibility</mat-icon>
                      查看權限
                    </button>
                    <button mat-menu-item (click)="editSecurityManager(manager)">
                      <mat-icon>edit</mat-icon>
                      編輯
                    </button>
                    <button mat-menu-item (click)="removeSecurityManager(manager)" class="danger-action">
                      <mat-icon>delete</mat-icon>
                      移除
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <ng-template #loadingTemplate>
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>載入安全管理員資料中...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .security-manager-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .title-section {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
      color: #1976d2;
    }

    .page-description {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .action-section {
      display: flex;
      gap: 12px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .stat-details {
      flex: 1;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      line-height: 1;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .main-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .table-container {
      overflow-x: auto;
    }

    .security-table {
      width: 100%;
    }

    .entity-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .entity-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .entity-name {
      font-weight: 500;
    }

    .assigned-by {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .danger-action {
      color: #f44336;
    }

    .danger-action mat-icon {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .security-manager-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class SecurityManagerComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // 響應式狀態
  private _isLoading = signal(false);
  private _securityManagers = signal<SecurityManager[]>([]);

  // 公開的只讀 signals
  readonly isLoading = this._isLoading.asReadonly();
  readonly securityManagers = this._securityManagers.asReadonly();

  // 計算屬性
  readonly userSecurityManagers = computed(() => 
    this.securityManagers().filter(sm => sm.type === 'user')
  );

  readonly teamSecurityManagers = computed(() => 
    this.securityManagers().filter(sm => sm.type === 'team')
  );

  readonly totalPermissions = computed(() => 
    this.securityManagers().reduce((total, sm) => total + sm.permissions.length, 0)
  );

  // 表格配置
  displayedColumns: string[] = [
    'type', 
    'entity', 
    'permissions', 
    'assignedAt', 
    'assignedBy', 
    'actions'
  ];

  ngOnInit(): void {
    this.loadSecurityManagers();
  }

  /**
   * 載入安全管理員資料
   */
  private async loadSecurityManagers(): Promise<void> {
    this._isLoading.set(true);
    try {
      // 暫時使用空數組，等待實際實現
      const managers: any[] = [];
      this._securityManagers.set(managers);
    } catch (error) {
      console.error('載入安全管理員失敗:', error);
      this.snackBar.open('載入安全管理員資料失敗', '關閉', { duration: 3000 });
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * 獲取類型顏色
   */
  getTypeColor(type: 'user' | 'team'): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'user': return 'primary';
      case 'team': return 'accent';
      default: return 'warn';
    }
  }

  /**
   * 獲取類型圖標
   */
  getTypeIcon(type: 'user' | 'team'): string {
    switch (type) {
      case 'user': return 'person';
      case 'team': return 'groups';
      default: return 'help';
    }
  }

  /**
   * 獲取類型標籤
   */
  getTypeLabel(type: 'user' | 'team'): string {
    switch (type) {
      case 'user': return '用戶';
      case 'team': return '團隊';
      default: return '未知';
    }
  }

  /**
   * 獲取實體名稱
   */
  getEntityName(manager: SecurityManager): string {
    // 這裡應該根據 entityId 查找實際的用戶名或團隊名
    // 簡化實作，直接返回 ID
    return manager.entityId;
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 開啟新增安全管理員對話框
   */
  openAddSecurityManagerDialog(): void {
    // TODO: 實作新增安全管理員對話框
    this.snackBar.open('新增安全管理員功能開發中', '關閉', { duration: 3000 });
  }

  /**
   * 查看權限
   */
  viewPermissions(manager: SecurityManager): void {
    // TODO: 實作查看權限對話框
    this.snackBar.open(`查看 ${manager.entityId} 的權限`, '關閉', { duration: 3000 });
  }

  /**
   * 編輯安全管理員
   */
  editSecurityManager(manager: SecurityManager): void {
    // TODO: 實作編輯安全管理員對話框
    this.snackBar.open(`編輯 ${manager.entityId} 的安全管理員設定`, '關閉', { duration: 3000 });
  }

  /**
   * 移除安全管理員
   */
  removeSecurityManager(manager: SecurityManager): void {
    // TODO: 實作移除安全管理員確認對話框
    this.snackBar.open(`移除 ${manager.entityId} 的安全管理員`, '關閉', { duration: 3000 });
  }
}