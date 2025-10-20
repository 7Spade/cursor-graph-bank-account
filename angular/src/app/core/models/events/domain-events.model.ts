/**
 * 領域事件模型
 */

/**
 * 基礎事件介面
 */
export interface BaseEvent {
  /** 事件 ID */
  eventId: string;
  /** 事件類型 */
  eventType: string;
  /** 事件版本 */
  eventVersion: string;
  /** 發生時間 */
  occurredAt: Date;
  /** 聚合根 ID */
  aggregateId: string;
  /** 聚合根類型 */
  aggregateType: string;
  /** 事件資料 */
  eventData: Record<string, any>;
  /** 元資料 */
  metadata?: Record<string, any>;
}

/**
 * 用戶相關事件
 */
export namespace UserEvents {
  /** 用戶創建事件 */
  export interface UserCreatedEvent extends BaseEvent {
    eventType: 'UserCreated';
    eventData: {
      userId: string;
      username: string;
      email: string;
      displayName: string;
      role: string;
      createdAt: Date;
    };
  }

  /** 用戶更新事件 */
  export interface UserUpdatedEvent extends BaseEvent {
    eventType: 'UserUpdated';
    eventData: {
      userId: string;
      changes: Record<string, any>;
      updatedAt: Date;
    };
  }

  /** 用戶刪除事件 */
  export interface UserDeletedEvent extends BaseEvent {
    eventType: 'UserDeleted';
    eventData: {
      userId: string;
      deletedAt: Date;
    };
  }

  /** 用戶登入事件 */
  export interface UserLoggedInEvent extends BaseEvent {
    eventType: 'UserLoggedIn';
    eventData: {
      userId: string;
      loginAt: Date;
      ipAddress?: string;
      userAgent?: string;
    };
  }

  /** 用戶登出事件 */
  export interface UserLoggedOutEvent extends BaseEvent {
    eventType: 'UserLoggedOut';
    eventData: {
      userId: string;
      logoutAt: Date;
    };
  }

  /** 密碼變更事件 */
  export interface PasswordChangedEvent extends BaseEvent {
    eventType: 'PasswordChanged';
    eventData: {
      userId: string;
      changedAt: Date;
    };
  }
}

/**
 * 組織相關事件
 */
export namespace OrganizationEvents {
  /** 組織創建事件 */
  export interface OrganizationCreatedEvent extends BaseEvent {
    eventType: 'OrganizationCreated';
    eventData: {
      organizationId: string;
      name: string;
      type: string;
      createdBy: string;
      createdAt: Date;
    };
  }

  /** 組織更新事件 */
  export interface OrganizationUpdatedEvent extends BaseEvent {
    eventType: 'OrganizationUpdated';
    eventData: {
      organizationId: string;
      changes: Record<string, any>;
      updatedBy: string;
      updatedAt: Date;
    };
  }

  /** 組織刪除事件 */
  export interface OrganizationDeletedEvent extends BaseEvent {
    eventType: 'OrganizationDeleted';
    eventData: {
      organizationId: string;
      deletedBy: string;
      deletedAt: Date;
    };
  }

  /** 成員加入事件 */
  export interface MemberJoinedEvent extends BaseEvent {
    eventType: 'MemberJoined';
    eventData: {
      organizationId: string;
      memberId: string;
      userId: string;
      role: string;
      joinedAt: Date;
    };
  }

  /** 成員離開事件 */
  export interface MemberLeftEvent extends BaseEvent {
    eventType: 'MemberLeft';
    eventData: {
      organizationId: string;
      memberId: string;
      userId: string;
      leftAt: Date;
    };
  }

  /** 成員角色變更事件 */
  export interface MemberRoleChangedEvent extends BaseEvent {
    eventType: 'MemberRoleChanged';
    eventData: {
      organizationId: string;
      memberId: string;
      userId: string;
      oldRole: string;
      newRole: string;
      changedBy: string;
      changedAt: Date;
    };
  }
}

/**
 * 團隊相關事件
 */
export namespace TeamEvents {
  /** 團隊創建事件 */
  export interface TeamCreatedEvent extends BaseEvent {
    eventType: 'TeamCreated';
    eventData: {
      teamId: string;
      name: string;
      organizationId: string;
      parentTeamId?: string;
      createdBy: string;
      createdAt: Date;
    };
  }

  /** 團隊更新事件 */
  export interface TeamUpdatedEvent extends BaseEvent {
    eventType: 'TeamUpdated';
    eventData: {
      teamId: string;
      changes: Record<string, any>;
      updatedBy: string;
      updatedAt: Date;
    };
  }

  /** 團隊刪除事件 */
  export interface TeamDeletedEvent extends BaseEvent {
    eventType: 'TeamDeleted';
    eventData: {
      teamId: string;
      deletedBy: string;
      deletedAt: Date;
    };
  }

  /** 團隊成員加入事件 */
  export interface TeamMemberJoinedEvent extends BaseEvent {
    eventType: 'TeamMemberJoined';
    eventData: {
      teamId: string;
      memberId: string;
      userId: string;
      role: string;
      joinedAt: Date;
    };
  }

