# Angular 應用程式

這是主要的 Angular 應用程式，所有程式碼都在 `src/` 目錄中。

## 專案結構

```
angular/
├── src/                     # 🎯 主要程式碼目錄
│   ├── app/                 # Angular 應用程式
│   │   ├── core/           # 核心服務和工具
│   │   ├── features/       # 功能模組
│   │   ├── shared/         # 共享組件
│   │   └── ...
│   ├── environments/       # 環境配置
│   └── ...
├── package.json            # Angular 專案依賴
└── angular.json           # Angular CLI 配置
```

## 開發

```bash
# 在 angular 目錄中執行
cd angular

# 安裝依賴
yarn install

# 啟動開發伺服器
yarn start

# 建置
yarn build
```

## 重要提醒

- 所有新的 Angular 組件、服務、模組都應該建立在 `src/app/` 下
- 不要修改根目錄的檔案結構
- 這是 Angular 專案，不是根目錄的 Node.js 專案