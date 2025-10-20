import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private currentLevel: LogLevel = LogLevel.DEBUG;
  private logs: LogEntry[] = [];

  /**
   * 設置日誌級別
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 獲取當前日誌級別
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * 獲取所有日誌
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 清除日誌
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 記錄調試信息
   */
  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * 記錄一般信息
   */
  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * 記錄警告信息
   */
  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * 記錄錯誤信息
   */
  error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * 內部日誌記錄方法
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    if (level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data
    };

    // 添加到內部日誌數組
    this.logs.push(entry);

    // 保持日誌數組大小合理（最多保留 1000 條）
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // 根據級別輸出到控制台
    const logMessage = `[${this.getLevelName(level)}] ${context ? `[${context}] ` : ''}${message}`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
    }
  }

  /**
   * 獲取級別名稱
   */
  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }
}
