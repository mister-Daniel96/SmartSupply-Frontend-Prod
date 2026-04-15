/* import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { Faq } from '../../../models/faq';
import { FaqService } from '../../../services/faq.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatDivider,
    //,CommonModule   -->  este se usa para la version antigua
  ],
  templateUrl: './ayuda.component.html',
  styleUrl: './ayuda.component.css',
})
export class AyudaComponent implements OnInit {
  readonly panelOpenState = signal(false);
  usuario = new Usuario();
  id = 0;
  faqs: Faq[] = [];
  constructor(
    private fS: FaqService,
    private FormBuilder: FormBuilder,
    private uS: UsuarioService,

    public route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });
    this.fS.list().subscribe((data) => {
      this.faqs = data;
    });
    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });
  }
  descargarGuia() {
    const link = document.createElement('a');
    link.href = '/manuales/MANUAL_DE_USO.pdf'; 
    link.download = 'MANUAL_DE_USO.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
 */