import {
  Component,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  updateDoc,
  deleteDoc,
  doc
} from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface Article {
  id?: string;
  title: string;
  content: string;
  createdAt: Date;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="editor-wrapper">
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Editor Panel</span>
        <span class="spacer"></span>
        <button mat-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </mat-toolbar>

      <mat-card class="editor-card">
        <h2 class="title">📝 {{ editingArticleId ? 'Edit Article' : 'Create Article' }}</h2>

        <form (ngSubmit)="saveArticle()" class="article-form">
          <mat-form-field appearance="outline" class="field">
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="title" name="title" required />
          </mat-form-field>

          <mat-form-field appearance="outline" class="field">
            <mat-label>Content</mat-label>
            <textarea matInput [(ngModel)]="content" name="content" rows="8" required></textarea>
          </mat-form-field>

          <button mat-raised-button color="primary" class="save-btn" type="submit">
            <mat-icon>save</mat-icon> {{ editingArticleId ? 'Update' : 'Save' }}
          </button>
        </form>
      </mat-card>

      <mat-card class="preview-card" *ngIf="title || content">
        <h3 class="preview-title">🔍 Live Preview</h3>
        <h4>{{ title }}</h4>
        <p style="margin-top: 0px;">{{ content }}</p>
      </mat-card>

      <mat-card class="editor-card" *ngIf="articles.length">
        <h2 class="title">📚 Article History</h2>
        <div *ngFor="let article of articles" class="article-item">
          <div style="display: flex;">
                      <h3 style="width: 90%;">{{ article.title }}</h3>
          <div class="actions">
            <button mat-stroked-button color="primary" (click)="editArticle(article)">
              <mat-icon>edit</mat-icon> Edit
            </button>
            <button mat-stroked-button color="warn" (click)="deleteArticle(article.id)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </div>
          </div>

          <p style="margin-top: 0px;">{{ article.content | slice:0:100 }}...</p>

        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .editor-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
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

    .editor-card, .preview-card {
      margin: 24px auto;
      padding: 24px;
      width: 100%;
      max-width: 900px;
      border-radius: 16px;
      background: white;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }

    .article-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field {
      width: 100%;
    }

    .save-btn {
      align-self: flex-end;
      height: 48px;
    }

    .preview-title {
      font-weight: 600;
      color: #0d47a1;
      margin-bottom: 12px;
    }

    h4 {
      margin-top: 0;
      font-size: 20px;
    }

    p {
      white-space: pre-line;
      font-size: 16px;
      color: #444;
    }

    mat-icon {
      vertical-align: middle;
      margin-right: 6px;
    }

    .article-item {
      margin-bottom: 20px;
      border-top: 1px solid #eee;
      padding-top: 16px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
  `]
})
export class EditorComponent implements OnInit {
  firestore = inject(Firestore);
  snackbar = inject(MatSnackBar);
  router = inject(Router);

  title = '';
  content = '';
  editingArticleId: string | null = null;
  articles: Article[] = [];

  ngOnInit() {
    const articlesRef = collection(this.firestore, 'articles');
    collectionData(articlesRef, { idField: 'id' }).subscribe((data) => {
      this.articles = data as Article[];
    });
  }

  async saveArticle() {
    if (!this.title.trim() || !this.content.trim()) {
      this.snackbar.open('❗ Title and content are required', 'Close', { duration: 3000 });
      return;
    }

    try {
      if (this.editingArticleId) {
        const articleRef = doc(this.firestore, 'articles', this.editingArticleId);
        await updateDoc(articleRef, {
          title: this.title,
          content: this.content
        });
        this.snackbar.open('✅ Article updated!', 'Close', { duration: 3000 });
      } else {
        const articlesRef = collection(this.firestore, 'articles');
        await addDoc(articlesRef, {
          title: this.title,
          content: this.content,
          createdAt: new Date()
        });
        this.snackbar.open('✅ Article saved!', 'Close', { duration: 3000 });
      }

      this.title = '';
      this.content = '';
      this.editingArticleId = null;

    } catch (err) {
      console.error('❌ Error saving article:', err);
      this.snackbar.open('❌ Failed to save article', 'Close', { duration: 3000 });
    }
  }

  editArticle(article: Article) {
    this.title = article.title;
    this.content = article.content;
    this.editingArticleId = article.id || null;
  }

  async deleteArticle(id?: string) {
    if (!id) return;
    const confirmed = confirm('Are you sure you want to delete this article?');
    if (!confirmed) return;

    try {
      const articleRef = doc(this.firestore, 'articles', id);
      await deleteDoc(articleRef);
      this.snackbar.open('🗑️ Article deleted!', 'Close', { duration: 3000 });
    } catch (err) {
      console.error('❌ Error deleting article:', err);
      this.snackbar.open('❌ Failed to delete article', 'Close', { duration: 3000 });
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
