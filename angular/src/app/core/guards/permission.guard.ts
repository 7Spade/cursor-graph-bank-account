// src/app/core/guards/permission.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from 'rxfire/auth';
import { map } from 'rxjs';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';
import { OrgRole } from '../models/auth.model';

// authGuard 已移至 features/user/auth/auth.guard.ts
// 請使用統一的 authGuard 實作

/**
 * 用戶角色守衛工廠函數
 * @param expectedRole 預期的用戶角色
 * @returns CanActivateFn
 */
export function roleGuard(expectedRole: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    // 檢查用戶角色
    if (currentAccount.type === 'user') {
      const user = currentAccount;
      const permissions = user.permissions;
      
      // 檢查是否有預期角色
      if (permissions.roles.includes(expectedRole)) {
        return true;
      }
      
      // 如果沒有預期角色，重定向到未授權頁面
      router.navigate(['/unauthorized']);
      return false;
    }

    // 組織帳戶不支援角色守衛
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * 通用權限守衛
 * 從路由數據中讀取權限配置
 */
export const permissionGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentAccount = authService.currentAccount();
  
  if (!currentAccount) {
    router.navigate(['/login']);
    return false;
  }

  // 從路由參數中獲取組織ID，並設置組織上下文
  const orgId = route.paramMap.get('orgId');
  if (orgId) {
    try {
      await permissionService.setCurrentOrganizationByIdentifier(orgId);
    } catch (error) {
      console.error('Failed to set organization context:', error);
      // 如果設置組織上下文失敗，仍然繼續權限檢查
    }
  }

  // 從路由數據中獲取權限配置
  const permission = route.data['permission'] as { action: string; resource: string };
  
  if (!permission) {
    console.warn('No permission configuration found in route data');
    return true; // 如果沒有權限配置，允許訪問
  }

  try {
    // 檢查權限 - 現在正確處理異步
    const hasPermission = await permissionService.can(permission.action, permission.resource);
    if (hasPermission) {
      return true;
    }
  } catch (error) {
    console.error('Permission check failed:', error);
    // 如果權限檢查失敗，為了安全起見，拒絕訪問
  }

  // 沒有權限，重定向到未授權頁面
  router.navigate(['/unauthorized']);
  return false;
};

/**
 * 權限守衛工廠函數
 * @param action 權限動作 (read, write, admin, delete)
 * @param resource 資源類型 (organization, team, repository, member)
 * @returns CanActivateFn
 */
export function createPermissionGuard(action: string, resource: string): CanActivateFn {
  return async () => {
    const permissionService = inject(PermissionService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    try {
      // 檢查權限 - 現在正確處理異步
      const hasPermission = await permissionService.can(action, resource);
      if (hasPermission) {
        return true;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }

    // 沒有權限，重定向到未授權頁面
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * 組織權限守衛工廠函數
 * @param role 組織角色
 * @returns CanActivateFn
 */
export function orgRoleGuard(role: OrgRole): CanActivateFn {
  return async () => {
    const permissionService = inject(PermissionService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    try {
      // 檢查組織角色 - 使用正確的方法名
      const hasRole = await permissionService.hasRole(role);
      if (hasRole) {
        return true;
      }
    } catch (error) {
      console.error('Role check failed:', error);
    }

    // 沒有權限，重定向到未授權頁面
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * 組織管理員守衛
 * 檢查用戶是否為組織管理員或擁有者
 */
export const orgAdminGuard: CanActivateFn = () => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentAccount = authService.currentAccount();
  
  if (!currentAccount) {
    router.navigate(['/login']);
    return false;
  }

  // 檢查是否為組織管理員
  if (permissionService.isOrganizationAdmin()) {
    return true;
  }

  // 沒有權限，重定向到未授權頁面
  router.navigate(['/unauthorized']);
  return false;
};

/**
 * 組織擁有者守衛
 * 檢查用戶是否為組織擁有者
 */
export const orgOwnerGuard: CanActivateFn = () => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentAccount = authService.currentAccount();
  
  if (!currentAccount) {
    router.navigate(['/login']);
    return false;
  }

  // 檢查是否為組織擁有者
  if (permissionService.isOrganizationOwner()) {
    return true;
  }

  // 沒有權限，重定向到未授權頁面
  router.navigate(['/unauthorized']);
  return false;
};

/**
 * Repository 讀取權限守衛
 * @param repositoryId Repository ID
 * @returns CanActivateFn
 */
export function repositoryReadGuard(repositoryId: string): CanActivateFn {
  return async () => {
    const permissionService = inject(PermissionService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    // 檢查 Repository 讀取權限
    const canAccess = await permissionService.canAccessRepository(repositoryId);
    
    if (canAccess) {
      return true;
    }

    // 沒有權限，重定向到未授權頁面
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * Repository 寫入權限守衛
 * @param repositoryId Repository ID
 * @returns CanActivateFn
 */
export function repositoryWriteGuard(repositoryId: string): CanActivateFn {
  return async () => {
    const permissionService = inject(PermissionService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    // 檢查 Repository 寫入權限
    const canWrite = await permissionService.canWriteRepository(repositoryId);
    
    if (canWrite) {
      return true;
    }

    // 沒有權限，重定向到未授權頁面
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * Repository 管理權限守衛
 * @param repositoryId Repository ID
 * @returns CanActivateFn
 */
export function repositoryManageGuard(repositoryId: string): CanActivateFn {
  return async () => {
    const permissionService = inject(PermissionService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    // 檢查 Repository 管理權限
    const canManage = await permissionService.canManageRepository(repositoryId);
    
    if (canManage) {
      return true;
    }

    // 沒有權限，重定向到未授權頁面
    router.navigate(['/unauthorized']);
    return false;
  };
}

/**
 * 團隊管理權限守衛
 * @param teamId 團隊 ID
 * @returns CanActivateFn
 */
export function teamManageGuard(teamId: string): CanActivateFn {
  return async () => {
    const permissionService = inject(PermissionService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentAccount = authService.currentAccount();
    
    if (!currentAccount) {
      router.navigate(['/login']);
      return false;
    }

    // 檢查團隊管理權限
    const canManage = await permissionService.canManageTeam(teamId);
    
    if (canManage) {
      return true;
    }

    // 沒有權限，重定向到未授權頁面
    router.navigate(['/unauthorized']);
    return false;
  };
}

