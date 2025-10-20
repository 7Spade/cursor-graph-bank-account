/**
 * 用戶相關響應模型
 */

import { User, SocialAccount, NotificationPreferences, PrivacySettings } from '../entities/user.model';

/**
 * 用戶 API 響應
 */
export interface UserApiResponse {
  /** 用戶資料 */
  user: User;
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
  /** 錯誤代碼（如果有） */
  errorCode?: string;
}

/**
 * 社交帳戶 API 響應
 */
export interface SocialAccountApiResponse {
  /** 社交帳戶列表 */
  socialAccounts: SocialAccount[];
  /** 響應時間戳 */
  timestamp: Date;
  /** 響應狀態 */
  status: 'success' | 'error';
  /** 錯誤訊息（如果有） */
  message?: string;
}

/**
 * 用戶列表響應
 */
export interface UserListResponse {
  /** 用戶列表 */
  users: User[];
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
 * 用戶搜尋響應
 */
export interface UserSearchResponse {
  /** 搜尋結果 */
  results: User[];
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
 * 用戶認證響應
 */
export interface UserAuthResponse {
  /** 用戶資料 */
  user: User;
  /** 存取權杖 */
  accessToken: string;
  /** 重新整理權杖 */
  refreshToken: string;
  /** 權杖過期時間 */
  expiresIn: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 用戶註冊響應
 */
export interface UserRegistrationResponse {
  /** 用戶資料 */
  user: User;
  /** 是否需要驗證 */
  requiresVerification: boolean;
  /** 驗證郵件已發送 */
  verificationEmailSent: boolean;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 用戶驗證響應
 */
export interface UserVerificationResponse {
  /** 驗證狀態 */
  verified: boolean;
  /** 驗證時間 */
  verifiedAt?: Date;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 密碼重設響應
 */
export interface PasswordResetResponse {
  /** 重設郵件已發送 */
  resetEmailSent: boolean;
  /** 重設權杖過期時間（分鐘） */
  tokenExpiresIn: number;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 密碼變更響應
 */
export interface PasswordChangeResponse {
  /** 變更成功 */
  success: boolean;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 用戶偏好設定響應
 */
export interface UserPreferencesResponse {
  /** 通知偏好設定 */
  notificationPreferences: NotificationPreferences;
  /** 隱私設定 */
  privacySettings: PrivacySettings;
  /** 響應時間戳 */
  timestamp: Date;
}

/**
 * 用戶統計響應
 */
export interface UserStatsResponse {
  /** 用戶 ID */
  userId: string;
  /** 統計資料 */
  stats: {
    /** 登入次數 */
    loginCount: number;
    /** 最後登入時間 */
    lastLoginAt: Date;
    /** 創建時間 */
    createdAt: Date;
    /** 組織數量 */
    organizationCount: number;
    /** 團隊數量 */
    teamCount: number;
    /** 專案數量 */
    projectCount: number;
  };
  /** 響應時間戳 */
  timestamp: Date;
}