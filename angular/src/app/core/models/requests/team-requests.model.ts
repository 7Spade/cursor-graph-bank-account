/**
 * 團隊相關請求模型
 */

/**
 * 創建團隊請求
 */
export interface CreateTeamRequest {
  /** 團隊名稱 */
  name: string;
  /** 團隊描述 */
  description?: string;
  /** 組織 ID */
  organizationId: string;
  /** 父團隊 ID（用於層級結構） */
  parentTeamId?: string;
  /** 團隊設定 */
  settings?: {
    allowMemberInvites: boolean;
    requireAdminApproval: boolean;
    language: string;
    timezone: string;
    notificationSettings: {
      newMemberJoined: boolean;
      memberLeft: boolean;
      projectUpdates: boolean;
      taskAssignments: boolean;
      deadlineReminders: boolean;
    };
  };
}

/**
 * 更新團隊請求
 */
export interface UpdateTeamRequest {
  /** 團隊 ID */
  teamId: string;
  /** 團隊名稱 */
  name?: string;
  /** 團隊描述 */
  description?: string;
  /** 父團隊 ID */
  parentTeamId?: string;
  /** 團隊設定 */
  settings?: {
    allowMemberInvites: boolean;
    requireAdminApproval: boolean;
    language: string;
    timezone: string;
    notificationSettings: {
      newMemberJoined: boolean;
      memberLeft: boolean;
      projectUpdates: boolean;
      taskAssignments: boolean;
      deadlineReminders: boolean;
    };
  };
}

/**
 * 邀請團隊成員請求
 */
export interface InviteTeamMemberRequest {
  /** 團隊 ID */
  teamId: string;
  /** 用戶 ID */
  userId: string;
  /** 角色 ID */
  roleId: string;
  /** 邀請訊息 */
  message?: string;
}

/**
 * 更新團隊成員角色請求
 */
export interface UpdateTeamMemberRoleRequest {
  /** 團隊 ID */
  teamId: string;
  /** 成員 ID */
  memberId: string;
  /** 新角色 ID */
  roleId: string;
}

/**
 * 移除團隊成員請求
 */
export interface RemoveTeamMemberRequest {
  /** 團隊 ID */
  teamId: string;
  /** 成員 ID */
  memberId: string;
  /** 移除原因 */
  reason?: string;
}

/**
 * 創建團隊角色請求
 */
export interface CreateTeamRoleRequest {
  /** 團隊 ID */
  teamId: string;
  /** 角色名稱 */
  name: string;
  /** 角色描述 */
  description?: string;
  /** 角色權限 */
  permissions: string[];
}

/**
 * 更新團隊角色請求
 */
export interface UpdateTeamRoleRequest {
  /** 團隊 ID */
  teamId: string;
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
 * 刪除團隊角色請求
 */
export interface DeleteTeamRoleRequest {
  /** 團隊 ID */
  teamId: string;
  /** 角色 ID */
  roleId: string;
  /** 替代角色 ID（用於重新分配成員） */
  replacementRoleId?: string;
}

/**
 * 團隊搜尋請求
 */
export interface SearchTeamsRequest {
  /** 組織 ID */
  organizationId: string;
  /** 搜尋關鍵字 */
  query?: string;
  /** 父團隊 ID 篩選 */
  parentTeamId?: string;
  /** 狀態篩選 */
  status?: 'active' | 'inactive' | 'archived';
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
 * 團隊層級結構請求
 */
export interface TeamHierarchyRequest {
  /** 組織 ID */
  organizationId: string;
  /** 根團隊 ID（可選，預設為組織根層級） */
  rootTeamId?: string;
  /** 最大深度 */
  maxDepth?: number;
  /** 包含成員資訊 */
  includeMembers?: boolean;
}

/**
 * 團隊統計請求
 */
export interface TeamStatsRequest {
  /** 團隊 ID */
  teamId: string;
  /** 時間範圍 */
  timeRange?: {
    start: Date;
    end: Date;
  };
  /** 統計類型 */
  statsType?: 'members' | 'projects' | 'tasks' | 'activity';
}