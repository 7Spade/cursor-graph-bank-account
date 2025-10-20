import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule
  ],
  template: `
    <div class="landing-wrapper">
      <!-- 頂部導航欄 -->
      <mat-toolbar color="primary" class="toolbar">
        <span class="toolbar-title">Angular Fire RoleKit</span>
        <span class="spacer"></span>
        <button mat-button color="accent" (click)="navigateToLogin()">
          <mat-icon>login</mat-icon> 登入
        </button>
        <button mat-button color="primary" (click)="navigateToSignup()">
          <mat-icon>person_add</mat-icon> 註冊
        </button>
      </mat-toolbar>

      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Angular Fire RoleKit</h1>
          <h2 class="hero-subtitle">GitHub 式多層級權限系統</h2>
          <p class="hero-description">
            現代化的組織管理和 Repository 管理解決方案<br>
            基於 Angular 20 + Firebase 的企業級權限管理平台
          </p>
          <div class="cta-buttons">
            <button mat-raised-button color="primary" class="cta-primary" (click)="navigateToSignup()">
              <mat-icon>rocket_launch</mat-icon>
              立即開始
            </button>
            <button mat-stroked-button color="primary" class="cta-secondary" (click)="navigateToLogin()">
              <mat-icon>login</mat-icon>
              已有帳號？登入
            </button>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="features-content">
          <h2 class="features-title">功能特色</h2>
          <div class="feature-grid">
            <mat-card class="feature-card">
              <div class="feature-icon">
                <mat-icon>security</mat-icon>
              </div>
              <h3>多層級權限</h3>
              <p>個人 → 組織 → 團隊 → Repository 的完整權限體系，精細控制每個資源的訪問權限</p>
            </mat-card>

            <mat-card class="feature-card">
              <div class="feature-icon">
                <mat-icon>business</mat-icon>
              </div>
              <h3>組織管理</h3>
              <p>完整的組織、團隊和成員管理功能，支援 GitHub 式的組織結構和管理流程</p>
            </mat-card>

            <mat-card class="feature-card">
              <div class="feature-icon">
                <mat-icon>folder</mat-icon>
              </div>
              <h3>Repository 管理</h3>
              <p>GitHub 式的 Repository 協作者和權限管理，支援私有和公開 Repository</p>
            </mat-card>

            <mat-card class="feature-card">
              <div class="feature-icon">
                <mat-icon>palette</mat-icon>
              </div>
              <h3>現代化 UI</h3>
              <p>基於 Angular Material 3 的現代化界面，支援響應式設計和深色模式</p>
            </mat-card>

            <mat-card class="feature-card">
              <div class="feature-icon">
                <mat-icon>speed</mat-icon>
              </div>
              <h3>高性能</h3>
              <p>使用 Angular 20 Signals 和 Control Flow，提供極致的性能和用戶體驗</p>
            </mat-card>

            <mat-card class="feature-card">
              <div class="feature-icon">
                <mat-icon>cloud</mat-icon>
              </div>
              <h3>雲端整合</h3>
              <p>基於 Firebase 的雲端服務，支援即時同步和跨平台訪問</p>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Technology Section -->
      <div class="technology-section">
        <div class="technology-content">
          <h2 class="technology-title">技術架構</h2>
          <div class="tech-grid">
            <div class="tech-item">
              <mat-icon>build</mat-icon>
              <span><strong>前端框架</strong><br>Angular 20.1.0</span>
            </div>
            <div class="tech-item">
              <mat-icon>cloud</mat-icon>
              <span><strong>後端服務</strong><br>Firebase 11.10.0</span>
            </div>
            <div class="tech-item">
              <mat-icon>security</mat-icon>
              <span><strong>認證系統</strong><br>Firebase Auth</span>
            </div>
            <div class="tech-item">
              <mat-icon>storage</mat-icon>
              <span><strong>資料庫</strong><br>Firestore</span>
            </div>
            <div class="tech-item">
              <mat-icon>palette</mat-icon>
              <span><strong>UI 框架</strong><br>Material Design 3</span>
            </div>
            <div class="tech-item">
              <mat-icon>speed</mat-icon>
              <span><strong>狀態管理</strong><br>Angular Signals</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-content">
          <p>&copy; 2024 Angular Fire RoleKit. All rights reserved.</p>
          <p>基於 Angular 20 + Firebase 的企業級權限管理平台</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .toolbar {
      background-color: #e3f2fd;
      color: #0d47a1;
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .hero-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      text-align: center;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 48px;
      font-weight: 700;
      color: #0d47a1;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .hero-subtitle {
      font-size: 28px;
      font-weight: 500;
      color: #1976d2;
      margin-bottom: 24px;
    }

    .hero-description {
      font-size: 18px;
      color: #666;
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-primary, .cta-secondary {
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 180px;
    }

    .cta-primary {
      background: linear-gradient(45deg, #1976d2, #42a5f5);
      color: white;
    }

    .features-section {
      padding: 80px 24px;
      background: white;
    }

    .features-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features-title {
      font-size: 36px;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 60px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 32px;
    }

    .feature-card {
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-align: center;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .feature-icon {
      margin-bottom: 20px;
    }

    .feature-icon mat-icon {
      font-size: 48px;
      color: #1976d2;
    }

    .feature-card h3 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .feature-card p {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
    }

    .technology-section {
      padding: 80px 24px;
      background: #f8f9fa;
    }

    .technology-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .technology-title {
      font-size: 36px;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 60px;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .tech-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }

    .tech-item mat-icon {
      font-size: 32px;
      color: #1976d2;
      margin-bottom: 12px;
    }

    .tech-item span {
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }

    .footer {
      background: #333;
      color: white;
      padding: 40px 24px;
      text-align: center;
    }

    .footer-content p {
      margin: 8px 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 32px;
      }

      .hero-subtitle {
        font-size: 20px;
      }

      .hero-description {
        font-size: 16px;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-primary, .cta-secondary {
        width: 100%;
        max-width: 300px;
      }

      .feature-grid {
        grid-template-columns: 1fr;
      }

      .tech-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .features-title, .technology-title {
        font-size: 28px;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 40px 16px;
      }

      .features-section, .technology-section {
        padding: 40px 16px;
      }

      .tech-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
