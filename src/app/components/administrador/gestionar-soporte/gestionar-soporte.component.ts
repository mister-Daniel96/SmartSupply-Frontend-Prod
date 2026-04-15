/* import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Soporte } from '../../../models/soporte';
import {
  MatTableDataSource,
  MatTable,
  MatHeaderRow,
  MatRowDef,
  MatHeaderRowDef,
  MatHeaderCellDef,
  MatCellDef,
  MatTableModule,
} from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SoporteService } from '../../../services/soporte.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-gestionar-soporte',
  standalone: true,
  imports: [
    MatPaginator,
    MatTable,
    MatHeaderRow,
    MatRowDef,
    MatHeaderRowDef,
    MatHeaderCellDef,
    MatCellDef,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckbox,
  ],
  templateUrl: './gestionar-soporte.component.html',
  styleUrl: './gestionar-soporte.component.css',
})
export class GestionarSoporteComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Soporte> = new MatTableDataSource<Soporte>([]);
  displayedColumns: string[] = [
    'codigo',
    'titulo',
    'descripcion',
    'usuario',
    'pendiente',
  ];
  usuario = new Usuario();
  id = 0;

  @ViewChild(MatPaginator) paginatorClient!: MatPaginator;

  constructor(
    private uS: UsuarioService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private sS: SoporteService
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });

    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });

    this.sS.list().subscribe((data) => {
      this.dataSource.data = data;
    });

    this.sS.getList().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginatorClient;
  }
  onPendienteChange(soporte: Soporte, nuevoValor: boolean) {
    soporte.pendienteSoporte = nuevoValor;

    this.sS.update(soporte).subscribe({
      next: () => console.log('Pendiente actualizado'),
      error: (err) => {
        console.error(err);
        soporte.pendienteSoporte = !nuevoValor;
      },
    });
  }
}
 */