import { GestionarSoporteComponent } from './gestionar-soporte/gestionar-soporte.component';
import { AdministradorComponent } from './administrador.component';
import { Routes } from '@angular/router';
import { CreaEditaUsuariosComponent } from './crea-edita-usuarios/crea-edita-usuarios.component';
import { CargarDataComponent } from './cargar-data/cargar-data.component';


export const ADMIN_ROUTES: Routes = [
  {
     path: '',
    component: AdministradorComponent,
   children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: CreaEditaUsuariosComponent },
      { path: 'cargar-data', component: CargarDataComponent },
      { path: 'gestionar-soporte', component: GestionarSoporteComponent },
    ], 
  },
];