  /** 團隊成員離開事件 */
  export interface TeamMemberLeftEvent extends BaseEvent {
    eventType: 'TeamMemberLeft';
    eventData: {
      teamId: string;
      memberId: string;
      userId: string;
      leftAt: Date;
    };
  }
}

/**
 * 儲存庫相關事件
 */
export namespace RepositoryEvents {
  /** 儲存庫創建事件 */
  export interface RepositoryCreatedEvent extends BaseEvent {
    eventType: 'RepositoryCreated';
    eventData: {
      repositoryId: string;
      name: string;
      organizationId: string;
      teamId?: string;
      isPrivate: boolean;
      createdBy: string;
      createdAt: Date;
    };
  }

  /** 儲存庫更新事件 */
  export interface RepositoryUpdatedEvent extends BaseEvent {
    eventType: 'RepositoryUpdated';
    eventData: {
      repositoryId: string;
      changes: Record<string, any>;
      updatedBy: string;
      updatedAt: Date;
    };
  }

  /** 儲存庫刪除事件 */
  export interface RepositoryDeletedEvent extends BaseEvent {
    eventType: 'RepositoryDeleted';
    eventData: {
      repositoryId: string;
      deletedBy: string;
      deletedAt: Date;
    };
  }

  /** 協作者加入事件 */
  export interface CollaboratorJoinedEvent extends BaseEvent {
    eventType: 'CollaboratorJoined';
    eventData: {
      repositoryId: string;
      collaboratorId: string;
      userId: string;
      permission: string;
      joinedAt: Date;
    };
  }

  /** 協作者離開事件 */
  export interface CollaboratorLeftEvent extends BaseEvent {
    eventType: 'CollaboratorLeft';
    eventData: {
      repositoryId: string;
      collaboratorId: string;
      userId: string;
      leftAt: Date;
    };
  }

  /** 提交推送事件 */
  export interface CommitPushedEvent extends BaseEvent {
    eventType: 'CommitPushed';
    eventData: {
      repositoryId: string;
      branch: string;
      commitSha: string;
      commitMessage: string;
      author: string;
      pushedAt: Date;
    };
  }
}

/**
 * 系統事件
 */
export namespace SystemEvents {
  /** 系統錯誤事件 */
  export interface SystemErrorEvent extends BaseEvent {
    eventType: 'SystemError';
    eventData: {
      errorCode: string;
      errorMessage: string;
      stackTrace?: string;
      occurredAt: Date;
    };
  }

  /** 系統警告事件 */
  export interface SystemWarningEvent extends BaseEvent {
    eventType: 'SystemWarning';
    eventData: {
      warningCode: string;
      warningMessage: string;
      occurredAt: Date;
    };
  }

  /** 系統維護事件 */
  export interface SystemMaintenanceEvent extends BaseEvent {
    eventType: 'SystemMaintenance';
    eventData: {
      maintenanceType: 'scheduled' | 'emergency';
      startTime: Date;
      endTime: Date;
      description: string;
    };
  }
}

/**
 * 所有事件類型的聯合類型
 */
export type DomainEvent = 
  | UserEvents.UserCreatedEvent
  | UserEvents.UserUpdatedEvent
  | UserEvents.UserDeletedEvent
  | UserEvents.UserLoggedInEvent
  | UserEvents.UserLoggedOutEvent
  | UserEvents.PasswordChangedEvent
  | OrganizationEvents.OrganizationCreatedEvent
  | OrganizationEvents.OrganizationUpdatedEvent
  | OrganizationEvents.OrganizationDeletedEvent
  | OrganizationEvents.MemberJoinedEvent
  | OrganizationEvents.MemberLeftEvent
  | OrganizationEvents.MemberRoleChangedEvent
  | TeamEvents.TeamCreatedEvent
  | TeamEvents.TeamUpdatedEvent
  | TeamEvents.TeamDeletedEvent
  | TeamEvents.TeamMemberJoinedEvent
  | TeamEvents.TeamMemberLeftEvent
  | RepositoryEvents.RepositoryCreatedEvent
  | RepositoryEvents.RepositoryUpdatedEvent
  | RepositoryEvents.RepositoryDeletedEvent
  | RepositoryEvents.CollaboratorJoinedEvent
  | RepositoryEvents.CollaboratorLeftEvent
  | RepositoryEvents.CommitPushedEvent
  | SystemEvents.SystemErrorEvent
  | SystemEvents.SystemWarningEvent
  | SystemEvents.SystemMaintenanceEvent;

/**
 * 事件處理器介面
 */
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  /** 處理事件 */
  handle(event: T): Promise<void>;
  /** 事件類型 */
  eventType: string;
}

/**
 * 事件儲存介面
 */
export interface EventStore {
  /** 儲存事件 */
  save(event: DomainEvent): Promise<void>;
  /** 取得事件 */
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  /** 取得事件（按類型） */
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
}