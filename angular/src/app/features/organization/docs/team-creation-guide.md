# 團隊建立指南

## 📋 概述

本指南說明如何在組織中建立和管理團隊。團隊功能提供了完整的 CRUD 操作，包括創建、查看、編輯和刪除團隊。

## 🚀 如何建立團隊

### 方法一：使用對話框（推薦）

1. **進入組織詳情頁面**
   - 導航到 `/organizations/{orgId}`
   - 點擊「團隊」標籤

2. **開啟團隊創建對話框**
   - 點擊「新增團隊」按鈕
   - 或使用快捷鍵（如果配置）

3. **填寫團隊信息**
   ```typescript
   // 必填字段
   name: string;           // 團隊名稱（2-50 字符）
   slug: string;           // 團隊標識符（2-30 字符，小寫字母、數字、連字符）
   
   // 可選字段
   description?: string;    // 團隊描述（最多 500 字符）
   privacy: 'open' | 'closed';  // 隱私設定（預設：open）
   permission: 'read' | 'write' | 'admin';  // 權限等級（預設：read）
   ```

4. **提交創建**
   - 點擊「建立團隊」按鈕
   - 系統會驗證表單並創建團隊

### 方法二：使用獨立頁面

1. **導航到團隊創建頁面**
   - 直接訪問 `/organizations/{orgId}/teams/new`

2. **填寫表單並提交**
   - 與對話框方式相同

## 🔧 團隊管理功能

### 查看團隊列表

**路由**: `/organizations/{orgId}/teams`

**功能**:
- 顯示組織所有團隊
- 支援搜尋和篩選
- 顯示團隊統計信息
- 提供快速操作按鈕

### 查看團隊詳情

**路由**: `/organizations/{orgId}/teams/{teamId}`

**功能**:
- 顯示團隊基本信息
- 顯示團隊成員列表
- 顯示團隊權限設定
- 提供編輯和刪除選項

### 編輯團隊

**路由**: `/organizations/{orgId}/teams/{teamId}/edit`

**功能**:
- 修改團隊基本信息
- 更新團隊權限
- 更改隱私設定

## 🔐 權限控制

### 團隊權限等級

| 權限等級 | 描述 | 可執行的操作 |
|---------|------|-------------|
| `read` | 只讀權限 | 查看團隊信息、成員列表 |
| `write` | 寫入權限 | 編輯團隊信息、管理成員 |
| `admin` | 管理權限 | 所有操作，包括刪除團隊 |

### 路由權限配置

```typescript
// 團隊列表 - 需要讀取權限
{ permission: { action: 'read', resource: 'team' } }

// 創建團隊 - 需要管理權限
{ permission: { action: 'admin', resource: 'team' } }

// 團隊詳情 - 需要讀取權限
{ permission: { action: 'read', resource: 'team' } }

// 編輯團隊 - 需要寫入權限
{ permission: { action: 'write', resource: 'team' } }
```

## 🛠️ 技術實現

### 服務層方法

```typescript
// 創建團隊
async createTeam(
  orgId: string,
  name: string,
  slug: string,
  description?: string,
  privacy: 'open' | 'closed' = 'open',
  permissions?: TeamPermissions
): Promise<string>

// 獲取團隊列表
getTeams(orgId: string): Observable<Team[]>

// 更新團隊
async updateTeam(
  orgId: string,
  teamId: string,
  updates: Partial<Team>
): Promise<void>

// 刪除團隊
async deleteTeam(orgId: string, teamId: string): Promise<void>

// 團隊成員管理
async addTeamMember(orgId: string, teamId: string, userId: string, role: TeamRole): Promise<void>
async removeTeamMember(orgId: string, teamId: string, userId: string): Promise<void>
getTeamMembers(orgId: string, teamId: string): Observable<TeamMember[]>
```

### 數據模型

```typescript
interface Team {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  privacy: 'open' | 'closed';
  permissions: TeamPermissions;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamPermissions {
  repository: { read: boolean; write: boolean; admin: boolean };
  issues: { read: boolean; write: boolean; delete: boolean };
  pullRequests: { read: boolean; write: boolean; merge: boolean };
}
```

## 📱 用戶界面組件

### 主要組件

1. **TeamCreateDialogComponent** - 團隊創建對話框
2. **TeamsListComponent** - 團隊列表顯示
3. **TeamDetailComponent** - 團隊詳情頁面
4. **TeamEditComponent** - 團隊編輯頁面
5. **TeamManagementComponent** - 團隊層級管理

### 響應式設計

- 支援桌面和移動設備
- 自適應佈局
- 觸控友好的界面

## ⚠️ 注意事項

### 團隊名稱規則

- 長度：2-50 個字符
- 不能包含特殊字符
- 必須唯一（在組織內）

### 團隊 Slug 規則

- 長度：2-30 個字符
- 只能包含小寫字母、數字和連字符
- 不能以連字符開頭或結尾
- 必須唯一（在組織內）

### 權限要求

- 創建團隊：需要組織管理員或擁有者權限
- 編輯團隊：需要團隊寫入權限
- 刪除團隊：需要團隊管理權限

## 🔍 故障排除

### 常見問題

1. **無法創建團隊**
   - 檢查是否有足夠的權限
   - 確認團隊名稱和 slug 符合規則
   - 檢查網路連接

2. **團隊列表載入失敗**
   - 檢查組織 ID 是否正確
   - 確認用戶有讀取權限
   - 檢查 Firebase 連接

3. **權限錯誤**
   - 確認用戶在組織中的角色
   - 檢查團隊權限設定
   - 聯繫組織管理員

### 錯誤代碼

| 錯誤代碼 | 描述 | 解決方案 |
|---------|------|---------|
| `PERMISSION_DENIED` | 權限不足 | 聯繫組織管理員 |
| `VALIDATION_ERROR` | 驗證失敗 | 檢查輸入數據格式 |
| `NETWORK_ERROR` | 網路錯誤 | 檢查網路連接 |
| `TEAM_EXISTS` | 團隊已存在 | 使用不同的名稱或 slug |

## 📚 相關文檔

- [組織管理指南](./organization-management-guide.md)
- [權限系統說明](./permission-system.md)
- [API 參考文檔](./api-reference.md)