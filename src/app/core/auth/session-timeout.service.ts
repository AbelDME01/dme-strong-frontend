import { Injectable, Injector, NgZone, inject, runInInjectionContext } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subscription, fromEvent, merge, throttleTime } from 'rxjs';
import { AuthService } from './auth.service';

/** Tiempo de inactividad tras el cual se cierra la sesión automáticamente. */
export const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

/** Ventana mínima entre eventos de actividad procesados para no reiniciar el contador en exceso. */
const ACTIVITY_THROTTLE_MS = 1_000;

/** Eventos del DOM que consideramos señales de actividad del usuario. */
const ACTIVITY_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'] as const;

/**
 * Cierra la sesión del usuario tras {@link SESSION_TIMEOUT_MS} de inactividad
 * y lo redirige al login. Solo vigila la actividad mientras hay sesión activa
 * y deja de hacerlo al cerrar sesión.
 *
 * La escucha de eventos se ejecuta fuera de la zona de Angular para no disparar
 * detección de cambios con cada interacción del usuario.
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly injector = inject(Injector);

  private countdownId: ReturnType<typeof setTimeout> | null = null;
  private activitySubscription: Subscription | null = null;
  private started = false;

  /** Comienza a vigilar la sesión. Idempotente: llamadas repetidas no tienen efecto. */
  start(): void {
    if (this.started) return;
    this.started = true;

    runInInjectionContext(this.injector, () => {
      toObservable(this.authService.isAuthenticated)
        .pipe(takeUntilDestroyed())
        .subscribe((isAuthenticated) => {
          if (isAuthenticated) {
            this.beginMonitoring();
          } else {
            this.stopMonitoring();
          }
        });
    });
  }

  private beginMonitoring(): void {
    if (this.activitySubscription) return;

    this.ngZone.runOutsideAngular(() => {
      const activity$ = merge(
        ...ACTIVITY_EVENTS.map((eventName) =>
          fromEvent(document, eventName, { passive: true }),
        ),
      );
      this.activitySubscription = activity$
        .pipe(throttleTime(ACTIVITY_THROTTLE_MS))
        .subscribe(() => this.restartCountdown());
    });

    this.restartCountdown();
  }

  private restartCountdown(): void {
    this.clearCountdown();
    this.countdownId = setTimeout(() => this.expireSession(), SESSION_TIMEOUT_MS);
  }

  private expireSession(): void {
    this.stopMonitoring();
    this.ngZone.run(async () => {
      try {
        await this.authService.signOut();
      } finally {
        await this.router.navigate(['/auth/login']);
      }
    });
  }

  private stopMonitoring(): void {
    this.clearCountdown();
    this.activitySubscription?.unsubscribe();
    this.activitySubscription = null;
  }

  private clearCountdown(): void {
    if (this.countdownId !== null) {
      clearTimeout(this.countdownId);
      this.countdownId = null;
    }
  }
}
