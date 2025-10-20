/**
 * 儲存庫相關實體模型
 */

/**
 * 儲存庫實體
 */
export interface Repository {
  /** 儲存庫 ID */
  id: string;
  /** 儲存庫名稱 */
  name: string;
  /** 儲存庫描述 */
  description?: string;
  /** 組織 ID */
  organizationId: string;
  /** 團隊 ID */
  teamId?: string;
  /** 擁有者 ID */
  ownerId: string;
  /** 儲存庫類型 */
  type: 'git' | 'svn' | 'mercurial' | 'other';
  /** 儲存庫 URL */
  url: string;
  /** 是否為私有 */
  isPrivate: boolean;
  /** 預設分支 */
  defaultBranch: string;
  /** 分支列表 */
  branches?: RepositoryBranch[];
  /** 協作者 */
  collaborators?: RepositoryCollaborator[];
  /** 團隊存取權限 */
  teamAccess?: RepositoryTeamAccess[];
  /** 設定 */
  settings?: RepositorySettings;
  /** 統計資料 */
  stats?: RepositoryStats;
  /** 創建時間 */
  createdAt: Date;
  /** 最後更新時間 */
  updatedAt: Date;
  /** 最後推送時間 */
  lastPushedAt?: Date;
}

/**
 * 儲存庫分支
 */
export interface RepositoryBranch {
  /** 分支名稱 */
  name: string;
  /** 分支 SHA */
  sha: string;
  /** 是否為預設分支 */
  isDefault: boolean;
  /** 是否受保護 */
  isProtected: boolean;
  /** 最後提交 */
  lastCommit?: RepositoryCommit;
  /** 創建時間 */
  createdAt: Date;
}

/**
 * 儲存庫提交
 */
export interface RepositoryCommit {
  /** 提交 SHA */
  sha: string;
  /** 提交訊息 */
  message: string;
  /** 作者 */
  author: {
    name: string;
    email: string;
    date: Date;
  };
  /** 提交者 */
  committer: {
    name: string;
    email: string;
    date: Date;
  };
  /** 父提交 */
  parents: string[];
  /** 檔案變更 */
  files?: CommitFile[];
}

/**
 * 提交檔案
 */
export interface CommitFile {
  /** 檔案路徑 */
  path: string;
  /** 變更類型 */
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  /** 新增行數 */
  additions: number;
  /** 刪除行數 */
  deletions: number;
  /** 檔案大小 */
  size: number;
}

/**
 * 儲存庫問題
 */
export interface RepositoryIssue {
  /** 問題編號 */
  number: number;
  /** 標題 */
  title: string;
  /** 內容 */
  body?: string;
  /** 狀態 */
  state: 'open' | 'closed';
  /** 標籤 */
  labels: string[];
  /** 指派人 */
  assignees: string[];
  /** 里程碑 */
  milestone?: string;
  /** 創建者 */
  creator: string;
  /** 創建時間 */
  createdAt: Date;
  /** 更新時間 */
  updatedAt: Date;
  /** 關閉時間 */
  closedAt?: Date;
}

/**
 * 儲存庫拉取請求
 */
export interface RepositoryPullRequest {
  /** PR 編號 */
  number: number;
  /** 標題 */
  title: string;
  /** 內容 */
  body?: string;
  /** 狀態 */
  state: 'open' | 'closed' | 'merged';
  /** 來源分支 */
  headBranch: string;
  /** 目標分支 */
  baseBranch: string;
  /** 標籤 */
  labels: string[];
  /** 指派人 */
  assignees: string[];
  /** 審查者 */
  reviewers: string[];
  /** 創建者 */
  creator: string;
  /** 創建時間 */
  createdAt: Date;
  /** 更新時間 */
  updatedAt: Date;
  /** 合併時間 */
  mergedAt?: Date;
  /** 關閉時間 */
  closedAt?: Date;
}

/**
 * 儲存庫協作者
 */
