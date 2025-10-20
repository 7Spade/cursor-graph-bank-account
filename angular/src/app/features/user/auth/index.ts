/**
 * 認證模組匯出檔案
 * 對齊 TREE.md 結構要求
 */

// 組件匯出
export * from './login.component';
export * from './signup.component';
export * from './unauthorized.component';

// 服務匯出 - AuthService 已移至 core/services/auth.service.ts

// 守衛匯出 - 認證守衛已移至 core/guards/permission.guard.ts
