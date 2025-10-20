import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { AuthService } from './auth.service';
import { OrganizationService } from './organization.service';
import { ErrorLoggingService } from './error-handling/error-logging.service';
import { Firestore } from '@angular/fire/firestore';
import { OrgRole } from '../models/auth.model';

describe('PermissionService', () => {
  let service: PermissionService;
  let authService: jasmine.SpyObj<AuthService>;
  let orgService: jasmine.SpyObj<OrganizationService>;
  let errorLoggingService: jasmine.SpyObj<ErrorLoggingService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['currentAccount']);
    const orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['getOrganization']);
    const errorLoggingServiceSpy = jasmine.createSpyObj('ErrorLoggingService', ['logError']);

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OrganizationService, useValue: orgServiceSpy },
        { provide: ErrorLoggingService, useValue: errorLoggingServiceSpy },
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(PermissionService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgService = TestBed.inject(OrganizationService) as jasmine.SpyObj<OrganizationService>;
    errorLoggingService = TestBed.inject(ErrorLoggingService) as jasmine.SpyObj<ErrorLoggingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('can method', () => {
    it('should return false when no account is logged in', () => {
      authService.currentAccount.and.returnValue(null);
      expect(service.can('read', 'organization')).toBeFalse();
    });

    it('should return true for organization owner', () => {
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
      
      // Mock organization membership as owner
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.OWNER,
        isOwner: true
      });

      expect(service.can('read', 'organization')).toBeTrue();
      expect(service.can('write', 'organization')).toBeTrue();
      expect(service.can('admin', 'organization')).toBeTrue();
      expect(service.can('delete', 'organization')).toBeTrue();
    });

    it('should return appropriate permissions for organization admin', () => {
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
      
      // Mock organization membership as admin
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.ADMIN,
        isOwner: false
      });

      expect(service.can('read', 'organization')).toBeTrue();
      expect(service.can('write', 'organization')).toBeTrue();
      expect(service.can('admin', 'organization')).toBeTrue();
      expect(service.can('delete', 'organization')).toBeFalse();
    });

    it('should return appropriate permissions for organization member', () => {
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
      
      // Mock organization membership as member
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.MEMBER,
        isOwner: false
      });

      expect(service.can('read', 'organization')).toBeTrue();
      expect(service.can('write', 'organization')).toBeFalse();
      expect(service.can('admin', 'organization')).toBeFalse();
      expect(service.can('delete', 'organization')).toBeFalse();
    });

    it('should return false for non-member', () => {
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
      
      // Mock organization membership as non-member
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: false,
        role: null,
        isOwner: false
      });

      expect(service.can('read', 'organization')).toBeFalse();
      expect(service.can('write', 'organization')).toBeFalse();
      expect(service.can('admin', 'organization')).toBeFalse();
      expect(service.can('delete', 'organization')).toBeFalse();
    });

    it('should use basic permissions for non-organization resources', () => {
      const mockAccount = {
        id: 'user1',
        type: 'user' as const,
        login: 'testuser',
        profile: {} as any,
        permissions: { 
          abilities: [
            { action: 'read', resource: 'repository' },
            { action: 'write', resource: 'repository' }
          ], 
          roles: [] 
        },
        settings: {} as any,
        projectsOwned: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      authService.currentAccount.and.returnValue(mockAccount);

      expect(service.can('read', 'repository')).toBeTrue();
      expect(service.can('write', 'repository')).toBeTrue();
      expect(service.can('delete', 'repository')).toBeFalse();
    });
  });

  describe('isOrganizationOwner method', () => {
    it('should return true when user is organization owner', () => {
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.OWNER,
        isOwner: true
      });

      expect(service.isOrganizationOwner()).toBeTrue();
    });

    it('should return false when user is not organization owner', () => {
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.ADMIN,
        isOwner: false
      });

      expect(service.isOrganizationOwner()).toBeFalse();
    });
  });

  describe('isOrganizationAdmin method', () => {
    it('should return true when user is organization owner', () => {
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.OWNER,
        isOwner: true
      });

      expect(service.isOrganizationAdmin()).toBeTrue();
    });

    it('should return true when user is organization admin', () => {
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.ADMIN,
        isOwner: false
      });

      expect(service.isOrganizationAdmin()).toBeTrue();
    });

    it('should return false when user is organization member', () => {
      spyOn(service, 'orgMembership').and.returnValue({
        isMember: true,
        role: OrgRole.MEMBER,
        isOwner: false
      });

      expect(service.isOrganizationAdmin()).toBeFalse();
    });
  });
});