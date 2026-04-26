import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import * as XLSX from 'xlsx';

import { Usuario } from '../../../models/usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-cargar-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cargar-data.component.html',
  styleUrls: ['./cargar-data.component.css'],
})
export class CargarDataComponent implements OnInit {
  private uS = inject(UsuarioService);
  private loginService = inject(LoginService);

  selectedFile: File | null = null;
  usuario = new Usuario();
  id = 0;

  isUploading = false;
  isPreviewLoading = false;

  previewHeaders: string[] = [];
  previewRows: Record<string, any>[] = [];
  previewError = '';

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token cargar data:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
    } else {
      console.error('No se pudo obtener el id del usuario desde el token');
    }
  }

  private cargarUsuario(): void {
    this.uS.listId(this.id).subscribe({
      next: (data: Usuario) => {
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
      },
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;
    if (this.selectedFile || this.isUploading || this.isPreviewLoading) return;

    const file = input.files[0];
    await this.procesarArchivo(file);

    input.value = '';
  }

  async onFileDrop(event: DragEvent): Promise<void> {
    event.preventDefault();

    if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;
    if (this.selectedFile || this.isUploading || this.isPreviewLoading) return;

    const file = event.dataTransfer.files[0];
    await this.procesarArchivo(file);
  }

  async reemplazarArchivo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;
    if (this.isUploading || this.isPreviewLoading) return;

    const file = input.files[0];
    await this.procesarArchivo(file);

    input.value = '';
  }

  private async procesarArchivo(file: File): Promise<void> {
    this.selectedFile = file;
    this.previewHeaders = [];
    this.previewRows = [];
    this.previewError = '';
    this.isPreviewLoading = true;

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv') {
        await this.generarPreviewCSV(file);
      } else if (extension === 'xlsx' || extension === 'xls') {
        await this.generarPreviewExcel(file);
      } else {
        this.previewError =
          'Formato no soportado. Solo se permiten archivos .csv, .xlsx o .xls';
      }

      if (this.previewError) {
        this.selectedFile = null;
      }
    } catch (error) {
      console.error('Error al generar vista previa', error);
      this.previewError = 'No se pudo generar la vista previa del archivo.';
      this.selectedFile = null;
    } finally {
      this.isPreviewLoading = false;
    }
  }

  private async generarPreviewCSV(file: File): Promise<void> {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (!lines.length) {
      this.previewError = 'El archivo CSV está vacío.';
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());

    const rows = lines.slice(1, 11).map((line) => {
      const values = line.split(',');
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() ?? '';
      });

      return row;
    });

    this.previewHeaders = headers;
    this.previewRows = rows;
  }

  private async generarPreviewExcel(file: File): Promise<void> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: '',
    });

    if (!jsonData.length) {
      this.previewError = 'El archivo Excel está vacío.';
      return;
    }

    this.previewHeaders = Object.keys(jsonData[0]);
    this.previewRows = jsonData.slice(0, 10);
  }

  onUpload(): void {
    if (!this.selectedFile || this.isUploading || this.isPreviewLoading) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    console.log('Subiendo archivo...', this.selectedFile.name);

    setTimeout(() => {
      console.log('Archivo cargado correctamente');
      this.isUploading = false;
      this.limpiarArchivo();
    }, 2500);
  }

  limpiarArchivo(): void {
    if (this.isUploading) return;

    this.selectedFile = null;
    this.previewHeaders = [];
    this.previewRows = [];
    this.previewError = '';
    this.isPreviewLoading = false;
  }

  descargarPlantilla(): void {
    const url = 'plantillas/plantilla_historial_demanda.csv';

    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_historial_demanda.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getIniciales(): string {
    const nombre = this.usuario?.nameUsuario?.trim() || 'Usuario';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }

  getFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}