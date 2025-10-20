// src/app/core/services/auth.service.ts

import { Injectable, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  Auth, 
  authState, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  query,
  where,
  setDoc,
  writeBatch,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, of, switchMap, map, combineLatest, firstValueFrom } from 'rxjs';
import { 
  User, 
  Organization, 
  Account, 
  AccountState, 
  ProfileVO, 
  PermissionVO, 
  SettingsVO 
} from '../models/auth.model';
import { ValidationUtils } from '../utils/validation.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  
  // 使用 Signals 管理狀態
  private accountState = new AccountState();
  
  // 公開的 Signals
  readonly currentAccount = this.accountState.currentAccount;
  readonly isLoading = this.accountState.isLoading;
  readonly error = this.accountState.error;
  readonly isAuthenticated = this.accountState.isAuthenticated;
  readonly isUser = this.accountState.isUser;
  readonly isOrganization = this.accountState.isOrganization;
  readonly userPermissions = this.accountState.userPermissions;

  // Computed Signals for organizations
  readonly userOrganizations = computed(() => {
    const account = this.currentAccount();
    if (!account || account.type !== 'user') return [];
    
    // 這裡應該實現組織查詢邏輯
    // 為了簡化，返回空數組
    return [];
  });

  constructor() {
    // 監聽 Firebase Auth 狀態變化
    authState(this.auth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(firebaseUser => {
        if (firebaseUser) {
          this.loadUserAccount(firebaseUser.uid);
        } else {
          this.accountState.setAccount(null);
        }
      });
  }

  async signInWithGoogle() {
    try {
      this.accountState.setLoading(true);
      this.accountState.clearError();
      
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      await this.syncUserProfile(credential.user);
      
      return credential;
    } catch (error) {
      const errorMessage = this.getFirebaseAuthErrorMessage(error);
      this.accountState.setError(`Google 登入失敗: ${errorMessage}`);
      throw error;
    } finally {
      this.accountState.setLoading(false);
    }
  }

  async signOut() {
    try {
      this.accountState.setLoading(true);
      await signOut(this.auth);
    } catch (error) {
      this.accountState.setError(`登出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this.accountState.setLoading(false);
    }
  }

  private getFirebaseAuthErrorMessage(error: any): string {
    if (!(error instanceof Error)) return '未知錯誤';
    
    // Firebase Auth 錯誤代碼對應的中文訊息
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': '無效的電子郵件格式',
      'auth/user-disabled': '此帳號已被停用',
      'auth/user-not-found': '找不到此帳號',
      'auth/wrong-password': '密碼錯誤',
      'auth/email-already-in-use': '此電子郵件已被使用',
      'auth/operation-not-allowed': '此登入方式未啟用',
      'auth/weak-password': '密碼強度不足',
      'auth/invalid-credential': '無效的登入憑證',
      'auth/account-exists-with-different-credential': '此電子郵件已使用其他登入方式',
      'auth/popup-blocked': '登入視窗被封鎖',
      'auth/popup-closed-by-user': '登入視窗被關閉',
      'auth/network-request-failed': '網路連線失敗',
      'auth/too-many-requests': '登入嘗試次數過多，請稍後再試'
    };

    const code = (error as any).code;
    return errorMessages[code] || error.message || '未知錯誤';
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      this.accountState.setLoading(true);
      this.accountState.clearError();
      
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.syncUserProfile(credential.user);
      
      return credential;
    } catch (error) {
      const errorMessage = this.getFirebaseAuthErrorMessage(error);
      this.accountState.setError(`登入失敗: ${errorMessage}`);
      throw error;
    } finally {
      this.accountState.setLoading(false);
    }
  }

  async createUserWithEmailAndPassword(email: string, password: string, displayName?: string) {
    try {
      this.accountState.setLoading(true);
      this.accountState.clearError();
      
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // 如果提供了顯示名稱，更新用戶資料
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }
      
      await this.syncUserProfile(credential.user);
      
      return credential;
    } catch (error) {
      const errorMessage = this.getFirebaseAuthErrorMessage(error);
      this.accountState.setError(`註冊失敗: ${errorMessage}`);
      throw error;
    } finally {
      this.accountState.setLoading(false);
    }
  }

  private async loadUserAccount(uid: string) {
    try {
      this.accountState.setLoading(true);
      
      const userDoc = doc(this.firestore, `accounts/${uid}`);
      const userData = await firstValueFrom(
        docData(userDoc, { idField: 'id' }).pipe(
          map(data => {
            if (data && (data as any)['type'] === 'user') {
              return data as User;
            }
            return null;
          })
        )
      );
      
      this.accountState.setAccount(userData || null);
    } catch (error) {
      this.accountState.setError(`載入用戶資料失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      this.accountState.setLoading(false);
    }
  }

  private async syncUserProfile(firebaseUser: FirebaseUser) {
    try {
      const userRef = doc(this.firestore, `accounts/${firebaseUser.uid}`);
      
      // 檢查用戶是否已存在
      const userDoc = await firstValueFrom(docData(userRef, { idField: 'id' })) as User | null;
      const login = firebaseUser.email?.split('@')[0] || firebaseUser.uid;
      
      // 建立或更新 ProfileVO
      const profile: ProfileVO = {
        name: firebaseUser.displayName || login,
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || 'avatar.jpg', // 預設頭像
        bio: userDoc?.profile?.bio || '',
        location: userDoc?.profile?.location || '',
        website: userDoc?.profile?.website || ''
      };
      
      // 驗證 Profile
      const profileErrors = ValidationUtils.validateProfile(profile);
      if (profileErrors.length > 0) {
        throw new Error(`Profile validation failed: ${profileErrors.join(', ')}`);
      }
      
      // 建立或保留現有的 PermissionVO
      const permissions: PermissionVO = userDoc?.permissions || {
        roles: ['user'],
        abilities: [
          { action: 'read', resource: 'organization' },
          { action: 'read', resource: 'team' },
          { action: 'read', resource: 'member' }
        ]
      };
      
      // 建立或保留現有的 SettingsVO
      const settings: SettingsVO = userDoc?.settings || {
        language: 'zh-TW',
        theme: 'light',
        notifications: { email: true, push: true, sms: false },
        privacy: { profilePublic: true, showEmail: false }
      };
      
      // 準備用戶資料
      const userData: Partial<User> = {
        id: firebaseUser.uid,
        type: 'user',
        login: login,
        profile: profile,
        permissions: permissions,
        settings: settings,
        projectsOwned: userDoc?.projectsOwned || [],
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || login,
        photoURL: firebaseUser.photoURL || 'avatar.jpg', // 預設頭像
        certificates: userDoc?.certificates || [],
        socialRelations: userDoc?.socialRelations || {
          followers: [],
          following: [],
          connections: []
        },
        organizationMemberships: userDoc?.organizationMemberships || [],
        updatedAt: new Date()
      };
      
      // 如果是新用戶，添加創建時間
      if (!userDoc) {
        userData.createdAt = new Date();
      }
      
      // 使用事務確保資料一致性
      const batch = writeBatch(this.firestore);
      
      // 更新用戶資料
      batch.set(userRef, userData, { merge: true });
      
      // 如果是新用戶，創建默認的個人設定
      if (!userDoc) {
        const settingsRef = doc(this.firestore, `accounts/${firebaseUser.uid}/settings/default`);
        batch.set(settingsRef, {
          theme: 'light',
          language: 'zh-TW',
          emailNotifications: true,
          createdAt: new Date()
        });
      }
      
      // 提交事務
      await batch.commit();
      
      // 更新本地狀態
      this.accountState.setAccount(userData as User);
      
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      
      // 回滾本地狀態
      this.accountState.setAccount(null);
      
      // 重新拋出錯誤
      throw new Error(`User profile sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 權限檢查方法
  can(action: string, resource: string): boolean {
    const permissions = this.userPermissions();
    if (!permissions) return false;
    
    return permissions.abilities.some(ability => 
      ability.action === action && ability.resource === resource
    );
  }

  // 角色檢查方法
  hasRole(role: string): boolean {
    const permissions = this.userPermissions();
    if (!permissions) return false;
    
    return permissions.roles.includes(role);
  }

  // 獲取當前用戶
  getCurrentUser(): User | null {
    const account = this.currentAccount();
    return account && account.type === 'user' ? account as User : null;
  }

  // 獲取當前組織
  getCurrentOrganization(): Organization | null {
    const account = this.currentAccount();
    return account && account.type === 'organization' ? account as Organization : null;
  }

  // 更新用戶檔案
  async updateUserProfile(profile: ProfileVO): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // 驗證 Profile
    const profileErrors = ValidationUtils.validateProfile(profile);
    if (profileErrors.length > 0) {
      throw new Error(`Profile validation failed: ${profileErrors.join(', ')}`);
    }

    try {
      this.accountState.setLoading(true);
      
      const userRef = doc(this.firestore, `accounts/${user.id}`);
      await setDoc(userRef, {
        profile: profile,
        updatedAt: new Date()
      }, { merge: true });
      
      // 更新本地狀態
      const updatedUser = { ...user, profile, updatedAt: new Date() };
      this.accountState.setAccount(updatedUser);
      
    } catch (error) {
      this.accountState.setError(`更新用戶檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this.accountState.setLoading(false);
    }
  }

  // 更新用戶設定
  async updateUserSettings(settings: SettingsVO): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    // 驗證 Settings
    const settingsErrors = ValidationUtils.validateSettings(settings);
    if (settingsErrors.length > 0) {
      throw new Error(`Settings validation failed: ${settingsErrors.join(', ')}`);
    }

    try {
      this.accountState.setLoading(true);
      
      const userRef = doc(this.firestore, `accounts/${user.id}`);
      await setDoc(userRef, {
        settings: settings,
        updatedAt: new Date()
      }, { merge: true });
      
      // 更新本地狀態
      const updatedUser = { ...user, settings, updatedAt: new Date() };
      this.accountState.setAccount(updatedUser);
      
    } catch (error) {
      this.accountState.setError(`更新用戶設定失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      throw error;
    } finally {
      this.accountState.setLoading(false);
    }
  }

  // 設置錯誤
  setError(error: string) {
    this.accountState.setError(error);
  }

  // 清除錯誤
  clearError() {
    this.accountState.clearError();
  }
}