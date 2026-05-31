import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../../models/usuario';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-dialog.component.html',
})
export class UsuarioDialogComponent {
  @Input() data: Usuario = {
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

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardarUsuario = new EventEmitter<Usuario>();

  errores: string[] = [];

  cancelar(): void {
    this.cerrar.emit();
  }

  guardar(): void {
    this.errores = [];

    const nombre = this.data.nameUsuario?.trim() || '';
    const email = this.data.emailUsuario?.trim() || '';
    const password = this.data.passwordUsuario?.trim() || '';
    const rol = this.data.rolUsuario?.trim() || '';
    const telefono = this.data.phoneUsuario?.trim() || '';
    const dni = String(this.data.dniUsuario || '').trim();
    const edad = Number(this.data.ageUsuario);

    if (!nombre) {
      this.errores.push('El nombre es obligatorio.');
    } else if (nombre.length < 3) {
      this.errores.push('El nombre debe tener al menos 3 caracteres.');
    }

    if (!email) {
      this.errores.push('El correo es obligatorio.');
    } else if (!this.esEmailValido(email)) {
      this.errores.push('El correo no tiene un formato válido.');
    }

    if (!dni) {
      this.errores.push('El DNI es obligatorio.');
    } else if (!/^\d{8}$/.test(dni)) {
      this.errores.push('El DNI debe tener exactamente 8 dígitos.');
    }

    if (!edad || edad <= 0) {
      this.errores.push('La edad es obligatoria.');
    } else if (edad < 18 || edad > 100) {
      this.errores.push('La edad debe estar entre 18 y 100 años.');
    }

    if (!telefono) {
      this.errores.push('El teléfono es obligatorio.');
    } else if (!/^9\d{8}$/.test(telefono)) {
      this.errores.push('El teléfono debe tener 9 dígitos y empezar con 9.');
    }

    if (!rol) {
      this.errores.push('El rol es obligatorio.');
    }

    // Solo exigir contraseña cuando se crea un usuario nuevo
    if (!this.data.idUsuario) {
      if (!password) {
        this.errores.push('La contraseña es obligatoria.');
      } else if (!this.esPasswordSegura(password)) {
        this.errores.push(
          'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
        );
      }
    }

    if (this.errores.length > 0) {
      return;
    }

    const usuarioGuardar: Usuario = {
      ...this.data,
      nameUsuario: nombre,
      emailUsuario: email,
      passwordUsuario: password,
      rolUsuario: rol,
      phoneUsuario: telefono,
      dniUsuario: Number(dni),
      ageUsuario: edad,
    };

    // En creación, asegúrate de no mandar ID
    if (!usuarioGuardar.idUsuario) {
      usuarioGuardar.idUsuario = null;
    }

    this.guardarUsuario.emit(usuarioGuardar);
  }

  private esEmailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private esPasswordSegura(password: string): boolean {
    const tieneMinimo8 = password.length >= 8;
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneNumero = /\d/.test(password);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(password);

    return (
      tieneMinimo8 &&
      tieneMayuscula &&
      tieneMinuscula &&
      tieneNumero &&
      tieneEspecial
    );
  }
}