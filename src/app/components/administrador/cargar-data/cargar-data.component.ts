/* import { Component, OnInit } from '@angular/core';
import {
  MatCardActions,
  MatCardContent,
  MatCard,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { UsuarioService } from '../../../services/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-cargar-data',
  standalone: true,
  imports: [MatCardActions, MatIcon, MatCardContent, MatCard],
  templateUrl: './cargar-data.component.html',
  styleUrl: './cargar-data.component.css',
})
export class CargarDataComponent implements OnInit {
  selectedFile: File | null = null;
  usuario = new Usuario();
  id = 0;
  constructor(private uS: UsuarioService, private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });

    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Archivo seleccionado:', this.selectedFile.name);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      console.log('Archivo dropeado:', this.selectedFile.name);
    }
  }

  onUpload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    // TODO: llamar a tu servicio HTTP
    console.log('Subiendo archivo...', this.selectedFile.name);
  }
  descargarPlantilla() {
    const url = 'plantillas/plantilla_historial_demanda.csv';

    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_historial_demanda.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
 */