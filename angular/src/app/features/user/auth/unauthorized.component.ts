import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="unauth-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Unauthorized</span>
        <span class="spacer"></span>
        <button mat-icon-button color="accent" (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <mat-card class="unauth-card">
        <h2 class="title">🚫 Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauth-wrapper {
      min-height: 100vh;
      background: #fff3e0;
    }

    .toolbar {
      background: #ffe0b2;
      color: #bf360c;
    }

    .toolbar-title {
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .unauth-card {
      max-width: 700px;
      margin: 60px auto;
      padding: 32px;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #d84315;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']);
  }
}
