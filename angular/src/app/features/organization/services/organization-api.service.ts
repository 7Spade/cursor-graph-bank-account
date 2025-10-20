import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  OrganizationDetail, 
  CreateOrganizationRequest, 
  UpdateOrganizationRequest,
  Team,
  TeamMember,
  CreateTeamRequest,
  UpdateTeamRequest,
  OrganizationMember,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  SecurityManager,
  OrganizationRole
} from '../../../core/models/auth.model';

/**
 * 組織 API 服務
 * 實作對齊 GitHub REST API 模式的組織管理 API
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // ==================== 組織管理 API ====================
  
  /**
   * 獲取組織資訊 (對齊 GitHub: GET /orgs/{org})
   */
  getOrganization(orgSlug: string): Observable<OrganizationDetail> {
    return this.http.get<OrganizationDetail>(`${this.baseUrl}/orgs/${orgSlug}`);
  }

  /**
   * 創建組織 (對齊 GitHub: POST /orgs)
   */
  createOrganization(org: CreateOrganizationRequest): Observable<OrganizationDetail> {
    return this.http.post<OrganizationDetail>(`${this.baseUrl}/orgs`, org);
  }

  /**
   * 更新組織 (對齊 GitHub: PUT /orgs/{org})
   */
  updateOrganization(orgSlug: string, updates: UpdateOrganizationRequest): Observable<OrganizationDetail> {
    return this.http.put<OrganizationDetail>(`${this.baseUrl}/orgs/${orgSlug}`, updates);
  }

  /**
   * 刪除組織 (對齊 GitHub: DELETE /orgs/{org})
   */
  deleteOrganization(orgSlug: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orgs/${orgSlug}`);
  }

  // ==================== 組織成員管理 API ====================

  /**
   * 獲取組織成員列表 (對齊 GitHub: GET /orgs/{org}/members)
   */
  getOrganizationMembers(orgSlug: string): Observable<OrganizationMember[]> {
    return this.http.get<OrganizationMember[]>(`${this.baseUrl}/orgs/${orgSlug}/members`);
  }

  /**
   * 邀請成員加入組織 (對齊 GitHub: POST /orgs/{org}/members)
   */
  inviteMember(orgSlug: string, invite: InviteMemberRequest): Observable<OrganizationMember> {
    return this.http.post<OrganizationMember>(`${this.baseUrl}/orgs/${orgSlug}/members`, invite);
  }

  /**
   * 更新成員角色 (對齊 GitHub: PUT /orgs/{org}/members/{username})
   */
  updateMemberRole(orgSlug: string, userId: string, update: UpdateMemberRoleRequest): Observable<OrganizationMember> {
    return this.http.put<OrganizationMember>(`${this.baseUrl}/orgs/${orgSlug}/members/${userId}`, update);
  }

  /**
   * 移除組織成員 (對齊 GitHub: DELETE /orgs/{org}/members/{username})
   */
  removeMember(orgSlug: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orgs/${orgSlug}/members/${userId}`);
  }

  // ==================== 團隊管理 API ====================

  /**
   * 獲取組織團隊列表 (對齊 GitHub: GET /orgs/{org}/teams)
   */
  getTeams(orgSlug: string): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/orgs/${orgSlug}/teams`);
  }

  /**
   * 創建團隊 (對齊 GitHub: POST /orgs/{org}/teams)
   */
  createTeam(orgSlug: string, team: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/orgs/${orgSlug}/teams`, team);
  }

  /**
   * 獲取團隊詳情 (對齊 GitHub: GET /orgs/{org}/teams/{team_slug})
   */
  getTeam(orgSlug: string, teamSlug: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/orgs/${orgSlug}/teams/${teamSlug}`);
  }

  /**
   * 更新團隊 (對齊 GitHub: PUT /orgs/{org}/teams/{team_slug})
   */
  updateTeam(orgSlug: string, teamSlug: string, updates: UpdateTeamRequest): Observable<Team> {
    return this.http.put<Team>(`${this.baseUrl}/orgs/${orgSlug}/teams/${teamSlug}`, updates);
  }

  /**
   * 刪除團隊 (對齊 GitHub: DELETE /orgs/{org}/teams/{team_slug})
   */
  deleteTeam(orgSlug: string, teamSlug: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orgs/${orgSlug}/teams/${teamSlug}`);
  }

  // ==================== 團隊成員管理 API ====================

  /**
   * 獲取團隊成員列表 (對齊 GitHub: GET /orgs/{org}/teams/{team_slug}/members)
   */
  getTeamMembers(orgSlug: string, teamSlug: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/orgs/${orgSlug}/teams/${teamSlug}/members`);
  }

  /**
   * 添加團隊成員 (對齊 GitHub: PUT /orgs/{org}/teams/{team_slug}/members/{username})
   */
  addTeamMember(orgSlug: string, teamSlug: string, userId: string): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.baseUrl}/orgs/${orgSlug}/teams/${teamSlug}/members/${userId}`, {});
  }

  /**
   * 移除團隊成員 (對齊 GitHub: DELETE /orgs/{org}/teams/{team_slug}/members/{username})
   */
  removeTeamMember(orgSlug: string, teamSlug: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orgs/${orgSlug}/teams/${teamSlug}/members/${userId}`);
  }

  // ==================== 安全管理器 API ====================

  /**
   * 獲取安全管理器列表
   */
  getSecurityManagers(orgSlug: string): Observable<SecurityManager[]> {
    return this.http.get<SecurityManager[]>(`${this.baseUrl}/orgs/${orgSlug}/security-managers`);
  }

  /**
   * 創建安全管理器
   */
  createSecurityManager(orgSlug: string, manager: Partial<SecurityManager>): Observable<SecurityManager> {
    return this.http.post<SecurityManager>(`${this.baseUrl}/orgs/${orgSlug}/security-managers`, manager);
  }

  /**
   * 更新安全管理器
   */
  updateSecurityManager(orgSlug: string, managerId: string, updates: Partial<SecurityManager>): Observable<SecurityManager> {
    return this.http.put<SecurityManager>(`${this.baseUrl}/orgs/${orgSlug}/security-managers/${managerId}`, updates);
  }

  /**
   * 刪除安全管理器
   */
  deleteSecurityManager(orgSlug: string, managerId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orgs/${orgSlug}/security-managers/${managerId}`);
  }

  // ==================== 組織角色 API ====================

  /**
   * 獲取組織角色列表
   */
  getOrganizationRoles(orgSlug: string): Observable<OrganizationRole[]> {
    return this.http.get<OrganizationRole[]>(`${this.baseUrl}/orgs/${orgSlug}/roles`);
  }

  /**
   * 創建組織角色
   */
  createOrganizationRole(orgSlug: string, role: Partial<OrganizationRole>): Observable<OrganizationRole> {
    return this.http.post<OrganizationRole>(`${this.baseUrl}/orgs/${orgSlug}/roles`, role);
  }

  /**
   * 更新組織角色
   */
  updateOrganizationRole(orgSlug: string, roleId: string, updates: Partial<OrganizationRole>): Observable<OrganizationRole> {
    return this.http.put<OrganizationRole>(`${this.baseUrl}/orgs/${orgSlug}/roles/${roleId}`, updates);
  }

  /**
   * 刪除組織角色
   */
  deleteOrganizationRole(orgSlug: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orgs/${orgSlug}/roles/${roleId}`);
  }
}
