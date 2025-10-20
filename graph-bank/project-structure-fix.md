# Graph Bank 專案結構配置

## 問題記錄

**問題**：AI agent 經常在根目錄建立 `src/` 資料夾，但實際的運行代碼都在 `angular/src/` 中。

**原因分析**：
1. 根目錄有 `package.json`，AI 誤解為單一專案
2. 缺乏明確的專案結構指示
3. Monorepo 結構不夠明顯

## 解決方案實施

### 1. 建立 `.cursorignore`
- 防止 AI 在根目錄建立 `src/`
- 保留 `angular/src/` 的存取權限

### 2. 建立 `PROJECT_STRUCTURE.md`
- 明確說明專案架構
- 指示正確的程式碼位置
- 提供開發指令參考

### 3. 更新 `package.json`
- 在描述中明確說明這是 monorepo
- 添加註解說明 Angular 應用程式位置

### 4. 建立 `angular/README.md`
- 在 Angular 目錄中提供清楚的開發指引
- 強調所有程式碼都在 `src/` 中

## 預期效果

- AI agent 應該能正確識別專案結構
- 避免在根目錄建立不必要的 `src/` 資料夾
- 所有新檔案都會建立在正確的 `angular/src/` 位置

## 監控要點

- 觀察 AI agent 是否還會在根目錄建立 `src/`
- 檢查新建立的檔案是否都在正確位置
- 必要時可以進一步調整配置

## 相關檔案

- `.cursorignore` - Cursor AI 忽略規則
- `PROJECT_STRUCTURE.md` - 專案結構說明
- `angular/README.md` - Angular 開發指引
- `package.json` - 更新的根目錄配置
