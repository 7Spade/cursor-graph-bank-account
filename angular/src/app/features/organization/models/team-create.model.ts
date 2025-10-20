/**
 * 團隊建立相關的模型定義
 * 遵循單一職責原則：只包含團隊建立所需的數據結構
 */

/**
 * 團隊建立請求介面
 * 單一職責：定義團隊建立請求的數據結構
 */
export interface TeamCreateRequest {
  /** 團隊名稱 */
  name: string;
  /** 團隊描述（可選） */
  description?: string;
  /** 所屬組織 ID */
  organizationId: string;
  /** 父團隊 ID（可選，用於層級團隊） */
  parentTeamId?: string;
  /** 隱私設定 */
  privacy: 'open' | 'closed';
  /** 權限等級 */
  permission: 'read' | 'write' | 'admin';
  /** 團隊 slug（唯一標識符） */
  slug: string;
}

/**
 * 團隊建立響應介面
 * 單一職責：定義團隊建立響應的數據結構
 */
export interface TeamCreateResponse {
  /** 是否成功 */
  success: boolean;
  /** 團隊 ID */
  teamId?: string;
  /** 錯誤訊息 */
  error?: string;
  /** 建立的團隊數據 */
  team?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    organizationId: string;
    parentTeamId?: string;
    privacy: 'open' | 'closed';
    permission: 'read' | 'write' | 'admin';
    createdAt: Date;
  };
}

/**
 * 團隊建立事件介面
 * 單一職責：定義團隊建立事件的數據結構
 */
export interface TeamCreatedEvent {
  /** 建立的團隊 */
  team: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    organizationId: string;
    parentTeamId?: string;
    privacy: 'open' | 'closed';
    permission: 'read' | 'write' | 'admin';
    createdAt: Date;
  };
  /** 是否成功 */
  success: boolean;
  /** 錯誤訊息（如果失敗） */
  error?: string;
}

/**
 * 團隊建立表單狀態介面
 * 單一職責：定義團隊建立表單的狀態
 */
export interface TeamCreateFormState {
  /** 表單是否正在提交 */
  isSubmitting: boolean;
  /** 表單是否有效 */
  isValid: boolean;
  /** 表單錯誤 */
  errors: {
    name?: string;
    slug?: string;
    description?: string;
    privacy?: string;
    permission?: string;
  };
  /** 表單值 */
  values: {
    name: string;
    slug: string;
    description: string;
    privacy: 'open' | 'closed';
    permission: 'read' | 'write' | 'admin';
  };
}
