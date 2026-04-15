/* import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from '../../../models/usuario';
import { MatPaginator } from '@angular/material/paginator';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as bcrypt from 'bcryptjs';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioDialogComponent } from './usuario-dialog/usuario-dialog.component';

@Component({
  selector: 'app-crea-edita-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule, // 👈 agrega esto
  ],
  templateUrl: './crea-edita-usuarios.component.html',
  styleUrl: './crea-edita-usuarios.component.css',
})
export class CreaEditaUsuariosComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Usuario> = new MatTableDataSource<Usuario>([]);
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'correo',
    'rol',
    'contrasena',
    'activado',
    'accion01',
  ];
   usuario = new Usuario();
  id = 0;

  @ViewChild(MatPaginator) paginatorClient!: MatPaginator;

  constructor(
    private uS: UsuarioService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
  this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });

    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });


    // 1) Carga inicial desde la API
    this.uS.list().subscribe((data) => {
      console.log('[list()] datos recibidos:', data);
      this.dataSource.data = data;
    });

    // 2) Escucha de cambios reactivos (BehaviorSubject en el service)
    this.uS.getList().subscribe((data) => {
      console.log('[getList()] datos actualizados:', data);
      this.dataSource.data = data;
    });
  }

  ngAfterViewInit(): void {
    // Aquí ya existe el ViewChild
    this.dataSource.paginator = this.paginatorClient;
  }

  eliminar(id: number) {
    console.log('[eliminar] id a eliminar:', id);

    this.uS.delete(id).subscribe(() => {
      console.log('[eliminar] delete OK, recargando lista...');
      this.uS.list().subscribe((data) => {
        console.log('[eliminar] lista después de eliminar:', data);
        this.uS.setList(data); // esto disparará el getList() de arriba
      });
    });
  }
  abrirDialogoEditar(usuario: Usuario) {
    // Guardamos una copia original, con el hash actual
    const usuarioOriginal = { ...usuario };

    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '500px',
      data: {
        ...usuario,
        passwordUsuario: '', // 👉 el popup empieza con contraseña vacía
      },
    });

    dialogRef.afterClosed().subscribe((result: Usuario | undefined) => {
      if (result) {
        console.log('[Dialog] Usuario editado:', result);

        // Armamos el usuario que enviaremos al backend
        const usuarioActualizado: Usuario = {
          ...usuarioOriginal, // mantiene idUsuario y password hash original
          nameUsuario: result.nameUsuario,
          emailUsuario: result.emailUsuario,
          enabledUsuario: result.enabledUsuario,
        };

        // Si el admin escribió una nueva contraseña, la encriptamos
        if (result.passwordUsuario && result.passwordUsuario.trim() !== '') {
          usuarioActualizado.passwordUsuario = bcrypt.hashSync(
            result.passwordUsuario.trim(),
            12
          );
        }

        this.uS.update(usuarioActualizado).subscribe(() => {
          console.log('[update] Usuario actualizado, recargando lista...');
          this.uS.list().subscribe((data) => {
            this.uS.setList(data);
          });
        });
      }
    });
  }
 abrirDialogoNuevo() {
  const nuevoUsuario: Usuario = {
    idUsuario: null,
    nameUsuario: '',
    passwordUsuario: '',
    emailUsuario: '',
    enabledUsuario: true,
    ageUsuario: 0,
    dniUsuario: 0,
    rolUsuario: 'CLIENTE',
    phoneUsuario: '',
  };

  const dialogRef = this.dialog.open(UsuarioDialogComponent, {
    width: '500px',
    data: { ...nuevoUsuario },
  });

  dialogRef.afterClosed().subscribe((result: Usuario | undefined) => {
    if (result) {
      console.log('[Dialog NUEVO] Usuario ingresado:', result);

      // Armamos el usuario que vamos a enviar al backend
      const usuarioNuevo: Usuario = {
        ...nuevoUsuario,
        nameUsuario: result.nameUsuario,
        emailUsuario: result.emailUsuario,
        enabledUsuario: result.enabledUsuario,
        ageUsuario: result.ageUsuario,
        dniUsuario: result.dniUsuario,
        rolUsuario: result.rolUsuario,
        phoneUsuario: result.phoneUsuario,
      };

      // Encriptar la contraseña antes de enviar
      if (result.passwordUsuario && result.passwordUsuario.trim() !== '') {
        usuarioNuevo.passwordUsuario = bcrypt.hashSync(
          result.passwordUsuario.trim(),
          12
        );
      } else {
        // Si por alguna razón viniera vacío, no tiene sentido crear el usuario
        console.warn(
          '[Dialog NUEVO] Contraseña vacía, no se creará el usuario.'
        );
        return;
      }

      this.uS.insert(usuarioNuevo).subscribe(() => {
        console.log('[insert] Usuario creado, recargando lista...');
        this.uS.list().subscribe((data) => {
          this.uS.setList(data); // ✅ actualizas la tabla
        });
      });
    }
  });
}

}
 */