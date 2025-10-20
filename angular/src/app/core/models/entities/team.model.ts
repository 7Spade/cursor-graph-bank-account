/**
 * 團隊相關實體模型
 */

import { OrganizationMember, Permission } from './organization.model';

/**
 * 團隊實體
 */
export interface Team {
  /** 團隊 ID */
  id: string;
  /** 團隊名稱 */
  name: string;
  /** 團隊描述 */
  description?: string;
  /** 組織 ID */
  organizationId: string;
  /** 父團隊 ID（用於層級結構） */
  parentTeamId?: string;
  /** 團隊成員 */
  members?: TeamMember[];
  /** 團隊權限 */
  permissions?: TeamPermissions;
  /** 團隊設定 */
  settings?: TeamSettings;
  /** 創建時間 */
  createdAt: Date;
  /** 最後更新時間 */
  updatedAt: Date;
  /** 創建者 ID */
  createdBy: string;
  /** 狀態 */
  status: 'active' | 'inactive' | 'archived';
}

/**
 * 團隊成員
 */
export interface TeamMember {
  /** 成員 ID */
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
  /** 角色 */
  role: TeamRole;
  /** 權限 */
  permissions: Permission[];
  /** 加入時間 */
  joinedAt: Date;
  /** 狀態 */
  status: 'active' | 'inactive' | 'pending';
}

/**
 * 團隊角色
 */
export interface TeamRole {
  /** 角色 ID */
  id: string;
  /** 角色名稱 */
  name: string;
  /** 角色描述 */
  description?: string;
  /** 角色權限 */
  permissions: Permission[];
  /** 是否為預設角色 */
  isDefault: boolean;
  /** 創建時間 */
  createdAt: Date;
}

/**
 * 團隊權限
 */
export interface TeamPermissions {
  /** 可以管理團隊 */
  canManageTeam: boolean;
  /** 可以邀請成員 */
  canInviteMembers: boolean;
  /** 可以移除成員 */
  canRemoveMembers: boolean;
  /** 可以編輯團隊設定 */
  canEditSettings: boolean;
  /** 可以刪除團隊 */
  canDeleteTeam: boolean;
  /** 可以查看所有專案 */
  canViewAllProjects: boolean;
  /** 可以創建專案 */
  canCreateProjects: boolean;
  /** 可以管理專案 */
  canManageProjects: boolean;
}

/**
 * 團隊設定
 */
export interface TeamSettings {
  /** 允許成員邀請 */
  allowMemberInvites: boolean;
  /** 需要管理員批准 */
  requireAdminApproval: boolean;
  /** 預設成員權限 */
  defaultMemberPermissions: Permission[];
  /** 團隊主題 */
  theme?: string;
  /** 團隊語言 */
  language: string;
  /** 時區 */
  timezone: string;
  /** 通知設定 */
  notificationSettings: TeamNotificationSettings;
}

/**
 * 團隊通知設定
 */
export interface TeamNotificationSettings {
  /** 新成員加入通知 */
  newMemberJoined: boolean;
  /** 成員離開通知 */
  memberLeft: boolean;
  /** 專案更新通知 */
  projectUpdates: boolean;
  /** 任務分配通知 */
  taskAssignments: boolean;
  /** 截止日期提醒 */
  deadlineReminders: boolean;
}

/**
 * 團隊層級節點（用於樹狀結構）
 */
export interface TeamNode extends Team {
  /** 子團隊 */
  children?: TeamNode[];
  /** 層級深度 */
  level: number;
  /** 是否為葉節點 */
  isLeaf: boolean;
  /** 父團隊名稱 */
  parentTeamName?: string;
}

/**
 * 團隊統計
 */
export interface TeamStats {
  /** 總成員數 */
  totalMembers: number;
  /** 活躍成員數 */
  activeMembers: number;
  /** 專案數 */
  projectCount: number;
  /** 任務數 */
  taskCount: number;
  /** 完成任務數 */
  completedTaskCount: number;
  /** 團隊效率 */
  efficiency: number;
}