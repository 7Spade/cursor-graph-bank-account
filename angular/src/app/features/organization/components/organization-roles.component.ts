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
import { MatBadgeModule } from '@angular/material/badge';

import { OrganizationRole, Permission } from '../../../core/models/auth.model';
import { PermissionService } from '../../../core/services/permission.service';

/**
 * 組織角色系統組件
 * 管理組織的角色和權限設定
 */
@Component({
  selector: 'app-organization-roles',
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
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  template: `
    <div class="organization-roles-container">
      <!-- 標題區域 -->
      <div class="header-section">
        <div class="title-section">
          <h2 class="page-title">
            <mat-icon>admin_panel_settings</mat-icon>
            組織角色系統
          </h2>
          <p class="page-description">
            管理組織的角色和權限設定，建立完整的權限體系
          </p>
        </div>
        <div class="action-section">
          <button 
            mat-raised-button 
            color="primary"
            (click)="openCreateRoleDialog()"
            [disabled]="isLoading()">
            <mat-icon>add</mat-icon>
            新增角色
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
                <div class="stat-number">{{ organizationRoles().length }}</div>
                <div class="stat-label">總角色數</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">build</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ systemRoles().length }}</div>
                <div class="stat-label">系統角色</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">person_add</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ customRoles().length }}</div>
                <div class="stat-label">自訂角色</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">security</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ totalPermissions() }}</div>
                <div class="stat-label">總權限數</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 角色列表 -->
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>角色列表</mat-card-title>
          <mat-card-subtitle>管理組織的角色和權限設定</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="table-container" *ngIf="!isLoading(); else loadingTemplate">
            <table mat-table [dataSource]="organizationRoles()" class="roles-table">
              <!-- 角色名稱欄位 -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>角色名稱</th>
                <td mat-cell *matCellDef="let role">
                  <div class="role-name">
                    <mat-icon class="role-icon">{{ getRoleIcon(role.level) }}</mat-icon>
                    <div class="role-details">
                      <div class="role-title">{{ role.name }}</div>
                      <div class="role-description">{{ role.description }}</div>
                    </div>
                    <mat-chip *ngIf="role.isSystemRole" color="accent" class="system-chip">
                      系統角色
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- 等級欄位 -->
              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef>等級</th>
                <td mat-cell *matCellDef="let role">
                  <mat-chip-set>
                    <mat-chip [color]="getLevelColor(role.level)">
                      <mat-icon>star</mat-icon>
                      Level {{ role.level }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 權限數量欄位 -->
              <ng-container matColumnDef="permissions">
                <th mat-header-cell *matHeaderCellDef>權限數量</th>
                <td mat-cell *matCellDef="let role">
                  <mat-chip-set>
                    <mat-chip color="primary">
                      <mat-icon>security</mat-icon>
                      {{ role.permissions.length }} 個權限
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- 權限範圍欄位 -->
              <ng-container matColumnDef="scopes">
                <th mat-header-cell *matHeaderCellDef>權限範圍</th>
                <td mat-cell *matCellDef="let role">
                  <div class="scopes-container">
                    <mat-chip 
                      *ngFor="let scope of getUniqueScopes(role.permissions)" 
                      [color]="getScopeColor(scope)"
                      class="scope-chip">
                      {{ getScopeLabel(scope) }}
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- 建立時間欄位 -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>建立時間</th>
                <td mat-cell *matCellDef="let role">
                  {{ formatDate(role.createdAt) }}
                </td>
              </ng-container>

              <!-- 操作欄位 -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>操作</th>
                <td mat-cell *matCellDef="let role">
                  <button 
                    mat-icon-button 
                    [matMenuTriggerFor]="actionMenu"
                    [matTooltip]="'更多操作'">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="viewRoleDetails(role)">
                      <mat-icon>visibility</mat-icon>
                      查看詳情
                    </button>
                    <button mat-menu-item (click)="editRole(role)" [disabled]="role.isSystemRole">
                      <mat-icon>edit</mat-icon>
                      編輯角色
                    </button>
                    <button mat-menu-item (click)="duplicateRole(role)">
                      <mat-icon>content_copy</mat-icon>
                      複製角色
                    </button>
                    <button mat-menu-item (click)="deleteRole(role)" [disabled]="role.isSystemRole" class="danger-action">
                      <mat-icon>delete</mat-icon>
                      刪除角色
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
              <p>載入角色資料中...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .organization-roles-container {
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

    .roles-table {
      width: 100%;
    }

    .role-name {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .role-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #1976d2;
    }

    .role-details {
      flex: 1;
    }

    .role-title {
      font-weight: 500;
      font-size: 16px;
      color: #333;
    }

    .role-description {
      font-size: 14px;
      color: #666;
      margin-top: 2px;
    }

    .system-chip {
      font-size: 12px;
    }

    .scopes-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .scope-chip {
      font-size: 12px;
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
      .organization-roles-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .role-name {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class OrganizationRolesComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // 響應式狀態
  private _isLoading = signal(false);
  private _organizationRoles = signal<OrganizationRole[]>([]);

  // 公開的只讀 signals
  readonly isLoading = this._isLoading.asReadonly();
  readonly organizationRoles = this._organizationRoles.asReadonly();

  // 計算屬性
  readonly systemRoles = computed(() => 
    this.organizationRoles().filter(role => role.isSystemRole)
  );

  readonly customRoles = computed(() => 
    this.organizationRoles().filter(role => !role.isSystemRole)
  );

  readonly totalPermissions = computed(() => 
    this.organizationRoles().reduce((total, role) => total + role.permissions.length, 0)
  );

  // 表格配置
  displayedColumns: string[] = [
    'name', 
    'level', 
    'permissions', 
    'scopes', 
    'createdAt', 
    'actions'
  ];

  ngOnInit(): void {
    this.loadOrganizationRoles();
  }

  /**
   * 載入組織角色資料
   */
  private async loadOrganizationRoles(): Promise<void> {
    this._isLoading.set(true);
    try {
      // 暫時使用空數組，等待實際實現
      const roles: any[] = [];
      this._organizationRoles.set(roles);
    } catch (error) {
      console.error('載入組織角色失敗:', error);
      this.snackBar.open('載入組織角色資料失敗', '關閉', { duration: 3000 });
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * 獲取角色圖標
   */
  getRoleIcon(level: number): string {
    if (level >= 8) return 'admin_panel_settings';
    if (level >= 5) return 'security';
    if (level >= 3) return 'verified_user';
    return 'person';
  }

  /**
   * 獲取等級顏色
   */
  getLevelColor(level: number): 'primary' | 'accent' | 'warn' {
    if (level >= 8) return 'warn';
    if (level >= 5) return 'accent';
    return 'primary';
  }

  /**
   * 獲取唯一權限範圍
   */
  getUniqueScopes(permissions: Permission[]): string[] {
    const scopes = permissions.map(p => p.scope);
    return [...new Set(scopes)];
  }

  /**
   * 獲取範圍顏色
   */
  getScopeColor(scope: string): 'primary' | 'accent' | 'warn' {
    switch (scope) {
      case 'organization': return 'warn';
      case 'team': return 'accent';
      case 'project': return 'primary';
      case 'user': return 'primary';
      default: return 'primary';
    }
  }

  /**
   * 獲取範圍標籤
   */
  getScopeLabel(scope: string): string {
    switch (scope) {
      case 'organization': return '組織';
      case 'team': return '團隊';
      case 'project': return '專案';
      case 'user': return '用戶';
      default: return scope;
    }
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
   * 開啟新增角色對話框
   */
  openCreateRoleDialog(): void {
    // TODO: 實作新增角色對話框
    this.snackBar.open('新增角色功能開發中', '關閉', { duration: 3000 });
  }

  /**
   * 查看角色詳情
   */
  viewRoleDetails(role: OrganizationRole): void {
    // TODO: 實作查看角色詳情對話框
    this.snackBar.open(`查看角色 ${role.name} 的詳情`, '關閉', { duration: 3000 });
  }

  /**
   * 編輯角色
   */
  editRole(role: OrganizationRole): void {
    // TODO: 實作編輯角色對話框
    this.snackBar.open(`編輯角色 ${role.name}`, '關閉', { duration: 3000 });
  }

  /**
   * 複製角色
   */
  duplicateRole(role: OrganizationRole): void {
    // TODO: 實作複製角色功能
    this.snackBar.open(`複製角色 ${role.name}`, '關閉', { duration: 3000 });
  }

  /**
   * 刪除角色
   */
  deleteRole(role: OrganizationRole): void {
    // TODO: 實作刪除角色確認對話框
    this.snackBar.open(`刪除角色 ${role.name}`, '關閉', { duration: 3000 });
  }
}