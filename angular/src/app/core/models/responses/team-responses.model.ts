/**
 * 團隊相關響應模型
 */

import { Team, TeamMember, TeamRole, TeamNode, TeamStats } from '../entities/team.model';

/**
 * 團隊創建響應
 */
export interface TeamCreateResponse {
  /** 團隊資料 */
  team: Team;
  /** 創建者角色 */
  creatorRole: TeamRole;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊更新響應
 */
export interface TeamUpdateResponse {
  /** 團隊資料 */
  team: Team;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊列表響應
 */
export interface TeamListResponse {
  /** 團隊列表 */
  teams: Team[];
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
 * 團隊搜尋響應
 */
export interface TeamSearchResponse {
  /** 搜尋結果 */
  results: Team[];
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
 * 團隊層級結構響應
 */
export interface TeamHierarchyResponse {
  /** 團隊層級樹 */
  hierarchy: TeamNode[];
  /** 總團隊數 */
  totalTeams: number;
  /** 最大深度 */
  maxDepth: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 團隊成員列表響應
 */
export interface TeamMembersResponse {
  /** 成員列表 */
  members: TeamMember[];
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
 * 團隊角色列表響應
 */
export interface TeamRolesResponse {
  /** 角色列表 */
  roles: TeamRole[];
  /** 總數 */
  total: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 團隊成員邀請響應
 */
export interface TeamMemberInvitationResponse {
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
 * 團隊成員角色更新響應
 */
export interface TeamMemberRoleUpdateResponse {
  /** 成員資料 */
  member: TeamMember;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊成員移除響應
 */
export interface TeamMemberRemovalResponse {
  /** 移除成功 */
  success: boolean;
  /** 被移除的成員 ID */
  memberId: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 團隊角色創建響應
 */
export interface TeamRoleCreationResponse {
  /** 角色資料 */
  role: TeamRole;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊角色更新響應
 */
export interface TeamRoleUpdateResponse {
  /** 角色資料 */
  role: TeamRole;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 團隊角色刪除響應
 */
export interface TeamRoleDeletionResponse {
  /** 刪除成功 */
  success: boolean;
  /** 被刪除的角色 ID */
  roleId: string;
  /** 受影響的成員數量 */
  affectedMembersCount: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 團隊統計響應
 */
export interface TeamStatsResponse {
  /** 團隊 ID */
  teamId: string;
  /** 統計資料 */
  stats: TeamStats;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 團隊詳細資料響應
 */
export interface TeamDetailResponse {
  /** 團隊資料 */
  team: Team;
  /** 成員統計 */
  memberStats: {
    total: number;
    active: number;
    pending: number;
  };
  /** 專案統計 */
  projectStats: {
    total: number;
    active: number;
    completed: number;
  };
  /** 響應時間戳 */
  timestamp: Date;
}