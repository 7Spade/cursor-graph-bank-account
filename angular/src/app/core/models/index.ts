/**
 * 型別定義模型統一導出
 * 
 * 這個檔案提供了所有型別定義的統一導出點，
 * 讓其他模組可以方便地導入所需的型別定義。
 * 
 * 使用方式：
 * import { User, Organization, Team } from '@core/models';
 * import { CreateUserRequest, UserResponse } from '@core/models';
 * import { UserCreatedEvent, OrganizationCreatedEvent } from '@core/models';
 */

// 實體模型
export * from './entities';

// 請求模型
export * from './requests';

// 響應模型
export * from './responses';

// 事件模型
export * from './events';

// 狀態模型
export * from './states';

// 配置模型
export * from './configs';

// 重新導出常用的型別別名
export type {
  // 實體別名
  User,
  Organization,
  Team,
  Repository,
  Article,
  Account,
  UserProfile,
  SocialAccount,
  NotificationPreferences,
  PrivacySettings,
  UserData,
  OrganizationMember,
  OrganizationRole,
  Permission,
  OrganizationSettings,
  OrganizationDetail,
  OrganizationProfile,
  Activity,
  TeamMember,
  TeamRole,
  TeamPermissions,
  TeamSettings,
  TeamNotificationSettings,
  TeamNode,
  TeamStats,
  RepositoryBranch,
  RepositoryCommit,
  RepositoryIssue,
  RepositoryPullRequest,
  RepositoryCollaborator,
  RepositoryTeamAccess,
  RepositorySettings,
  RepositoryStats,
  RepositorySearchResult,
  RepositorySearchParams,
  RepositoryPermissionResult,
  RepositoryAnalytics,
} from './entities';

// 請求別名
export type {
  CreateUserRequest,
  UpdateUserRequest,
  AddSocialAccountRequest,
  UpdateNotificationPreferencesRequest,
  UpdatePrivacySettingsRequest,
  SearchUsersRequest,
  UserAuthRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  RemoveMemberRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  DeleteRoleRequest,
  SearchOrganizationsRequest,
  OrganizationStatsRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  InviteTeamMemberRequest,
  UpdateTeamMemberRoleRequest,
  RemoveTeamMemberRequest,
  CreateTeamRoleRequest,
  UpdateTeamRoleRequest,
  DeleteTeamRoleRequest,
  SearchTeamsRequest,
  TeamHierarchyRequest,
  TeamStatsRequest,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  InviteCollaboratorRequest,
  GrantTeamAccessRequest,
  UpdateCollaboratorPermissionRequest,
  RemoveCollaboratorRequest,
  UpdateTeamAccessRequest,
  RemoveTeamAccessRequest,
  SearchRepositoriesRequest,
  RepositoryAnalyticsRequest,
  SyncRepositoryRequest,
  BackupRepositoryRequest,
} from './requests';

// 響應別名
export type {
  UserApiResponse,
  SocialAccountApiResponse,
  UserListResponse,
  UserSearchResponse,
  UserAuthResponse,
  UserRegistrationResponse,
  UserVerificationResponse,
  PasswordResetResponse,
  PasswordChangeResponse,
  UserPreferencesResponse,
  UserStatsResponse,
  OrganizationCreateResponse,
  OrganizationUpdateResponse,
  OrganizationListResponse,
  OrganizationSearchResponse,
  OrganizationDetailResponse,
  OrganizationMembersResponse,
  OrganizationRolesResponse,
  MemberInvitationResponse,
  MemberRoleUpdateResponse,
  MemberRemovalResponse,
  RoleCreationResponse,
  RoleUpdateResponse,
  RoleDeletionResponse,
  OrganizationStatsResponse,
  TeamCreateResponse,
  TeamUpdateResponse,
  TeamListResponse,
  TeamSearchResponse,
  TeamHierarchyResponse,
  TeamMembersResponse,
  TeamRolesResponse,
  TeamMemberInvitationResponse,
  TeamMemberRoleUpdateResponse,
  TeamMemberRemovalResponse,
  TeamRoleCreationResponse,
  TeamRoleUpdateResponse,
  TeamRoleDeletionResponse,
  TeamStatsResponse,
  TeamDetailResponse,
  RepositoryCreateResponse,
  RepositoryUpdateResponse,
  RepositoryListResponse,
  RepositorySearchResponse,
  RepositoryDetailResponse,
  RepositoryBranchesResponse,
  RepositoryCommitsResponse,
  RepositoryIssuesResponse,
  RepositoryPullRequestsResponse,
  CollaboratorInvitationResponse,
  CollaboratorPermissionUpdateResponse,
  CollaboratorRemovalResponse,
  TeamAccessGrantResponse,
  TeamAccessUpdateResponse,
  TeamAccessRemovalResponse,
  RepositoryAnalyticsResponse,
  RepositorySyncResponse,
  RepositoryBackupResponse,
} from './responses';

// 事件別名
export type {
  BaseEvent,
  DomainEvent,
  EventHandler,
  EventStore,
} from './events';

// 狀態別名
export type {
  FormState,
  FormFieldState,
  FormValidationState,
  FormConfig,
  FormResetOptions,
  FormSubmitOptions,
  DynamicFormField,
  FormStepState,
  MultiStepFormState,
  LoadingState,
  ErrorState,
  SuccessState,
  DialogState,
  DialogConfig,
  PaginationState,
  SortState,
  FilterState,
  SearchState,
  SelectionState,
  ExpansionState,
  TabState,
  TabItem,
  NavigationState,
  ThemeState,
  LanguageState,
  ComponentLifecycleState,
  NotificationState,
  NotificationItem,
  NotificationAction,
  NotificationSettings,
  NotificationTypeSettings,
  NotificationFilter,
  NotificationHistory,
  NotificationHistoryItem,
  NotificationStats,
  NotificationTemplate,
  NotificationQueue,
  NotificationQueueItem,
} from './states';

// 配置別名
export type {
  ValidationConfig,
  CustomValidator,
  ValidationErrorStyle,
  ValidationSuccessStyle,
  ValidationMessageTemplate,
  FieldValidationConfig,
  FormValidationConfig,
  ValidationError,
  ValidationWarning,
  ValidationStats,
  ValidationConfigBuilder,
  NotificationConfig,
  GlobalNotificationConfig,
  NotificationTypeConfig,
  NotificationChannelConfig,
  NotificationChannelLimits,
  NotificationChannelAuth,
  NotificationChannelEndpoint,
  NotificationTemplateConfig,
  NotificationTemplateContent,
  NotificationTemplateVariable,
  NotificationTemplateAction,
  NotificationTemplateSettings,
  NotificationFilterConfig,
  NotificationQueueConfig,
  NotificationQueueProcessor,
  NotificationQueueAlert,
  NotificationAnalyticsConfig,
  NotificationAnalyticsMetric,
  NotificationAnalyticsReport,
  NotificationAnalyticsAlert,
} from './configs';