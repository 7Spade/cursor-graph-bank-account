/**
 * 通知配置模型
 */

/**
 * 通知配置
 */
export interface NotificationConfig {
  /** 全域設定 */
  global: GlobalNotificationConfig;
  /** 通知類型設定 */
  types: Record<string, NotificationTypeConfig>;
  /** 通知通道設定 */
  channels: NotificationChannelConfig[];
  /** 通知模板設定 */
  templates: NotificationTemplateConfig[];
  /** 通知過濾器設定 */
  filters: NotificationFilterConfig[];
  /** 通知佇列設定 */
  queue: NotificationQueueConfig;
  /** 通知統計設定 */
  analytics: NotificationAnalyticsConfig;
}

/**
 * 全域通知配置
 */
export interface GlobalNotificationConfig {
  /** 是否啟用通知 */
  enabled: boolean;
  /** 預設語言 */
  defaultLanguage: string;
  /** 支援的語言 */
  supportedLanguages: string[];
  /** 時區 */
  timezone: string;
  /** 日期格式 */
  dateFormat: string;
  /** 時間格式 */
  timeFormat: string;
  /** 最大通知數量 */
  maxNotifications: number;
  /** 通知保留時間（天） */
  retentionDays: number;
  /** 是否啟用加密 */
  enableEncryption: boolean;
  /** 加密金鑰 */
  encryptionKey?: string;
}

/**
 * 通知類型配置
 */
export interface NotificationTypeConfig {
  /** 類型名稱 */
  name: string;
  /** 類型標識符 */
  identifier: string;
  /** 類型描述 */
  description: string;
  /** 是否啟用 */
  enabled: boolean;
  /** 預設優先級 */
  defaultPriority: 'low' | 'normal' | 'high' | 'urgent';
  /** 預設持續時間 */
  defaultDuration: number;
  /** 預設位置 */
  defaultPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  /** 預設動畫 */
  defaultAnimation: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  /** 是否可關閉 */
  closable: boolean;
  /** 是否可點擊 */
  clickable: boolean;
  /** 是否啟用聲音 */
  enableSound: boolean;
  /** 是否啟用振動 */
  enableVibration: boolean;
  /** 聲音檔案 */
  soundFile?: string;
  /** 振動模式 */
  vibrationPattern?: number[];
  /** 自訂樣式 */
  customStyle?: Record<string, any>;
  /** 自訂圖示 */
  customIcon?: string;
  /** 自訂顏色 */
  customColor?: string;
}

/**
 * 通知通道配置
 */
export interface NotificationChannelConfig {
  /** 通道名稱 */
  name: string;
  /** 通道類型 */
  type: 'desktop' | 'email' | 'sms' | 'push' | 'in-app' | 'webhook' | 'custom';
  /** 通道描述 */
  description: string;
  /** 是否啟用 */
  enabled: boolean;
  /** 通道優先級 */
  priority: number;
  /** 通道設定 */
  settings: Record<string, any>;
  /** 通道限制 */
  limits: NotificationChannelLimits;
  /** 通道認證 */
  authentication?: NotificationChannelAuth;
  /** 通道端點 */
  endpoints: NotificationChannelEndpoint[];
  /** 通道狀態 */
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  /** 最後測試時間 */
  lastTestedAt?: Date;
  /** 錯誤訊息 */
  errorMessage?: string;
}

/**
 * 通知通道限制
 */
export interface NotificationChannelLimits {
  /** 每分鐘最大發送量 */
  maxPerMinute: number;
  /** 每小時最大發送量 */
  maxPerHour: number;
  /** 每天最大發送量 */
  maxPerDay: number;
  /** 最大重試次數 */
  maxRetries: number;
  /** 重試間隔（毫秒） */
  retryInterval: number;
  /** 超時時間（毫秒） */
  timeout: number;
  /** 批次大小 */
  batchSize: number;
  /** 批次間隔（毫秒） */
  batchInterval: number;
}

/**
 * 通知通道認證
 */
