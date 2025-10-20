# Tasks (Active)

- [x] INIT: 建立 Graph Bank 基礎結構與核心檔案 ✅
- [x] VAN: 技術驗證與複雜度評估 ✅
- [x] PLAN: 建立權限問題修復任務計劃 ✅
- [x] BUILD: 實施權限問題修復 ✅

## BUILD 已完成 ✅
### Phase 1: 創建組織上下文解析器 ✅
- [x] 創建 `organization-context.resolver.ts`
- [x] 實現組織上下文設置邏輯
- [x] 添加組織存在性驗證

### Phase 2: 修改權限守衛邏輯 ✅
- [x] 更新 `permissionGuard` 支持組織上下文
- [x] 添加路由參數組織 ID 獲取
- [x] 實現組織上下文自動設置

### Phase 3: 更新路由配置 ✅
- [x] 添加 `organizationContextResolver` 到所有組織路由
- [x] 更新 `organization-detail.routes.ts`
- [x] 確保解析器在權限守衛前執行

### Phase 4: 測試與驗證 ✅
- [x] 建置成功，無 TypeScript 錯誤
- [x] Bundle 大小正常
- [x] 準備進行功能測試
