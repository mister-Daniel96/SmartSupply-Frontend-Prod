import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';

import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { LoginService } from '../../../services/login.service';
import { UsuarioDialogComponent } from './usuario-dialog/usuario-dialog.component';

@Component({
  selector: 'app-crea-edita-usuarios',
  standalone: true,
  imports: [CommonModule, UsuarioDialogComponent],
  templateUrl: './crea-edita-usuarios.component.html',
  styleUrls: ['./crea-edita-usuarios.component.css'],
})
export class CreaEditaUsuariosComponent implements OnInit {
  private uS = inject(UsuarioService);
  private loginService = inject(LoginService);

  usuario = new Usuario();
  id = 0;

  usuarios: Usuario[] = [];
  mostrarDialogo = false;
  usuarioDialogo: Usuario | null = null;

  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token admin usuarios:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
    } else {
      console.error('No se pudo obtener el id del usuario desde el token');
    }

    this.cargarUsuarios();

    this.uS.getList().subscribe((data) => {
      console.log('[getList()] datos actualizados:', data);
      this.usuarios = data;
      this.ajustarPaginaActual();
    });
  }

  private cargarUsuario(): void {
    this.uS.listId(this.id).subscribe({
      next: (data: Usuario) => {
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario logueado', err);
      },
    });
  }

  private cargarUsuarios(): void {
    this.uS.list().subscribe({
      next: (data: Usuario[]) => {
        console.log('[list()] datos recibidos:', data);
        this.usuarios = data;
        this.uS.setList(data);
        this.ajustarPaginaActual();
      },
      error: (err) => {
        console.error('Error al listar usuarios', err);

        Swal.fire({
          icon: 'error',
          title: 'Error al listar usuarios',
          text: 'No se pudo cargar la lista de usuarios.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626',
        });
      },
    });
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.usuarios.length / this.pageSize), 1);
  }

  get usuariosPaginados(): Usuario[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.usuarios.slice(start, start + this.pageSize);
  }

  private ajustarPaginaActual(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  irPaginaAnterior(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  irPaginaSiguiente(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  abrirDialogoNuevo(): void {
    this.usuarioDialogo = {
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

    this.mostrarDialogo = true;
  }

  abrirDialogoEditar(usuario: Usuario): void {
    this.usuarioDialogo = {
      ...usuario,

      // Importante:
      // Dejamos la contraseña vacía para que no se muestre ni se modifique automáticamente.
      // Solo se actualizará si el admin escribe una nueva contraseña.
      passwordUsuario: '',
    };

    this.mostrarDialogo = true;
  }

  cerrarDialogo(): void {
    this.mostrarDialogo = false;
    this.usuarioDialogo = null;
  }

  guardarUsuario(result: Usuario): void {
    if (!this.usuarioDialogo) return;

    const esEdicion = !!result.idUsuario;

    if (esEdicion) {
      this.actualizarUsuario(result);
    } else {
      this.crearUsuario(result);
    }
  }

  private crearUsuario(result: Usuario): void {
    if (!result.passwordUsuario || result.passwordUsuario.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña requerida',
        text: 'Debes ingresar una contraseña para crear el usuario.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#f59e0b',
      });

      return;
    }

    const usuarioNuevo: Usuario = {
      ...result,
      idUsuario: null,
      passwordUsuario: bcrypt.hashSync(result.passwordUsuario.trim(), 12),
    };

    this.uS.insert(usuarioNuevo).subscribe({
      next: () => {
        this.uS.list().subscribe({
          next: (data) => {
            this.uS.setList(data);
            this.cerrarDialogo();

            Swal.fire({
              icon: 'success',
              title: 'Usuario creado',
              text: 'El usuario se creó correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#2563eb',
            });
          },
          error: (err) => {
            console.error('Error al recargar usuarios después de crear', err);

            Swal.fire({
              icon: 'warning',
              title: 'Usuario creado',
              text: 'El usuario se creó, pero no se pudo actualizar la lista automáticamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#f59e0b',
            });
          },
        });
      },
      error: (err) => {
        console.error('Error al crear usuario', err);

        Swal.fire({
          icon: 'error',
          title: 'Error al crear',
          text: 'No se pudo crear el usuario. Verifica que el correo o DNI no estén registrados.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626',
        });
      },
    });
  }

  private actualizarUsuario(result: Usuario): void {
    const usuarioOriginal = this.usuarios.find(
      (u) => u.idUsuario === result.idUsuario
    );

    if (!usuarioOriginal) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no encontrado',
        text: 'No se encontró el usuario seleccionado para actualizar.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc2626',
      });

      return;
    }

    const usuarioActualizado: Usuario = {
      ...usuarioOriginal,
      nameUsuario: result.nameUsuario,
      emailUsuario: result.emailUsuario,
      enabledUsuario: result.enabledUsuario,
      ageUsuario: result.ageUsuario,
      dniUsuario: result.dniUsuario,
      rolUsuario: result.rolUsuario,
      phoneUsuario: result.phoneUsuario,
    };

    // Si el campo contraseña viene vacío, se mantiene la contraseña anterior.
    // Si el admin escribe una nueva, se reemplaza por la nueva encriptada.
    if (result.passwordUsuario && result.passwordUsuario.trim() !== '') {
      usuarioActualizado.passwordUsuario = bcrypt.hashSync(
        result.passwordUsuario.trim(),
        12
      );
    }

    this.uS.update(usuarioActualizado).subscribe({
      next: () => {
        this.uS.list().subscribe({
          next: (data) => {
            this.uS.setList(data);
            this.cerrarDialogo();

            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              text: 'Los datos del usuario se actualizaron correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#2563eb',
            });
          },
          error: (err) => {
            console.error('Error al recargar usuarios después de actualizar', err);

            Swal.fire({
              icon: 'warning',
              title: 'Usuario actualizado',
              text: 'El usuario se actualizó, pero no se pudo actualizar la lista automáticamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#f59e0b',
            });
          },
        });
      },
      error: (err) => {
        console.error('Error al actualizar usuario', err);

        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'No se pudo actualizar el usuario. Verifica los datos e inténtalo nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc2626',
        });
      },
    });
  }

  eliminar(id: number | null): void {
    if (id == null) return;

    const usuarioEliminar = this.usuarios.find((u) => u.idUsuario === id);

    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: usuarioEliminar
        ? `Se eliminará el usuario "${usuarioEliminar.nameUsuario}". Esta acción no se puede deshacer.`
        : 'Se eliminará este usuario. Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.uS.delete(id).subscribe({
        next: () => {
          this.uS.list().subscribe({
            next: (data) => {
              this.uS.setList(data);

              Swal.fire({
                icon: 'success',
                title: 'Usuario eliminado',
                text: 'El usuario se eliminó correctamente.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2563eb',
              });
            },
            error: (err) => {
              console.error('Error al recargar usuarios después de eliminar', err);

              Swal.fire({
                icon: 'warning',
                title: 'Usuario eliminado',
                text: 'El usuario se eliminó, pero no se pudo actualizar la lista automáticamente.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#f59e0b',
              });
            },
          });
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);

          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: 'No se pudo eliminar el usuario. Puede tener información relacionada en el sistema.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#dc2626',
          });
        },
      });
    });
  }

  getIniciales(): string {
    const nombre = this.usuario?.nameUsuario?.trim() || 'Usuario';

    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}