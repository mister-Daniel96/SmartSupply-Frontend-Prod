import { Routes } from '@angular/router';
import { ClienteComponent } from './cliente.component';


export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: ClienteComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      /* { path: 'inicio', component: InicioComponent },
      { path: 'predicciones', component: PrediccionComponent },
      { path: 'cuenta', component: CuentaComponent },
      { path: 'historial', component: HistorialComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'ayuda', component: AyudaComponent }, */
    ],
  },
];