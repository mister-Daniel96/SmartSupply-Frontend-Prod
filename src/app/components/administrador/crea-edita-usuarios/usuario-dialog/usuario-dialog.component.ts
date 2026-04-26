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

  cancelar(): void {
    this.cerrar.emit();
  }

  guardar(): void {
    if (
      !this.data.nameUsuario?.trim() ||
      !this.data.emailUsuario?.trim() ||
      !this.data.rolUsuario?.trim()
    ) {
      return;
    }

    if (!this.data.idUsuario && !this.data.passwordUsuario?.trim()) {
      return;
    }

    this.guardarUsuario.emit(this.data);
  }
}