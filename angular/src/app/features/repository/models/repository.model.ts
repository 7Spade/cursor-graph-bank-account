// src/app/features/repository/models/repository.model.ts

import { Repository, RepositoryCollaborator, RepositoryTeamAccess } from '../../../core/models/auth.model';

// Repository 相關的擴展模型
export interface RepositorySettings {
  defaultBranch: string;
  allowSquashMerge: boolean;
  allowMergeCommit: boolean;
  allowRebaseMerge: boolean;
  deleteBranchOnMerge: boolean;
  hasIssues: boolean;
  hasProjects: boolean;
  hasWiki: boolean;
  hasDownloads: boolean;
}

export interface RepositoryStats {
  stars: number;
  watchers: number;
  forks: number;
  openIssues: number;
  openPullRequests: number;
}

export interface RepositoryBranch {
  name: string;
  protected: boolean;
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    date: Date;
  };
}

export interface RepositoryCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: Date;
  url?: string;
}

export interface RepositoryIssue {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface RepositoryPullRequest {
  id: string;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  headBranch: string;
  baseBranch: string;
  author: string;
  assignees: string[];
  reviewers: string[];
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  closedAt?: Date;
}

// Repository 創建請求
export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  private: boolean;
  ownerId?: string;
  initializeWithReadme?: boolean;
  addLicense?: boolean;
  addGitignore?: boolean;
}

// Repository 更新請求
export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  private?: boolean;
  defaultBranch?: string;
  topics?: string[];
}

// 協作者邀請請求
export interface InviteCollaboratorRequest {
  userId: string;
  permission: 'read' | 'triage' | 'write' | 'maintain' | 'admin';
  message?: string;
}

// 團隊訪問權限請求
export interface GrantTeamAccessRequest {
  teamId: string;
  permission: 'read' | 'triage' | 'write' | 'maintain' | 'admin';
}

// Repository 搜索結果
export interface RepositorySearchResult {
  repositories: Repository[];
  totalCount: number;
  hasMore: boolean;
}

// Repository 搜索參數
export interface RepositorySearchParams {
  query?: string;
  ownerId?: string;
  isPrivate?: boolean;
  topics?: string[];
  sortBy?: 'name' | 'created' | 'updated' | 'stars';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Repository 權限檢查結果
export interface RepositoryPermissionResult {
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
  canDelete: boolean;
  permission: string;
  reason?: string;
}

// Repository 統計數據
export interface RepositoryAnalytics {
  commits: {
    total: number;
    last30Days: number;
    contributors: number;
  };
  issues: {
    open: number;
    closed: number;
    total: number;
  };
  pullRequests: {
    open: number;
    merged: number;
    closed: number;
    total: number;
  };
  releases: {
    total: number;
    latest?: {
      version: string;
      date: Date;
    };
  };
}

// Repository 模板
export interface RepositoryTemplate {
  id: string;
  name: string;
  description: string;
  owner: string;
  topics: string[];
  isPublic: boolean;
  createdAt: Date;
}

// Repository 比較結果
export interface RepositoryComparison {
  ahead: number;
  behind: number;
  commits: RepositoryCommit[];
  files: {
    added: string[];
    modified: string[];
    removed: string[];
  };
}

// Repository 標籤
export interface RepositoryLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// Repository 里程碑
export interface RepositoryMilestone {
  id: string;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  dueDate?: Date;
  openIssues: number;
  closedIssues: number;
  createdAt: Date;
  updatedAt: Date;
}

// Repository Webhook
export interface RepositoryWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  lastDelivery?: {
    status: number;
    date: Date;
  };
}

// Repository 部署
export interface RepositoryDeployment {
  id: string;
  environment: string;
  ref: string;
  sha: string;
  status: 'pending' | 'success' | 'failure' | 'error';
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

// Repository 環境
export interface RepositoryEnvironment {
  name: string;
  protectionRules: {
    requiredReviewers: string[];
    waitTimer: number;
  };
  deploymentBranchPolicy: {
    protectedBranches: boolean;
    customBranchPolicy: boolean;
  };
}

// Repository 安全警報
export interface RepositorySecurityAlert {
  id: string;
  type: 'vulnerability' | 'secret' | 'dependency';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  package?: string;
  description: string;
  state: 'open' | 'dismissed' | 'fixed';
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

// Repository 代碼掃描結果
export interface RepositoryCodeScanningResult {
  id: string;
  rule: string;
  severity: 'error' | 'warning' | 'note';
  message: string;
  path: string;
  line: number;
  column: number;
  createdAt: Date;
  state: 'open' | 'dismissed' | 'fixed';
}
