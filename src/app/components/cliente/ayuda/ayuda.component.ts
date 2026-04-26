import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Faq } from '../../../models/faq';
import { Usuario } from '../../../models/usuario';
import { FaqService } from '../../../services/faq.service';
import { UsuarioService } from '../../../services/usuario.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.css'],
})
export class AyudaComponent implements OnInit {
  usuario = new Usuario();
  id = 0;
  faqs: Faq[] = [];
  faqAbierto: number | null = null;

  constructor(
    private fS: FaqService,
    private uS: UsuarioService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;

    this.cargarFaqs();

    if (this.id > 0) {
      this.cargarUsuario();
    }
  }

  cargarFaqs(): void {
    this.fS.list().subscribe({
      next: (data) => {
        this.faqs = data ?? [];
      },
      error: (err) => {
        console.error('Error al cargar FAQs', err);
        this.faqs = [];
      },
    });
  }

  cargarUsuario(): void {
    this.uS.listId(this.id).subscribe({
      next: (data) => {
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
      },
    });
  }

  toggleFaq(index: number): void {
    this.faqAbierto = this.faqAbierto === index ? null : index;
  }

  descargarGuia(): void {
    const link = document.createElement('a');
    link.href = '/manuales/MANUAL_DE_USO.pdf';
    link.download = 'MANUAL_DE_USO.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getIniciales(): string {
    const nombre = this.usuario?.nameUsuario || '';

    return (
      nombre
        .split(' ')
        .filter((x: string) => x.trim().length > 0)
        .map((x: string) => x.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('') || 'U'
    );
  }
}