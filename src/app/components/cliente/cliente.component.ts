import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css',
})
export class ClienteComponent {
  menuOpen = false;
  isMobile = window.innerWidth < 1024;

  botones = [
    { texto: 'Inicio', ruta: 'inicio', icon: 'fa-solid fa-house' },
    {
      texto: 'Ventas',
      ruta: 'predicciones',
      icon: 'fa-solid fa-cash-register',
    },
    {
      texto: 'Predicciones',
      ruta: 'predicciones',
      icon: 'fa-solid fa-file-waveform',
    },
    {
      texto: 'Ver Cuenta',
      ruta: 'cuenta',
      icon: 'fa-solid fa-circle-user',
    },
    {
      texto: 'Historial',
      ruta: 'historial',
      icon: 'fa-solid fa-database',
    },
    {
      texto: 'Soporte',
      ruta: 'soporte',
      icon: 'fa-solid fa-triangle-exclamation',
    },
    {
      texto: 'Ayuda',
      ruta: 'ayuda',
      icon: 'fa-solid fa-circle-question',
    },
  ];

  constructor(private router: Router) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1024;

    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  cerrar() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleSidenav() {
    if (this.isMobile) {
      this.menuOpen = !this.menuOpen;
    }
  }

  closeMenuOnMobile() {
    if (this.isMobile) {
      this.menuOpen = false;
    }
  }

  isLinkActive(ruta: string): boolean {
    return this.router.url.includes(ruta);
  }
}
