import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import * as bcrypt from 'bcryptjs';

import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.css'],
})
export class CuentaComponent implements OnInit {
  usuario = new Usuario();
  id = 0;
  form!: FormGroup;
  mostrarModalPassword = false;

  constructor(
    private uS: UsuarioService,
    private fb: FormBuilder,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      idUsuario: [0],
      nameUsuario: [''],
      emailUsuario: [''],
      enabledUsuario: [true],
      passwordUsuario: [''],
      ageUsuario: [''],
      dniUsuario: [''],
      rolUsuario: [''],
      phoneUsuario: [''],
    });

    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token:', this.id);

    if (this.id > 0) {
      this.getData();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el id del usuario desde el token',
      });
    }
  }

  getData(): void {
    console.log('Consultando usuario con id:', this.id);

    this.uS.listId(this.id).subscribe({
      next: (data) => {
        console.log('Usuario recibido:', data);
        this.usuario = data;

        this.form.patchValue({
          idUsuario: data.idUsuario ?? 0,
          nameUsuario: data.nameUsuario ?? '',
          emailUsuario: data.emailUsuario ?? '',
          enabledUsuario: data.enabledUsuario ?? true,
          ageUsuario: data.ageUsuario ?? '',
          dniUsuario: data.dniUsuario ?? '',
          rolUsuario: data.rolUsuario ?? '',
          phoneUsuario: data.phoneUsuario ?? '',
          passwordUsuario: '',
        });
      },
      error: (err) => {
        console.error('Error al obtener usuario', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del usuario',
        });
      },
    });
  }

  abrirModalPassword(): void {
    const passwordControl = this.form.get('passwordUsuario');

    this.mostrarModalPassword = true;

    passwordControl?.setValidators([
      Validators.required,
      Validators.minLength(8),
    ]);
    passwordControl?.setValue('');
    passwordControl?.setErrors(null);
    passwordControl?.markAsPristine();
    passwordControl?.markAsUntouched();
    passwordControl?.updateValueAndValidity();
  }

  cerrarModalPassword(): void {
    const passwordControl = this.form.get('passwordUsuario');

    this.mostrarModalPassword = false;
    passwordControl?.clearValidators();
    passwordControl?.setValue('');
    passwordControl?.setErrors(null);
    passwordControl?.markAsPristine();
    passwordControl?.markAsUntouched();
    passwordControl?.updateValueAndValidity();
  }

  aceptar(): void {
    const passwordControl = this.form.get('passwordUsuario');
    const passwordNueva = passwordControl?.value?.trim();

    if (!passwordNueva) {
      passwordControl?.setErrors({ required: true });
      passwordControl?.markAsTouched();
      return;
    }

    if (passwordNueva.length < 8) {
      passwordControl?.setErrors({ minlength: true });
      passwordControl?.markAsTouched();
      return;
    }

    const passwordHasheada = bcrypt.hashSync(passwordNueva, 12);

    const usuarioActualizado: Usuario = {
      ...this.usuario,
      passwordUsuario: passwordHasheada,
    };

    this.uS.update(usuarioActualizado).subscribe({
      next: () => {
        this.usuario = usuarioActualizado;

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Contraseña actualizada correctamente',
          showConfirmButton: false,
          timer: 2000,
        });

        this.cerrarModalPassword();
      },
      error: (err) => {
        console.error('Error al actualizar usuario', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la contraseña',
        });
      },
    });
  }

  getIniciales(): string {
    const nombre = this.form.get('nameUsuario')?.value || '';

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