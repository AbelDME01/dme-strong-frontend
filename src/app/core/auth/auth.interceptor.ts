import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo intervenimos peticiones a nuestra API; las llamadas de auth de Supabase
  // van por otro host y quedan fuera, evitando bucles de cierre de sesión.
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.session()?.access_token;
  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        void expireSession(authService, router);
      }
      return throwError(() => error);
    }),
  );
};

/** Cierra la sesión y redirige al login cuando la API responde 401 (token inválido o expirado). */
async function expireSession(authService: AuthService, router: Router): Promise<void> {
  try {
    await authService.signOut();
  } finally {
    await router.navigate(['/auth/login']);
  }
}
