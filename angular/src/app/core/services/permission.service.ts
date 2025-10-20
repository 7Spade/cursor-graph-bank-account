// src/app/core/services/permission.service.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrgRole, TeamRole } from '../models/auth.model';
import { AuthService } from './auth.service';
import { ErrorLoggingService } from './error-handling/error-logging.service';
import { OrganizationService } from './organization.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private orgService = inject(OrganizationService);
  private errorLoggingService = inject(ErrorLoggingService);

  // 當前組織 ID Signal
  private _currentOrgId = signal<string | null>(null);
  readonly currentOrgId = this._currentOrgId.asReadonly();

  // 組織成員資格 Signal
  private _orgMembership = signal<{
    isMember: boolean;
    role: OrgRole | null;
    isOwner: boolean;
  }>({ isMember: false, role: null, isOwner: false });

  readonly orgMembership = this._orgMembership.asReadonly();

  // Computed Signals for permissions
  readonly canManageOrganization = computed(() => {
    const membership = this._orgMembership();
    return membership.isOwner || membership.role === OrgRole.ADMIN;
  });

  readonly canManageMembers = computed(() => {
    const membership = this._orgMembership();
    return membership.isOwner || membership.role === OrgRole.ADMIN;
  });

  readonly canManageTeams = computed(() => {
    const membership = this._orgMembership();
    return membership.isOwner || membership.role === OrgRole.ADMIN;
  });

  readonly canCreateRepositories = computed(() => {
    const membership = this._orgMembership();
    return membership.isMember;
  });

  // 設置當前組織
  async setCurrentOrganization(orgId: string) {
    this._currentOrgId.set(orgId);
    await this.loadOrganizationMembership(orgId);
  }

  // 載入組織成員資格
  private async loadOrganizationMembership(orgId: string) {
    const currentUser = this.authService.currentAccount();
    if (!currentUser || currentUser.type !== 'user') {
      this._orgMembership.set({ isMember: false, role: null, isOwner: false });
      return;
    }

    try {
      // 先檢查是否為組織擁有者
      const org = await firstValueFrom(this.orgService.getOrganization(orgId));
      const isOwner = org?.ownerId === currentUser.id;

      if (isOwner) {
        // 如果是擁有者，直接設為擁有者權限
        this._orgMembership.set({
          isMember: true,
          role: OrgRole.OWNER,
          isOwner: true
        });
        return;
      }

      // 檢查成員文檔
      const memberDoc = doc(this.firestore, `accounts/${orgId}/members/${currentUser.id}`);
      const memberData = await firstValueFrom(docData(memberDoc).pipe(
        map(data => data as { role: OrgRole } | null)
      ));

      if (memberData) {
        this._orgMembership.set({
          isMember: true,
          role: memberData.role,
          isOwner: false
        });
      } else {
        this._orgMembership.set({ isMember: false, role: null, isOwner: false });
      }
    } catch (error) {
      console.error('Failed to load organization membership:', error);
      // 記錄詳細錯誤信息
      this.errorLoggingService.logError(
        {
          message: `載入組織成員資格失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError',
          context: {
            component: 'PermissionService',
            action: 'loadOrganizationMembership',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: currentUser.id
          },
          severity: 'high',
          category: 'authorization'
        },
        ['permission', 'organization', 'membership']
      );
      this._orgMembership.set({ isMember: false, role: null, isOwner: false });
    }
  }

  // 權限檢查方法
  can(action: string, resource: string): boolean {
    const account = this.authService.currentAccount();
    if (!account) return false;

    // 對於組織相關資源，優先檢查組織權限
    if (resource === 'organization' || resource === 'member' || resource === 'team') {
      const membership = this._orgMembership();

      // 如果是組織擁有者，擁有所有權限
      if (membership.isOwner) return true;

      // 如果是組織管理員，擁有大部分權限
      if (membership.role === OrgRole.ADMIN) {
        return action === 'read' || action === 'write' || action === 'admin';
      }

      // 如果是成員，只有讀取權限
      if (membership.isMember) {
        return action === 'read';
      }

      return false;
    }

    // 其他資源使用基本權限檢查
    return account.permissions.abilities.some(ability =>
      ability.action === action && ability.resource === resource
    );
  }

  // 團隊權限檢查
  async canManageTeam(teamId: string): Promise<boolean> {
    const membership = this._orgMembership();
    if (!membership.isMember) return false;

    // 組織管理員和擁有者可以管理所有團隊
    if (membership.role === OrgRole.ADMIN || membership.isOwner) {
      return true;
    }

    // 檢查是否為團隊維護者
    const currentUser = this.authService.currentAccount();
    if (!currentUser) return false;

    try {
      const teamMemberDoc = doc(
        this.firestore,
        `accounts/${this._currentOrgId()}/teams/${teamId}/members/${currentUser.id}`
      );
      const teamMemberData = await firstValueFrom(docData(teamMemberDoc).pipe(
        map(data => data as { role: TeamRole } | null)
      ));

      return teamMemberData?.role === TeamRole.MAINTAINER;
    } catch (error) {
      console.error('Failed to check team permissions:', error);
      return false;
    }
  }

  // Repository 權限檢查
  async canAccessRepository(repositoryId: string): Promise<boolean> {
    const account = this.authService.currentAccount();
    if (!account) return false;

    try {
      const repoDoc = doc(this.firestore, `repositories/${repositoryId}`);
      const repoData = await firstValueFrom(docData(repoDoc).pipe(
        map(data => data as { ownerId: string; ownerType: string; private: boolean } | null)
      ));

      if (!repoData) return false;

      // 如果是公開 Repository，任何人都可以讀取
      if (!repoData.private) return true;

      // 檢查是否為擁有者
      if (repoData.ownerId === account.id) return true;

      // 檢查是否為協作者
      const collaboratorDoc = doc(
        this.firestore,
        `repositories/${repositoryId}/collaborators/${account.id}`
      );
      const collaboratorData = await firstValueFrom(docData(collaboratorDoc).pipe(
        map(data => !!data)
      ));

      return collaboratorData || false;
    } catch (error) {
      console.error('Failed to check repository permissions:', error);
      return false;
    }
  }

  // 檢查 Repository 寫入權限
  async canWriteRepository(repositoryId: string): Promise<boolean> {
    const account = this.authService.currentAccount();
    if (!account) return false;

    try {
      const repoDoc = doc(this.firestore, `repositories/${repositoryId}`);
      const repoData = await firstValueFrom(docData(repoDoc).pipe(
        map(data => data as { ownerId: string; ownerType: string; private: boolean } | null)
      ));

      if (!repoData) return false;

      // 檢查是否為擁有者
      if (repoData.ownerId === account.id) return true;

      // 檢查協作者權限
      const collaboratorDoc = doc(
        this.firestore,
        `repositories/${repositoryId}/collaborators/${account.id}`
      );
      const collaboratorData = await firstValueFrom(docData(collaboratorDoc).pipe(
        map(data => data as { permission: string } | null)
      ));

      if (!collaboratorData) return false;

      // 檢查權限等級
      const writePermissions = ['write', 'maintain', 'admin'];
      return writePermissions.includes(collaboratorData.permission);
    } catch (error) {
      console.error('Failed to check repository write permissions:', error);
      return false;
    }
  }

  // 檢查 Repository 管理權限
  async canManageRepository(repositoryId: string): Promise<boolean> {
    const account = this.authService.currentAccount();
    if (!account) return false;

    try {
      const repoDoc = doc(this.firestore, `repositories/${repositoryId}`);
      const repoData = await firstValueFrom(docData(repoDoc).pipe(
        map(data => data as { ownerId: string; ownerType: string; private: boolean } | null)
      ));

      if (!repoData) return false;

      // 檢查是否為擁有者
      if (repoData.ownerId === account.id) return true;

      // 檢查協作者權限
      const collaboratorDoc = doc(
        this.firestore,
        `repositories/${repositoryId}/collaborators/${account.id}`
      );
      const collaboratorData = await firstValueFrom(docData(collaboratorDoc).pipe(
        map(data => data as { permission: string } | null)
      ));

      if (!collaboratorData) return false;

      // 檢查權限等級
      const adminPermissions = ['maintain', 'admin'];
      return adminPermissions.includes(collaboratorData.permission);
    } catch (error) {
      console.error('Failed to check repository manage permissions:', error);
      return false;
    }
  }

  // 清除組織上下文
  clearOrganizationContext() {
    this._currentOrgId.set(null);
    this._orgMembership.set({ isMember: false, role: null, isOwner: false });
  }

  // 檢查用戶角色
  hasRole(role: string): boolean {
    const account = this.authService.currentAccount();
    if (!account) return false;

    return account.permissions.roles.includes(role);
  }

  // 檢查組織角色
  hasOrgRole(role: OrgRole): boolean {
    const membership = this._orgMembership();
    return membership.role === role;
  }

  // 檢查是否為組織擁有者
  isOrganizationOwner(): boolean {
    const membership = this._orgMembership();
    return membership.isOwner;
  }

  // 檢查是否為組織管理員
  isOrganizationAdmin(): boolean {
    const membership = this._orgMembership();
    return membership.role === OrgRole.ADMIN || membership.isOwner;
  }
}
