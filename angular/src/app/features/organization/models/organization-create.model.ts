/**
 * 組織建立相關的模型定義
 * 遵循單一職責原則：只包含組織建立所需的數據結構
 */

/**
 * 組織建立請求介面
 * 單一職責：定義組織建立請求的數據結構
 */
export interface OrganizationCreateRequest {
  /** 組織名稱 */
  name: string;
  /** 組織描述（可選） */
  description?: string;
  /** 隱私設定 */
  privacy: 'public' | 'private';
  /** 擁有者 ID */
  ownerId: string;
  /** 組織登入名稱（唯一標識符） */
  login: string;
}

/**
 * 組織建立響應介面
 * 單一職責：定義組織建立響應的數據結構
 */
export interface OrganizationCreateResponse {
  /** 是否成功 */
  success: boolean;
  /** 組織 ID */
  organizationId?: string;
  /** 錯誤訊息 */
  error?: string;
  /** 建立的組織數據 */
  organization?: {
    id: string;
    name: string;
    login: string;
    description?: string;
    privacy: 'public' | 'private';
    ownerId: string;
    createdAt: Date;
  };
}

/**
 * 組織建立事件介面
 * 單一職責：定義組織建立事件的數據結構
 */
export interface OrganizationCreatedEvent {
  /** 建立的組織 */
  organization: {
    id: string;
    name: string;
    login: string;
    description?: string;
    privacy: 'public' | 'private';
    ownerId: string;
    createdAt: Date;
  };
  /** 是否成功 */
  success: boolean;
  /** 錯誤訊息（如果失敗） */
  error?: string;
}

/**
 * 組織建立表單狀態介面
 * 單一職責：定義組織建立表單的狀態
 */
export interface OrganizationCreateFormState {
  /** 表單是否正在提交 */
  isSubmitting: boolean;
  /** 表單是否有效 */
  isValid: boolean;
  /** 表單錯誤 */
  errors: {
    name?: string;
    login?: string;
    description?: string;
    privacy?: string;
  };
  /** 表單值 */
  values: {
    name: string;
    login: string;
    description: string;
    privacy: 'public' | 'private';
  };
}
