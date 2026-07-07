import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { SessionTimeoutService } from './core/auth/session-timeout.service';

function initAuth() {
  const auth = inject(AuthService);
  return () => auth.initialize();
}

function initSessionTimeout() {
  const sessionTimeout = inject(SessionTimeoutService);
  return () => sessionTimeout.start();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initSessionTimeout,
      multi: true,
    },
  ],
};
