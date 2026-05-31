import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { GuardService } from './services/guard.service';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'cliente',
    canActivate: [GuardService],
    loadChildren: () =>
      import('./components/cliente/cliente.routes').then(
        (m) => m.CLIENTE_ROUTES
      ),
  },

  {
    path: 'administrador',
    canActivate: [GuardService],
    loadChildren: () =>
      import('./components/administrador/administrador.routes').then(
        (m) => m.ADMIN_ROUTES
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];