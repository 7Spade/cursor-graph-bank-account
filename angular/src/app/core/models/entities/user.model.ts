/**
 * 用戶相關實體模型
 */

/**
 * 基礎帳戶介面
 */
export interface Account {
  /** 帳戶唯一識別碼 */
  id: string;
  /** 電子郵件地址 */
  email: string;
  /** 創建時間 */
  createdAt: Date;
  /** 最後更新時間 */
  updatedAt: Date;
  /** 帳戶狀態 */
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

/**
 * 用戶實體
 */
export interface User extends Account {
  /** 用戶名稱 */
  username: string;
  /** 顯示名稱 */
  displayName: string;
  /** 頭像 URL */
  avatarUrl?: string;
  /** 角色 */
  role: string;
  /** 用戶資料 */
  profile?: UserProfile;
  /** 社交帳戶 */
  socialAccounts?: SocialAccount[];
  /** 通知偏好設定 */
  notificationPreferences?: NotificationPreferences;
  /** 隱私設定 */
  privacySettings?: PrivacySettings;
}

/**
 * 用戶資料
 */
export interface UserProfile {
  /** 名字 */
  firstName?: string;
  /** 姓氏 */
  lastName?: string;
  /** 電話號碼 */
  phoneNumber?: string;
  /** 地址 */
  address?: string;
  /** 生日 */
  dateOfBirth?: Date;
  /** 性別 */
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  /** 個人簡介 */
  bio?: string;
  /** 網站 */
  website?: string;
  /** 位置 */
  location?: string;
}

/**
 * 社交帳戶
 */
export interface SocialAccount {
  /** 社交平台 */
  provider: 'google' | 'facebook' | 'twitter' | 'github' | 'linkedin';
  /** 社交帳戶 ID */
  providerId: string;
  /** 社交帳戶用戶名 */
  username?: string;
  /** 社交帳戶顯示名稱 */
  displayName?: string;
  /** 社交帳戶頭像 */
  avatarUrl?: string;
  /** 連接時間 */
  connectedAt: Date;
}

/**
 * 通知偏好設定
 */
export interface NotificationPreferences {
  /** 電子郵件通知 */
  email: boolean;
  /** 推送通知 */
  push: boolean;
  /** 簡訊通知 */
  sms: boolean;
  /** 系統通知 */
  system: boolean;
  /** 行銷通知 */
  marketing: boolean;
}

/**
 * 隱私設定
 */
export interface PrivacySettings {
  /** 個人資料可見性 */
  profileVisibility: 'public' | 'private' | 'friends';
  /** 電子郵件可見性 */
  emailVisibility: 'public' | 'private' | 'friends';
  /** 線上狀態可見性 */
  onlineStatusVisibility: 'public' | 'private' | 'friends';
  /** 搜尋可見性 */
  searchVisibility: boolean;
}

/**
 * 用戶資料（本地定義，用於組件）
 */
export interface UserData {
  /** 用戶 ID */
  uid: string;
  /** 電子郵件 */
  email: string;
  /** 角色 */
  role: string;
}