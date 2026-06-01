import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginService } from '../../services/login.service';
import { SessionSecurityService } from '../../services/session-security.service';
import { JwtRequest } from '../../models/jwtRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  hide = true;
  mensaje: string = '';
  form: FormGroup = new FormGroup({});

  constructor(
    private loginService: LoginService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sessionSecurityService: SessionSecurityService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nameUsuario: ['', Validators.required],
      passwordUsuario: ['', Validators.required],
    });

    this.route.queryParams.subscribe((params) => {
      if (params['authRequired']) {
        this.mensaje = 'Debe autenticarse para acceder.';
      }

      if (params['sessionExpired']) {
        this.mensaje =
          'Su sesión ha expirado por inactividad. Inicie sesión nuevamente.';
      }

      if (params['connectionLost']) {
        this.mensaje =
          'Se perdió la conexión a internet. Por seguridad, debe iniciar sesión nuevamente.';
      }

      this.cdr.markForCheck();
    });
  }

  clickEvent(event: Event): void {
    event.preventDefault();
    this.hide = !this.hide;
    this.cdr.markForCheck();
  }

  login(): void {
    this.mensaje = '';

    if (this.form.invalid) {
      this.mensaje = 'Completa los campos obligatorios';
      this.cdr.markForCheck();
      return;
    }

    const request = new JwtRequest();
    request.nameUsuario = this.form.value.nameUsuario.trim();
    request.passwordUsuario = this.form.value.passwordUsuario.trim();

    this.loginService.login(request).subscribe({
      next: (data: any) => {
        sessionStorage.setItem('token', data.jwttoken);

        // Inicia seguridad de sesión: inactividad + pérdida de conexión
        this.sessionSecurityService.start();

        const role = this.loginService.showRole();
        const id = this.loginService.showId();

        console.log('Rol:', role);
        console.log('Id:', id);

        if (role === 'CLIENTE') {
          console.log('entro cliente');
          this.router.navigate(['/cliente']);
        } else if (role === 'ADMINISTRADOR') {
          console.log('entro admin');
          this.router.navigate(['/administrador']);
        } else {
          this.mensaje = 'Rol no reconocido';
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.mensaje = 'Credenciales incorrectas';
        this.cdr.markForCheck();
      },
    });
  }
}