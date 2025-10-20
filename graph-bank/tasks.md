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

---

# Level 3 任務：修復 111 組織按鈕功能實現

## 任務概述
**複雜度等級**: Level 3 (中級功能)
**任務類型**: 組織功能修復與實現
**影響範圍**: 多個組件和服務
**預估時間**: 2-3 天

## 問題描述
基於 VAN 模式分析，111 組織的三個主要按鈕功能都存在問題：
1. **檢視按鈕**: 出現 "組織不存在或類型不正確" 錯誤
2. **編輯按鈕**: 顯示 "功能即將推出" 佔位符
3. **設定按鈕**: 跳轉到未授權頁面

## 根本原因分析
- 服務方法混亂：存在兩個不同的 `getOrganization` 方法
- 資料結構不一致：組織 ID 和 slug 的對應關係問題
- 權限系統問題：設定頁面權限驗證失敗
- 功能實現不完整：編輯功能僅為佔位符

## PLAN 模式規劃階段

### 1. 需求分析 (Requirements Analysis)
**功能需求**:
- [ ] 修復組織詳情載入功能
- [ ] 實現組織編輯功能
- [ ] 修復組織設定權限問題
- [ ] 統一組織服務方法
- [ ] 改善錯誤處理機制

**非功能需求**:
- [ ] 保持現有 UI/UX 一致性
- [ ] 確保資料完整性
- [ ] 提供清晰的錯誤訊息
- [ ] 維持系統效能

**技術約束**:
- [ ] 必須使用現有的 Angular 20 + Firebase 架構
- [ ] 保持與現有權限系統的相容性
- [ ] 遵循現有的程式碼風格指南

### 2. 組件分析 (Component Analysis)
**受影響的組件**:
- [ ] `organization-detail.component.ts` - 需要修復載入邏輯
- [ ] `organization-edit-dialog.component.ts` - 需要完整實現
- [ ] `organization-settings.component.ts` - 需要修復權限檢查
- [ ] `organization.service.ts` - 需要統一服務方法
- [ ] `organization-api.service.ts` - 需要協調 API 層

**依賴關係**:
- [ ] 權限服務 (`permission.service.ts`)
- [ ] 認證服務 (`auth.service.ts`)
- [ ] 路由配置 (`organization-detail.routes.ts`)
- [ ] 資料模型 (`auth.model.ts`)

### 3. 設計決策 (Design Decisions)
**架構決策**:
- [ ] 統一使用 `OrganizationService` 作為主要服務
- [ ] 保持 `OrganizationApiService` 作為 API 層抽象
- [ ] 實現清晰的資料轉換層

**UI/UX 設計**:
- [ ] 保持現有的 Material Design 3 風格
- [ ] 提供載入狀態指示器
- [ ] 實現友好的錯誤訊息顯示

**演算法設計**:
- [ ] 實現組織 ID 和 slug 的雙向映射
- [ ] 優化資料載入策略
- [ ] 實現權限檢查快取機制

### 4. 實施策略 (Implementation Strategy)

**Phase 1: 服務層修復**
- [ ] 統一 `getOrganization` 方法
- [ ] 實現資料結構轉換
- [ ] 修復錯誤處理邏輯

**Phase 2: 組件層修復**
- [ ] 修復 `organization-detail.component.ts`
- [ ] 實現 `organization-edit-dialog.component.ts`
- [ ] 修復 `organization-settings.component.ts`

**Phase 3: 權限系統修復**
- [ ] 修復設定頁面權限檢查
- [ ] 實現組織管理員權限驗證
- [ ] 更新路由守衛邏輯

**Phase 4: 測試與驗證**
- [ ] 單元測試
- [ ] 整合測試
- [ ] 端到端測試

### 5. 測試策略 (Testing Strategy)
**單元測試**:
- [ ] 組織服務方法測試
- [ ] 組件邏輯測試
- [ ] 權限檢查測試

**整合測試**:
- [ ] 組織載入流程測試
- [ ] 編輯功能整合測試
- [ ] 設定頁面權限測試

**端到端測試**:
- [ ] 完整組織管理流程測試
- [ ] 跨組件互動測試
- [ ] 錯誤處理流程測試

### 6. 文檔計劃 (Documentation Plan)
- [ ] 更新 API 文檔
- [ ] 更新用戶指南
- [ ] 更新架構文檔
- [ ] 創建故障排除指南

## CREATIVE 階段完成 ✅
**已完成的設計決策**:
- [x] **UI/UX 設計**: 組織編輯對話框的用戶體驗設計 ✅
  - 文檔: `graph-bank/creative/organization-edit-dialog-uiux.md`
  - 決策: 單頁表單對話框設計
- [x] **架構設計**: 組織服務層的統一架構設計 ✅
  - 文檔: `graph-bank/creative/organization-service-architecture.md`
  - 決策: 分層架構，保持 OrganizationService 和 OrganizationApiService 分工
- [x] **演算法設計**: 組織權限檢查的優化演算法 ✅
  - 文檔: `graph-bank/creative/organization-permission-algorithm.md`
  - 決策: 混合策略，結合快取和即時查詢

## 風險評估
**技術風險**:
- [ ] 資料結構變更可能影響其他功能
- [ ] 權限系統修改可能導致安全問題
- [ ] 服務方法統一可能破壞現有功能

**緩解策略**:
- [ ] 實施漸進式修復
- [ ] 加強測試覆蓋率
- [ ] 實現回滾機制

## 成功標準
- [ ] 111 組織的檢視按鈕能正常載入組織詳情
- [ ] 編輯按鈕能開啟功能完整的編輯對話框
- [ ] 設定按鈕能正常訪問組織設定頁面
- [ ] 所有功能都通過測試驗證
- [ ] 程式碼品質符合專案標準
