import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { Team } from '../../../core/models/auth.model';
import { TeamCreateDialogComponent } from '../components/team-create-dialog.component';
import { TeamCreatedEvent } from '../models/team-create.model';
import { LoggerService } from '../../../core/services/logger.service';

/**
 * 團隊節點介面
 */
interface TeamNode extends Team {
  children: TeamNode[];
  level: number;
  expandable: boolean;
}

/**
 * 團隊層級管理組件
 * 使用 Material Design 3 的 Tree 組件實作 GitHub 風格的團隊層級結構
 */
@Component({
  selector: 'app-team-hierarchy',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule
  ],
  template: `
    <div class="team-hierarchy-container">
      <div class="hierarchy-header">
        <h3>團隊層級結構</h3>
        <button mat-raised-button color="primary" (click)="onCreateTeam()">
          <mat-icon>add</mat-icon>
          新增團隊
        </button>
      </div>

      <div class="hierarchy-content">
        @if (teamNodes().length === 0) {
          <div class="empty-state">
            <mat-icon>groups</mat-icon>
            <p>尚未建立任何團隊</p>
            <button mat-button color="primary" (click)="onCreateTeam()">
              建立第一個團隊
            </button>
          </div>
        } @else {
          <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="team-tree">
            <!-- 團隊節點模板 -->
            <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodeToggle>
              <div class="team-node" [style.padding-left.px]="getNodePadding(node)">
                <mat-icon class="team-icon">
                  {{ getTeamIcon(node.privacy) }}
                </mat-icon>
                
                <div class="team-info">
                  <div class="team-name">{{ node.name }}</div>
                  <div class="team-description">{{ node.description }}</div>
                  <div class="team-meta">
                    <mat-chip-set>
                      <mat-chip [class]="'privacy-' + node.privacy">
                        {{ getPrivacyLabel(node.privacy) }}
                      </mat-chip>
                      <mat-chip [class]="'permission-' + node.permission">
                        {{ getPermissionLabel(node.permission) }}
                      </mat-chip>
                      <mat-chip>
                        <mat-icon matChipAvatar>people</mat-icon>
                        {{ node.members?.length || 0 }} 成員
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>

                <div class="team-actions">
                  <button mat-icon-button [matMenuTriggerFor]="teamMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #teamMenu="matMenu">
                    <button mat-menu-item (click)="onViewTeam(node)">
                      <mat-icon>visibility</mat-icon>
                      <span>檢視</span>
                    </button>
                    <button mat-menu-item (click)="onEditTeam(node)">
                      <mat-icon>edit</mat-icon>
                      <span>編輯</span>
                    </button>
                    <button mat-menu-item (click)="onManageMembers(node)">
                      <mat-icon>people</mat-icon>
                      <span>管理成員</span>
                    </button>
                    <button mat-menu-item (click)="onCreateSubTeam(node)">
                      <mat-icon>add</mat-icon>
                      <span>新增子團隊</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="onDeleteTeam(node)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>刪除</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </mat-tree-node>

            <!-- 展開/收合按鈕 -->
            <mat-tree-node *matTreeNodeDef="let node; when: !hasChild" matTreeNodePadding>
              <div class="team-node" [style.padding-left.px]="getNodePadding(node)">
                <mat-icon class="team-icon">
                  {{ getTeamIcon(node.privacy) }}
                </mat-icon>
                
                <div class="team-info">
                  <div class="team-name">{{ node.name }}</div>
                  <div class="team-description">{{ node.description }}</div>
                  <div class="team-meta">
                    <mat-chip-set>
                      <mat-chip [class]="'privacy-' + node.privacy">
                        {{ getPrivacyLabel(node.privacy) }}
                      </mat-chip>
                      <mat-chip [class]="'permission-' + node.permission">
                        {{ getPermissionLabel(node.permission) }}
                      </mat-chip>
                      <mat-chip>
                        <mat-icon matChipAvatar>people</mat-icon>
                        {{ node.members?.length || 0 }} 成員
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>

                <div class="team-actions">
                  <button mat-icon-button [matMenuTriggerFor]="teamMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #teamMenu="matMenu">
                    <button mat-menu-item (click)="onViewTeam(node)">
                      <mat-icon>visibility</mat-icon>
                      <span>檢視</span>
                    </button>
                    <button mat-menu-item (click)="onEditTeam(node)">
                      <mat-icon>edit</mat-icon>
                      <span>編輯</span>
                    </button>
                    <button mat-menu-item (click)="onManageMembers(node)">
                      <mat-icon>people</mat-icon>
                      <span>管理成員</span>
                    </button>
                    <button mat-menu-item (click)="onCreateSubTeam(node)">
                      <mat-icon>add</mat-icon>
                      <span>新增子團隊</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="onDeleteTeam(node)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>刪除</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </mat-tree-node>
          </mat-tree>
        }
      </div>
    </div>
  `,
  styles: [`
    .team-hierarchy-container {
      padding: 24px;
      background: var(--mdc-theme-surface);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .hierarchy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h3 {
        margin: 0;
        color: var(--mdc-theme-on-surface);
        font-weight: 500;
      }
    }

    .hierarchy-content {
      min-height: 200px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--mdc-theme-on-surface-variant);
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      p {
        margin: 16px 0 24px;
        font-size: 16px;
      }
    }

    .team-tree {
      background: transparent;
    }

    .team-node {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--mdc-theme-outline-variant);
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: var(--mdc-theme-surface-variant);
      }
      
      &:last-child {
        border-bottom: none;
      }
    }

    .team-icon {
      margin-right: 12px;
      color: var(--mdc-theme-primary);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .team-info {
      flex: 1;
      
      .team-name {
        font-weight: 500;
        color: var(--mdc-theme-on-surface);
        margin-bottom: 4px;
      }
      
      .team-description {
        color: var(--mdc-theme-on-surface-variant);
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .team-meta {
        mat-chip-set {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        mat-chip {
          font-size: 12px;
          height: 24px;
          
          &.privacy-open {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
          
          &.privacy-closed {
            background-color: #ffebee;
            color: #c62828;
          }
          
          &.permission-read {
            background-color: #e3f2fd;
            color: #1565c0;
          }
          
          &.permission-write {
            background-color: #fff3e0;
            color: #ef6c00;
          }
          
          &.permission-admin {
            background-color: #f3e5f5;
            color: #7b1fa2;
          }
        }
      }
    }

    .team-actions {
      margin-left: 12px;
    }

    .delete-action {
      color: var(--mdc-theme-error);
    }

    @media (max-width: 768px) {
      .team-hierarchy-container {
        padding: 16px;
      }
      
      .hierarchy-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        
        h3 {
          text-align: center;
        }
      }
      
      .team-node {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        
        .team-info {
          .team-meta mat-chip-set {
            justify-content: center;
          }
        }
        
        .team-actions {
          align-self: flex-end;
          margin-left: 0;
        }
      }
    }
  `]
})
export class TeamHierarchyComponent {
  @Input() teams = signal<Team[]>([]);
  @Input() organizationId!: string;
  
