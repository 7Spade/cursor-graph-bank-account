/**
 * 組織相關響應模型
 */

import { Organization, OrganizationMember, OrganizationRole, OrganizationDetail } from '../entities/organization.model';

/**
 * 組織創建響應
 */
export interface OrganizationCreateResponse {
  /** 組織資料 */
  organization: Organization;
  /** 創建者角色 */
  creatorRole: OrganizationRole;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 組織更新響應
 */
export interface OrganizationUpdateResponse {
  /** 組織資料 */
  organization: Organization;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 組織列表響應
 */
export interface OrganizationListResponse {
  /** 組織列表 */
  organizations: Organization[];
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
 * 組織搜尋響應
 */
export interface OrganizationSearchResponse {
  /** 搜尋結果 */
  results: Organization[];
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
 * 組織詳細資料響應
 */
export interface OrganizationDetailResponse {
  /** 組織詳細資料 */
  organizationDetail: OrganizationDetail;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 組織成員列表響應
 */
export interface OrganizationMembersResponse {
  /** 成員列表 */
  members: OrganizationMember[];
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
 * 組織角色列表響應
 */
export interface OrganizationRolesResponse {
  /** 角色列表 */
  roles: OrganizationRole[];
  /** 總數 */
  total: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 成員邀請響應
 */
export interface MemberInvitationResponse {
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
 * 成員角色更新響應
 */
export interface MemberRoleUpdateResponse {
  /** 成員資料 */
  member: OrganizationMember;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 成員移除響應
 */
export interface MemberRemovalResponse {
  /** 移除成功 */
  success: boolean;
  /** 被移除的成員 ID */
  memberId: string;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 角色創建響應
 */
export interface RoleCreationResponse {
  /** 角色資料 */
  role: OrganizationRole;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 角色更新響應
 */
export interface RoleUpdateResponse {
  /** 角色資料 */
  role: OrganizationRole;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 角色刪除響應
 */
export interface RoleDeletionResponse {
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
 * 組織統計響應
 */
export interface OrganizationStatsResponse {
  /** 組織 ID */
  organizationId: string;
  /** 統計資料 */
  stats: {
    /** 成員統計 */
    members: {
      total: number;
      active: number;
      pending: number;
      suspended: number;
    };
    /** 團隊統計 */
    teams: {
      total: number;
      active: number;
    };
    /** 專案統計 */
    projects: {
      total: number;
      active: number;
      completed: number;
    };
    /** 活動統計 */
    activity: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  };
  /** 響應時間戳 */
  timestamp: Date;
}