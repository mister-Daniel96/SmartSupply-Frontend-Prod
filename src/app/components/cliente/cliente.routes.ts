import { AyudaComponent } from './ayuda/ayuda.component';
import { SoporteComponent } from './soporte/soporte.component';
import { Routes } from '@angular/router';
import { ClienteComponent } from './cliente.component';
import { CuentaComponent } from './cuenta/cuenta.component';
import { InicioComponent } from './inicio/inicio.component';
import { PrediccionComponent } from './prediccion/prediccion.component';
import { HistorialComponent } from './historial/historial.component';


export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: ClienteComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
       { path: 'inicio', component: InicioComponent },
      { path: 'predicciones', component: PrediccionComponent }, 
      { path: 'cuenta', component: CuentaComponent },
   { path: 'historial', component: HistorialComponent }, 
      { path: 'soporte', component: SoporteComponent },
       { path: 'ayuda', component: AyudaComponent },   
    ],
  },
];