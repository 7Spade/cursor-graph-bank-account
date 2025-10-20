import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, UpdateUserRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authService = inject(AuthService);

  getCurrentUser(): Observable<User | null> {
    // 使用 AuthService 獲取當前用戶
    return of(this.authService.getCurrentUser());
  }

  updateUserProfile(request: UpdateUserRequest): Observable<User> {
    // 暫時返回模擬數據
    return of({
      id: '1',
      type: 'user',
      login: 'user',
      uid: '1',
      username: 'user',
      email: 'user@example.com',
      displayName: 'User',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      socialAccounts: [],
      certificates: [],
      organizationMemberships: [],
      notificationPreferences: {
        email: { enabled: true, frequency: 'immediate', types: [], marketing: false, updates: false, security: false },
        push: { enabled: true, types: [], marketing: false, updates: false, security: false },
        inApp: { enabled: true, types: [] }
      },
      privacySettings: {
        profileVisibility: 'public',
        emailVisibility: 'private',
        socialAccountsVisibility: 'public',
        certificatesVisibility: 'private',
        activityVisibility: 'public'
      },
      profile: {
        name: 'User',
        email: 'user@example.com'
      },
      permissions: {
        roles: [],
        abilities: []
      },
      settings: {
        language: 'zh-TW',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profilePublic: true,
          showEmail: false
        }
      },
      projectsOwned: []
    } as User);
  }

  updateUser(request: UpdateUserRequest): Observable<User> {
    return this.updateUserProfile(request);
  }

  uploadAvatar(file: File): Observable<any> {
    // 暫時返回模擬數據
    return of({ success: true, url: 'https://example.com/avatar.jpg' });
  }
}