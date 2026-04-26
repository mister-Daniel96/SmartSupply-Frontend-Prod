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
        this.consultas = data;
      },
      error: (err) => {
        console.error('Error al listar consultas', err);
      },
    });
  }
}