// src/app/core/utils/validation.utils.ts

import { ProfileVO, PermissionVO, SettingsVO, OrgRole } from '../models/auth.model';

/**
 * 驗證工具類別
 * 提供統一的驗證邏輯和錯誤處理
 */
export class ValidationUtils {
  /**
   * 驗證電子郵件格式
   * @param email 電子郵件地址
   * @returns 是否為有效的電子郵件格式
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * 驗證密碼強度
   * @param password 密碼
   * @returns 驗證結果和錯誤訊息
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || password.length < 8) {
      errors.push('密碼至少需要 8 個字符');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('密碼必須包含至少一個大寫字母');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('密碼必須包含至少一個小寫字母');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('密碼必須包含至少一個數字');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密碼必須包含至少一個特殊字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證用戶檔案
   * @param profile 用戶檔案
   * @returns 錯誤訊息陣列
   */
  static validateProfile(profile: ProfileVO): string[] {
    const errors: string[] = [];
    
    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('用戶名稱不能為空');
    }
    
    if (profile.name && profile.name.trim().length < 2) {
      errors.push('用戶名稱至少需要 2 個字符');
    }
    
    if (!profile.email || !this.validateEmail(profile.email)) {
      errors.push('無效的電子郵件格式');
    }
    
    if (profile.bio && profile.bio.length > 500) {
      errors.push('個人簡介不能超過 500 個字符');
    }
    
    if (profile.website && !this.validateUrl(profile.website)) {
      errors.push('無效的網站 URL 格式');
    }
    
