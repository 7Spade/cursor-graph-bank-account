import { Injectable, signal, computed } from '@angular/core';

export interface LoadingState {
  id: string;
  name: string;
  loading: boolean;
  progress?: number;
  message?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface LoadingSettings {
  enableProgressTracking: boolean;
  enableDurationTracking: boolean;
  enableMessageTracking: boolean;
  defaultLoadingMessage: string;
  maxLoadingStates: number;
  enableLoadingHistory: boolean;
}

/**
 * LoadingStateService - 載入狀態服務
 * 使用 Angular Signals 統一管理載入狀態
 * 遵循單一職責原則：只負責載入狀態管理
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingStateService {
  // State signals
  private readonly _loadingStates = signal<Map<string, LoadingState>>(new Map());
  private readonly _loadingHistory = signal<LoadingState[]>([]);
  private readonly _settings = signal<LoadingSettings>({
    enableProgressTracking: true,
    enableDurationTracking: true,
    enableMessageTracking: true,
    defaultLoadingMessage: '載入中...',
    maxLoadingStates: 10,
    enableLoadingHistory: true
  });

  // Public readonly signals
  readonly loadingStates = this._loadingStates.asReadonly();
  readonly loadingHistory = this._loadingHistory.asReadonly();
  readonly settings = this._settings.asReadonly();

  // Computed signals
  readonly hasLoadingStates = computed(() => this._loadingStates().size > 0);
  readonly isLoading = computed(() => 
    Array.from(this._loadingStates().values()).some(state => state.loading)
  );
  readonly loadingCount = computed(() => 
    Array.from(this._loadingStates().values()).filter(state => state.loading).length
  );
  readonly activeLoadingStates = computed(() => 
    Array.from(this._loadingStates().values()).filter(state => state.loading)
  );
  readonly completedLoadingStates = computed(() => 
    Array.from(this._loadingStates().values()).filter(state => !state.loading)
  );

  /**
   * Start loading state
   */
  startLoading(
    name: string,
    message?: string,
    progress?: number
  ): string {
    const loadingId = this.generateId();
    const settings = this._settings();
    
    const loadingState: LoadingState = {
      id: loadingId,
      name,
      loading: true,
      progress: progress ?? 0,
      message: message ?? settings.defaultLoadingMessage,
      startTime: Date.now()
    };

    this._loadingStates.update(states => {
      const newStates = new Map(states);
      newStates.set(loadingId, loadingState);
      
      // Limit loading states
      if (newStates.size > settings.maxLoadingStates) {
        const oldestKey = Array.from(newStates.keys())[0];
        if (oldestKey) {
          newStates.delete(oldestKey);
        }
      }
      
      return newStates;
    });

    return loadingId;
  }

  /**
   * Update loading progress
   */
  updateProgress(loadingId: string, progress: number, message?: string): boolean {
    const state = this._loadingStates().get(loadingId);
    if (!state || !state.loading) {
      return false;
    }

    this._loadingStates.update(states => {
      const newStates = new Map(states);
      const updatedState = {
        ...state,
        progress: Math.min(100, Math.max(0, progress)),
        message: message ?? state.message
      };
      newStates.set(loadingId, updatedState);
      return newStates;
    });

    return true;
  }

  /**
   * Update loading message
   */
  updateMessage(loadingId: string, message: string): boolean {
    const state = this._loadingStates().get(loadingId);
    if (!state || !state.loading) {
      return false;
    }

    this._loadingStates.update(states => {
      const newStates = new Map(states);
      const updatedState = { ...state, message };
      newStates.set(loadingId, updatedState);
      return newStates;
    });

    return true;
  }

  /**
   * Complete loading state
   */
  completeLoading(loadingId: string, finalMessage?: string): boolean {
    const state = this._loadingStates().get(loadingId);
    if (!state || !state.loading) {
      return false;
    }

    const endTime = Date.now();
    const completedState: LoadingState = {
      ...state,
      loading: false,
      progress: 100,
      message: finalMessage ?? state.message,
      endTime,
      duration: endTime - state.startTime
    };

    this._loadingStates.update(states => {
      const newStates = new Map(states);
      newStates.set(loadingId, completedState);
      return newStates;
    });

    // Add to history if enabled
    if (this._settings().enableLoadingHistory) {
      this.addToHistory(completedState);
    }

    return true;
  }

