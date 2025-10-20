import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { OrganizationService } from '../../../core/services/organization.service';
import { PermissionService } from '../../../core/services/permission.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrganizationMember, OrgRole } from '../../../core/models/auth.model';

/**
 * 成員列表組件
 * 顯示組織成員列表並允許管理員管理成員角色
 */
@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="members-list-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入成員列表中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon>error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="loadMembers()">重試</button>
        </div>
      } @else {
        <mat-card class="members-card">
          <mat-card-header>
            <mat-card-title>組織成員</mat-card-title>
            <mat-card-subtitle>管理組織成員和角色</mat-card-subtitle>
            
            @if (canManageMembers()) {
              <div class="card-actions">
                <button mat-icon-button (click)="inviteMember()">
                  <mat-icon>person_add</mat-icon>
                </button>
              </div>
            }
          </mat-card-header>

          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="members()" class="members-table">
                <!-- 成員列 -->
                <ng-container matColumnDef="member">
                  <th mat-header-cell *matHeaderCellDef>成員</th>
                  <td mat-cell *matCellDef="let member">
                    <div class="member-info">
                      <mat-icon class="member-avatar">person</mat-icon>
                      <div class="member-details">
                        <span class="member-name">{{ member.userId }}</span>
                        <span class="member-id">ID: {{ member.userId }}</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- 角色列 -->
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>角色</th>
                  <td mat-cell *matCellDef="let member">
                    @if (canManageMembers()) {
                      <mat-select 
                        [(ngModel)]="member.role"
                        (ngModelChange)="updateRole(member, $event)"
                        class="role-select">
                        @for (role of availableRoles; track role.value) {
                          <mat-option [value]="role.value">{{ role.label }}</mat-option>
                        }
                      </mat-select>
                    } @else {
                      <span class="role-badge" [class]="'role-' + member.role">
                        {{ getRoleLabel(member.role) }}
                      </span>
                    }
                  </td>
                </ng-container>

                <!-- 加入時間列 -->
                <ng-container matColumnDef="joinedAt">
                  <th mat-header-cell *matHeaderCellDef>加入時間</th>
                  <td mat-cell *matCellDef="let member">
                    {{ member.joinedAt | date: 'yyyy-MM-dd HH:mm' }}
                  </td>
                </ng-container>

                <!-- 邀請者列 -->
                <ng-container matColumnDef="invitedBy">
                  <th mat-header-cell *matHeaderCellDef>邀請者</th>
                  <td mat-cell *matCellDef="let member">
                    {{ member.invitedBy || '-' }}
                  </td>
                </ng-container>

                <!-- 操作列 -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>操作</th>
                  <td mat-cell *matCellDef="let member">
                    @if (canManageMembers() && !isCurrentUser(member.userId)) {
                      <button 
                        mat-icon-button 
                        [matMenuTriggerFor]="memberMenu"
                        (click)="$event.stopPropagation()">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      
                      <mat-menu #memberMenu="matMenu">
                        <button mat-menu-item (click)="removeMember(member)">
                          <mat-icon>person_remove</mat-icon>
                          <span>移除成員</span>
                        </button>
                      </mat-menu>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            @if (members().length === 0) {
              <div class="empty-state">
                <mat-icon>people_outline</mat-icon>
                <p>尚未有任何成員</p>
                @if (canManageMembers()) {
                  <button mat-button (click)="inviteMember()">
                    <mat-icon>person_add</mat-icon>
                    邀請成員
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
    .members-list-container {
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

    .members-card {
      .card-actions {
        position: absolute;
        top: 8px;
        right: 8px;
      }

      .table-container {
        overflow-x: auto;
      }

      .members-table {
        width: 100%;
        
        .member-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .member-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: var(--mdc-theme-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          }
          
          .member-details {
            display: flex;
            flex-direction: column;
            
            .member-name {
              font-weight: 500;
              font-size: 14px;
            }
            
            .member-id {
              font-size: 12px;
              color: var(--mdc-theme-on-surface-variant);
            }
          }
        }

        .role-select {
          min-width: 120px;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          
          &.role-owner {
            background-color: #ff9800;
            color: white;
          }
          
          &.role-admin {
            background-color: #f44336;
            color: white;
          }
          
          &.role-member {
            background-color: #4caf50;
            color: white;
          }
          
          &.role-billing {
            background-color: #2196f3;
            color: white;
          }
          
          &.role-outside_collaborator {
            background-color: #9e9e9e;
            color: white;
          }
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
      .members-list-container {
        padding: 16px;
      }
      
      .members-table {
        .member-info {
          .member-details {
            .member-id {
              display: none;
            }
          }
        }
      }
    }
  `]
})
export class MembersListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orgService = inject(OrganizationService);
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Signals
  members = signal<OrganizationMember[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  readonly canManageMembers = computed(() => 
    this.permissionService.canManageMembers()
  );

  // Table configuration
  displayedColumns: string[] = ['member', 'role', 'joinedAt', 'invitedBy', 'actions'];

  orgId!: string;

  availableRoles = [
    { value: OrgRole.OWNER, label: '擁有者' },
    { value: OrgRole.ADMIN, label: '管理員' },
    { value: OrgRole.MEMBER, label: '成員' },
    { value: OrgRole.BILLING, label: '帳務管理員' },
    { value: OrgRole.OUTSIDE_COLLABORATOR, label: '外部協作者' }
  ];

  async ngOnInit() {
    this.orgId = this.route.snapshot.paramMap.get('orgId')!;
    
    if (!this.orgId) {
      this.error.set('無效的組織 ID');
      return;
    }

    await this.loadMembers();
  }

  async loadMembers() {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      
      const members = await firstValueFrom(this.orgService.getOrganizationMembers(this.orgId));
      this.members.set(members || []);
      
    } catch (error) {
      this.error.set(`載入成員列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateRole(member: OrganizationMember, newRole: OrgRole) {
    try {
      await this.orgService.updateMemberRole(this.orgId, member.userId, newRole);
      this.notificationService.showSuccess('成員角色已更新');
      
      // 更新本地狀態
      this.members.update(members => 
        members.map(m => m.id === member.id ? { ...m, role: newRole as OrgRole } : m)
      );
      
    } catch (error) {
      this.notificationService.showError('更新角色失敗');
    }
  }

  async removeMember(member: OrganizationMember) {
    try {
      await this.orgService.removeOrganizationMember(this.orgId, member.userId);
      this.notificationService.showSuccess('成員已移除');
      
      // 更新本地狀態
      this.members.update(members => 
        members.filter(m => m.id !== member.id)
      );
      
    } catch (error) {
      this.notificationService.showError('移除成員失敗');
    }
  }

  inviteMember() {
    // TODO: 實作邀請成員對話框
    this.notificationService.showInfo('邀請成員功能即將推出');
  }

  isCurrentUser(userId: string): boolean {
    // TODO: 檢查是否為當前用戶
    return false;
  }

  getRoleLabel(role: OrgRole): string {
    return this.availableRoles.find(r => r.value === role)?.label || role;
  }
}
