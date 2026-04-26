import { ADMIN_ROUTES } from './components/administrador/administrador.routes';
import { CLIENTE_ROUTES } from './components/cliente/cliente.routes';
import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'cliente',
    loadChildren: () =>
      import('./components/cliente/cliente.routes').then((m) => m.CLIENTE_ROUTES),
  },
  {
    path: 'administrador',
    loadChildren: () =>
      import('./components/administrador/administrador.routes').then(
        (m) => m.ADMIN_ROUTES,
      ),
  },

  { path: '**', redirectTo: '' },
];
