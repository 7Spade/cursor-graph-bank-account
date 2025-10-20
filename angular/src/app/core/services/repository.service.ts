// src/app/core/services/repository.service.ts

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
  DocumentData
} from '@angular/fire/firestore';
import { Observable, map, switchMap, combineLatest, of, catchError, throwError, firstValueFrom } from 'rxjs';
import { 
  Repository, 
  RepositoryCollaborator, 
  RepositoryTeamAccess,
  Account
} from '../models/auth.model';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { ValidationUtils } from '../utils/validation.utils';

@Injectable({ providedIn: 'root' })
export class RepositoryService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  // Signals for state management
  private _currentRepository = signal<Repository | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Readonly signals
  readonly currentRepository = this._currentRepository.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly isRepositoryLoaded = computed(() => this._currentRepository() !== null);
  readonly canManageRepository = computed(() => {
    const repo = this._currentRepository();
    if (!repo) return false;
    
    const currentAccount = this.authService.currentAccount();
    if (!currentAccount) return false;
    
    return repo.ownerId === currentAccount.id;
  });

  async createRepository(
    name: string,
    description?: string,
    isPrivate: boolean = true,
    ownerId?: string
  ): Promise<string> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 驗證 Repository 名稱
      const nameValidation = ValidationUtils.validateRepositoryName(name);
      if (!nameValidation.isValid) {
        throw new Error(`Repository 名稱驗證失敗: ${nameValidation.errors.join(', ')}`);
      }

      const currentAccount = this.authService.currentAccount();
      if (!currentAccount) {
        throw new Error('用戶未登入');
      }

      const actualOwnerId = ownerId || currentAccount.id;
      const repoId = doc(collection(this.firestore, 'repositories')).id;
      const fullName = `${currentAccount.login}/${name}`;

      await setDoc(doc(this.firestore, `repositories/${repoId}`), {
        id: repoId,
        name,
        fullName,
        description,
        private: isPrivate,
        ownerId: actualOwnerId,
        ownerType: currentAccount.type,
        createdAt: new Date(),
        updatedAt: new Date(),
        defaultBranch: 'main',
        topics: []
      });

      // 如果擁有者不是當前用戶，添加協作者
      if (actualOwnerId !== currentAccount.id) {
        await this.addCollaborator(repoId, currentAccount.id, 'admin');
      }

      return repoId;
    } catch (error) {
      this._error.set(`創建 Repository 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  getRepository(repoId: string): Observable<Repository> {
    const repoDoc = doc(this.firestore, `repositories/${repoId}`);
    return docData(repoDoc, { idField: 'id' }).pipe(
      map(data => {
        if (data) {
          return data as Repository;
        }
        throw new Error(`倉庫不存在: ${repoId}`);
      }),
      catchError((error: any) => {
        console.error('獲取倉庫失敗:', error);
        return throwError(() => new Error('無法載入倉庫資訊，請稍後再試'));
      })
    );
  }

  async loadRepository(repoId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      const repoDoc = doc(this.firestore, `repositories/${repoId}`);
      const repoData = await firstValueFrom(docData(repoDoc, { idField: 'id' }).pipe(
        map(data => data as Repository | null)
      ));

      this._currentRepository.set(repoData || null);
    } catch (error) {
      this._error.set(`載入 Repository 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  getUserRepositories(userId: string): Observable<Repository[]> {
    const reposQuery = query(
      collection(this.firestore, 'repositories'),
      where('ownerId', '==', userId)
    );
    return collectionData(reposQuery, { idField: 'id' }) as Observable<Repository[]>;
  }

  getOrganizationRepositories(orgId: string): Observable<Repository[]> {
    const reposQuery = query(
      collection(this.firestore, 'repositories'),
      where('ownerId', '==', orgId),
      where('ownerType', '==', 'organization')
    );
    return collectionData(reposQuery, { idField: 'id' }) as Observable<Repository[]>;
  }

  async updateRepository(
    repoId: string,
    updates: Partial<Repository>
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限修改此 Repository');
      }

      const repoRef = doc(this.firestore, `repositories/${repoId}`);
      await updateDoc(repoRef, {
        ...updates,
        updatedAt: new Date()
      });

      // 更新本地狀態
      const currentRepo = this._currentRepository();
      if (currentRepo && currentRepo.id === repoId) {
        this._currentRepository.set({ ...currentRepo, ...updates, updatedAt: new Date() });
      }
    } catch (error) {
      this._error.set(`更新 Repository 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteRepository(repoId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限刪除此 Repository');
      }

      const repoRef = doc(this.firestore, `repositories/${repoId}`);
      await deleteDoc(repoRef);

      // 清除本地狀態
      const currentRepo = this._currentRepository();
      if (currentRepo && currentRepo.id === repoId) {
        this._currentRepository.set(null);
      }
    } catch (error) {
      this._error.set(`刪除 Repository 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  getRepositoryCollaborators(repoId: string): Observable<RepositoryCollaborator[]> {
    const collaboratorsCol = collection(this.firestore, `repositories/${repoId}/collaborators`);
    return collectionData(collaboratorsCol, { idField: 'id' }) as Observable<RepositoryCollaborator[]>;
  }

  async addCollaborator(
    repoId: string,
    userId: string,
    permission: 'read' | 'triage' | 'write' | 'maintain' | 'admin',
    invitedBy?: string
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限添加協作者');
      }

      const collaboratorRef = doc(this.firestore, `repositories/${repoId}/collaborators/${userId}`);
      await setDoc(collaboratorRef, {
        id: userId,
        repositoryId: repoId,
        userId,
        permission,
        roleName: this.getRoleName(permission),
        invitedBy: invitedBy || this.authService.currentAccount()?.id,
        invitedAt: new Date()
      });
    } catch (error) {
      this._error.set(`添加協作者失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateCollaboratorPermission(
    repoId: string,
    userId: string,
    newPermission: 'read' | 'triage' | 'write' | 'maintain' | 'admin'
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限修改協作者權限');
      }

      const collaboratorRef = doc(this.firestore, `repositories/${repoId}/collaborators/${userId}`);
      await updateDoc(collaboratorRef, {
        permission: newPermission,
        roleName: this.getRoleName(newPermission)
      });
    } catch (error) {
      this._error.set(`更新協作者權限失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async removeCollaborator(repoId: string, userId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限移除協作者');
      }

      const collaboratorRef = doc(this.firestore, `repositories/${repoId}/collaborators/${userId}`);
      await deleteDoc(collaboratorRef);
    } catch (error) {
      this._error.set(`移除協作者失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  getRepositoryTeamAccess(repoId: string): Observable<RepositoryTeamAccess[]> {
    const teamAccessCol = collection(this.firestore, `repositories/${repoId}/teamAccess`);
    return collectionData(teamAccessCol, { idField: 'id' }) as Observable<RepositoryTeamAccess[]>;
  }

  async addTeamAccess(
    repoId: string,
    teamId: string,
    permission: 'read' | 'triage' | 'write' | 'maintain' | 'admin',
    grantedBy?: string
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限添加團隊訪問權限');
      }

      const teamAccessRef = doc(this.firestore, `repositories/${repoId}/teamAccess/${teamId}`);
      await setDoc(teamAccessRef, {
        id: teamId,
        repositoryId: repoId,
        teamId,
        permission,
        roleName: this.getRoleName(permission),
        grantedBy: grantedBy || this.authService.currentAccount()?.id,
        grantedAt: new Date()
      });
    } catch (error) {
      this._error.set(`添加團隊訪問權限失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateTeamAccessPermission(
    repoId: string,
    teamId: string,
    newPermission: 'read' | 'triage' | 'write' | 'maintain' | 'admin'
  ): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限修改團隊訪問權限');
      }

      const teamAccessRef = doc(this.firestore, `repositories/${repoId}/teamAccess/${teamId}`);
      await updateDoc(teamAccessRef, {
        permission: newPermission,
        roleName: this.getRoleName(newPermission)
      });
    } catch (error) {
      this._error.set(`更新團隊訪問權限失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async removeTeamAccess(repoId: string, teamId: string): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      // 檢查權限
      const canManage = await this.permissionService.canManageRepository(repoId);
      if (!canManage) {
        throw new Error('沒有權限移除團隊訪問權限');
      }

      const teamAccessRef = doc(this.firestore, `repositories/${repoId}/teamAccess/${teamId}`);
      await deleteDoc(teamAccessRef);
    } catch (error) {
      this._error.set(`移除團隊訪問權限失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  private getRoleName(permission: string): string {
    const roleMap: { [key: string]: string } = {
      'read': '讀取',
      'triage': '分類',
      'write': '寫入',
      'maintain': '維護',
      'admin': '管理員'
    };
    return roleMap[permission] || permission;
  }

  // 清除錯誤
  clearError() {
    this._error.set(null);
  }

  // 清除 Repository 上下文
  clearRepositoryContext() {
    this._currentRepository.set(null);
    this._error.set(null);
  }
}
