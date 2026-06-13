import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { UsuarioService } from '../../../services/usuario.service';
import { PrediccionesService } from '../../../services/ConsultaPrediccionDemanda.service';
import { LoginService } from '../../../services/login.service';

import { ConsultaPrediccionDemanda } from '../../../models/ConsultaPrediccionDemanda';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
  providers: [DatePipe],
})
export class HistorialComponent implements OnInit {
  private uS = inject(UsuarioService);
  private pS = inject(PrediccionesService);
  private loginService = inject(LoginService);

  consultas: ConsultaPrediccionDemanda[] = [];
  id = 0;
  usuario: Usuario = new Usuario();

  // Paginador
  paginaActual: number = 1;
  registrosPorPagina: number = 10;

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token historial:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
      this.listarConsultas();
    } else {
      console.error('No se pudo obtener el id del usuario desde el token');
    }
  }

  private cargarUsuario(): void {
    this.uS.listId(this.id).subscribe({
      next: (data: Usuario) => {
        console.log('Usuario historial:', data);
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
      },
    });
  }

  private listarConsultas(): void {
    this.pS.list().subscribe({
      next: (data: ConsultaPrediccionDemanda[]) => {
        console.log('Consultas recibidas:', data);

        this.consultas = data ?? [];

        // Cada vez que se cargan datos, volvemos a la primera página
        this.paginaActual = 1;
      },
      error: (err) => {
        console.error('Error al listar consultas', err);
        this.consultas = [];
      },
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.consultas.length / this.registrosPorPagina) || 1;
  }

  get indiceInicial(): number {
    return (this.paginaActual - 1) * this.registrosPorPagina;
  }

  get indiceFinal(): number {
    const final = this.indiceInicial + this.registrosPorPagina;
    return final > this.consultas.length ? this.consultas.length : final;
  }

  get consultasPaginadas(): ConsultaPrediccionDemanda[] {
    return this.consultas.slice(this.indiceInicial, this.indiceFinal);
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  getIniciales(): string {
    const nombre = this.usuario?.nameUsuario || '';

    return (
      nombre
        .split(' ')
        .filter((x: string) => x.trim().length > 0)
        .map((x: string) => x.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('') || 'U'
    );
  }
}