export interface NotificationChannelAuth {
  /** 認證類型 */
  type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'custom';
  /** 認證參數 */
  params: Record<string, any>;
  /** 認證標頭 */
  headers: Record<string, string>;
  /** 認證查詢參數 */
  queryParams: Record<string, string>;
  /** 認證過期時間 */
  expiresAt?: Date;
  /** 認證刷新時間 */
  refreshAt?: Date;
}

/**
 * 通知通道端點
 */
export interface NotificationChannelEndpoint {
  /** 端點名稱 */
  name: string;
  /** 端點 URL */
  url: string;
  /** 端點方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 端點標頭 */
  headers: Record<string, string>;
  /** 端點查詢參數 */
  queryParams: Record<string, string>;
  /** 端點認證 */
  authentication?: NotificationChannelAuth;
  /** 端點狀態 */
  status: 'active' | 'inactive' | 'error';
  /** 端點優先級 */
  priority: number;
  /** 端點超時 */
  timeout: number;
  /** 端點重試 */
  retry: {
    enabled: boolean;
    maxAttempts: number;
    interval: number;
  };
}

/**
 * 通知模板配置
 */
export interface NotificationTemplateConfig {
  /** 模板 ID */
  id: string;
  /** 模板名稱 */
  name: string;
  /** 模板類型 */
  type: string;
  /** 模板語言 */
  language: string;
  /** 模板版本 */
  version: string;
  /** 模板內容 */
  content: NotificationTemplateContent;
  /** 模板變數 */
  variables: NotificationTemplateVariable[];
  /** 模板設定 */
  settings: NotificationTemplateSettings;
  /** 模板狀態 */
  status: 'draft' | 'published' | 'archived';
  /** 創建時間 */
  createdAt: Date;
  /** 更新時間 */
  updatedAt: Date;
  /** 創建者 */
  createdBy: string;
  /** 使用次數 */
  usageCount: number;
}

/**
 * 通知模板內容
 */
export interface NotificationTemplateContent {
  /** 標題模板 */
  title: string;
  /** 內容模板 */
  body: string;
  /** 摘要模板 */
  summary?: string;
  /** 動作模板 */
  actions?: NotificationTemplateAction[];
  /** 連結模板 */
  link?: string;
  /** 圖片模板 */
  image?: string;
  /** 圖示模板 */
  icon?: string;
  /** 聲音模板 */
  sound?: string;
}

/**
 * 通知模板變數
 */
export interface NotificationTemplateVariable {
  /** 變數名稱 */
  name: string;
  /** 變數類型 */
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  /** 變數描述 */
  description: string;
  /** 變數預設值 */
  defaultValue?: any;
  /** 變數是否必填 */
  required: boolean;
  /** 變數驗證規則 */
  validation?: string[];
  /** 變數範例 */
  example?: any;
}

/**
 * 通知模板動作
 */
export interface NotificationTemplateAction {
  /** 動作 ID */
  id: string;
  /** 動作標題 */
  title: string;
  /** 動作類型 */
  type: 'button' | 'link' | 'custom';
  /** 動作 URL */
  url?: string;
  /** 動作樣式 */
  style: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** 動作圖示 */
  icon?: string;
  /** 動作條件 */
  condition?: string;
}

/**
 * 通知模板設定
 */
export interface NotificationTemplateSettings {
  /** 預設優先級 */
  defaultPriority: 'low' | 'normal' | 'high' | 'urgent';
  /** 預設持續時間 */
  defaultDuration: number;
  /** 預設位置 */
  defaultPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  /** 預設動畫 */
  defaultAnimation: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  /** 是否可關閉 */
  closable: boolean;
  /** 是否可點擊 */
  clickable: boolean;
  /** 是否啟用聲音 */
  enableSound: boolean;
  /** 是否啟用振動 */
  enableVibration: boolean;
  /** 自訂樣式 */
  customStyle?: Record<string, any>;
}

/**
 * 通知過濾器配置
 */
export interface NotificationFilterConfig {
  /** 過濾器 ID */
  id: string;
  /** 過濾器名稱 */
  name: string;
  /** 過濾器描述 */
  description: string;
  /** 過濾器類型 */
  type: 'user' | 'role' | 'organization' | 'team' | 'custom';
  /** 過濾器條件 */
  conditions: NotificationFilterCondition[];
  /** 過濾器動作 */
  actions: NotificationFilterAction[];
  /** 過濾器優先級 */
  priority: number;
  /** 過濾器是否啟用 */
  enabled: boolean;
  /** 過濾器創建時間 */
  createdAt: Date;
  /** 過濾器更新時間 */
  updatedAt: Date;
  /** 過濾器創建者 */
  createdBy: string;
}

