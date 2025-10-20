# System Patterns

- Value Objects：ProfileVO / PermissionVO / SettingsVO（提升可讀性與一致性）
- RBAC：基於角色的存取控制（Owner/Admin/Member 等）
- Signals：用於權限與 UI 狀態，Computed Signals 驅動界面
- 錯誤處理：GlobalErrorHandler + Error Services