    return errors;
  }

  /**
   * 驗證權限設定
   * @param permission 權限設定
   * @returns 錯誤訊息陣列
   */
  static validatePermission(permission: PermissionVO): string[] {
    const errors: string[] = [];
    
    if (!permission.roles || permission.roles.length === 0) {
      errors.push('至少需要一個角色');
    }
    
    if (!permission.abilities || permission.abilities.length === 0) {
      errors.push('至少需要一個權限能力');
    }
    
    // 驗證角色格式
    if (permission.roles) {
      const validRoles = Object.values(OrgRole);
      const invalidRoles = permission.roles.filter(role => !validRoles.includes(role as OrgRole));
      if (invalidRoles.length > 0) {
        errors.push(`無效的角色: ${invalidRoles.join(', ')}`);
      }
    }
    
    return errors;
  }

  /**
   * 驗證設定
   * @param settings 設定
   * @returns 錯誤訊息陣列
   */
  static validateSettings(settings: SettingsVO): string[] {
    const errors: string[] = [];
    
    if (!settings.language || settings.language.trim().length === 0) {
      errors.push('語言設定不能為空');
    }
    
    if (!['light', 'dark'].includes(settings.theme)) {
      errors.push('主題設定必須是 light 或 dark');
    }
    
    if (settings.notifications) {
      if (typeof settings.notifications.email !== 'boolean') {
        errors.push('電子郵件通知設定必須是布林值');
      }
      if (typeof settings.notifications.push !== 'boolean') {
        errors.push('推送通知設定必須是布林值');
      }
      if (typeof settings.notifications.sms !== 'boolean') {
        errors.push('簡訊通知設定必須是布林值');
      }
    }
    
    if (settings.privacy) {
      if (typeof settings.privacy.profilePublic !== 'boolean') {
        errors.push('公開檔案設定必須是布林值');
      }
      if (typeof settings.privacy.showEmail !== 'boolean') {
        errors.push('顯示電子郵件設定必須是布林值');
      }
    }
    
    return errors;
  }

  /**
   * 驗證 URL 格式
   * @param url URL 字串
   * @returns 是否為有效的 URL
   */
  static validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 驗證登入名稱 (GitHub 式)
   * @param login 登入名稱
   * @returns 驗證結果和錯誤訊息
   */
  static validateLogin(login: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!login || login.trim().length === 0) {
      errors.push('登入名稱不能為空');
      return { isValid: false, errors };
    }
    
    const trimmedLogin = login.trim();
    
    if (trimmedLogin.length < 3) {
      errors.push('登入名稱至少需要 3 個字符');
    }
    
    if (trimmedLogin.length > 39) {
      errors.push('登入名稱不能超過 39 個字符');
    }
    
    // GitHub 式登入名稱規則：只能包含字母、數字、連字符和底線
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedLogin)) {
      errors.push('登入名稱只能包含字母、數字、連字符和底線');
    }
    
    // 不能以連字符或底線開頭或結尾
    if (/^[-_]|[-_]$/.test(trimmedLogin)) {
      errors.push('登入名稱不能以連字符或底線開頭或結尾');
    }
    
    // 不能包含連續的連字符或底線
    if (/[-_]{2,}/.test(trimmedLogin)) {
      errors.push('登入名稱不能包含連續的連字符或底線');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證組織名稱
   * @param name 組織名稱
   * @returns 驗證結果和錯誤訊息
   */
  static validateOrganizationName(name: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('組織名稱不能為空');
      return { isValid: false, errors };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      errors.push('組織名稱至少需要 2 個字符');
    }
    
    if (trimmedName.length > 100) {
      errors.push('組織名稱不能超過 100 個字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證團隊名稱
   * @param name 團隊名稱
   * @returns 驗證結果和錯誤訊息
   */
  static validateTeamName(name: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('團隊名稱不能為空');
      return { isValid: false, errors };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      errors.push('團隊名稱至少需要 2 個字符');
    }
    
    if (trimmedName.length > 50) {
      errors.push('團隊名稱不能超過 50 個字符');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證團隊 slug
   * @param slug 團隊 slug
   * @returns 驗證結果和錯誤訊息
   */
  static validateTeamSlug(slug: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!slug || slug.trim().length === 0) {
      errors.push('團隊 slug 不能為空');
      return { isValid: false, errors };
    }
    
    const trimmedSlug = slug.trim();
    
    if (trimmedSlug.length < 2) {
      errors.push('團隊 slug 至少需要 2 個字符');
    }
    
    if (trimmedSlug.length > 30) {
      errors.push('團隊 slug 不能超過 30 個字符');
    }
    
    // 檢查格式
    if (!/^[a-z0-9\-_]+$/.test(trimmedSlug)) {
      errors.push('團隊 slug 只能包含小寫字母、數字、連字符和下劃線');
    }
    
    // 檢查是否以連字符開頭或結尾
    if (/^[-_]|[-_]$/.test(trimmedSlug)) {
      errors.push('團隊 slug 不能以連字符或下劃線開頭或結尾');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 驗證 Repository 名稱
   * @param name Repository 名稱
   * @returns 驗證結果和錯誤訊息
   */
  static validateRepositoryName(name: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Repository 名稱不能為空');
      return { isValid: false, errors };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 1) {
      errors.push('Repository 名稱至少需要 1 個字符');
    }
    
    if (trimmedName.length > 100) {
      errors.push('Repository 名稱不能超過 100 個字符');
    }
    
    // Repository 名稱規則：只能包含字母、數字、連字符、底線和點
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmedName)) {
      errors.push('Repository 名稱只能包含字母、數字、連字符、底線和點');
    }
    
    // 不能以點開頭或結尾
    if (/^\.|\.$/.test(trimmedName)) {
      errors.push('Repository 名稱不能以點開頭或結尾');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 清理和格式化輸入
   * @param input 輸入字串
   * @returns 清理後的字串
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input.trim().replace(/\s+/g, ' ');
  }

  /**
   * 驗證日期範圍
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns 驗證結果和錯誤訊息
   */
  static validateDateRange(startDate: Date, endDate: Date): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!startDate || !endDate) {
      errors.push('開始日期和結束日期不能為空');
      return { isValid: false, errors };
    }
    
    if (startDate >= endDate) {
      errors.push('開始日期必須早於結束日期');
    }
    
    const now = new Date();
    if (startDate > now) {
      errors.push('開始日期不能是未來日期');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

