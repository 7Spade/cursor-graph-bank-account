/**
 * 儲存庫相關請求模型
 */

/**
 * 創建儲存庫請求
 */
export interface CreateRepositoryRequest {
  /** 儲存庫名稱 */
  name: string;
  /** 儲存庫描述 */
  description?: string;
  /** 組織 ID */
  organizationId: string;
  /** 團隊 ID（可選） */
  teamId?: string;
  /** 儲存庫類型 */
  type: 'git' | 'svn' | 'mercurial' | 'other';
  /** 儲存庫 URL */
  url: string;
  /** 是否為私有 */
  isPrivate: boolean;
  /** 預設分支 */
  defaultBranch?: string;
  /** 儲存庫設定 */
  settings?: {
    allowBranchProtection: boolean;
    allowMerge: boolean;
    allowSquashMerge: boolean;
    allowRebaseMerge: boolean;
    requireReview: boolean;
    requireStatusChecks: boolean;
    requireUpToDateBranch: boolean;
    autoDeleteBranch: boolean;
  };
}

/**
 * 更新儲存庫請求
 */
export interface UpdateRepositoryRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 儲存庫名稱 */
  name?: string;
  /** 儲存庫描述 */
  description?: string;
  /** 儲存庫 URL */
  url?: string;
  /** 是否為私有 */
  isPrivate?: boolean;
  /** 預設分支 */
  defaultBranch?: string;
  /** 儲存庫設定 */
  settings?: {
    allowBranchProtection: boolean;
    allowMerge: boolean;
    allowSquashMerge: boolean;
    allowRebaseMerge: boolean;
    requireReview: boolean;
    requireStatusChecks: boolean;
    requireUpToDateBranch: boolean;
    autoDeleteBranch: boolean;
  };
}

/**
 * 邀請協作者請求
 */
export interface InviteCollaboratorRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 用戶 ID */
  userId: string;
  /** 權限 */
  permission: 'read' | 'write' | 'admin';
  /** 邀請訊息 */
  message?: string;
}

/**
 * 授予團隊存取權限請求
 */
export interface GrantTeamAccessRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 團隊 ID */
  teamId: string;
  /** 權限 */
  permission: 'read' | 'write' | 'admin';
}

/**
 * 更新協作者權限請求
 */
export interface UpdateCollaboratorPermissionRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 協作者 ID */
  collaboratorId: string;
  /** 新權限 */
  permission: 'read' | 'write' | 'admin';
}

/**
 * 移除協作者請求
 */
export interface RemoveCollaboratorRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 協作者 ID */
  collaboratorId: string;
  /** 移除原因 */
  reason?: string;
}

/**
 * 更新團隊存取權限請求
 */
export interface UpdateTeamAccessRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 團隊存取權限 ID */
  teamAccessId: string;
  /** 新權限 */
  permission: 'read' | 'write' | 'admin';
}

/**
 * 移除團隊存取權限請求
 */
export interface RemoveTeamAccessRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 團隊存取權限 ID */
  teamAccessId: string;
  /** 移除原因 */
  reason?: string;
}

/**
 * 儲存庫搜尋請求
 */
export interface SearchRepositoriesRequest {
  /** 搜尋關鍵字 */
  query?: string;
  /** 組織 ID */
  organizationId?: string;
  /** 團隊 ID */
  teamId?: string;
  /** 是否為私有 */
  isPrivate?: boolean;
  /** 儲存庫類型 */
  type?: 'git' | 'svn' | 'mercurial' | 'other';
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
 * 儲存庫分析請求
 */
export interface RepositoryAnalyticsRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 時間範圍 */
  timeRange: {
    start: Date;
    end: Date;
  };
  /** 分析類型 */
  analyticsType?: 'commits' | 'contributors' | 'files' | 'quality';
  /** 分支篩選 */
  branches?: string[];
}

/**
 * 儲存庫同步請求
 */
export interface SyncRepositoryRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 同步類型 */
  syncType: 'full' | 'incremental';
  /** 強制同步 */
  force?: boolean;
}

/**
 * 儲存庫備份請求
 */
export interface BackupRepositoryRequest {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 備份類型 */
  backupType: 'full' | 'incremental';
  /** 備份位置 */
  backupLocation?: string;
  /** 壓縮 */
  compress?: boolean;
}