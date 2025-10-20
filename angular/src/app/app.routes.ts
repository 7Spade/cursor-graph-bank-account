import { Routes } from '@angular/router';
import { LoginComponent } from './features/user/auth/login.component';
import { SignupComponent } from './features/user/auth/signup.component';
import { LandingComponent } from './landing/landing.component';

import { authGuard } from './features/user/auth/auth.guard';
import { roleGuard, orgRoleGuard, permissionGuard, orgAdminGuard, orgOwnerGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  // 首頁路由 - Landing Page
  {
    path: '',
    component: LandingComponent,
    title: 'Angular Fire RoleKit - GitHub 式權限系統'
  },
  
  // 認證路由
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/user/auth/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  
  // 用戶帳戶管理路由
  {
    path: 'account',
    loadChildren: () => import('./features/user/user.routes').then(m => m.userRoutes),
    canActivate: [authGuard]
  },
  
  // 組織管理路由 - 支援完整的組織層級結構
  {
    path: 'organizations',
    loadChildren: () => import('./features/organization/routes/organization.routes').then(m => m.organizationRoutes),
    canActivate: [authGuard]
  },
  
  // 特定組織的詳細路由
  {
    path: 'organizations/:orgId',
    loadChildren: () => import('./features/organization/routes/organization-detail.routes').then(m => m.organizationDetailRoutes),
    canActivate: [authGuard]
  },
  
  // Repository 管理路由
  {
    path: 'repositories',
    loadChildren: () => import('./features/repository/routes/repository.routes').then(m => m.repositoryRoutes),
    canActivate: [authGuard]
  },
  
  // 角色管理路由
  {
    path: 'admin',
    loadComponent: () => import('./dashboard/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard('admin')]
  },
  {
    path: 'editor',
    loadComponent: () => import('./dashboard/editor.component').then(m => m.EditorComponent),
    canActivate: [authGuard, roleGuard('editor')]
  },
  {
    path: 'viewer',
    loadComponent: () => import('./dashboard/viewer.component').then(m => m.ViewerComponent),
    canActivate: [authGuard, roleGuard('viewer')]
  },
  
  // 儀表板路由
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  
  // 預設重定向
  {
    path: '**',
    redirectTo: ''
  }
];
