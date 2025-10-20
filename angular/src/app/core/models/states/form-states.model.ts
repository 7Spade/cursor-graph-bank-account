/**
 * 表單狀態模型
 */

/**
 * 表單狀態
 */
export interface FormState {
  /** 表單是否有效 */
  isValid: boolean;
  /** 表單是否已提交 */
  isSubmitted: boolean;
  /** 表單是否正在提交 */
  isSubmitting: boolean;
  /** 表單是否已修改 */
  isDirty: boolean;
  /** 表單是否已觸碰 */
  isTouched: boolean;
  /** 表單錯誤 */
  errors: Record<string, string[]>;
  /** 表單值 */
  values: Record<string, any>;
  /** 表單欄位狀態 */
  fields: Record<string, FormFieldState>;
}

/**
 * 表單欄位狀態
 */
export interface FormFieldState {
  /** 欄位值 */
  value: any;
  /** 欄位是否有效 */
  isValid: boolean;
  /** 欄位是否已觸碰 */
  isTouched: boolean;
  /** 欄位是否已修改 */
  isDirty: boolean;
  /** 欄位是否正在驗證 */
  isValidating: boolean;
  /** 欄位錯誤 */
  errors: string[];
  /** 欄位驗證規則 */
  validators: FormValidationRule[];
}

/**
 * 表單驗證規則
 */
export interface FormValidationRule {
  /** 規則名稱 */
  name: string;
  /** 規則參數 */
  params?: Record<string, any>;
  /** 錯誤訊息 */
  message: string;
  /** 是否為非同步驗證 */
  isAsync?: boolean;
}

/**
 * 表單驗證結果
 */
export interface FormValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 錯誤訊息 */
  errors: string[];
  /** 驗證時間 */
  validatedAt: Date;
}

/**
 * 表單驗證狀態
 */
export interface FormValidationState {
  /** 整體驗證狀態 */
  overall: FormValidationResult;
  /** 欄位驗證狀態 */
  fields: Record<string, FormValidationResult>;
  /** 自訂驗證狀態 */
  custom: Record<string, FormValidationResult>;
}

/**
 * 表單配置
 */
export interface FormConfig {
  /** 表單 ID */
  formId: string;
  /** 表單名稱 */
  formName: string;
  /** 驗證模式 */
  validationMode: 'onChange' | 'onBlur' | 'onSubmit';
  /** 是否啟用自動驗證 */
  enableAutoValidation: boolean;
  /** 是否啟用非同步驗證 */
  enableAsyncValidation: boolean;
  /** 驗證延遲時間（毫秒） */
  validationDelay: number;
  /** 提交處理器 */
  onSubmit?: (values: Record<string, any>) => Promise<void>;
  /** 驗證處理器 */
  onValidate?: (values: Record<string, any>) => Promise<FormValidationResult>;
}

/**
 * 表單重置選項
 */
export interface FormResetOptions {
  /** 是否重置值 */
  resetValues: boolean;
  /** 是否重置狀態 */
  resetState: boolean;
  /** 是否重置錯誤 */
  resetErrors: boolean;
  /** 是否重置觸碰狀態 */
  resetTouched: boolean;
  /** 是否重置修改狀態 */
  resetDirty: boolean;
}

/**
 * 表單提交選項
 */
export interface FormSubmitOptions {
  /** 是否驗證表單 */
  validate: boolean;
  /** 是否顯示載入狀態 */
  showLoading: boolean;
  /** 是否防止重複提交 */
  preventDuplicate: boolean;
  /** 提交成功後是否重置表單 */
  resetOnSuccess: boolean;
  /** 提交成功後是否顯示成功訊息 */
  showSuccessMessage: boolean;
}

/**
 * 動態表單欄位
 */
export interface DynamicFormField {
  /** 欄位 ID */
  fieldId: string;
  /** 欄位類型 */
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file';
  /** 欄位標籤 */
  label: string;
  /** 欄位名稱 */
  name: string;
  /** 欄位值 */
  value?: any;
  /** 預設值 */
  defaultValue?: any;
  /** 是否必填 */
  required: boolean;
  /** 是否禁用 */
  disabled: boolean;
  /** 是否只讀 */
  readonly: boolean;
  /** 佔位符文字 */
  placeholder?: string;
  /** 說明文字 */
  description?: string;
  /** 驗證規則 */
  validators: FormValidationRule[];
  /** 選項（用於 select, radio, checkbox） */
  options?: Array<{
    value: any;
    label: string;
    disabled?: boolean;
  }>;
  /** 欄位屬性 */
  attributes?: Record<string, any>;
  /** 條件顯示 */
  conditional?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  };
}

/**
 * 表單步驟狀態
 */
export interface FormStepState {
  /** 當前步驟 */
  currentStep: number;
  /** 總步驟數 */
  totalSteps: number;
  /** 步驟是否有效 */
  isStepValid: boolean;
  /** 步驟是否已觸碰 */
  isStepTouched: boolean;
  /** 步驟是否已修改 */
  isStepDirty: boolean;
  /** 步驟錯誤 */
  stepErrors: Record<string, string[]>;
  /** 步驟值 */
  stepValues: Record<string, any>;
}

/**
 * 多步驟表單狀態
 */
export interface MultiStepFormState extends FormState {
  /** 步驟狀態 */
  steps: FormStepState[];
  /** 是否可以前往下一步 */
  canGoNext: boolean;
  /** 是否可以前往上一步 */
  canGoPrevious: boolean;
  /** 是否為最後一步 */
  isLastStep: boolean;
  /** 是否為第一步 */
  isFirstStep: boolean;
}