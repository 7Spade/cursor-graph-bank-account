import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck, CustomProvider } from '@angular/fire/app-check';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    provideAppCheck(() => {
      const app = initializeApp(environment.firebase);
      
      // 根據環境選擇 App Check provider
      if (environment.production) {
        // 生產環境使用 reCAPTCHA Enterprise
        const provider = new ReCaptchaEnterpriseProvider(environment.appCheck.recaptchaSiteKey);
        return initializeAppCheck(app, { 
          provider, 
          isTokenAutoRefreshEnabled: true 
        });
      } else {
        // 開發環境使用 debug token
        const debugProvider = new CustomProvider({
          getToken: async () => {
            // 返回 debug token
            return {
              token: (environment.appCheck as any).debugToken,
              expireTimeMillis: Date.now() + 3600000 // 1小時後過期
            };
          }
        });
        return initializeAppCheck(app, { 
          provider: debugProvider, 
          isTokenAutoRefreshEnabled: true 
        });
      }
    }),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideVertexAI(() => getVertexAI())
  ]
};
