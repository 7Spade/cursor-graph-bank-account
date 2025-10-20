/**
 * 儲存庫相關響應模型
 */

import { Repository, RepositoryBranch, RepositoryCommit, RepositoryIssue, RepositoryPullRequest, RepositoryCollaborator, RepositoryTeamAccess, RepositoryStats, RepositorySearchResult, RepositoryAnalytics } from '../entities/repository.model';

/**
 * 儲存庫創建響應
 */
export interface RepositoryCreateResponse {
  /** 儲存庫資料 */
  repository: Repository;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 儲存庫更新響應
 */
export interface RepositoryUpdateResponse {
  /** 儲存庫資料 */
  repository: Repository;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 儲存庫列表響應
 */
export interface RepositoryListResponse {
  /** 儲存庫列表 */
  repositories: Repository[];
  /** 總數 */
  total: number;
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
  /** 總頁數 */
  totalPages: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫搜尋響應
 */
export interface RepositorySearchResponse {
  /** 搜尋結果 */
  results: RepositorySearchResult[];
  /** 總數 */
  total: number;
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
  /** 搜尋關鍵字 */
  query: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫詳細資料響應
 */
export interface RepositoryDetailResponse {
  /** 儲存庫資料 */
  repository: Repository;
  /** 分支列表 */
  branches: RepositoryBranch[];
  /** 協作者列表 */
  collaborators: RepositoryCollaborator[];
  /** 團隊存取權限列表 */
  teamAccess: RepositoryTeamAccess[];
  /** 統計資料 */
  stats: RepositoryStats;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫分支列表響應
 */
export interface RepositoryBranchesResponse {
  /** 分支列表 */
  branches: RepositoryBranch[];
  /** 總數 */
  total: number;
  /** 預設分支 */
  defaultBranch: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫提交列表響應
 */
export interface RepositoryCommitsResponse {
  /** 提交列表 */
  commits: RepositoryCommit[];
  /** 總數 */
  total: number;
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
  /** 分支名稱 */
  branch: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫問題列表響應
 */
export interface RepositoryIssuesResponse {
  /** 問題列表 */
  issues: RepositoryIssue[];
  /** 總數 */
  total: number;
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫拉取請求列表響應
 */
export interface RepositoryPullRequestsResponse {
  /** 拉取請求列表 */
  pullRequests: RepositoryPullRequest[];
  /** 總數 */
  total: number;
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 協作者邀請響應
 */
export interface CollaboratorInvitationResponse {
  /** 邀請 ID */
  invitationId: string;
  /** 邀請狀態 */
  status: 'sent' | 'accepted' | 'declined' | 'expired';
  /** 邀請郵件已發送 */
  invitationEmailSent: boolean;
  /** 邀請過期時間 */
  expiresAt: Date;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 協作者權限更新響應
 */
export interface CollaboratorPermissionUpdateResponse {
  /** 協作者資料 */
  collaborator: RepositoryCollaborator;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 協作者移除響應
 */
export interface CollaboratorRemovalResponse {
  /** 移除成功 */
  success: boolean;
  /** 被移除的協作者 ID */
  collaboratorId: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 團隊存取權限授予響應
 */
export interface TeamAccessGrantResponse {
  /** 團隊存取權限資料 */
  teamAccess: RepositoryTeamAccess;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊存取權限更新響應
 */
export interface TeamAccessUpdateResponse {
  /** 團隊存取權限資料 */
  teamAccess: RepositoryTeamAccess;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊存取權限移除響應
 */
export interface TeamAccessRemovalResponse {
  /** 移除成功 */
  success: boolean;
  /** 被移除的團隊存取權限 ID */
  teamAccessId: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫分析響應
 */
export interface RepositoryAnalyticsResponse {
  /** 儲存庫 ID */
  repositoryId: string;
  /** 分析資料 */
  analytics: RepositoryAnalytics;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫同步響應
 */
export interface RepositorySyncResponse {
  /** 同步成功 */
  success: boolean;
  /** 同步類型 */
  syncType: 'full' | 'incremental';
  /** 同步開始時間 */
  syncStartedAt: Date;
  /** 同步完成時間 */
  syncCompletedAt: Date;
  /** 同步耗時（毫秒） */
  syncDuration: number;
  /** 同步的提交數量 */
  commitsSynced: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 儲存庫備份響應
 */
export interface RepositoryBackupResponse {
  /** 備份成功 */
  success: boolean;
  /** 備份類型 */
  backupType: 'full' | 'incremental';
  /** 備份檔案路徑 */
  backupPath: string;
  /** 備份檔案大小 */
  backupSize: number;
  /** 備份開始時間 */
  backupStartedAt: Date;
  /** 備份完成時間 */
  backupCompletedAt: Date;
  /** 響應時間戳 */
  timestamp: Date;
}