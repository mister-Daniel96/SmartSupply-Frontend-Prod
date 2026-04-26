import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent {
  menuOpen = false;
  isMobile = false;

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

  constructor(private router: Router) {
    this.checkScreen();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreen();
  }

  private checkScreen(): void {
    this.isMobile = window.innerWidth < 1024;

    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  toggleSidenav(): void {
    if (this.isMobile) {
      this.menuOpen = !this.menuOpen;
    }
  }

  closeMenuOnMobile(): void {
    if (this.isMobile) {
      this.menuOpen = false;
    }
  }

  cerrar(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isLinkActive(ruta: string): boolean {
    return this.router.url.includes(ruta);
  }
}