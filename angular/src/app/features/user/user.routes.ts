import { Routes } from '@angular/router';

/**
 * 用戶模組路由配置
 * 對齊 TREE.md 結構和 GitHub Account 設計
 */
export const userRoutes: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile-management.component').then(m => m.ProfileManagementComponent),
    title: '個人資料管理'
  },
  {
    path: 'settings',
    loadComponent: () => import('./profile/profile-management.component').then(m => m.ProfileManagementComponent),
    title: '帳戶設定'
  },
  {
    path: 'certificates',
    loadComponent: () => import('./profile/profile-management.component').then(m => m.ProfileManagementComponent),
    title: '證照管理'
  },
  {
    path: 'social',
    loadComponent: () => import('./profile/profile-management.component').then(m => m.ProfileManagementComponent),
    title: '社交帳戶'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./profile/profile-management.component').then(m => m.ProfileManagementComponent),
    title: '通知設定'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./profile/profile-management.component').then(m => m.ProfileManagementComponent),
    title: '隱私設定'
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  }
];
