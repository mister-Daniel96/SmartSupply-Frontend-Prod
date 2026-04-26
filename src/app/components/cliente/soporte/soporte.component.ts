import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

import { Usuario } from '../../../models/usuario';
import { Soporte } from '../../../models/soporte';
import { UsuarioService } from '../../../services/usuario.service';
import { SoporteService } from '../../../services/soporte.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css'],
})
export class SoporteComponent implements OnInit {
  usuario = new Usuario();
  id = 0;
  form!: FormGroup;
  list: Soporte[] = [];

  constructor(
    private fb: FormBuilder,
    private uS: UsuarioService,
    private sS: SoporteService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      tituloSoporte: ['', Validators.required],
      descripcionSoporte: ['', Validators.required],
    });

    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token soporte:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
      this.cargarSoportes();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el id del usuario desde el token',
      });
    }
  }

  cargarUsuario(): void {
    this.uS.listId(this.id).subscribe({
      next: (data) => {
        console.log('Usuario soporte:', data);
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del usuario',
        });
      },
    });
  }

  cargarSoportes(): void {
    this.sS.list().subscribe({
      next: (data) => {
        this.sS.setList(data);
        this.list = data;
        console.log('Soportes cargados:', this.list);
      },
      error: (err) => {
        console.error('Error al cargar soportes', err);
      },
    });
  }

  aceptar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.usuario?.idUsuario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al usuario que reporta la incidencia',
      });
      return;
    }

    const soporte = new Soporte();
    soporte.tituloSoporte = this.form.value.tituloSoporte.trim();
    soporte.descripcionSoporte = this.form.value.descripcionSoporte.trim();
    soporte.pendienteSoporte = true;
    soporte.fechaSoporte = new Date();

    soporte.usuario = new Usuario();
    soporte.usuario.idUsuario = this.usuario.idUsuario;

    this.sS.insert(soporte).subscribe({
      next: () => {
        this.form.reset();
        this.cargarSoportes();

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Incidencia registrada correctamente',
          text: 'Pronto revisaremos tu reporte.',
          showConfirmButton: false,
          timer: 3000,
        });
      },
      error: (err) => {
        console.error('Error al registrar soporte', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar la incidencia',
        });
      },
    });
  }

  cancelar(): void {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
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