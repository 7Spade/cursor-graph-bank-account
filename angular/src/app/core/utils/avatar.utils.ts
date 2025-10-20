/**
 * 頭像 URL 處理工具
 * 統一處理預設頭像和用戶自定義頭像的 URL 生成
 */

export class AvatarUtils {
  private static readonly DEFAULT_AVATAR = 'avatar.jpg';
  private static readonly STORAGE_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/elite-chiller-455712-c4.firebasestorage.app/o';

  /**
   * 獲取頭像 URL
   * @param avatar 頭像路徑或 URL
   * @returns 完整的頭像 URL
   */
  static getAvatarUrl(avatar: string | undefined | null): string {
    if (!avatar || avatar.trim() === '') {
      // 使用預設頭像
      return `${this.STORAGE_BASE_URL}/${this.DEFAULT_AVATAR}?alt=media`;
    }
    
    if (avatar.startsWith('http')) {
      // 完整的 URL，直接返回
      return avatar;
    } else {
      // 相對路徑，從 Storage 獲取
      return `${this.STORAGE_BASE_URL}/${avatar}?alt=media`;
    }
  }

  /**
   * 檢查是否為預設頭像
   * @param avatar 頭像路徑或 URL
   * @returns 是否為預設頭像
   */
  static isDefaultAvatar(avatar: string | undefined | null): boolean {
    if (!avatar) return true;
    return avatar === this.DEFAULT_AVATAR || avatar.includes(this.DEFAULT_AVATAR);
  }

  /**
   * 獲取預設頭像 URL
   * @returns 預設頭像的完整 URL
   */
  static getDefaultAvatarUrl(): string {
    return `${this.STORAGE_BASE_URL}/${this.DEFAULT_AVATAR}?alt=media`;
  }
}
