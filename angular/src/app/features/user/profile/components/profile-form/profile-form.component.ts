import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { User } from '../../../../../core/models/auth.model';

/**
 * ProfileFormComponent - 個人資料表單組件
 * 單一職責：處理個人資料的表單輸入和驗證
 * 遵循單一職責原則：只負責個人資料相關的表單邏輯
 */
@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFormComponent {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  user = signal<User | null>(null);
  loading = signal(false);
  isDirty = signal(false);

  // Form
  profileForm!: FormGroup;

  // Computed signals
  readonly canSave = computed(() => 
    this.profileForm?.valid && this.isDirty() && !this.loading()
  );

  readonly canReset = computed(() => 
    this.isDirty() && !this.loading()
  );

  ngOnInit() {
    this.initializeForm();
    this.loadUserData();
    this.setupFormChangeTracking();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      bio: ['', [Validators.maxLength(500)]],
      location: ['', [Validators.maxLength(100)]],
      company: ['', [Validators.maxLength(100)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      blog: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  private loadUserData() {
    this.loading.set(true);
    
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.user.set(user);
          this.updateFormWithUserData(user);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('載入用戶資料失敗:', error);
        this.notificationService.showError('載入用戶資料失敗');
        this.loading.set(false);
      }
    });
  }

  private updateFormWithUserData(user: User) {
    this.profileForm.patchValue({
      displayName: user.displayName,
      bio: user.bio,
      location: user.location,
      company: user.company,
      website: user.website,
      blog: user.blog
    });
    
    // Reset dirty state after loading
    this.isDirty.set(false);
  }

  private setupFormChangeTracking() {
    this.profileForm.valueChanges.subscribe(() => {
      this.isDirty.set(true);
    });
  }

  onSave() {
    if (this.profileForm.valid && this.canSave()) {
      this.loading.set(true);
      
      const updates = this.profileForm.value;
      this.userService.updateUser(updates).subscribe({
        next: (updatedUser) => {
          if (updatedUser) {
            this.user.set(updatedUser);
            this.isDirty.set(false);
            this.notificationService.showSuccess('個人資料更新成功');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('更新個人資料失敗:', error);
          this.notificationService.showError('更新失敗，請重試');
          this.loading.set(false);
        }
      });
    }
  }

  onReset() {
    if (this.canReset()) {
      const user = this.user();
      if (user) {
        this.updateFormWithUserData(user);
        this.notificationService.showInfo('已重置為原始資料');
      }
    }
  }

  // Form field helpers
  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} 為必填欄位`;
      if (field.errors['minlength']) return `${fieldName} 至少需要 2 個字符`;
      if (field.errors['maxlength']) return `${fieldName} 不能超過 100 個字符`;
      if (field.errors['pattern']) return `${fieldName} 格式不正確`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
