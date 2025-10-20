# Tech Context

## 技術棧
- **前端框架**：Angular 20.1.0（Standalone 組件、Signals、Material Design）
- **UI 組件庫**：Angular Material 20.1.0（azure-blue 主題）
- **後端服務**：Firebase 11.10.0（Auth、Firestore）via @angular/fire 20.0.1
- **建置工具**：@angular/build 20.1.0、SCSS、TypeScript 5.8.2
- **響應式程式設計**：RxJS 7.8.0、Zone.js 0.15.0

## 專案架構
- **架構模式**：Feature-based 架構
- **功能模組**：組織管理、用戶管理、儲存庫管理、儀表板
- **核心服務**：認證、權限、通知、錯誤處理、驗證、日誌
- **路由守衛**：權限控制系統
- **狀態管理**：RxJS 響應式狀態管理

## 開發環境
- **包管理器**：yarn
- **開發模式**：optimization: true, sourceMap: true
- **生產模式**：outputHashing: all, 預算限制配置
- **測試框架**：Jasmine + Karma

## 複雜度評估
- **等級**：Level 3（中級功能）
- **特徵**：多功能模組、權限系統、Firebase 整合、Material UI
- **檔案規模**：50+ TypeScript 檔案
- **架構複雜度**：中等到高
