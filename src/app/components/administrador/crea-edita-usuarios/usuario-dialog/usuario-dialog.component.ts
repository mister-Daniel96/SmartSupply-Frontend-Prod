/* import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { Usuario } from '../../../../models/usuario';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.idUsuario ? 'Editar usuario' : 'Registrar usuario' }}
    </h2>

    <div mat-dialog-content>
      <form #formUsuario="ngForm">
        <mat-form-field
          appearance="outline"
          class="full-width"
          *ngIf="data.idUsuario"
        >
          <mat-label>ID</mat-label>
          <input
            matInput
            [ngModel]="data.idUsuario"
            name="idUsuario"
            disabled
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre de usuario</mat-label>
          <input
            matInput
            [(ngModel)]="data.nameUsuario"
            name="nameUsuario"
            required
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo</mat-label>
          <input
            matInput
            [(ngModel)]="data.emailUsuario"
            name="emailUsuario"
            type="email"
            required
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input
            matInput
            [(ngModel)]="data.passwordUsuario"
            name="passwordUsuario"
            type="password"
            [required]="!data.idUsuario" 
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Edad</mat-label>
          <input
            matInput
            [(ngModel)]="data.ageUsuario"
            name="ageUsuario"
            type="number"
            min="0"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>DNI</mat-label>
          <input
            matInput
            [(ngModel)]="data.dniUsuario"
            name="dniUsuario"
            type="number"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input
            matInput
            [(ngModel)]="data.phoneUsuario"
            name="phoneUsuario"
            type="tel"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rol</mat-label>
          <mat-select [(ngModel)]="data.rolUsuario" name="rolUsuario" required>
            <mat-option value="ADMIN">Administrador</mat-option>
            <mat-option value="CLIENTE">Cliente</mat-option>
            <mat-option value="SOPORTE">Soporte</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-slide-toggle
          [(ngModel)]="data.enabledUsuario"
          name="enabledUsuario"
        >
          Usuario activado
        </mat-slide-toggle>
      </form>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="guardar()"
        [disabled]="!formUsuario.form.valid"
      >
        Guardar
      </button>
    </div>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class UsuarioDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario
  ) {}

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    this.dialogRef.close(this.data);
  }
}
 */