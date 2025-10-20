/**
 * 驗證配置模型
 */

/**
 * 驗證配置
 */
export interface ValidationConfig {
  /** 驗證模式 */
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'manual';
  /** 是否啟用自動驗證 */
  enableAutoValidation: boolean;
  /** 是否啟用非同步驗證 */
  enableAsyncValidation: boolean;
  /** 驗證延遲時間（毫秒） */
  validationDelay: number;
  /** 驗證超時時間（毫秒） */
  validationTimeout: number;
  /** 是否顯示驗證錯誤 */
  showValidationErrors: boolean;
  /** 是否顯示驗證成功 */
  showValidationSuccess: boolean;
  /** 驗證錯誤樣式 */
  errorStyle: ValidationErrorStyle;
  /** 驗證成功樣式 */
  successStyle: ValidationSuccessStyle;
  /** 全域驗證規則 */
  globalRules: ValidationRule[];
  /** 自訂驗證器 */
  customValidators: CustomValidator[];
  /** 驗證訊息模板 */
  messageTemplates: ValidationMessageTemplate[];
}

/**
 * 驗證規則
 */
export interface ValidationRule {
  /** 規則名稱 */
  name: string;
  /** 規則類型 */
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'number' | 'min' | 'max' | 'custom' | 'async';
  /** 規則參數 */
  params?: Record<string, any>;
  /** 錯誤訊息 */
  message: string;
  /** 是否為非同步驗證 */
  isAsync?: boolean;
  /** 驗證函數 */
  validator?: (value: any, params?: any) => boolean | Promise<boolean>;
  /** 錯誤訊息函數 */
  messageFunction?: (value: any, params?: any) => string;
  /** 規則優先級 */
  priority: number;
  /** 規則是否啟用 */
  enabled: boolean;
  /** 規則條件 */
  condition?: (formData: any) => boolean;
}

/**
 * 自訂驗證器
 */
export interface CustomValidator {
  /** 驗證器名稱 */
  name: string;
  /** 驗證器函數 */
  validator: (value: any, params?: any) => boolean | Promise<boolean>;
  /** 錯誤訊息函數 */
  messageFunction: (value: any, params?: any) => string;
  /** 驗證器參數 */
  params?: Record<string, any>;
  /** 驗證器描述 */
  description?: string;
  /** 驗證器版本 */
  version: string;
}

/**
 * 驗證錯誤樣式
 */
export interface ValidationErrorStyle {
  /** 文字顏色 */
  color: string;
  /** 背景顏色 */
  backgroundColor: string;
  /** 邊框顏色 */
  borderColor: string;
  /** 邊框樣式 */
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  /** 邊框寬度 */
  borderWidth: string;
  /** 字體大小 */
  fontSize: string;
  /** 字體粗細 */
  fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  /** 圖示 */
  icon?: string;
  /** 圖示顏色 */
  iconColor?: string;
  /** 動畫 */
  animation?: string;
  /** 自訂 CSS 類別 */
  customClass?: string;
}

/**
 * 驗證成功樣式
 */
export interface ValidationSuccessStyle {
  /** 文字顏色 */
  color: string;
  /** 背景顏色 */
  backgroundColor: string;
  /** 邊框顏色 */
  borderColor: string;
  /** 邊框樣式 */
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  /** 邊框寬度 */
  borderWidth: string;
  /** 字體大小 */
  fontSize: string;
  /** 字體粗細 */
  fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  /** 圖示 */
  icon?: string;
  /** 圖示顏色 */
  iconColor?: string;
  /** 動畫 */
  animation?: string;
  /** 自訂 CSS 類別 */
  customClass?: string;
}

/**
 * 驗證訊息模板
 */
export interface ValidationMessageTemplate {
  /** 模板名稱 */
  name: string;
  /** 模板類型 */
  type: 'error' | 'warning' | 'info' | 'success';
  /** 模板內容 */
  template: string;
  /** 模板變數 */
  variables: string[];
  /** 模板樣式 */
  style: ValidationErrorStyle | ValidationSuccessStyle;
  /** 模板位置 */
  position: 'top' | 'bottom' | 'left' | 'right' | 'inline';
  /** 模板動畫 */
  animation?: string;
  /** 模板持續時間 */
  duration?: number;
  /** 模板是否可關閉 */
  closable: boolean;
}

/**
 * 欄位驗證配置
 */
