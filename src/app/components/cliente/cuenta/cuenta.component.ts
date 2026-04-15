/* import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import Swal from 'sweetalert2'

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.css',
})
export class CuentaComponent implements OnInit {
  usuario = new Usuario();
  id = 0;
  form!: FormGroup;
  flagPassword: boolean = true;

  constructor(
    private uS: UsuarioService,
    private FormBuilder: FormBuilder,

    public route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });
    this.form = this.FormBuilder.group({
      idUsuario: [],
      nameUsuario: [''],
      emailUsuario: [''],
      enabledUsuario: [],
      passwordUsuario: [],
      ageUsuario: [''],
      dniUsuario: [''],
      rolUsuario: [''],
      phoneUsuario: [''],
    });

    this.getDate();
  }

  getDate() {
    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
      this.form.patchValue({
        idUsuario: data.idUsuario,
        nameUsuario: data.nameUsuario,
        emailUsuario: data.emailUsuario,
        enabledUsuario: data.enabledUsuario,
        ageUsuario: data.ageUsuario,
        dniUsuario: data.dniUsuario,
        rolUsuario: data.rolUsuario,
        phoneUsuario: data.phoneUsuario,
        passwordUsuario: data.passwordUsuario,
      });
    });
  }



  aceptar() {
    if (this.form.valid) {
      if (this.form.value.passwordUsuario.length > 16) {
        this.usuario.passwordUsuario = this.form.value.passwordUsuario;
      } else {
        this.usuario.passwordUsuario = bcrypt.hashSync(
          this.form.value.passwordUsuario.trim(),
          12
        );
      }

      this.uS.update(this.usuario).subscribe((data) => {
        this.uS.list().subscribe((data) => {
          this.uS.setList(data);
        });
      });
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Contraseña actualizada correctamente',
        showConfirmButton: false,
        timer: 2000,
      });
      this.changeFlagPassword();
    } else {
      console.log('no entro');
    }
  }
    changeFlagPassword() {
    this.flagPassword = !this.flagPassword;
  }
}
 */