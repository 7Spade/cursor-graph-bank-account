// src/app/features/repository/components/repository-list.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { RepositoryService } from '../../../core/services/repository.service';
import { AuthService } from '../../../core/services/auth.service';
import { Repository } from '../../../core/models/auth.model';

@Component({
  selector: 'app-repository-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="repository-list-container">
      <div class="header">
        <h1>我的 Repository</h1>
        <button mat-raised-button color="primary" (click)="createRepository()">
          <mat-icon>add</mat-icon>
          新建 Repository
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
          <button mat-button (click)="loadRepositories()">重試</button>
        </div>
      } @else if (repositories().length === 0) {
        <div class="empty-container">
          <mat-icon>folder_open</mat-icon>
          <h2>還沒有 Repository</h2>
          <p>創建您的第一個 Repository 開始協作</p>
          <button mat-raised-button color="primary" (click)="createRepository()">
            <mat-icon>add</mat-icon>
            創建 Repository
          </button>
        </div>
      } @else {
        <div class="repository-grid">
          @for (repo of repositories(); track repo.id) {
            <mat-card class="repository-card" (click)="viewRepository(repo.id)">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon class="repo-icon">folder</mat-icon>
                  {{ repo.name }}
                </mat-card-title>
                <mat-card-subtitle>{{ repo.fullName }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                @if (repo.description) {
                  <p class="description">{{ repo.description }}</p>
                }
                
                <div class="repo-meta">
                  <div class="visibility">
                    <mat-icon [class]="repo.private ? 'private' : 'public'">
                      {{ repo.private ? 'lock' : 'public' }}
                    </mat-icon>
                    <span>{{ repo.private ? '私有' : '公開' }}</span>
                  </div>
                  
                  <div class="branch">
                    <mat-icon>account_tree</mat-icon>
                    <span>{{ repo.defaultBranch }}</span>
                  </div>
                  
                  <div class="updated">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ formatDate(repo.updatedAt) }}</span>
                  </div>
                </div>
                
                @if (repo.topics.length > 0) {
                  <div class="topics">
                    @for (topic of repo.topics.slice(0, 3); track topic) {
                      <mat-chip>{{ topic }}</mat-chip>
                    }
                    @if (repo.topics.length > 3) {
                      <mat-chip>+{{ repo.topics.length - 3 }}</mat-chip>
                    }
                  </div>
                }
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button (click)="viewRepository(repo.id); $event.stopPropagation()">
                  <mat-icon>visibility</mat-icon>
                  查看
                </button>
                
                @if (canManageRepository()(repo)) {
                  <button mat-button (click)="editRepository(repo.id); $event.stopPropagation()">
                    <mat-icon>edit</mat-icon>
                    編輯
                  </button>
                  
                  <button mat-button (click)="manageCollaborators(repo.id); $event.stopPropagation()">
                    <mat-icon>people</mat-icon>
                    協作者
                  </button>
                  
                  <button mat-button (click)="manageSettings(repo.id); $event.stopPropagation()">
                    <mat-icon>settings</mat-icon>
                    設定
                  </button>
                  
                  <button mat-button (click)="deleteRepository(repo.id); $event.stopPropagation()" class="danger">
                    <mat-icon>delete</mat-icon>
                    刪除
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .repository-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #1976d2;
    }

    .loading-container,
    .error-container,
    .empty-container {
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

    .empty-container mat-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .repository-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 16px;
    }

    .repository-card {
      cursor: pointer;
      transition: box-shadow 0.2s ease;
    }

    .repository-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .repo-icon {
      margin-right: 8px;
      color: #1976d2;
    }

    .description {
      color: #666;
      margin: 8px 0;
      line-height: 1.4;
    }

    .repo-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin: 12px 0;
      font-size: 14px;
      color: #666;
    }

    .repo-meta > div {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .visibility .private {
      color: #f44336;
    }

    .visibility .public {
      color: #4caf50;
    }

    .topics {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }

    .topics mat-chip {
      font-size: 12px;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .danger {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .repository-grid {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class RepositoryListComponent implements OnInit {
  private repositoryService = inject(RepositoryService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  readonly repositories = signal<Repository[]>([]);
  readonly isLoading = this.repositoryService.isLoading;
  readonly error = this.repositoryService.error;

  // Computed signals
  readonly canManageRepository = computed(() => {
    return (repo: Repository) => {
      const currentAccount = this.authService.currentAccount();
      return currentAccount?.id === repo.ownerId;
    };
  });

  ngOnInit() {
    this.loadRepositories();
  }

  async loadRepositories() {
    try {
      const currentAccount = this.authService.currentAccount();
      if (!currentAccount) {
        this.router.navigate(['/login']);
        return;
      }

      // 載入用戶的 Repository
      const repos$ = this.repositoryService.getUserRepositories(currentAccount.id);
      repos$.subscribe(repos => {
        this.repositories.set(repos);
      });
    } catch (error) {
      console.error('Failed to load repositories:', error);
    }
  }

  createRepository() {
    this.router.navigate(['/repositories/new']);
  }

  viewRepository(repoId: string) {
    this.router.navigate(['/repositories', repoId]);
  }

  editRepository(repoId: string) {
    this.router.navigate(['/repositories', repoId, 'edit']);
  }

  manageCollaborators(repoId: string) {
    this.router.navigate(['/repositories', repoId, 'collaborators']);
  }

  manageSettings(repoId: string) {
    this.router.navigate(['/repositories', repoId, 'settings']);
  }

  async deleteRepository(repoId: string) {
    if (confirm('確定要刪除此 Repository 嗎？此操作無法復原。')) {
      try {
        await this.repositoryService.deleteRepository(repoId);
        await this.loadRepositories();
      } catch (error) {
        console.error('Failed to delete repository:', error);
      }
    }
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
