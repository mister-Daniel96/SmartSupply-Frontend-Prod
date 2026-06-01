import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { LoginService } from './services/login.service';
import { SessionSecurityService } from './services/session-security.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'SmartSupply-Frontend-Prod';

  constructor(
    public route: ActivatedRoute,
    private loginService: LoginService,
    private sessionSecurityService: SessionSecurityService
  ) {}

  ngOnInit(): void {
    if (this.loginService.verificar()) {
      this.sessionSecurityService.start();
    }
  }
}