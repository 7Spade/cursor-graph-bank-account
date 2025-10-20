// src/app/features/repository/routes/repository.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from '../../user/auth/auth.guard';
import { repositoryReadGuard, repositoryManageGuard } from '../../../core/guards/permission.guard';

export const repositoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../components/repository-list.component').then(m => m.RepositoryListComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('../components/repository-detail.component').then(m => m.RepositoryDetailComponent),
    canActivate: [authGuard, repositoryReadGuard(':id')]
  },
  {
    path: ':id/collaborators',
    loadComponent: () => import('../components/collaborator-management.component').then(m => m.CollaboratorManagementComponent),
    canActivate: [authGuard, repositoryManageGuard(':id')]
  }
];
