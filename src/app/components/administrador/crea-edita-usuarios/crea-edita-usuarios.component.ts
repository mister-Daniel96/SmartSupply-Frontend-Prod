import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import * as bcrypt from 'bcryptjs';

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
      const usuarioOriginal = this.usuarios.find(
        (u) => u.idUsuario === result.idUsuario
      );

      if (!usuarioOriginal) return;

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

      if (result.passwordUsuario && result.passwordUsuario.trim() !== '') {
        usuarioActualizado.passwordUsuario = bcrypt.hashSync(
          result.passwordUsuario.trim(),
          12
        );
      }

      this.uS.update(usuarioActualizado).subscribe({
        next: () => {
          this.uS.list().subscribe((data) => {
            this.uS.setList(data);
            this.cerrarDialogo();
          });
        },
        error: (err) => {
          console.error('Error al actualizar usuario', err);
        },
      });
    } else {
      if (!result.passwordUsuario || result.passwordUsuario.trim() === '') {
        console.warn('Contraseña vacía, no se creará el usuario.');
        return;
      }

      const usuarioNuevo: Usuario = {
        ...result,
        idUsuario: null,
        passwordUsuario: bcrypt.hashSync(result.passwordUsuario.trim(), 12),
      };

      this.uS.insert(usuarioNuevo).subscribe({
        next: () => {
          this.uS.list().subscribe((data) => {
            this.uS.setList(data);
            this.cerrarDialogo();
          });
        },
        error: (err) => {
          console.error('Error al crear usuario', err);
        },
      });
    }
  }

  eliminar(id: number | null): void {
    if (id == null) return;

    this.uS.delete(id).subscribe({
      next: () => {
        this.uS.list().subscribe((data) => {
          this.uS.setList(data);
        });
      },
      error: (err) => {
        console.error('Error al eliminar usuario', err);
      },
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