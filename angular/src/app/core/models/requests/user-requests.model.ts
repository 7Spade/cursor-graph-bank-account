/**
 * 用戶相關請求模型
 */

/**
 * 創建用戶請求
 */
export interface CreateUserRequest {
  /** 用戶名稱 */
  username: string;
  /** 電子郵件 */
  email: string;
  /** 顯示名稱 */
  displayName: string;
  /** 密碼 */
  password: string;
  /** 角色 */
  role?: string;
  /** 個人資料 */
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    bio?: string;
  };
}

/**
 * 更新用戶請求
 */
export interface UpdateUserRequest {
  /** 用戶 ID */
  userId: string;
  /** 顯示名稱 */
  displayName?: string;
  /** 頭像 URL */
  avatarUrl?: string;
  /** 個人資料 */
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    bio?: string;
    website?: string;
    location?: string;
  };
  /** 通知偏好設定 */
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    system: boolean;
    marketing: boolean;
  };
  /** 隱私設定 */
  privacySettings?: {
    profileVisibility: 'public' | 'private' | 'friends';
    emailVisibility: 'public' | 'private' | 'friends';
    onlineStatusVisibility: 'public' | 'private' | 'friends';
    searchVisibility: boolean;
  };
}

/**
 * 添加社交帳戶請求
 */
export interface AddSocialAccountRequest {
  /** 用戶 ID */
  userId: string;
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
}

/**
 * 更新通知偏好設定請求
 */
export interface UpdateNotificationPreferencesRequest {
  /** 用戶 ID */
  userId: string;
  /** 通知偏好設定 */
  preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    system: boolean;
    marketing: boolean;
  };
}

/**
 * 更新隱私設定請求
 */
export interface UpdatePrivacySettingsRequest {
  /** 用戶 ID */
  userId: string;
  /** 隱私設定 */
  settings: {
    profileVisibility: 'public' | 'private' | 'friends';
    emailVisibility: 'public' | 'private' | 'friends';
    onlineStatusVisibility: 'public' | 'private' | 'friends';
    searchVisibility: boolean;
  };
}

/**
 * 用戶搜尋請求
 */
export interface SearchUsersRequest {
  /** 搜尋關鍵字 */
  query?: string;
  /** 角色篩選 */
  role?: string;
  /** 狀態篩選 */
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  /** 排序方式 */
  sortBy?: 'username' | 'displayName' | 'createdAt' | 'lastLoginAt';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
}

/**
 * 用戶認證請求
 */
export interface UserAuthRequest {
  /** 電子郵件或用戶名 */
  identifier: string;
  /** 密碼 */
  password: string;
  /** 記住我 */
  rememberMe?: boolean;
}

/**
 * 密碼重設請求
 */
export interface ResetPasswordRequest {
  /** 電子郵件 */
  email: string;
}

/**
 * 密碼變更請求
 */
export interface ChangePasswordRequest {
  /** 用戶 ID */
  userId: string;
  /** 當前密碼 */
  currentPassword: string;
  /** 新密碼 */
  newPassword: string;
}