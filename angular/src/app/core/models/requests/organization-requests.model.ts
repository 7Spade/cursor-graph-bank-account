/**
 * 組織相關請求模型
 */

/**
 * 創建組織請求
 */
export interface CreateOrganizationRequest {
  /** 組織名稱 */
  name: string;
  /** 組織描述 */
  description?: string;
  /** 組織網站 */
  website?: string;
  /** 組織類型 */
  type: 'company' | 'nonprofit' | 'educational' | 'government' | 'other';
  /** 組織規模 */
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  /** 組織地址 */
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  /** 組織設定 */
  settings?: {
    allowMemberInvites: boolean;
    requireAdminApproval: boolean;
    allowPublicJoin: boolean;
    language: string;
    timezone: string;
  };
}

/**
 * 更新組織請求
 */
export interface UpdateOrganizationRequest {
  /** 組織 ID */
  organizationId: string;
  /** 組織名稱 */
  name?: string;
  /** 組織描述 */
  description?: string;
  /** 組織網站 */
  website?: string;
  /** 組織標誌 */
  logoUrl?: string;
  /** 組織類型 */
  type?: 'company' | 'nonprofit' | 'educational' | 'government' | 'other';
  /** 組織規模 */
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  /** 組織地址 */
  address?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  /** 組織設定 */
  settings?: {
    allowMemberInvites: boolean;
    requireAdminApproval: boolean;
    allowPublicJoin: boolean;
    language: string;
    timezone: string;
  };
}

/**
 * 邀請成員請求
 */
export interface InviteMemberRequest {
  /** 組織 ID */
  organizationId: string;
  /** 電子郵件 */
  email: string;
  /** 角色 ID */
  roleId: string;
  /** 邀請訊息 */
  message?: string;
}

/**
 * 更新成員角色請求
 */
export interface UpdateMemberRoleRequest {
  /** 組織 ID */
  organizationId: string;
  /** 成員 ID */
  memberId: string;
  /** 新角色 ID */
  roleId: string;
}

/**
 * 移除成員請求
 */
export interface RemoveMemberRequest {
  /** 組織 ID */
  organizationId: string;
  /** 成員 ID */
  memberId: string;
  /** 移除原因 */
  reason?: string;
}

/**
 * 創建角色請求
 */
export interface CreateRoleRequest {
  /** 組織 ID */
  organizationId: string;
  /** 角色名稱 */
  name: string;
  /** 角色描述 */
  description?: string;
  /** 角色權限 */
  permissions: string[];
}

/**
 * 更新角色請求
 */
export interface UpdateRoleRequest {
  /** 組織 ID */
  organizationId: string;
  /** 角色 ID */
  roleId: string;
  /** 角色名稱 */
  name?: string;
  /** 角色描述 */
  description?: string;
  /** 角色權限 */
  permissions?: string[];
}

/**
 * 刪除角色請求
 */
export interface DeleteRoleRequest {
  /** 組織 ID */
  organizationId: string;
  /** 角色 ID */
  roleId: string;
  /** 替代角色 ID（用於重新分配成員） */
  replacementRoleId?: string;
}

/**
 * 組織搜尋請求
 */
export interface SearchOrganizationsRequest {
  /** 搜尋關鍵字 */
  query?: string;
  /** 組織類型篩選 */
  type?: 'company' | 'nonprofit' | 'educational' | 'government' | 'other';
  /** 組織規模篩選 */
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  /** 排序方式 */
  sortBy?: 'name' | 'createdAt' | 'memberCount';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
}

/**
 * 組織統計請求
 */
export interface OrganizationStatsRequest {
  /** 組織 ID */
  organizationId: string;
  /** 時間範圍 */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /** 統計類型 */
  statsType?: 'members' | 'teams' | 'projects' | 'activity';
}