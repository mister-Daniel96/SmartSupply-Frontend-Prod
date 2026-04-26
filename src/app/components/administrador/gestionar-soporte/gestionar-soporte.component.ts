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
  private uS = inject(UsuarioService);
  private sS = inject(SoporteService);
  private loginService = inject(LoginService);

  usuario = new Usuario();
  id = 0;

  soportes: Soporte[] = [];

  currentPage = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token gestionar soporte:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
    } else {
      console.error('No se pudo obtener el id del usuario desde el token');
    }

    this.cargarSoportes();

    this.sS.getList().subscribe((data) => {
      this.soportes = data;
      this.ajustarPaginaActual();
    });
  }

  private cargarUsuario(): void {
    this.uS.listId(this.id).subscribe({
      next: (data: Usuario) => {
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
      },
    });
  }

  private cargarSoportes(): void {
    this.sS.list().subscribe({
      next: (data: Soporte[]) => {
        this.soportes = data;
        this.sS.setList(data);
        this.ajustarPaginaActual();
      },
      error: (err) => {
        console.error('Error al listar soportes', err);
      },
    });
  }

  get totalPages(): number {
    return Math.max(Math.ceil(this.soportes.length / this.pageSize), 1);
  }

  get soportesPaginados(): Soporte[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.soportes.slice(start, start + this.pageSize);
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

  onPendienteChange(soporte: Soporte, event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevoValor = input.checked;
    const valorAnterior = soporte.pendienteSoporte;

    soporte.pendienteSoporte = nuevoValor;

    this.sS.update(soporte).subscribe({
      next: () => {
        console.log('Pendiente actualizado');
      },
      error: (err) => {
        console.error('Error al actualizar pendiente', err);
        soporte.pendienteSoporte = valorAnterior;
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