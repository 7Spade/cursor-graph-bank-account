# Tasks (Active)

- [x] INIT: 建立 Graph Bank 基礎結構與核心檔案 ✅
- [x] VAN: 技術驗證與複雜度評估 ✅
- [ ] PLAN: 建立權限問題修復任務計劃

## VAN 已完成 ✅
- [x] 掃描專案（Angular/Firebase）結構與版本
- [x] 檢查 `angular/angular.json`、`angular/package.json`
- [x] 複雜度等級判定：Level 3（中級功能 - 權限系統修復）
- [x] 問題診斷：PermissionService 未設置組織上下文

## PLAN 進行中 🔄
### 需求分析
- [x] 核心需求：修復組織權限檢查問題
- [x] 技術約束：Angular 20 + Firebase + Signals
- [x] 影響範圍：所有組織相關功能

### 組件分析
- [x] 受影響組件：
  - `permission.service.ts` - 需要設置組織上下文
  - `permission.guard.ts` - 需要從路由參數獲取組織 ID
  - `organization-detail.routes.ts` - 需要添加解析器
  - `organization-detail.component.ts` - 需要初始化組織上下文

### 設計決策
- [ ] 架構：創建路由解析器設置組織上下文
- [ ] 實作策略：修改權限守衛支持路由參數
- [ ] 測試策略：單元測試 + 整合測試

### 實施階段
1. Phase 1: 創建組織上下文解析器
2. Phase 2: 修改權限守衛邏輯
3. Phase 3: 更新路由配置
4. Phase 4: 測試與驗證