  /**
   * Cancel loading state
   */
  cancelLoading(loadingId: string, cancelMessage?: string): boolean {
    const state = this._loadingStates().get(loadingId);
    if (!state || !state.loading) {
      return false;
    }

    const endTime = Date.now();
    const cancelledState: LoadingState = {
      ...state,
      loading: false,
      message: cancelMessage ?? '已取消',
      endTime,
      duration: endTime - state.startTime
    };

    this._loadingStates.update(states => {
      const newStates = new Map(states);
      newStates.set(loadingId, cancelledState);
      return newStates;
    });

    // Add to history if enabled
    if (this._settings().enableLoadingHistory) {
      this.addToHistory(cancelledState);
    }

    return true;
  }

  /**
   * Get loading state by ID
   */
  getLoadingState(loadingId: string): LoadingState | undefined {
    return this._loadingStates().get(loadingId);
  }

  /**
   * Get loading states by name
   */
  getLoadingStatesByName(name: string): LoadingState[] {
    return Array.from(this._loadingStates().values())
      .filter(state => state.name === name);
  }

  /**
   * Get active loading states by name
   */
  getActiveLoadingStatesByName(name: string): LoadingState[] {
    return Array.from(this._loadingStates().values())
      .filter(state => state.name === name && state.loading);
  }

  /**
   * Check if specific operation is loading
   */
  isOperationLoading(name: string): boolean {
    return Array.from(this._loadingStates().values())
      .some(state => state.name === name && state.loading);
  }

  /**
   * Get loading statistics
   */
  getLoadingStatistics() {
    const states = Array.from(this._loadingStates().values());
    const history = this._loadingHistory();
    
    const stats = {
      totalOperations: states.length,
      activeOperations: states.filter(s => s.loading).length,
      completedOperations: states.filter(s => !s.loading).length,
      averageLoadingTime: this.calculateAverageLoadingTime(states),
      totalLoadingTime: this.calculateTotalLoadingTime(states),
      operationsByName: this.groupOperationsByName(states),
      recentOperations: history.slice(-10)
    };

    return stats;
  }

  /**
   * Clear completed loading states
   */
  clearCompleted(): void {
    this._loadingStates.update(states => {
      const newStates = new Map();
      states.forEach((state, id) => {
        if (state.loading) {
          newStates.set(id, state);
        }
      });
      return newStates;
    });
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this._loadingStates.set(new Map());
  }

  /**
   * Clear loading history
   */
  clearHistory(): void {
    this._loadingHistory.set([]);
  }

  /**
   * Update loading settings
   */
  updateSettings(settings: Partial<LoadingSettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
  }

  // Private methods
  private addToHistory(state: LoadingState): void {
    this._loadingHistory.update(history => {
      const newHistory = [...history, state];
      
      // Limit history size
      const maxHistory = 100;
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory);
      }
      
      return newHistory;
    });
  }

  private generateId(): string {
    return `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateAverageLoadingTime(states: LoadingState[]): number {
    const completedStates = states.filter(s => 
      !s.loading && s.duration !== undefined
    );
    
    if (completedStates.length === 0) return 0;
    
    const totalTime = completedStates.reduce((sum, state) => sum + state.duration!, 0);
    return Math.round(totalTime / completedStates.length);
  }

  private calculateTotalLoadingTime(states: LoadingState[]): number {
    const completedStates = states.filter(s => 
      !s.loading && s.duration !== undefined
    );
    
    return completedStates.reduce((sum, state) => sum + state.duration!, 0);
  }

  private groupOperationsByName(states: LoadingState[]): Record<string, number> {
    return states.reduce((acc, state) => {
      acc[state.name] = (acc[state.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
