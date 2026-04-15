/* import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PrediccionesService } from '../../../services/ConsultaPrediccionDemanda.service';
import { ConsultaPrediccionDemanda } from '../../../models/ConsultaPrediccionDemanda';
import { CommonModule, DatePipe } from '@angular/common';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css',
})
export class HistorialComponent implements OnInit {
  consultas: ConsultaPrediccionDemanda[] = [];
  id = 0;
  usuario = new Usuario();
  constructor(
    private uS: UsuarioService,
    public route: ActivatedRoute,
    private router: Router,
    private pS: PrediccionesService
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });
    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });
    this.listarConsultas();
    console.log(this.consultas);
  }

  listarConsultas(): void {
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
 */