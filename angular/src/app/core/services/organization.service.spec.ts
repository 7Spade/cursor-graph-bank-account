import { TestBed } from '@angular/core/testing';
import { OrganizationService } from './organization.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { ErrorLoggingService } from './error-handling/error-logging.service';
import { Firestore, writeBatch, doc, collection, getDocs } from '@angular/fire/firestore';
import { OrgRole } from '../models/auth.model';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let errorLoggingService: jasmine.SpyObj<ErrorLoggingService>;
  let firestore: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['currentAccount']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);
    const errorLoggingServiceSpy = jasmine.createSpyObj('ErrorLoggingService', ['logError']);
    const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection', 'doc']);

    TestBed.configureTestingModule({
      providers: [
        OrganizationService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: ErrorLoggingService, useValue: errorLoggingServiceSpy },
        { provide: Firestore, useValue: firestoreSpy }
      ]
    });

    service = TestBed.inject(OrganizationService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    errorLoggingService = TestBed.inject(ErrorLoggingService) as jasmine.SpyObj<ErrorLoggingService>;
    firestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createOrganization method', () => {
    it('should create organization successfully', async () => {
      const mockAccount = {
        id: 'user1',
        type: 'user' as const,
        login: 'testuser',
        profile: {} as any,
        permissions: { abilities: [], roles: [] },
        settings: {} as any,
        projectsOwned: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      authService.currentAccount.and.returnValue(mockAccount);

      // Mock Firestore operations
      const mockDocRef = { id: 'org123' };
      const mockCollection = jasmine.createSpyObj('CollectionReference', ['add']);
      const mockDoc = jasmine.createSpyObj('DocumentReference', ['set']);
      
      firestore.collection.and.returnValue(mockCollection as any);
      mockCollection.add.and.returnValue(Promise.resolve(mockDocRef));
      firestore.doc.and.returnValue(mockDoc as any);
      mockDoc.set.and.returnValue(Promise.resolve());

      const result = await service.createOrganization(
        'Test Organization',
        'test-org',
        'user1',
        'Test description'
      );

      expect(result).toBe('org123');
      expect(notificationService.showSuccess).toHaveBeenCalledWith('組織建立成功');
    });

    it('should handle validation errors', async () => {
      const mockAccount = {
        id: 'user1',
        type: 'user' as const,
        login: 'testuser',
        profile: {} as any,
        permissions: { abilities: [], roles: [] },
        settings: {} as any,
        projectsOwned: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      authService.currentAccount.and.returnValue(mockAccount);

      await expectAsync(service.createOrganization('', 'test-org', 'user1', 'Test description'))
        .toBeRejectedWithError('組織名稱驗證失敗');
    });
  });

  describe('deleteOrganization method', () => {
    it('should delete organization successfully when user is owner', async () => {
      const mockAccount = {
        id: 'user1',
        type: 'user' as const,
        login: 'testuser',
        profile: {} as any,
        permissions: { abilities: [], roles: [] },
        settings: {} as any,
        projectsOwned: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOrganization = {
        id: 'org123',
        type: 'organization' as const,
        login: 'test-org',
        profile: {} as any,
        permissions: { abilities: [], roles: [] },
        settings: {} as any,
        projectsOwned: [],
        ownerId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      authService.currentAccount.and.returnValue(mockAccount);

      // Mock getOrganization
      spyOn(service, 'getOrganization').and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => callback(mockOrganization)
        })
      } as any);

      // Mock Firestore batch operations
      const mockBatch = jasmine.createSpyObj('WriteBatch', ['delete', 'commit']);
      const mockMembersSnapshot = jasmine.createSpyObj('QuerySnapshot', ['forEach']);
      const mockTeamsSnapshot = jasmine.createSpyObj('QuerySnapshot', ['forEach']);
      const mockMembersCollection = jasmine.createSpyObj('CollectionReference', ['get']);
      const mockTeamsCollection = jasmine.createSpyObj('CollectionReference', ['get']);
      const mockOrgDoc = jasmine.createSpyObj('DocumentReference', ['delete']);

      mockMembersSnapshot.forEach.and.callFake((callback: any) => {
        // Simulate no members
      });
      mockTeamsSnapshot.forEach.and.callFake((callback: any) => {
        // Simulate no teams
      });

      mockMembersCollection.get.and.returnValue(Promise.resolve(mockMembersSnapshot));
      mockTeamsCollection.get.and.returnValue(Promise.resolve(mockTeamsSnapshot));

      firestore.collection.and.callFake((path: string) => {
        if (path.includes('members')) return mockMembersCollection;
        if (path.includes('teams')) return mockTeamsCollection;
        return {} as any;
      });

      firestore.doc.and.returnValue(mockOrgDoc as any);

      // Mock writeBatch
      spyOn(require('@angular/fire/firestore'), 'writeBatch').and.returnValue(mockBatch);
      mockBatch.commit.and.returnValue(Promise.resolve());

      await service.deleteOrganization('org123');

      expect(notificationService.showSuccess).toHaveBeenCalledWith('組織已刪除');
    });

    it('should throw error when user is not owner', async () => {
      const mockAccount = {
        id: 'user2',
        type: 'user' as const,
        login: 'testuser2',
        profile: {} as any,
        permissions: { abilities: [], roles: [] },
        settings: {} as any,
        projectsOwned: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockOrganization = {
        id: 'org123',
        type: 'organization' as const,
        login: 'test-org',
        profile: {} as any,
        permissions: { abilities: [], roles: [] },
        settings: {} as any,
        projectsOwned: [],
        ownerId: 'user1', // Different from current user
        createdAt: new Date(),
        updatedAt: new Date()
      };

      authService.currentAccount.and.returnValue(mockAccount);

      // Mock getOrganization
      spyOn(service, 'getOrganization').and.returnValue({
        pipe: () => ({
          subscribe: (callback: any) => callback(mockOrganization)
        })
      } as any);

      await expectAsync(service.deleteOrganization('org123'))
        .toBeRejectedWithError('只有組織擁有者可以刪除組織');
    });
  });
});