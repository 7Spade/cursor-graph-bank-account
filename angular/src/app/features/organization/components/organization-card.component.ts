import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { OrganizationDetail } from '../../../core/models/auth.model';

/**
 * 組織卡片組件
 * 使用 Material Design 3 設計，對齊 GitHub 的組織卡片風格
 */
@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="organization-card" [class.selected]="isSelected()">
      <mat-card-header>
        <div mat-card-avatar class="organization-avatar">
          @if (organization()?.profile?.avatar) {
            <img [src]="organization()?.profile?.avatar" [alt]="organization()?.name">
          } @else {
            <mat-icon>business</mat-icon>
          }
        </div>
        <mat-card-title>{{ organization()?.name }}</mat-card-title>
        <mat-card-subtitle>{{ organization()?.slug }}</mat-card-subtitle>
        
        <div class="card-actions">
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="onEdit()">
              <mat-icon>edit</mat-icon>
              <span>編輯</span>
            </button>
            <button mat-menu-item (click)="onSettings()">
              <mat-icon>settings</mat-icon>
              <span>設定</span>
            </button>
            <button mat-menu-item (click)="onMembers()">
              <mat-icon>people</mat-icon>
              <span>成員</span>
            </button>
            <button mat-menu-item (click)="onTeams()">
              <mat-icon>groups</mat-icon>
              <span>團隊</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="onDelete()" class="delete-action">
              <mat-icon>delete</mat-icon>
              <span>刪除</span>
            </button>
          </mat-menu>
        </div>
      </mat-card-header>

      <mat-card-content>
        @if (organization()?.description) {
          <p class="organization-description">{{ organization()?.description }}</p>
        }
        
        <div class="organization-stats">
          <div class="stat-item">
            <mat-icon>people</mat-icon>
            <span>{{ memberCount() }} 成員</span>
          </div>
          <div class="stat-item">
            <mat-icon>groups</mat-icon>
            <span>{{ teamCount() }} 團隊</span>
          </div>
          <div class="stat-item">
            <mat-icon>security</mat-icon>
            <span>{{ securityManagerCount() }} 安全管理器</span>
          </div>
        </div>

        <div class="organization-tags">
          <mat-chip-set>
            <mat-chip [class]="'type-' + organization()?.type">
              {{ getTypeLabel(organization()?.type) }}
            </mat-chip>
            @if (organization()?.profile?.location) {
              <mat-chip>
                <mat-icon matChipAvatar>location_on</mat-icon>
                {{ organization()?.profile?.location }}
              </mat-chip>
            }
            @if (organization()?.profile?.website) {
              <mat-chip>
                <mat-icon matChipAvatar>language</mat-icon>
                {{ organization()?.profile?.website }}
              </mat-chip>
            }
          </mat-chip-set>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button (click)="onView()" color="primary">
          <mat-icon>visibility</mat-icon>
          檢視
        </button>
        <button mat-button (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          編輯
        </button>
        <button mat-button (click)="onSettings()">
          <mat-icon>settings</mat-icon>
          設定
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .organization-card {
      margin: 16px;
      max-width: 400px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      &.selected {
        border: 2px solid var(--mdc-theme-primary);
        box-shadow: 0 4px 20px rgba(var(--mdc-theme-primary-rgb), 0.3);
      }
    }

    .organization-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--mdc-theme-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    mat-card-header {
      position: relative;
      
      .card-actions {
        position: absolute;
        top: 8px;
        right: 8px;
      }
    }

    .organization-description {
      margin: 16px 0;
      color: var(--mdc-theme-on-surface-variant);
      line-height: 1.5;
    }

    .organization-stats {
      display: flex;
      gap: 16px;
      margin: 16px 0;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--mdc-theme-on-surface-variant);
        font-size: 14px;
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .organization-tags {
      margin: 16px 0;
      
      mat-chip-set {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      mat-chip {
        &.type-construction {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        &.type-consulting {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }
        
        &.type-supplier {
          background-color: #e8f5e8;
          color: #388e3c;
        }
      }
    }

    mat-card-actions {
      padding: 16px;
      gap: 8px;
      
      button {
        flex: 1;
      }
    }

    .delete-action {
      color: var(--mdc-theme-error);
    }

    @media (max-width: 600px) {
      .organization-card {
        margin: 8px;
        max-width: 100%;
      }
      
      .organization-stats {
        flex-direction: column;
        gap: 8px;
      }
      
      mat-card-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class OrganizationCardComponent {
  @Input() organization = signal<OrganizationDetail | null>(null);
  @Input() isSelected = signal(false);
  
  @Output() view = new EventEmitter<OrganizationDetail>();
  @Output() edit = new EventEmitter<OrganizationDetail>();
  @Output() settings = new EventEmitter<OrganizationDetail>();
  @Output() members = new EventEmitter<OrganizationDetail>();
  @Output() teams = new EventEmitter<OrganizationDetail>();
  @Output() delete = new EventEmitter<OrganizationDetail>();

  // 計算屬性
  readonly memberCount = computed(() => 
    this.organization()?.members?.length || 0
  );

  readonly teamCount = computed(() => 
    this.organization()?.teams?.length || 0
  );

  readonly securityManagerCount = computed(() => 
    this.organization()?.securityManagers?.length || 0
  );

  /**
   * 獲取組織類型標籤
   */
  getTypeLabel(type?: string): string {
    switch (type) {
      case 'construction': return '營造業';
      case 'consulting': return '顧問業';
      case 'supplier': return '供應商';
      default: return '未知';
    }
  }

  /**
   * 檢視組織
   */
  onView(): void {
    const org = this.organization();
    if (org) {
      this.view.emit(org);
    }
  }

  /**
   * 編輯組織
   */
  onEdit(): void {
    const org = this.organization();
    if (org) {
      this.edit.emit(org);
    }
  }

  /**
   * 組織設定
   */
  onSettings(): void {
    const org = this.organization();
    if (org) {
      this.settings.emit(org);
    }
  }

  /**
   * 成員管理
   */
  onMembers(): void {
    const org = this.organization();
    if (org) {
      this.members.emit(org);
    }
  }

  /**
   * 團隊管理
   */
  onTeams(): void {
    const org = this.organization();
    if (org) {
      this.teams.emit(org);
    }
  }

  /**
   * 刪除組織
   */
  onDelete(): void {
    const org = this.organization();
    if (org) {
      this.delete.emit(org);
    }
  }
}
