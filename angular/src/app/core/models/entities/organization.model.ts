/**
 * 組織相關實體模型
 */

import { Account } from './user.model';
import { Team } from './team.model';

/**
 * 組織實體
 */
export interface Organization extends Account {
  /** 組織名稱 */
  name: string;
  /** 組織描述 */
  description?: string;
  /** 組織網站 */
  website?: string;
  /** 組織標誌 */
  logoUrl?: string;
  /** 組織類型 */
  type: 'company' | 'nonprofit' | 'educational' | 'government' | 'other';
  /** 組織規模 */
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  /** 組織地址 */
  address?: OrganizationAddress;
  /** 組織成員 */
  members?: OrganizationMember[];
  /** 組織團隊 */
  teams?: Team[];
  /** 組織設定 */
  settings?: OrganizationSettings;
}

/**
 * 組織地址
 */
export interface OrganizationAddress {
  /** 街道地址 */
  street: string;
  /** 城市 */
  city: string;
  /** 州/省 */
  state?: string;
  /** 郵遞區號 */
  postalCode: string;
  /** 國家 */
  country: string;
}

/**
 * 組織成員
 */
export interface OrganizationMember {
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
  role: OrganizationRole;
  /** 權限 */
  permissions: Permission[];
  /** 加入時間 */
  joinedAt: Date;
  /** 狀態 */
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

/**
 * 組織角色
 */
export interface OrganizationRole {
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
 * 權限
 */
export interface Permission {
  /** 權限 ID */
  id: string;
  /** 權限名稱 */
  name: string;
  /** 權限描述 */
  description?: string;
  /** 權限類型 */
  type: 'read' | 'write' | 'delete' | 'admin';
  /** 資源 */
  resource: string;
  /** 動作 */
  action: string;
}

/**
 * 組織設定
 */
export interface OrganizationSettings {
  /** 允許成員邀請 */
  allowMemberInvites: boolean;
  /** 需要管理員批准 */
  requireAdminApproval: boolean;
  /** 允許公開加入 */
  allowPublicJoin: boolean;
  /** 預設成員權限 */
  defaultMemberPermissions: Permission[];
  /** 組織主題 */
  theme?: string;
  /** 組織語言 */
  language: string;
  /** 時區 */
  timezone: string;
}

/**
 * 組織詳細資料
 */
export interface OrganizationDetail {
  /** 組織基本資訊 */
  organization: Organization;
  /** 成員統計 */
  memberStats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  /** 團隊統計 */
  teamStats: {
    total: number;
    active: number;
  };
  /** 最近活動 */
  recentActivity: Activity[];
}

/**
 * 組織資料
 */
export interface OrganizationProfile {
  /** 組織 ID */
  id: string;
  /** 組織名稱 */
  name: string;
  /** 組織描述 */
  description?: string;
  /** 組織網站 */
  website?: string;
  /** 組織標誌 */
  logoUrl?: string;
}

/**
 * 活動記錄
 */
export interface Activity {
  /** 活動 ID */
  id: string;
  /** 活動類型 */
  type: string;
  /** 活動描述 */
  description: string;
  /** 執行者 */
  actor: {
    id: string;
    name: string;
    type: 'user' | 'system';
  };
  /** 目標 */
  target?: {
    id: string;
    name: string;
    type: string;
  };
  /** 時間 */
  timestamp: Date;
  /** 詳細資料 */
  details?: Record<string, any>;
}