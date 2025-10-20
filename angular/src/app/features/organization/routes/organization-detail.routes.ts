import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission.guard';

/**
 * 組織詳細路由配置
 * 支援完整的組織層級結構，包含成員、團隊、設定等子路由
 * 對齊 docs/account.md 的設計
 */
export const organizationDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../components/organization-detail.component').then(m => m.OrganizationDetailComponent),
    title: '組織詳情'
  },
  
  // 組織設定 - 需要寫入權限
  {
    path: 'settings',
    loadComponent: () => import('../components/organization-settings.component').then(m => m.OrganizationSettingsComponent),
    canActivate: [permissionGuard],
    data: { permission: { action: 'write', resource: 'organization' } },
    title: '組織設定'
  },
  
  // 成員管理 - 需要讀取成員權限
  {
    path: 'members',
    loadComponent: () => import('../components/members-list.component').then(m => m.MembersListComponent),
    canActivate: [permissionGuard],
    data: { permission: { action: 'read', resource: 'member' } },
    title: '成員管理'
  },
  
  // 團隊管理路由
  {
    path: 'teams',
    children: [
      {
        path: '',
        loadComponent: () => import('../components/teams-list.component').then(m => m.TeamsListComponent),
        canActivate: [permissionGuard],
        data: { permission: { action: 'read', resource: 'team' } },
        title: '團隊列表'
      },
      {
        path: 'new',
        loadComponent: () => import('../components/team-create.component').then(m => m.TeamCreateComponent),
        canActivate: [permissionGuard],
        data: { permission: { action: 'admin', resource: 'team' } },
        title: '建立團隊'
      },
      {
        path: ':teamId',
        loadComponent: () => import('../components/team-detail.component').then(m => m.TeamDetailComponent),
        canActivate: [permissionGuard],
        data: { permission: { action: 'read', resource: 'team' } },
        title: '團隊詳情'
      },
      {
        path: ':teamId/edit',
        loadComponent: () => import('../components/team-edit.component').then(m => m.TeamEditComponent),
        canActivate: [permissionGuard],
        data: { permission: { action: 'write', resource: 'team' } },
        title: '編輯團隊'
      }
    ]
  },
  
  // 角色管理 - 需要管理權限
  {
    path: 'roles',
    loadComponent: () => import('../components/organization-roles.component').then(m => m.OrganizationRolesComponent),
    canActivate: [permissionGuard],
    data: { permission: { action: 'admin', resource: 'organization' } },
    title: '角色管理'
  },
  
  // 安全管理器 - 需要管理權限
  {
    path: 'security',
    loadComponent: () => import('../components/security-manager.component').then(m => m.SecurityManagerComponent),
    canActivate: [permissionGuard],
    data: { permission: { action: 'admin', resource: 'organization' } },
    title: '安全管理器'
  },
  
  // Repository 管理 - 暫時註解掉，因為組件尚未創建
  // {
  //   path: 'repositories',
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () => import('../../repository/components/repository-list.component').then(m => m.RepositoryListComponent),
  //       canActivate: [permissionGuard],
  //       data: { permission: { action: 'read', resource: 'repository' } },
  //       title: 'Repository 列表'
  //     },
  //     {
  //       path: 'new',
  //       loadComponent: () => import('../../repository/components/repository-create.component').then(m => m.RepositoryCreateComponent),
  //       canActivate: [permissionGuard],
  //       data: { permission: { action: 'write', resource: 'repository' } },
  //       title: '建立 Repository'
  //     }
  //   ]
  // },
  
  // 預設重定向到組織詳情
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
