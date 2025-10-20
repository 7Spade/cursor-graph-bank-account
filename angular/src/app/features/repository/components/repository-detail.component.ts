// src/app/features/repository/components/repository-detail.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { RepositoryService } from '../../../core/services/repository.service';
import { AuthService } from '../../../core/services/auth.service';
import { Repository } from '../../../core/models/auth.model';

@Component({
  selector: 'app-repository-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="repository-detail-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>載入中...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button (click)="goBack()">返回</button>
        </div>
      } @else if (repository()) {
        <div class="repository-header">
          <div class="breadcrumb">
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              返回列表
            </button>
            <mat-icon>chevron_right</mat-icon>
            <span>{{ repository()?.fullName }}</span>
          </div>
          
          <div class="header-actions">
            @if (canManageRepository()) {
              <button mat-button (click)="editRepository()">
                <mat-icon>edit</mat-icon>
                編輯
              </button>
              
              <button mat-button (click)="manageCollaborators()">
                <mat-icon>people</mat-icon>
                管理協作者
              </button>
              
              <button mat-button (click)="manageSettings()">
                <mat-icon>settings</mat-icon>
                設定
              </button>
              
              <button mat-button (click)="deleteRepository()" class="danger">
                <mat-icon>delete</mat-icon>
                刪除
              </button>
            }
          </div>
        </div>

        <div class="repository-content">
          <div class="repository-info">
            <div class="title-section">
              <h1>
                <mat-icon class="repo-icon">folder</mat-icon>
                {{ repository()?.name }}
              </h1>
              <div class="visibility-badge">
                <mat-icon [class]="repository()?.private ? 'private' : 'public'">
                  {{ repository()?.private ? 'lock' : 'public' }}
                </mat-icon>
                <span>{{ repository()?.private ? '私有' : '公開' }}</span>
              </div>
            </div>
            
            @if (repository()?.description) {
              <p class="description">{{ repository()?.description }}</p>
            }
            
            <div class="repository-meta">
              <div class="meta-item">
                <mat-icon>account_tree</mat-icon>
                <span>預設分支: {{ repository()?.defaultBranch }}</span>
              </div>
              
              <div class="meta-item">
                <mat-icon>schedule</mat-icon>
                <span>創建於: {{ formatDate(repository()?.createdAt) }}</span>
              </div>
              
              <div class="meta-item">
                <mat-icon>update</mat-icon>
                <span>更新於: {{ formatDate(repository()?.updatedAt) }}</span>
              </div>
            </div>
            
            @if (repository()?.topics && repository()!.topics.length > 0) {
              <div class="topics">
                <h3>標籤</h3>
                <div class="topic-chips">
                  @for (topic of repository()?.topics; track topic) {
                    <mat-chip>{{ topic }}</mat-chip>
                  }
                </div>
              </div>
            }
          </div>
          
          <div class="repository-tabs">
            <mat-tab-group>
              <mat-tab label="代碼">
                <div class="tab-content">
                  <div class="code-section">
                    <h3>代碼瀏覽</h3>
                    <p>這裡將顯示 Repository 的代碼結構</p>
                    <div class="placeholder">
                      <mat-icon>code</mat-icon>
                      <p>代碼瀏覽功能開發中...</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <mat-tab label="Issues">
                <div class="tab-content">
                  <div class="issues-section">
                    <h3>Issues</h3>
                    <p>管理 Repository 的問題和錯誤報告</p>
                    <div class="placeholder">
                      <mat-icon>bug_report</mat-icon>
                      <p>Issues 功能開發中...</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <mat-tab label="Pull Requests">
                <div class="tab-content">
                  <div class="pr-section">
                    <h3>Pull Requests</h3>
                    <p>管理代碼合併請求</p>
                    <div class="placeholder">
                      <mat-icon>merge</mat-icon>
                      <p>Pull Requests 功能開發中...</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <mat-tab label="協作者">
                <div class="tab-content">
                  <div class="collaborators-section">
                    <h3>協作者管理</h3>
                    <p>管理 Repository 的協作者權限</p>
                    <div class="placeholder">
                      <mat-icon>people</mat-icon>
                      <p>協作者管理功能開發中...</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
              
              <mat-tab label="設定">
                <div class="tab-content">
                  <div class="settings-section">
                    <h3>Repository 設定</h3>
                    <p>管理 Repository 的各種設定</p>
                    <div class="placeholder">
                      <mat-icon>settings</mat-icon>
                      <p>設定功能開發中...</p>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .repository-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
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

    .repository-header {
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .repository-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }

    .repository-info {
      background: #f5f5f5;
      padding: 24px;
      border-radius: 8px;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .title-section h1 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .repo-icon {
      color: #1976d2;
    }

    .visibility-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      background: #fff;
      font-size: 14px;
    }

    .visibility-badge .private {
      color: #f44336;
    }

    .visibility-badge .public {
      color: #4caf50;
    }

    .description {
      color: #666;
      margin: 16px 0;
      line-height: 1.5;
    }

    .repository-meta {
      margin: 16px 0;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }

    .topics {
      margin-top: 24px;
    }

    .topics h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
    }

    .topic-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .repository-tabs {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .placeholder mat-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .danger {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .repository-content {
        grid-template-columns: 1fr;
      }
      
      .repository-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class RepositoryDetailComponent implements OnInit {
  private repositoryService = inject(RepositoryService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  readonly repository = this.repositoryService.currentRepository;
  readonly isLoading = this.repositoryService.isLoading;
  readonly error = this.repositoryService.error;

  // Computed signals
  readonly canManageRepository = computed(() => {
    const repo = this.repository();
    const currentAccount = this.authService.currentAccount();
    return repo && currentAccount && repo.ownerId === currentAccount.id;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const repoId = params['id'];
      if (repoId) {
        this.loadRepository(repoId);
      }
    });
  }

  async loadRepository(repoId: string) {
    try {
      await this.repositoryService.loadRepository(repoId);
    } catch (error) {
      console.error('Failed to load repository:', error);
    }
  }

  goBack() {
    this.router.navigate(['/repositories']);
  }

  editRepository() {
    const repo = this.repository();
    if (repo) {
      this.router.navigate(['/repositories', repo.id, 'edit']);
    }
  }

  manageCollaborators() {
    const repo = this.repository();
    if (repo) {
      this.router.navigate(['/repositories', repo.id, 'collaborators']);
    }
  }

  manageSettings() {
    const repo = this.repository();
    if (repo) {
      this.router.navigate(['/repositories', repo.id, 'settings']);
    }
  }

  async deleteRepository() {
    const repo = this.repository();
    if (repo && confirm('確定要刪除此 Repository 嗎？此操作無法復原。')) {
      try {
        await this.repositoryService.deleteRepository(repo.id);
        this.router.navigate(['/repositories']);
      } catch (error) {
        console.error('Failed to delete repository:', error);
      }
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    
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
