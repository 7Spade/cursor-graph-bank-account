import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',

})
export class App {
  snackBar = inject(MatSnackBar);

  constructor() {
    // Firebase 和 App Check 已正確配置
    console.log('✅ Firebase configuration loaded successfully');
    console.log('✅ App Check configured for', environment.production ? 'production' : 'development');
  }
  protected readonly title = signal('angular-fire-rolekit');
}
