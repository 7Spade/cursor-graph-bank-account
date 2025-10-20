/**
 * 驗證相關的類型定義
 * 遵循單一職責原則：只包含驗證所需的數據結構
 */

/**
 * 驗證結果介面
 * 單一職責：定義驗證結果的數據結構
 */
export interface ValidationResult {
  /** 驗證是否通過 */
  isValid: boolean;
  /** 錯誤訊息列表 */
  errors: string[];
  /** 警告訊息列表（可選） */
  warnings?: string[];
  /** 驗證的字段名稱 */
  field?: string;
  /** 驗證的值 */
  value?: any;
}

/**
 * 表單驗證狀態介面
 * 單一職責：定義表單驗證狀態的數據結構
 */
export interface FormValidationState {
  /** 整個表單是否有效 */
  isValid: boolean;
  /** 是否正在驗證 */
  isValidating: boolean;
  /** 字段驗證結果 */
  fieldResults: Record<string, ValidationResult>;
  /** 表單級別錯誤 */
  formErrors: string[];
  /** 表單級別警告 */
  formWarnings: string[];
}

/**
 * 驗證規則介面
 * 單一職責：定義驗證規則的數據結構
 */
export interface ValidationRule {
  /** 規則名稱 */
  name: string;
  /** 規則描述 */
  description: string;
  /** 驗證函數 */
  validator: (value: any) => ValidationResult;
  /** 是否必填 */
  required?: boolean;
  /** 最小長度 */
  minLength?: number;
  /** 最大長度 */
  maxLength?: number;
  /** 正則表達式 */
  pattern?: RegExp;
  /** 自定義錯誤訊息 */
  errorMessage?: string;
}

/**
 * 驗證配置介面
 * 單一職責：定義驗證配置的數據結構
 */
export interface ValidationConfig {
  /** 字段驗證規則 */
  fields: Record<string, ValidationRule[]>;
  /** 表單級別驗證規則 */
  formRules?: ValidationRule[];
  /** 是否實時驗證 */
  realTimeValidation?: boolean;
  /** 驗證延遲時間（毫秒） */
  validationDelay?: number;
}