  @Output() createTeam = new EventEmitter<{ parentTeamId?: string }>();
  @Output() viewTeam = new EventEmitter<Team>();
  @Output() editTeam = new EventEmitter<Team>();
  @Output() manageMembers = new EventEmitter<Team>();
  @Output() deleteTeam = new EventEmitter<Team>();

  private logger = inject(LoggerService);

  // 服務注入
  private dialog = inject(MatDialog);

  // 樹狀結構轉換器
  treeFlattener = new MatTreeFlattener(
    (node: TeamNode, level: number) => {
      return {
        ...node,
        level: level,
        expandable: node.children && node.children.length > 0
      };
    },
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  // Tree 控制
  treeControl = new FlatTreeControl<TeamNode>(
    node => node.level,
    node => node.expandable
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  // 計算屬性
  readonly teamNodes = computed(() => this.buildTeamHierarchy(this.teams()));

  constructor() {
    // 監聽 teams 變化並更新 dataSource
    effect(() => {
      const nodes = this.teamNodes();
      this.dataSource.data = nodes;
    });
  }

  /**
   * 建立團隊層級結構
   */
  private buildTeamHierarchy(teams: Team[]): TeamNode[] {
    const teamMap = new Map<string, TeamNode>();
    const rootTeams: TeamNode[] = [];

    // 初始化所有團隊
    teams.forEach(team => {
      teamMap.set(team.id, {
        ...team,
        children: [],
        level: 0,
        expandable: false
      });
    });

    // 建立層級關係
    teams.forEach(team => {
      const teamNode = teamMap.get(team.id)!;
      if (team.parentTeamId) {
        const parent = teamMap.get(team.parentTeamId);
        if (parent) {
          parent.children.push(teamNode);
          parent.expandable = true;
        }
      } else {
        rootTeams.push(teamNode);
      }
    });

    return rootTeams;
  }

  /**
   * 獲取節點縮排
   */
  getNodePadding(node: TeamNode): number {
    return node.level * 24;
  }

  /**
   * 檢查是否有子節點
   */
  hasChild = (_: number, node: TeamNode) => node.expandable;

  /**
   * 獲取團隊圖示
   */
  getTeamIcon(privacy: 'open' | 'closed'): string {
    return privacy === 'open' ? 'public' : 'lock';
  }

  /**
   * 獲取隱私標籤
   */
  getPrivacyLabel(privacy: 'open' | 'closed'): string {
    return privacy === 'open' ? '公開' : '私有';
  }

  /**
   * 獲取權限標籤
   */
  getPermissionLabel(permission: 'read' | 'write' | 'admin'): string {
    switch (permission) {
      case 'read': return '讀取';
      case 'write': return '寫入';
      case 'admin': return '管理';
      default: return '未知';
    }
  }

  /**
   * 新增團隊
   */
  onCreateTeam(): void {
    this.openCreateTeamDialog();
  }

  /**
   * 新增子團隊
   */
  onCreateSubTeam(parentTeam: Team): void {
    this.openCreateTeamDialog(parentTeam.id);
  }

  /**
   * 檢視團隊
   */
  onViewTeam(team: Team): void {
    this.viewTeam.emit(team);
  }

  /**
   * 編輯團隊
   */
  onEditTeam(team: Team): void {
    this.editTeam.emit(team);
  }

  /**
   * 管理成員
   */
  onManageMembers(team: Team): void {
    this.manageMembers.emit(team);
  }

  /**
   * 刪除團隊
   */
  onDeleteTeam(team: Team): void {
    this.deleteTeam.emit(team);
  }

  /**
   * 打開建立團隊對話框
   */
  private openCreateTeamDialog(parentTeamId?: string): void {
    if (!this.organizationId) {
      console.error('Organization ID is required to create a team');
      return;
    }

    const dialogRef = this.dialog.open(TeamCreateDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      data: {
        organizationId: this.organizationId,
        parentTeamId: parentTeamId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // 發射事件通知父組件團隊已建立
        this.createTeam.emit({ parentTeamId });
        // 重新載入團隊列表
        this.loadTeams();
      }
    });
  }

  /**
   * 載入團隊列表
   */
  private loadTeams(): void {
    // TODO: 實現載入團隊列表的邏輯
    // 使用適當的日誌記錄服務替代 console.log
    this.logger.debug('Reloading teams...');
  }
}

// Tree 相關類別
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { effect } from '@angular/core';
