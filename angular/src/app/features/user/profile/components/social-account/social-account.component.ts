import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../../../../core/services/notification.service';
import { SocialAccount } from '../../../../../core/models/auth.model';

/**
 * SocialAccountComponent - 社交帳戶管理組件
 * 單一職責：處理社交帳戶的添加、編輯和刪除
 * 遵循單一職責原則：只負責社交帳戶相關的業務邏輯
 */
@Component({
  selector: 'app-social-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './social-account.component.html',
  styleUrls: ['./social-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialAccountComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  // Signals for state management
  socialAccounts = signal<SocialAccount[]>([]);
  loading = signal(false);
  showAddForm = signal(false);

  // Form
  socialAccountForm!: FormGroup;

  // Available providers
  readonly providers = [
    { key: 'twitter', name: 'Twitter', icon: 'chat' },
    { key: 'facebook', name: 'Facebook', icon: 'facebook' },
    { key: 'linkedin', name: 'LinkedIn', icon: 'work' },
    { key: 'youtube', name: 'YouTube', icon: 'video_library' },
    { key: 'instagram', name: 'Instagram', icon: 'photo_camera' },
    { key: 'github', name: 'GitHub', icon: 'code' }
  ];

  // Computed signals
  readonly canAdd = computed(() => 
    this.socialAccountForm?.valid && !this.loading()
  );

  readonly hasAccounts = computed(() => 
    this.socialAccounts().length > 0
  );

  ngOnInit() {
    this.initializeForm();
    this.loadSocialAccounts();
  }

  private initializeForm() {
    this.socialAccountForm = this.fb.group({
      provider: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      username: ['']
    });
  }

  private loadSocialAccounts() {
    // TODO: Load from service
    this.socialAccounts.set([
      { id: '1', provider: 'github', url: 'https://github.com/user', username: 'user', verified: true, addedAt: new Date() },
      { id: '2', provider: 'twitter', url: 'https://twitter.com/user', username: 'user', verified: true, addedAt: new Date() }
    ]);
  }

  onAddAccount() {
    if (this.canAdd()) {
      this.loading.set(true);
      
      const formValue = this.socialAccountForm.value;
      const newAccount: SocialAccount = {
        id: Date.now().toString(),
        provider: formValue.provider,
        url: formValue.url,
        username: formValue.username,
        verified: false,
        addedAt: new Date()
      };

      // TODO: Save to service
      // 模擬異步操作 - 應該替換為真實的服務調用
      Promise.resolve().then(() => {
        this.socialAccounts.update(accounts => [...accounts, newAccount]);
        this.socialAccountForm.reset();
        this.showAddForm.set(false);
        this.notificationService.showSuccess('社交帳戶添加成功');
        this.loading.set(false);
      });
    }
  }

  onRemoveAccount(account: SocialAccount) {
    // TODO: Remove from service
    this.socialAccounts.update(accounts => 
      accounts.filter(acc => acc.id !== account.id)
    );
    this.notificationService.showSuccess('社交帳戶已移除');
  }

  onEditAccount(account: SocialAccount) {
    this.socialAccountForm.patchValue({
      provider: account.provider,
      url: account.url,
      username: account.username
    });
    this.showAddForm.set(true);
  }

  onCancelAdd() {
    this.socialAccountForm.reset();
    this.showAddForm.set(false);
  }

  onShowAddForm() {
    this.showAddForm.set(true);
  }

  getProviderInfo(providerKey: string) {
    return this.providers.find(p => p.key === providerKey) || 
           { key: providerKey, name: providerKey, icon: 'link' };
  }

  getFieldError(fieldName: string): string {
    const field = this.socialAccountForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} 為必填欄位`;
      if (field.errors['pattern']) return `${fieldName} 格式不正確`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.socialAccountForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