export interface RepositoryCollaborator {
  /** 協作者 ID */
  id: string;
  /** 用戶 ID */
  userId: string;
  /** 用戶資料 */
  user: {
    username: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  /** 權限 */
  permission: 'read' | 'write' | 'admin';
  /** 邀請狀態 */
  invitationStatus: 'pending' | 'accepted' | 'declined';
  /** 邀請時間 */
  invitedAt: Date;
  /** 接受時間 */
  acceptedAt?: Date;
}

/**
 * 儲存庫團隊存取權限
 */
export interface RepositoryTeamAccess {
  /** 存取權限 ID */
  id: string;
  /** 團隊 ID */
  teamId: string;
  /** 團隊名稱 */
  teamName: string;
  /** 權限 */
  permission: 'read' | 'write' | 'admin';
  /** 授予時間 */
  grantedAt: Date;
  /** 授予者 */
  grantedBy: string;
}

/**
 * 儲存庫設定
 */
export interface RepositorySettings {
  /** 允許分支保護 */
  allowBranchProtection: boolean;
  /** 允許合併 */
  allowMerge: boolean;
  /** 允許 Squash 合併 */
  allowSquashMerge: boolean;
  /** 允許 Rebase 合併 */
  allowRebaseMerge: boolean;
  /** 需要審查 */
  requireReview: boolean;
  /** 需要狀態檢查 */
  requireStatusChecks: boolean;
  /** 需要最新分支 */
  requireUpToDateBranch: boolean;
  /** 自動刪除分支 */
  autoDeleteBranch: boolean;
}

/**
 * 儲存庫統計
 */
export interface RepositoryStats {
  /** 提交數 */
  commitCount: number;
  /** 分支數 */
  branchCount: number;
  /** 標籤數 */
  tagCount: number;
  /** 貢獻者數 */
  contributorCount: number;
  /** 問題數 */
  issueCount: number;
  /** 拉取請求數 */
  pullRequestCount: number;
  /** 程式碼行數 */
  codeLines: number;
  /** 檔案數 */
  fileCount: number;
  /** 最後活動時間 */
  lastActivityAt: Date;
}

/**
 * 儲存庫搜尋結果
 */
export interface RepositorySearchResult {
  /** 儲存庫 */
  repository: Repository;
  /** 相關度分數 */
  score: number;
  /** 匹配的欄位 */
  matchedFields: string[];
}

/**
 * 儲存庫搜尋參數
 */
export interface RepositorySearchParams {
  /** 搜尋關鍵字 */
  query?: string;
  /** 組織 ID */
  organizationId?: string;
  /** 團隊 ID */
  teamId?: string;
  /** 是否為私有 */
  isPrivate?: boolean;
  /** 儲存庫類型 */
  type?: string;
  /** 排序方式 */
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastPushedAt';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
}

/**
 * 儲存庫權限結果
 */
export interface RepositoryPermissionResult {
  /** 用戶 ID */
  userId: string;
  /** 權限 */
  permission: 'read' | 'write' | 'admin' | 'none';
  /** 權限來源 */
  source: 'direct' | 'team' | 'organization';
  /** 來源 ID */
  sourceId: string;
}

/**
 * 儲存庫分析
 */
export interface RepositoryAnalytics {
  /** 時間範圍 */
  timeRange: {
    start: Date;
    end: Date;
  };
  /** 提交趨勢 */
  commitTrend: {
    date: string;
    count: number;
  }[];
  /** 貢獻者活動 */
  contributorActivity: {
    userId: string;
    username: string;
    commits: number;
    additions: number;
    deletions: number;
  }[];
  /** 熱門檔案 */
  popularFiles: {
    path: string;
    changes: number;
    additions: number;
    deletions: number;
  }[];
  /** 程式碼品質指標 */
  codeQuality: {
    maintainability: number;
    reliability: number;
    security: number;
    coverage: number;
  };
}