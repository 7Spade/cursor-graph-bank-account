/**
 * 通知狀態模型
 */

/**
 * 通知狀態
 */
export interface NotificationState {
  /** 通知列表 */
  notifications: NotificationItem[];
  /** 未讀通知數量 */
  unreadCount: number;
  /** 通知設定 */
  settings: NotificationSettings;
  /** 是否正在載入 */
  isLoading: boolean;
  /** 最後更新時間 */
  lastUpdated: Date;
}

/**
 * 通知項目
 */
export interface NotificationItem {
  /** 通知 ID */
  id: string;
  /** 通知標題 */
  title: string;
  /** 通知內容 */
  content: string;
  /** 通知類型 */
  type: 'info' | 'success' | 'warning' | 'error' | 'custom';
  /** 通知優先級 */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** 是否已讀 */
  isRead: boolean;
  /** 是否已處理 */
  isHandled: boolean;
  /** 是否已存檔 */
  isArchived: boolean;
  /** 是否已釘選 */
  isPinned: boolean;
  /** 創建時間 */
  createdAt: Date;
  /** 讀取時間 */
  readAt?: Date;
  /** 處理時間 */
  handledAt?: Date;
  /** 過期時間 */
  expiresAt?: Date;
  /** 發送者 */
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** 接收者 */
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  /** 通知資料 */
  data?: Record<string, any>;
  /** 通知動作 */
  actions?: NotificationAction[];
  /** 通知標籤 */
  tags?: string[];
  /** 通知分類 */
  category?: string;
  /** 通知來源 */
  source?: string;
  /** 通知連結 */
  link?: string;
  /** 通知圖示 */
  icon?: string;
  /** 通知圖片 */
  image?: string;
  /** 通知聲音 */
  sound?: string;
  /** 通知振動 */
  vibration?: boolean;
  /** 通知位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  /** 通知動畫 */
  animation?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  /** 通知持續時間 */
  duration?: number;
  /** 是否可關閉 */
  closable: boolean;
  /** 是否可點擊 */
  clickable: boolean;
  /** 自訂樣式 */
  customStyle?: Record<string, any>;
}

/**
 * 通知動作
 */
export interface NotificationAction {
  /** 動作 ID */
  id: string;
  /** 動作標題 */
  title: string;
  /** 動作類型 */
  type: 'button' | 'link' | 'custom';
  /** 動作處理器 */
  handler?: () => void;
  /** 動作連結 */
  url?: string;
  /** 動作樣式 */
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** 動作圖示 */
  icon?: string;
  /** 動作是否啟用 */
  enabled: boolean;
  /** 動作是否可見 */
  visible: boolean;
}

/**
 * 通知設定
 */
export interface NotificationSettings {
  /** 是否啟用通知 */
  enabled: boolean;
  /** 桌面通知 */
  desktop: {
    enabled: boolean;
    permission: 'granted' | 'denied' | 'default';
    sound: boolean;
    vibration: boolean;
  };
  /** 電子郵件通知 */
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    types: string[];
  };
  /** 推送通知 */
  push: {
    enabled: boolean;
    permission: 'granted' | 'denied' | 'default';
    sound: boolean;
    vibration: boolean;
  };
  /** 應用程式內通知 */
  inApp: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    duration: number;
    maxVisible: number;
  };
  /** 通知類型設定 */
  types: Record<string, NotificationTypeSettings>;
  /** 靜音時間 */
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  /** 通知過濾器 */
  filters: NotificationFilter[];
}

/**
 * 通知類型設定
 */
