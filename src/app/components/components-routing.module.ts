import { GestionarSoporteComponent } from './administrador/gestionar-soporte/gestionar-soporte.component';
import { PrediccionComponent } from './cliente/prediccion/prediccion.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClienteComponent } from './cliente/cliente.component';
import { AdministradorComponent } from './administrador/administrador.component';
import { InicioComponent } from './cliente/inicio/inicio.component';
import { CuentaComponent } from './cliente/cuenta/cuenta.component';
import { HistorialComponent } from './cliente/historial/historial.component';
import { ReportesComponent } from './cliente/reportes/reportes.component';
import { AyudaComponent } from './cliente/ayuda/ayuda.component';
import { SoporteComponent } from './cliente/soporte/soporte.component';
import { CreaEditaUsuariosComponent } from './administrador/crea-edita-usuarios/crea-edita-usuarios.component';
import { CargarDataComponent } from './administrador/cargar-data/cargar-data.component';

const routes: Routes = [
  {
    path: 'cliente/:id',
    component: ClienteComponent,
    children: [
      {
        path: 'inicio',
        component: InicioComponent,
      },
      {
        path: 'predicciones',
        component: PrediccionComponent,
      },
      {
        path: 'cuenta',
        component: CuentaComponent,
      },
      {
        path: 'historial',
        component: HistorialComponent,
      },
      {
        path: 'soporte',
        component: SoporteComponent,
      },
      {
        path: 'ayuda',
        component: AyudaComponent,
      },
    ],
  },
  {
    path: 'administrador/:id',
    component: AdministradorComponent,
    children: [
      {
        path: 'usuarios',
        component: CreaEditaUsuariosComponent,
      },
      {
        path: 'cargar-data',
        component: CargarDataComponent,
      },
      {
        path: 'gestionar-soporte',
        component: GestionarSoporteComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComponentsRoutingModule {}
