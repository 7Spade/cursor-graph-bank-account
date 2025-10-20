import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

interface Article {
  id?: string;
  title: string;
  content: string;
  createdAt: Date;
}

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="viewer-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Viewer Panel</span>
        <span class="spacer"></span>
        <button mat-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-toolbar>

      <mat-card class="article-card" *ngFor="let article of articles">
        <h2>{{ article.title }}</h2>
        <p>{{ article.content }}</p>
<div class="date" *ngIf="article.createdAt">
  <mat-icon>calendar_today</mat-icon>
  {{ article.createdAt | date: 'medium' }}
</div>
      </mat-card>

      <mat-card *ngIf="articles.length == 0" class="no-articles">
        <p>No articles available yet. Please check back later!</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .viewer-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
      padding-bottom: 48px;
    }

    .toolbar {
      background-color: #e3f2fd;
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

    .article-card {
      margin: 24px auto;
      padding: 24px;
      width: 70%;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    h2 {
      font-size: 24px;
      margin-bottom: 12px;
      color: #0d47a1;
    }

    p {
      font-size: 16px;
      color: #333;
      white-space: pre-line;
    }

    .date {
      margin-top: 12px;
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .no-articles {
      max-width: 600px;
      margin: 40px auto;
      text-align: center;
      background: white;
      padding: 32px;
      border-radius: 12px;
    }
  `]
})
export class ViewerComponent implements OnInit {
  firestore = inject(Firestore);
  router = inject(Router);

  articles: Article[] = [];

  ngOnInit() {
    const articlesRef = collection(this.firestore, 'articles');
    collectionData(articlesRef, { idField: 'id' }).subscribe((data) => {
    this.articles = (data as any[]).map((article) => ({
      ...article,
      createdAt: article.createdAt?.toDate()
    })).sort((a, b) => b.createdAt - a.createdAt);
    });
  }

  getDate(date: any) {
    return new Date(date.toDate());
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
