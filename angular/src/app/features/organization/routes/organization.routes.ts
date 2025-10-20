import { Routes } from '@angular/router';

/**
 * 組織模組的路由配置
 * 對齊 docs/account.md 的組織管理路由結構
 * 支援完整的組織層級管理
 */
export const organizationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../components/organization-list.component').then(m => m.OrganizationListComponent),
    title: '組織管理'
  },
  
  // 建立組織路由
  {
    path: 'new',
    loadComponent: () => import('../components/organization-create.component').then(m => m.OrganizationCreateComponent),
    title: '建立組織'
  },
  
  // 預設重定向
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
