/* import { Component, OnInit, signal } from '@angular/core';
import { Usuario } from '../../../models/usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SoporteService } from '../../../services/soporte.service';
import { Soporte } from '../../../models/soporte';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './soporte.component.html',
  styleUrl: './soporte.component.css',
})
export class SoporteComponent implements OnInit {
  readonly panelOpenState = signal(false);
  usuario = new Usuario();
  id = 0;
  form!: FormGroup;
  soporte = new Soporte();
  list: Soporte[] = [];
  constructor(
    private FormBuilder: FormBuilder,
    private uS: UsuarioService,
    private sS: SoporteService,
    public route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });

    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });

    this.form = this.FormBuilder.group({
      tituloSoporte: [''],
      descripcionSoporte: [''],
    });

    this.sS.list().subscribe((data) => {
      this.sS.setList(data); // actualizas el Subject
      this.list = data; // actualizas tu lista local
      console.log('Soportes cargados:', this.list);
    });
  }

  aceptar() {
    if (this.form.valid) {
      this.soporte.tituloSoporte = this.form.value.tituloSoporte;
      this.soporte.descripcionSoporte = this.form.value.descripcionSoporte;
      this.soporte.pendienteSoporte = true;
      this.soporte.fechaSoporte = new Date(Date.now());
      this.soporte.usuario.idUsuario = this.usuario.idUsuario;

      this.sS.insert(this.soporte).subscribe(() => {
        // Después del insert recargamos lista y actualizamos Subject
        this.sS.list().subscribe((data) => {
          this.sS.setList(data); // refresca todo el sistema
          this.list = data; // refresca este componente
        });

        // Opcional: limpiar formulario
        this.form.reset();
      });
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Incidencia registrada correctamente, Pronto lo solucionaremos',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }
}
 */