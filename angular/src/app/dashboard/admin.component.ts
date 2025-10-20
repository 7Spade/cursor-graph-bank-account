import {
  Component,
  inject,
  OnInit,
  Injector,
  runInInjectionContext
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc
} from '@angular/fire/firestore';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoggerService } from '../core/services/logger.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

interface UserData {
  uid: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    MatButtonModule
  ],
  template: `
    <div class="admin-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Admin Panel</span>
        <span class="spacer"></span>
        <button mat-button color="accent" (click)="refresh()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
        <button mat-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-toolbar>

      <mat-card class="admin-card">
        <h2 class="title">👑 Manage Users</h2>

        <div *ngIf="!isLoading; else loading">
          <table mat-table [dataSource]="users" class="mat-elevation-z4 wide-table">

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>
                <mat-icon>email</mat-icon> Email
              </th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="uid">
              <th mat-header-cell *matHeaderCellDef>
                <mat-icon>fingerprint</mat-icon> UID
              </th>
              <td mat-cell *matCellDef="let user">{{ user.uid }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>
                <mat-icon>badge</mat-icon> Role
              </th>
              <td mat-cell *matCellDef="let user">
                <mat-form-field appearance="outline" class="role-select">
                  <mat-select [value]="user.role" (selectionChange)="updateRole(user.uid, $event.value)">
                    <mat-option *ngFor="let role of roles" [value]="role">
                      {{ role | titlecase }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <ng-template #loading>
          <div class="loading">
            <mat-spinner diameter="48"></mat-spinner>
            <p>Fetching users...</p>
          </div>
        </ng-template>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .toolbar {
      background-color: #e3f2fd; /* Light Blue */
      color: #0d47a1;
      padding: 0 24px;
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .admin-card {
      margin: 32px auto;
      padding: 32px;
      width: 100%;
      max-width: 1300px;
      border-radius: 20px;
      background: white;
    }

    .title {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #333;
      text-align: center;
    }

    .wide-table {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      background-color: #fff;
    }

    th.mat-header-cell {
      background: #e3f2fd;
      color: #0d47a1;
      font-weight: 600;
      font-size: 14px;
    }

    td.mat-cell {
      font-size: 14px;
      padding: 16px;
    }

    tr.mat-row:nth-child(even) td {
      background: #f1f1f1;
    }

    .role-select {
      width: 300px;
      padding-top: 20px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: #666;
    }

    mat-icon {
      vertical-align: middle;
      margin-right: 6px;
      font-size: 18px;
    }
  `]
})
export class AdminComponent implements OnInit {
  firestore = inject(Firestore);
  snackbar = inject(MatSnackBar);
  router = inject(Router);
  injector = inject(Injector);
  logger = inject(LoggerService);

  users: UserData[] = [];
  isLoading: boolean = true;
  displayedColumns = ['email', 'uid', 'role'];
  roles = ['admin', 'editor', 'viewer'];

  ngOnInit() {
    // 使用適當的日誌記錄服務替代 console.log
    this.logger.debug("Admin component initialized");
    this.loadUsers();
  }

  loadUsers() {
    runInInjectionContext(this.injector, () => {
      const usersRef = collection(this.firestore, 'users');
      collectionData(usersRef, { idField: 'uid' }).subscribe(data => {
        this.users = data as UserData[];
        this.isLoading = false;
      });
    });
  }

  updateRole(uid: string, newRole: string) {
    const userRef = doc(this.firestore, 'users', uid);
    updateDoc(userRef, { role: newRole }).then(() => {
      this.snackbar.open(`✅ Role updated to ${newRole}`, 'Close', { duration: 3000 });
    }).catch(err => {
      console.error('❌ Failed to update role:', err);
      this.snackbar.open('❌ Failed to update role', 'Close', { duration: 3000 });
    });
  }

  refresh() {
    this.isLoading = true;
    this.loadUsers();
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
