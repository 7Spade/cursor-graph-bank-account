/**
 * 組件狀態模型
 */

/**
 * 載入狀態
 */
export interface LoadingState {
  /** 是否正在載入 */
  isLoading: boolean;
  /** 載入訊息 */
  message?: string;
  /** 載入進度（0-100） */
  progress?: number;
  /** 載入開始時間 */
  startedAt?: Date;
  /** 載入結束時間 */
  endedAt?: Date;
  /** 載入類型 */
  type?: 'spinner' | 'skeleton' | 'progress' | 'overlay';
}

/**
 * 錯誤狀態
 */
export interface ErrorState {
  /** 是否有錯誤 */
  hasError: boolean;
  /** 錯誤訊息 */
  message?: string;
  /** 錯誤代碼 */
  code?: string;
  /** 錯誤詳情 */
  details?: Record<string, any>;
  /** 錯誤時間 */
  occurredAt?: Date;
  /** 錯誤類型 */
  type?: 'validation' | 'network' | 'server' | 'client' | 'unknown';
  /** 是否可以重試 */
  canRetry: boolean;
  /** 重試次數 */
  retryCount: number;
  /** 最大重試次數 */
  maxRetries: number;
}

/**
 * 成功狀態
 */
export interface SuccessState {
  /** 是否成功 */
  isSuccess: boolean;
  /** 成功訊息 */
  message?: string;
  /** 成功時間 */
  occurredAt?: Date;
  /** 成功類型 */
  type?: 'create' | 'update' | 'delete' | 'action';
  /** 自動隱藏時間（毫秒） */
  autoHideDelay?: number;
}

/**
 * 對話框狀態
 */
export interface DialogState {
  /** 對話框是否開啟 */
  isOpen: boolean;
  /** 對話框 ID */
  dialogId?: string;
  /** 對話框類型 */
  type?: 'confirm' | 'alert' | 'form' | 'custom';
  /** 對話框標題 */
  title?: string;
  /** 對話框內容 */
  content?: string;
  /** 對話框資料 */
  data?: Record<string, any>;
  /** 對話框配置 */
  config?: DialogConfig;
  /** 對話框結果 */
  result?: any;
}

/**
 * 對話框配置
 */
export interface DialogConfig {
  /** 對話框寬度 */
  width?: string;
  /** 對話框高度 */
  height?: string;
  /** 是否可關閉 */
  closable: boolean;
  /** 是否可拖拽 */
  draggable: boolean;
  /** 是否可調整大小 */
  resizable: boolean;
  /** 是否全螢幕 */
  fullscreen: boolean;
  /** 是否置中 */
  centered: boolean;
  /** 背景是否可點擊關閉 */
  backdropClickToClose: boolean;
  /** 按 ESC 鍵關閉 */
  escapeKeyToClose: boolean;
  /** 動畫類型 */
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
  /** 動畫持續時間 */
  animationDuration?: number;
}

/**
 * 分頁狀態
 */
export interface PaginationState {
  /** 當前頁碼 */
  currentPage: number;
  /** 每頁數量 */
  pageSize: number;
  /** 總項目數 */
  totalItems: number;
  /** 總頁數 */
  totalPages: number;
  /** 是否有上一頁 */
  hasPreviousPage: boolean;
  /** 是否有下一頁 */
  hasNextPage: boolean;
  /** 是否正在載入 */
  isLoading: boolean;
  /** 頁碼範圍 */
  pageRange: number[];
}

/**
 * 排序狀態
 */
export interface SortState {
  /** 排序欄位 */
  field: string;
  /** 排序方向 */
  direction: 'asc' | 'desc';
  /** 是否啟用排序 */
  enabled: boolean;
  /** 排序優先級 */
  priority?: number;
}

/**
 * 篩選狀態
 */
export interface FilterState {
  /** 篩選條件 */
  filters: Record<string, any>;
  /** 是否啟用篩選 */
  enabled: boolean;
  /** 篩選類型 */
  type?: 'text' | 'select' | 'date' | 'range' | 'custom';
  /** 篩選運算子 */
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
}

/**
 * 搜尋狀態
 */
