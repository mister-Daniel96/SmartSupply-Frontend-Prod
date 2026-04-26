import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsRoutingModule } from './components-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, RouterModule } from '@angular/router';
import { AdministradorComponent } from './administrador/administrador.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCellDef, MatHeaderCellDef, MatHeaderRowDef, MatRowDef, MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ComponentsRoutingModule,
    //importaciones agregadas
    MatSidenavModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormField,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatNativeDateModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    MatCardModule,
    MatDialogModule,
    MatGridListModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatTableModule,
    MatHeaderCellDef,
    MatCellDef,
    CommonModule,
    RouterLink,
    MatHeaderRowDef,
    MatRowDef,
    MatPaginator,
    MatTable,
  ],
})
export class ComponentsModule {}
