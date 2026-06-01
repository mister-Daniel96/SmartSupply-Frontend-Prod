import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

type SessionCloseReason = 'sessionExpired' | 'connectionLost';

@Injectable({
  providedIn: 'root',
})
export class SessionSecurityService {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isWatching = false;

  // Para pruebas: 20 segundos
  private readonly inactivityTime = 200 * 1000;

  // Para producción usa 10 minutos:
  // private readonly inactivityTime = 10 * 60 * 1000;

  private readonly activityEvents: string[] = [
    'mousemove',
    'keydown',
    'click',
    'scroll',
    'touchstart',
  ];

  constructor(
    private router: Router,
    private loginService: LoginService,
    private ngZone: NgZone
  ) {}

  start(): void {
    if (!this.loginService.verificar()) {
      return;
    }

    if (this.isWatching) {
      this.resetInactivityTimer();
      return;
    }

    this.isWatching = true;

    this.startActivityListeners();
    this.startConnectionListener();
    this.resetInactivityTimer();
  }

  stop(): void {
    this.stopActivityListeners();
    this.stopConnectionListener();
    this.clearTimer();
    this.isWatching = false;
  }

  private startActivityListeners(): void {
    this.activityEvents.forEach((event) => {
      window.addEventListener(event, this.resetInactivityTimer);
    });
  }

  private stopActivityListeners(): void {
    this.activityEvents.forEach((event) => {
      window.removeEventListener(event, this.resetInactivityTimer);
    });
  }

  private startConnectionListener(): void {
    window.addEventListener('offline', this.handleOffline);
  }

  private stopConnectionListener(): void {
    window.removeEventListener('offline', this.handleOffline);
  }

  private resetInactivityTimer = (): void => {
    if (!this.loginService.verificar()) {
      this.stop();
      return;
    }

    this.clearTimer();

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.closeSession('sessionExpired');
        });
      }, this.inactivityTime);
    });
  };

  private handleOffline = (): void => {
    this.ngZone.run(() => {
      if (!this.loginService.verificar()) {
        return;
      }

      this.closeSession('connectionLost');
    });
  };

  private closeSession(reason: SessionCloseReason): void {
    this.stop();

    sessionStorage.removeItem('token');

    this.router.navigate(['/login'], {
      queryParams: {
        [reason]: true,
      },
    });
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}