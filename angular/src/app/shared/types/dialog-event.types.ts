/**
 * 對話框事件相關的類型定義
 * 遵循單一職責原則：只包含對話框事件所需的數據結構
 */

/**
 * 對話框關閉事件介面
 * 單一職責：定義對話框關閉事件的數據結構
 */
export interface DialogCloseEvent {
  /** 關閉原因 */
  reason: 'cancel' | 'confirm' | 'backdrop' | 'escape';
  /** 對話框數據 */
  data?: any;
  /** 是否成功 */
  success?: boolean;
}

/**
 * 對話框狀態介面
 * 單一職責：定義對話框狀態的數據結構
 */
export interface DialogState {
  /** 對話框是否打開 */
  isOpen: boolean;
  /** 對話框是否正在加載 */
  isLoading: boolean;
  /** 對話框標題 */
  title: string;
  /** 對話框數據 */
  data?: any;
  /** 對話框配置 */
  config?: DialogConfig;
}

/**
 * 對話框配置介面
 * 單一職責：定義對話框配置的數據結構
 */
export interface DialogConfig {
  /** 對話框寬度 */
  width?: string;
  /** 對話框高度 */
  height?: string;
  /** 是否禁用關閉 */
  disableClose?: boolean;
  /** 是否顯示關閉按鈕 */
  hasCloseIcon?: boolean;
  /** 是否顯示確認按鈕 */
  hasConfirmButton?: boolean;
  /** 是否顯示取消按鈕 */
  hasCancelButton?: boolean;
  /** 確認按鈕文字 */
  confirmButtonText?: string;
  /** 取消按鈕文字 */
  cancelButtonText?: string;
  /** 確認按鈕顏色 */
  confirmButtonColor?: 'primary' | 'accent' | 'warn';
  /** 取消按鈕顏色 */
  cancelButtonColor?: 'primary' | 'accent' | 'warn';
}

/**
 * 對話框結果介面
 * 單一職責：定義對話框結果的數據結構
 */
export interface DialogResult<T = any> {
  /** 是否確認 */
  confirmed: boolean;
  /** 結果數據 */
  data?: T;
  /** 錯誤訊息 */
  error?: string;
  /** 關閉原因 */
  reason?: 'cancel' | 'confirm' | 'backdrop' | 'escape';
}

/**
 * 對話框事件類型
 * 單一職責：定義對話框事件類型
 */
export type DialogEventType = 
  | 'open'
  | 'close'
  | 'confirm'
  | 'cancel'
  | 'backdrop'
  | 'escape'
  | 'loading'
  | 'loaded'
  | 'error';

/**
 * 對話框事件介面
 * 單一職責：定義對話框事件的數據結構
 */
export interface DialogEvent {
  /** 事件類型 */
  type: DialogEventType;
  /** 事件數據 */
  data?: any;
  /** 時間戳 */
  timestamp: Date;
  /** 對話框 ID */
  dialogId?: string;
}
