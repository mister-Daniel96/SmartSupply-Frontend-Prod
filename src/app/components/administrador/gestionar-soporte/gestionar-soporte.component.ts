import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { Soporte } from '../../../models/soporte';
import { Usuario } from '../../../models/usuario';

import { UsuarioService } from '../../../services/usuario.service';
import { SoporteService } from '../../../services/soporte.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-gestionar-soporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestionar-soporte.component.html',
  styleUrls: ['./gestionar-soporte.component.css'],
})
export class GestionarSoporteComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly soporteService = inject(SoporteService);
  private readonly loginService = inject(LoginService);

  usuario = new Usuario();
  id = 0;

  soportes: Soporte[] = [];

  currentPage = 1;
  readonly pageSize = 6;

  desplegableAbierto: number | null = null;

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;

    console.log('ID token gestionar soporte:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
    } else {
      console.error('No se pudo obtener el ID del usuario desde el token');
    }

    this.cargarSoportes();
  }

  private cargarUsuario(): void {
    this.usuarioService.listId(this.id).subscribe({
      next: (data: Usuario) => {
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar el usuario', err);
      },
    });
  }

  private cargarSoportes(): void {
    this.soporteService.list().subscribe({
      next: (data: Soporte[]) => {
        this.soportes = data;
        this.soporteService.setList(data);
        this.ajustarPaginaActual();
      },
      error: (err) => {
        console.error('Error al listar los soportes', err);
      },
    });
  }

  get totalPages(): number {
    return Math.max(
      Math.ceil(this.soportes.length / this.pageSize),
      1
    );
  }

  get soportesPaginados(): Soporte[] {
    const inicio = (this.currentPage - 1) * this.pageSize;
    const fin = inicio + this.pageSize;

    return this.soportes.slice(inicio, fin);
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
      this.desplegableAbierto = null;
    }
  }

  irPaginaSiguiente(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.desplegableAbierto = null;
    }
  }

  alternarDesplegable(idSoporte: number): void {
    this.desplegableAbierto =
      this.desplegableAbierto === idSoporte
        ? null
        : idSoporte;
  }

  seleccionarEstado(
    soporte: Soporte,
    nuevoValor: boolean
  ): void {
    const valorAnterior = soporte.pendienteSoporte;

    this.desplegableAbierto = null;

    if (nuevoValor === valorAnterior) {
      return;
    }

    soporte.pendienteSoporte = nuevoValor;

    this.soporteService.update(soporte).subscribe({
      next: () => {
        console.log(
          nuevoValor
            ? 'Soporte marcado como pendiente'
            : 'Soporte marcado como resuelto'
        );

        this.soporteService.setList([...this.soportes]);
      },
      error: (err) => {
        console.error(
          'Error al actualizar el estado del soporte',
          err
        );

        soporte.pendienteSoporte = valorAnterior;
      },
    });
  }

  getIniciales(): string {
    const nombre =
      this.usuario?.nameUsuario?.trim() || 'Usuario';

    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  }
}