export interface FieldValidationConfig {
  /** 欄位名稱 */
  fieldName: string;
  /** 驗證規則 */
  rules: ValidationRule[];
  /** 驗證模式 */
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'manual';
  /** 是否啟用驗證 */
  enabled: boolean;
  /** 驗證延遲時間 */
  delay: number;
  /** 自訂錯誤訊息 */
  customMessages: Record<string, string>;
  /** 自訂樣式 */
  customStyle?: ValidationErrorStyle;
}

/**
 * 表單驗證配置
 */
export interface FormValidationConfig {
  /** 表單 ID */
  formId: string;
  /** 全域配置 */
  global: ValidationConfig;
  /** 欄位配置 */
  fields: FieldValidationConfig[];
  /** 提交驗證 */
  submitValidation: {
    enabled: boolean;
    showSummary: boolean;
    scrollToFirstError: boolean;
    highlightErrors: boolean;
  };
  /** 即時驗證 */
  realTimeValidation: {
    enabled: boolean;
    debounceTime: number;
    showErrors: boolean;
    showSuccess: boolean;
  };
}

/**
 * 驗證結果
 */
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 錯誤列表 */
  errors: ValidationError[];
  /** 警告列表 */
  warnings: ValidationWarning[];
  /** 驗證時間 */
  validatedAt: Date;
  /** 驗證耗時 */
  validationTime: number;
}

/**
 * 驗證錯誤
 */
export interface ValidationError {
  /** 錯誤 ID */
  id: string;
  /** 欄位名稱 */
  fieldName: string;
  /** 錯誤訊息 */
  message: string;
  /** 錯誤代碼 */
  code: string;
  /** 錯誤類型 */
  type: 'required' | 'format' | 'length' | 'range' | 'custom' | 'async';
  /** 錯誤值 */
  value: any;
  /** 錯誤規則 */
  rule: ValidationRule;
  /** 錯誤時間 */
  occurredAt: Date;
}

/**
 * 驗證警告
 */
export interface ValidationWarning {
  /** 警告 ID */
  id: string;
  /** 欄位名稱 */
  fieldName: string;
  /** 警告訊息 */
  message: string;
  /** 警告代碼 */
  code: string;
  /** 警告類型 */
  type: 'format' | 'length' | 'range' | 'custom';
  /** 警告值 */
  value: any;
  /** 警告規則 */
  rule: ValidationRule;
  /** 警告時間 */
  occurredAt: Date;
}

/**
 * 驗證統計
 */
export interface ValidationStats {
  /** 總驗證次數 */
  totalValidations: number;
  /** 成功驗證次數 */
  successfulValidations: number;
  /** 失敗驗證次數 */
  failedValidations: number;
  /** 平均驗證時間 */
  averageValidationTime: number;
  /** 最常見的錯誤 */
  commonErrors: Array<{
    code: string;
    count: number;
    percentage: number;
  }>;
  /** 驗證效能指標 */
  performance: {
    minTime: number;
    maxTime: number;
    medianTime: number;
    p95Time: number;
    p99Time: number;
  };
}

/**
 * 驗證配置建構器
 */
export interface ValidationConfigBuilder {
  /** 設定驗證模式 */
  setMode(mode: ValidationConfig['mode']): ValidationConfigBuilder;
  /** 啟用自動驗證 */
  enableAutoValidation(): ValidationConfigBuilder;
  /** 停用自動驗證 */
  disableAutoValidation(): ValidationConfigBuilder;
  /** 啟用非同步驗證 */
  enableAsyncValidation(): ValidationConfigBuilder;
  /** 停用非同步驗證 */
  disableAsyncValidation(): ValidationConfigBuilder;
  /** 設定驗證延遲 */
  setValidationDelay(delay: number): ValidationConfigBuilder;
  /** 設定驗證超時 */
  setValidationTimeout(timeout: number): ValidationConfigBuilder;
  /** 添加全域規則 */
  addGlobalRule(rule: ValidationRule): ValidationConfigBuilder;
  /** 移除全域規則 */
  removeGlobalRule(ruleName: string): ValidationConfigBuilder;
  /** 添加自訂驗證器 */
  addCustomValidator(validator: CustomValidator): ValidationConfigBuilder;
  /** 設定錯誤樣式 */
  setErrorStyle(style: ValidationErrorStyle): ValidationConfigBuilder;
  /** 設定成功樣式 */
  setSuccessStyle(style: ValidationSuccessStyle): ValidationConfigBuilder;
  /** 建構配置 */
  build(): ValidationConfig;
}