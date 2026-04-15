/* import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, ViewChild } from '@angular/core';
import {
  MatSidenav,
  MatSidenavContent,
  MatSidenavContainer,
} from '@angular/material/sidenav';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
  RouterLink,
} from '@angular/router';
import { map, Observable, shareReplay, startWith } from 'rxjs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatSidenavContent,
    MatToolbar,
    RouterOutlet,
    MatIcon,
    MatListModule,
    MatSidenavContainer,
    MatSidenav,
    RouterLink,
  ],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css',
})
export class AdministradorComponent {
  id: number = 0;
  private breakpointObserver = inject(BreakpointObserver);
  @ViewChild('drawer') drawer!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      startWith(false), 
      shareReplay()
    );

  botones = [
    {
      texto: 'Gestionar usuarios',
      ruta: 'usuarios',
      icon: 'fa-solid fa-people-group',
    },
    {
      texto: 'Nueva data',
      ruta: 'cargar-data',
      icon: 'fa-solid fa-file-waveform',
    },
    {
      texto: 'Gestionar reportes',
      ruta: 'gestionar-soporte',
      icon: 'fa-solid fa-circle-user',
    },
  ];

  constructor(public route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((data) => {
      this.id = +data['id'];
    });
  }

  cerrar() {
    sessionStorage.clear();
  }

  toggleSidenav(): void {
    if (window.innerWidth < 960) {
      this.drawer.toggle();
    }
  }

  isLinkActive(ruta: string): boolean {
    return this.router.url.includes(ruta);
  }
}
 */