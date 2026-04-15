import {
  ChangeDetectionStrategy,
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
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
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
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      nameUsuario: ['', Validators.required],
      passwordUsuario: ['', Validators.required],
    });
  }

  clickEvent(event: Event) {
    event.preventDefault();
    this.hide = !this.hide;
  }

  login() {
    if (this.form.invalid) {
      this.mensaje = 'Completa los campos obligatorios';
      return;
    }

    const request = new JwtRequest();
    request.nameUsuario = this.form.value.nameUsuario.trim();
    request.passwordUsuario = this.form.value.passwordUsuario.trim();

    this.loginService.login(request).subscribe({
      next: (data: any) => {
        sessionStorage.setItem('token', data.jwttoken);

        const role = this.loginService.showRole();
        const id = this.loginService.showId();

        console.log('Rol:', role);
        console.log('Id:', id);

        if (role === 'CLIENTE') {
          console.log("entro cliente");
          this.router.navigate(['/cliente']);
        } else if (role === 'ADMINISTRADOR') {
                    console.log("entro admin");

          this.router.navigate(['/administrador/usuarios']);
        } else {
          this.mensaje = 'Rol no reconocido';
        }
      },
      error: () => {
        this.mensaje = 'Credenciales incorrectas';
      },
    });
  }
}