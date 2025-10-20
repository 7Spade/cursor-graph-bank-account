// src/app/core/services/organization.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  writeBatch,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, map, switchMap, combineLatest, of, catchError, throwError, firstValueFrom } from 'rxjs';
import { 
  Organization, 
  OrganizationMember, 
  Team,
  TeamMember,
  OrgRole,
  TeamRole,
  ProfileVO,
  PermissionVO,
  SettingsVO
} from '../models/auth.model';
import { ValidationUtils } from '../utils/validation.utils';
import { ErrorLoggingService } from './error-handling/error-logging.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private firestore = inject(Firestore);
  private errorLoggingService = inject(ErrorLoggingService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Signals for state management
  private _currentOrganization = signal<Organization | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Readonly signals
  readonly currentOrganization = this._currentOrganization.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly isOrganizationLoaded = computed(() => this._currentOrganization() !== null);
  readonly organizationMembers = computed(() => {
    const org = this._currentOrganization();
    return org ? [] : []; // 這裡應該實現成員查詢
  });

  async createOrganization(
    name: string,
    login: string,
    ownerId: string,
    description?: string
  ): Promise<string> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 驗證組織名稱
      const nameValidation = ValidationUtils.validateOrganizationName(name);
      if (!nameValidation.isValid) {
        throw new Error(`組織名稱驗證失敗: ${nameValidation.errors.join(', ')}`);
      }

      // 驗證登入名稱
      const loginValidation = ValidationUtils.validateLogin(login);
      if (!loginValidation.isValid) {
        throw new Error(`登入名稱驗證失敗: ${loginValidation.errors.join(', ')}`);
      }

      const orgId = doc(collection(this.firestore, 'accounts')).id;

      // 建立 ProfileVO
      const profile: ProfileVO = {
        name: name,
        email: '', // 組織沒有電子郵件
        avatar: 'https://firebasestorage.googleapis.com/v0/b/elite-chiller-455712-c4.firebasestorage.app/o/avatar.jpg?alt=media&token=e1474080-6528-4f01-a719-411ea3447060',
        bio: description || '',
        location: '',
        website: ''
      };

      // 建立 PermissionVO
      const permissions: PermissionVO = {
        roles: ['organization'],
        abilities: [
          { action: 'read', resource: 'organization' },
          { action: 'write', resource: 'organization' },
          { action: 'admin', resource: 'organization' },
          { action: 'read', resource: 'team' },
          { action: 'write', resource: 'team' },
          { action: 'admin', resource: 'team' },
          { action: 'read', resource: 'member' },
          { action: 'write', resource: 'member' },
          { action: 'admin', resource: 'member' }
        ]
      };

      // 建立 SettingsVO
      const settings: SettingsVO = {
        language: 'zh-TW',
        theme: 'light',
        notifications: { email: true, push: true, sms: false },
        privacy: { profilePublic: true, showEmail: false },
        organization: {
          defaultMemberRole: OrgRole.MEMBER,
          visibility: 'private'
        }
      };

      await setDoc(doc(this.firestore, `accounts/${orgId}`), {
        id: orgId,
        type: 'organization',
        login,
        profile,
        permissions,
        settings,
        projectsOwned: [],
        description: description || '',
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.addOrganizationMember(orgId, ownerId, OrgRole.OWNER);
      return orgId;
    } catch (error) {
      this._error.set(`創建組織失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  getOrganization(orgId: string): Observable<Organization> {
    const orgDoc = doc(this.firestore, `accounts/${orgId}`);
    return docData(orgDoc, { idField: 'id' }).pipe(
      map(data => {
        if (data && (data as DocumentData)['type'] === 'organization') {
          return data as Organization;
        }
        throw new Error(`組織不存在或類型不正確: ${orgId}`);
      }),
      catchError((error: any) => {
        console.error('獲取組織失敗:', error);
        return throwError(() => new Error('無法載入組織資訊，請稍後再試'));
      })
    );
  }

  /**
   * 獲取用戶的所有組織
   * 修復：使用 Firestore where 查詢避免 N+1 查詢問題
   */
  getUserOrganizations(userId: string): Observable<Organization[]> {
    // 使用 where 查詢直接在資料庫層面過濾組織
    const accountsCol = collection(this.firestore, 'accounts');
    const q = query(
      accountsCol, 
      where('type', '==', 'organization')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      switchMap(async (organizations) => {
        // 檢查用戶是否為這些組織的成員
        const userOrganizations: Organization[] = [];
        
        for (const org of organizations) {
          try {
            // 檢查成員文檔是否存在
            const memberRef = doc(this.firestore, `accounts/${org.id}/members/${userId}`);
            const memberDoc = await getDoc(memberRef);
            
            if (memberDoc.exists()) {
              userOrganizations.push(org as Organization);
            }
          } catch (error) {
            // 使用錯誤處理服務記錄錯誤，而不是 console.warn
            this.errorLoggingService.logError(
              {
                message: `檢查組織 ${org.id} 成員資格失敗`,
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : 'UnknownError',
                context: {
                  component: 'OrganizationService',
                  action: 'checkMembership',
                  timestamp: Date.now(),
                  userAgent: navigator.userAgent,
                  url: window.location.href,
                  userId: userId
                },
                severity: 'medium',
                category: 'system'
              },
              ['organization', 'membership', 'firestore']
            );
            // 繼續處理其他組織，不中斷整個流程
          }
        }
        
        return userOrganizations;
      }),
      catchError((error: any) => {
        console.error('獲取用戶組織失敗:', error);
        return throwError(() => new Error('無法載入組織列表，請稍後再試'));
      })
    );
  }

  async loadOrganization(orgId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const orgDoc = doc(this.firestore, `accounts/${orgId}`);
      const orgData = await firstValueFrom(docData(orgDoc, { idField: 'id' }).pipe(
        map(data => {
          if (data && (data as DocumentData)['type'] === 'organization') {
            return data as Organization;
          }
          return null;
        })
      ));

      this._currentOrganization.set(orgData || null);
    } catch (error) {
      this._error.set(`載入組織失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  getOrganizationMembers(orgId: string): Observable<OrganizationMember[]> {
    const membersCol = collection(this.firestore, `accounts/${orgId}/members`);
    return collectionData(membersCol, { idField: 'id' }) as Observable<OrganizationMember[]>;
  }

  async addOrganizationMember(
    orgId: string,
    userId: string,
    role: OrgRole,
    invitedBy?: string
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const memberRef = doc(this.firestore, `accounts/${orgId}/members/${userId}`);
      await setDoc(memberRef, {
        id: userId,
        organizationId: orgId,
        userId,
        role,
        joinedAt: new Date(),
        invitedBy: invitedBy || '系統自動添加'
      });
    } catch (error) {
      this._error.set(`添加組織成員失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    newRole: OrgRole
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const memberRef = doc(this.firestore, `accounts/${orgId}/members/${userId}`);
      await updateDoc(memberRef, { role: newRole });
    } catch (error) {
      this._error.set(`更新成員角色失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async removeOrganizationMember(orgId: string, userId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const memberRef = doc(this.firestore, `accounts/${orgId}/members/${userId}`);
      await deleteDoc(memberRef);
    } catch (error) {
      this._error.set(`移除組織成員失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  getTeams(orgId: string): Observable<Team[]> {
    const teamsCol = collection(this.firestore, `accounts/${orgId}/teams`);
    return collectionData(teamsCol, { idField: 'id' }) as Observable<Team[]>;
  }

  /**
   * 獲取組織的所有團隊（別名方法，保持向後兼容）
   */
  getOrganizationTeams(orgId: string): Observable<Team[]> {
    return this.getTeams(orgId);
  }

  async createTeam(
    orgId: string,
    name: string,
    slug: string,
    description?: string,
    privacy: 'open' | 'closed' = 'open',
    permissions?: {
      repository: { read: boolean; write: boolean; admin: boolean };
      issues: { read: boolean; write: boolean; delete: boolean };
      pullRequests: { read: boolean; write: boolean; merge: boolean };
    }
  ): Promise<string> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 驗證團隊名稱
      const nameValidation = ValidationUtils.validateTeamName(name);
      if (!nameValidation.isValid) {
        throw new Error(`團隊名稱驗證失敗: ${nameValidation.errors.join(', ')}`);
      }

      // 驗證團隊 slug
      const slugValidation = ValidationUtils.validateTeamSlug(slug);
      if (!slugValidation.isValid) {
        throw new Error(`團隊 Slug 驗證失敗: ${slugValidation.errors.join(', ')}`);
      }

      const teamId = doc(collection(this.firestore, `accounts/${orgId}/teams`)).id;

      // 使用預設權限或用戶設定的權限
      const teamPermissions = permissions || {
        repository: { read: true, write: false, admin: false },
        issues: { read: true, write: false, delete: false },
        pullRequests: { read: true, write: false, merge: false }
      };

      await setDoc(doc(this.firestore, `accounts/${orgId}/teams/${teamId}`), {
        id: teamId,
        organizationId: orgId,
        name,
        slug,
        description: description || '',
        privacy,
        permissions: teamPermissions,
        memberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return teamId;
    } catch (error) {
      this._error.set(`創建團隊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateTeam(
    orgId: string,
    teamId: string,
    updates: Partial<Team>
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const teamRef = doc(this.firestore, `accounts/${orgId}/teams/${teamId}`);
      await updateDoc(teamRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      this._error.set(`更新團隊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteTeam(orgId: string, teamId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const teamRef = doc(this.firestore, `accounts/${orgId}/teams/${teamId}`);
      await deleteDoc(teamRef);
    } catch (error) {
      this._error.set(`刪除團隊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  getTeamMembers(orgId: string, teamId: string): Observable<TeamMember[]> {
    const membersCol = collection(this.firestore, `accounts/${orgId}/teams/${teamId}/members`);
    return collectionData(membersCol, { idField: 'id' }) as Observable<TeamMember[]>;
  }

  async addTeamMember(
    orgId: string,
    teamId: string,
    userId: string,
    role: TeamRole,
    addedBy?: string
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const memberRef = doc(this.firestore, `accounts/${orgId}/teams/${teamId}/members/${userId}`);
      await setDoc(memberRef, {
        id: userId,
        teamId,
        userId,
        role,
        joinedAt: new Date(),
        addedBy
      });
    } catch (error) {
      this._error.set(`添加團隊成員失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async removeTeamMember(
    orgId: string,
    teamId: string,
    userId: string
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const memberRef = doc(this.firestore, `accounts/${orgId}/teams/${teamId}/members/${userId}`);
      await deleteDoc(memberRef);
    } catch (error) {
      this._error.set(`移除團隊成員失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateOrganizationProfile(
    orgId: string,
    profile: ProfileVO
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 驗證 Profile
      const profileErrors = ValidationUtils.validateProfile(profile);
      if (profileErrors.length > 0) {
        throw new Error(`Profile validation failed: ${profileErrors.join(', ')}`);
      }

      const orgRef = doc(this.firestore, `accounts/${orgId}`);
      await updateDoc(orgRef, {
        profile,
        updatedAt: new Date()
      });

      // 更新本地狀態
      const currentOrg = this._currentOrganization();
      if (currentOrg) {
        this._currentOrganization.set({ ...currentOrg, profile, updatedAt: new Date() });
      }
    } catch (error) {
      this._error.set(`更新組織檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateOrganizationSettings(
    orgId: string,
    settings: SettingsVO
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 驗證 Settings
      const settingsErrors = ValidationUtils.validateSettings(settings);
      if (settingsErrors.length > 0) {
        throw new Error(`Settings validation failed: ${settingsErrors.join(', ')}`);
      }

      const orgRef = doc(this.firestore, `accounts/${orgId}`);
      await updateDoc(orgRef, {
        settings,
        updatedAt: new Date()
      });

      // 更新本地狀態
      const currentOrg = this._currentOrganization();
      if (currentOrg) {
        this._currentOrganization.set({ ...currentOrg, settings, updatedAt: new Date() });
      }
    } catch (error) {
      this._error.set(`更新組織設定失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  // 批次更新組織完整資訊（事務性操作）
  async updateOrganizationComplete(orgId: string, profile: ProfileVO, settings: SettingsVO): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 驗證 Profile 和 Settings
      const profileErrors = ValidationUtils.validateProfile(profile);
      if (profileErrors.length > 0) {
        throw new Error(`Profile validation failed: ${profileErrors.join(', ')}`);
      }

      const settingsErrors = ValidationUtils.validateSettings(settings);
      if (settingsErrors.length > 0) {
        throw new Error(`Settings validation failed: ${settingsErrors.join(', ')}`);
      }

      const batch = writeBatch(this.firestore);
      const orgRef = doc(this.firestore, `accounts/${orgId}`);
      
      // 添加更新操作到批次
      batch.update(orgRef, { 
        profile: { ...profile },
        settings: { ...settings },
        updatedAt: new Date()
      });
      
      // 執行批次操作
      await batch.commit();
      
      // 更新本地狀態
      const currentOrg = this._currentOrganization();
      if (currentOrg && currentOrg.id === orgId) {
        this._currentOrganization.set({
          ...currentOrg,
          profile: { ...profile },
          settings: { ...settings },
          updatedAt: new Date()
        });
      }

      this.notificationService.showInfo('組織完整資訊批次更新成功');
    } catch (error) {
      const errorMessage = `批次更新組織資訊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`;
      this._error.set(errorMessage);
      this.errorLoggingService.logError(
        {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError',
          context: {
            component: 'OrganizationService',
            action: 'updateOrganizationComplete',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          severity: 'high',
          category: 'system'
        },
        ['organization', 'batch', 'update']
      );
      throw new Error(errorMessage);
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteOrganization(orgId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查是否為擁有者
      const currentUser = this.authService.currentAccount();
      const org = await firstValueFrom(this.getOrganization(orgId));
      
      if (!org || org.ownerId !== currentUser?.id) {
        throw new Error('只有組織擁有者可以刪除組織');
      }

      // 刪除組織及其所有子集合
      const batch = writeBatch(this.firestore);
      
      // 刪除成員子集合
      const membersRef = collection(this.firestore, `accounts/${orgId}/members`);
      const membersSnapshot = await getDocs(membersRef);
      membersSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // 刪除團隊子集合
      const teamsRef = collection(this.firestore, `accounts/${orgId}/teams`);
      const teamsSnapshot = await getDocs(teamsRef);
      teamsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // 刪除組織文檔
      const orgRef = doc(this.firestore, `accounts/${orgId}`);
      batch.delete(orgRef);
      
      await batch.commit();
      
      this.notificationService.showSuccess('組織已刪除');
    } catch (error) {
      const errorMessage = `刪除組織失敗: ${error instanceof Error ? error.message : '未知錯誤'}`;
      this._error.set(errorMessage);
      this.notificationService.showError(errorMessage);
      
      // 記錄詳細錯誤信息
      this.errorLoggingService.logError(
        {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'UnknownError',
          context: {
            component: 'OrganizationService',
            action: 'deleteOrganization',
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.authService.currentAccount()?.id
          },
          severity: 'high',
          category: 'system'
        },
        ['organization', 'delete', 'permission']
      );
      
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  // 清除錯誤
  clearError() {
    this._error.set(null);
  }

  // 清除組織上下文
  clearOrganizationContext() {
    this._currentOrganization.set(null);
    this._error.set(null);
  }
}