/**
 * 通知過濾器條件
 */
export interface NotificationFilterCondition {
  /** 條件 ID */
  id: string;
  /** 條件欄位 */
  field: string;
  /** 條件運算子 */
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn' | 'regex';
  /** 條件值 */
  value: any;
  /** 條件邏輯運算子 */
  logic?: 'and' | 'or';
  /** 條件是否啟用 */
  enabled: boolean;
}

/**
 * 通知過濾器動作
 */
export interface NotificationFilterAction {
  /** 動作 ID */
  id: string;
  /** 動作類型 */
  type: 'block' | 'allow' | 'modify' | 'redirect' | 'custom';
  /** 動作參數 */
  params: Record<string, any>;
  /** 動作是否啟用 */
  enabled: boolean;
}

/**
 * 通知佇列配置
 */
export interface NotificationQueueConfig {
  /** 佇列是否啟用 */
  enabled: boolean;
  /** 佇列類型 */
  type: 'memory' | 'redis' | 'database' | 'custom';
  /** 佇列設定 */
  settings: Record<string, any>;
  /** 佇列限制 */
  limits: {
    maxSize: number;
    maxRetries: number;
    retryInterval: number;
    timeout: number;
  };
  /** 佇列處理器 */
  processors: NotificationQueueProcessor[];
  /** 佇列監控 */
  monitoring: {
    enabled: boolean;
    interval: number;
    alerts: NotificationQueueAlert[];
  };
}

/**
 * 通知佇列處理器
 */
export interface NotificationQueueProcessor {
  /** 處理器名稱 */
  name: string;
  /** 處理器類型 */
  type: string;
  /** 處理器設定 */
  settings: Record<string, any>;
  /** 處理器優先級 */
  priority: number;
  /** 處理器是否啟用 */
  enabled: boolean;
  /** 處理器並發數 */
  concurrency: number;
  /** 處理器超時 */
  timeout: number;
}

/**
 * 通知佇列警報
 */
export interface NotificationQueueAlert {
  /** 警報名稱 */
  name: string;
  /** 警報條件 */
  condition: string;
  /** 警報閾值 */
  threshold: number;
  /** 警報動作 */
  actions: string[];
  /** 警報是否啟用 */
  enabled: boolean;
}

/**
 * 通知分析配置
 */
export interface NotificationAnalyticsConfig {
  /** 分析是否啟用 */
  enabled: boolean;
  /** 分析類型 */
  types: ('delivery' | 'engagement' | 'performance' | 'error')[];
  /** 分析間隔 */
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  /** 分析保留時間 */
  retention: number;
  /** 分析指標 */
  metrics: NotificationAnalyticsMetric[];
  /** 分析報告 */
  reports: NotificationAnalyticsReport[];
  /** 分析警報 */
  alerts: NotificationAnalyticsAlert[];
}

/**
 * 通知分析指標
 */
export interface NotificationAnalyticsMetric {
  /** 指標名稱 */
  name: string;
  /** 指標類型 */
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  /** 指標描述 */
  description: string;
  /** 指標標籤 */
  labels: string[];
  /** 指標是否啟用 */
  enabled: boolean;
}

/**
 * 通知分析報告
 */
export interface NotificationAnalyticsReport {
  /** 報告名稱 */
  name: string;
  /** 報告類型 */
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  /** 報告設定 */
  settings: Record<string, any>;
  /** 報告收件人 */
  recipients: string[];
  /** 報告是否啟用 */
  enabled: boolean;
}

/**
 * 通知分析警報
 */
export interface NotificationAnalyticsAlert {
  /** 警報名稱 */
  name: string;
  /** 警報條件 */
  condition: string;
  /** 警報閾值 */
  threshold: number;
  /** 警報動作 */
  actions: string[];
  /** 警報是否啟用 */
  enabled: boolean;
}