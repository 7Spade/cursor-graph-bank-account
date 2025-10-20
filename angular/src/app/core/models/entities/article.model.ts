/**
 * Article 實體模型
 * 用於表示文章/內容的基本結構
 */
export interface Article {
  /** 文章唯一識別碼 */
  id?: string;
  /** 文章標題 */
  title: string;
  /** 文章內容 */
  content: string;
  /** 創建時間 */
  createdAt: Date;
  /** 最後更新時間 */
  updatedAt?: Date;
  /** 作者 ID */
  authorId?: string;
  /** 文章狀態 */
  status?: 'draft' | 'published' | 'archived';
  /** 文章標籤 */
  tags?: string[];
  /** 文章分類 */
  category?: string;
}