export interface SearchState {
  /** 搜尋關鍵字 */
  query: string;
  /** 是否正在搜尋 */
  isSearching: boolean;
  /** 搜尋結果 */
  results: any[];
  /** 搜尋結果數量 */
  resultCount: number;
  /** 搜尋建議 */
  suggestions: string[];
  /** 搜尋歷史 */
  history: string[];
  /** 搜尋過濾器 */
  filters: Record<string, any>;
  /** 搜尋排序 */
  sort: SortState;
  /** 搜尋分頁 */
  pagination: PaginationState;
}

/**
 * 選取狀態
 */
export interface SelectionState {
  /** 選取的項目 */
  selectedItems: any[];
  /** 選取項目數量 */
  selectedCount: number;
  /** 是否全選 */
  isAllSelected: boolean;
  /** 是否部分選取 */
  isPartiallySelected: boolean;
  /** 選取模式 */
  mode: 'single' | 'multiple' | 'none';
  /** 選取限制 */
  maxSelection?: number;
  /** 選取過濾器 */
  selectionFilter?: (item: any) => boolean;
}

/**
 * 展開狀態
 */
export interface ExpansionState {
  /** 展開的項目 */
  expandedItems: Set<string>;
  /** 是否全部展開 */
  isAllExpanded: boolean;
  /** 是否全部收合 */
  isAllCollapsed: boolean;
  /** 展開模式 */
  mode: 'single' | 'multiple' | 'none';
  /** 預設展開 */
  defaultExpanded?: boolean;
}

/**
 * 標籤頁狀態
 */
export interface TabState {
  /** 當前標籤頁 */
  activeTab: string;
  /** 標籤頁列表 */
  tabs: TabItem[];
  /** 是否啟用標籤頁 */
  enabled: boolean;
  /** 標籤頁位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** 標籤頁樣式 */
  style?: 'default' | 'pills' | 'underline' | 'custom';
}

/**
 * 標籤頁項目
 */
export interface TabItem {
  /** 標籤頁 ID */
  id: string;
  /** 標籤頁標題 */
  title: string;
  /** 標籤頁內容 */
  content?: any;
  /** 是否禁用 */
  disabled: boolean;
  /** 是否隱藏 */
  hidden: boolean;
  /** 標籤頁圖示 */
  icon?: string;
  /** 標籤頁徽章 */
  badge?: {
    text: string;
    color?: string;
  };
  /** 標籤頁工具提示 */
  tooltip?: string;
}

/**
 * 導航狀態
 */
export interface NavigationState {
  /** 當前路由 */
  currentRoute: string;
  /** 路由歷史 */
  history: string[];
  /** 是否可以返回 */
  canGoBack: boolean;
  /** 是否可以前進 */
  canGoForward: boolean;
  /** 導航參數 */
  params: Record<string, any>;
  /** 查詢參數 */
  queryParams: Record<string, any>;
  /** 片段 */
  fragment?: string;
}

/**
 * 主題狀態
 */
export interface ThemeState {
  /** 當前主題 */
  currentTheme: string;
  /** 可用主題 */
  availableThemes: string[];
  /** 是否為深色模式 */
  isDarkMode: boolean;
  /** 主題配置 */
  config: Record<string, any>;
  /** 自訂主題 */
  customTheme?: Record<string, any>;
}

/**
 * 語言狀態
 */
export interface LanguageState {
  /** 當前語言 */
  currentLanguage: string;
  /** 可用語言 */
  availableLanguages: string[];
  /** 語言配置 */
  config: Record<string, any>;
  /** 翻譯資料 */
  translations: Record<string, any>;
}

/**
 * 組件生命週期狀態
 */
export interface ComponentLifecycleState {
  /** 組件是否已初始化 */
  isInitialized: boolean;
  /** 組件是否已銷毀 */
  isDestroyed: boolean;
  /** 組件是否可見 */
  isVisible: boolean;
  /** 組件是否啟用 */
  isEnabled: boolean;
  /** 組件錯誤 */
  error?: ErrorState;
  /** 組件警告 */
  warning?: {
    message: string;
    type: 'warning' | 'info' | 'success';
  };
}