export interface NotificationTypeSettings {
  /** 是否啟用 */
  enabled: boolean;
  /** 桌面通知 */
  desktop: boolean;
  /** 電子郵件通知 */
  email: boolean;
  /** 推送通知 */
  push: boolean;
  /** 應用程式內通知 */
  inApp: boolean;
  /** 通知聲音 */
  sound: boolean;
  /** 通知振動 */
  vibration: boolean;
  /** 通知持續時間 */
  duration: number;
  /** 通知優先級 */
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * 通知過濾器
 */
export interface NotificationFilter {
  /** 過濾器 ID */
  id: string;
  /** 過濾器名稱 */
  name: string;
  /** 過濾器條件 */
  conditions: NotificationStateFilterCondition[];
  /** 過濾器動作 */
  actions: NotificationStateFilterAction[];
  /** 是否啟用 */
  enabled: boolean;
  /** 過濾器優先級 */
  priority: number;
}

/**
 * 通知過濾器條件（狀態版本）
 */
export interface NotificationStateFilterCondition {
  /** 條件欄位 */
  field: string;
  /** 條件運算子 */
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn';
  /** 條件值 */
  value: any;
  /** 條件邏輯運算子 */
  logic?: 'and' | 'or';
}

/**
 * 通知過濾器動作（狀態版本）
 */
export interface NotificationStateFilterAction {
  /** 動作類型 */
  type: 'markAsRead' | 'markAsUnread' | 'archive' | 'delete' | 'moveToCategory' | 'setPriority' | 'addTag' | 'removeTag' | 'custom';
  /** 動作參數 */
  params: Record<string, any>;
}

/**
 * 通知歷史
 */
export interface NotificationHistory {
  /** 歷史項目 */
  items: NotificationHistoryItem[];
  /** 總數 */
  total: number;
  /** 頁碼 */
  page: number;
  /** 每頁數量 */
  limit: number;
  /** 總頁數 */
  totalPages: number;
  /** 最後更新時間 */
  lastUpdated: Date;
}

/**
 * 通知歷史項目
 */
export interface NotificationHistoryItem extends NotificationItem {
  /** 歷史類型 */
  historyType: 'created' | 'read' | 'handled' | 'archived' | 'deleted';
  /** 歷史時間 */
  historyTime: Date;
  /** 歷史操作者 */
  operator?: {
    id: string;
    name: string;
  };
}

/**
 * 通知統計
 */
export interface NotificationStats {
  /** 總通知數 */
  total: number;
  /** 未讀通知數 */
  unread: number;
  /** 已讀通知數 */
  read: number;
  /** 已處理通知數 */
  handled: number;
  /** 已存檔通知數 */
  archived: number;
  /** 已刪除通知數 */
  deleted: number;
  /** 按類型統計 */
  byType: Record<string, number>;
  /** 按優先級統計 */
  byPriority: Record<string, number>;
  /** 按日期統計 */
  byDate: Record<string, number>;
  /** 按發送者統計 */
  bySender: Record<string, number>;
  /** 按分類統計 */
  byCategory: Record<string, number>;
  /** 平均處理時間 */
  averageHandlingTime: number;
  /** 平均讀取時間 */
  averageReadTime: number;
}

/**
 * 通知模板
 */
export interface NotificationTemplate {
  /** 模板 ID */
  id: string;
  /** 模板名稱 */
  name: string;
  /** 模板類型 */
  type: string;
  /** 模板標題 */
  title: string;
  /** 模板內容 */
  content: string;
  /** 模板變數 */
  variables: string[];
  /** 模板設定 */
  settings: NotificationTypeSettings;
  /** 模板動作 */
  actions: NotificationAction[];
  /** 模板標籤 */
  tags: string[];
  /** 模板分類 */
  category: string;
  /** 模板版本 */
  version: string;
  /** 創建時間 */
  createdAt: Date;
  /** 更新時間 */
  updatedAt: Date;
  /** 創建者 */
  createdBy: string;
  /** 是否啟用 */
  enabled: boolean;
}

/**
 * 通知佇列
 */
export interface NotificationQueue {
  /** 佇列項目 */
  items: NotificationQueueItem[];
  /** 佇列狀態 */
  status: 'idle' | 'processing' | 'paused' | 'error';
  /** 處理進度 */
  progress: {
    total: number;
    processed: number;
    failed: number;
    remaining: number;
  };
  /** 最後處理時間 */
  lastProcessedAt?: Date;
  /** 錯誤訊息 */
  error?: string;
}

/**
 * 通知佇列項目
 */
export interface NotificationQueueItem {
  /** 項目 ID */
  id: string;
  /** 通知資料 */
  notification: Omit<NotificationItem, 'id' | 'createdAt'>;
  /** 佇列狀態 */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** 重試次數 */
  retryCount: number;
  /** 最大重試次數 */
  maxRetries: number;
  /** 下次重試時間 */
  nextRetryAt?: Date;
  /** 錯誤訊息 */
  error?: string;
  /** 加入佇列時間 */
  queuedAt: Date;
  /** 處理時間 */
  processedAt?: Date;
}