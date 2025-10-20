// src/app/core/resolvers/organization-context.resolver.ts

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrganizationService } from '../services/organization.service';
import { PermissionService } from '../services/permission.service';

/**
 * 組織上下文解析器
 * 在路由激活前設置組織上下文，確保權限檢查正常工作
 */
export const organizationContextResolver: ResolveFn<boolean> = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const permissionService = inject(PermissionService);
    const orgService = inject(OrganizationService);
    const authService = inject(AuthService);

    // 獲取組織 ID
    const orgId = route.paramMap.get('orgId');

    if (!orgId) {
        console.warn('No organization ID found in route parameters');
        return false;
    }

    // 檢查用戶是否已登入
    const currentAccount = authService.currentAccount();
    if (!currentAccount) {
        console.warn('User not authenticated');
        return false;
    }

    try {
        // 驗證組織是否存在
        const organization = await orgService.getOrganization(orgId).toPromise();
        if (!organization) {
            console.warn(`Organization ${orgId} not found`);
            return false;
        }

        // 設置組織上下文
        await permissionService.setCurrentOrganization(orgId);

        console.log(`Organization context set for orgId: ${orgId}`);
        return true;
    } catch (error) {
        console.error('Failed to set organization context:', error);
        return false;
    }
};

/**
 * 組織上下文解析器工廠函數
 * 用於需要特定組織 ID 參數名的路由
 */
export function createOrganizationContextResolver(orgIdParamName: string = 'orgId'): ResolveFn<boolean> {
    return async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const permissionService = inject(PermissionService);
        const orgService = inject(OrganizationService);
        const authService = inject(AuthService);

        // 獲取組織 ID
        const orgId = route.paramMap.get(orgIdParamName);

        if (!orgId) {
            console.warn(`No organization ID found in route parameter: ${orgIdParamName}`);
            return false;
        }

        // 檢查用戶是否已登入
        const currentAccount = authService.currentAccount();
        if (!currentAccount) {
            console.warn('User not authenticated');
            return false;
        }

        try {
            // 驗證組織是否存在
            const organization = await orgService.getOrganization(orgId).toPromise();
            if (!organization) {
                console.warn(`Organization ${orgId} not found`);
                return false;
            }

            // 設置組織上下文
            await permissionService.setCurrentOrganization(orgId);

            console.log(`Organization context set for orgId: ${orgId}`);
            return true;
        } catch (error) {
            console.error('Failed to set organization context:', error);
            return false;
        }
    };
}
