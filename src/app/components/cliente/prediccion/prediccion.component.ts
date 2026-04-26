import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  Chart,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import { UsuarioService } from '../../../services/usuario.service';
import { ArticuloService } from '../../../services/articulo.service';
import { PrediccionesService } from '../../../services/ConsultaPrediccionDemanda.service';
import { LoginService } from '../../../services/login.service';

import { Articulo } from '../../../models/articulo';
import { PredictionResponse, PrediccionDia } from '../../../models/predictionResponse';
import { ConsultaPrediccionDemanda } from '../../../models/ConsultaPrediccionDemanda';
import { Usuario } from '../../../models/usuario';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-prediccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prediccion.component.html',
  styleUrls: ['./prediccion.component.css'],
  providers: [DatePipe],
})
export class PrediccionComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private uS = inject(UsuarioService);
  private aS = inject(ArticuloService);
  private pS = inject(PrediccionesService);
  private loginService = inject(LoginService);
  private datePipe = inject(DatePipe);

  form!: FormGroup;

  usuario: Usuario = new Usuario();
  id = 0;

  listaArticulos: { value: number; viewValue: string }[] = [];
  today = new Date();
  limiteInicio: Date = new Date();

  isCargando = false;
  respuesta!: PredictionResponse;
  predicciones: PrediccionDia[] = [];

  private chart: Chart | null = null;
  readonly chartId = 'prediccion-line-chart';

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        fechaInicio: ['', Validators.required],
        fechaFin: ['', Validators.required],
        nombreArticulo: ['', Validators.required],
      },
      { validators: this.dateRangeValidator }
    );

    this.limiteInicio.setDate(this.today.getDate() + 1);

    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token predicción:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
      this.cargarArticulos();
    } else {
      console.error('No se pudo obtener el id del usuario desde el token');
    }
  }

  ngOnDestroy(): void {
    this.destruirGrafico();
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

  private cargarArticulos(): void {
    this.aS.list().subscribe({
      next: (data: Articulo[]) => {
        this.listaArticulos = data.map((a) => ({
          value: a.idArticulo!,
          viewValue: a.nombreArticulo,
        }));
        console.log(this.listaArticulos);
      },
      error: (err) => {
        console.error('Error al cargar artículos', err);
      },
    });
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('fechaInicio')?.value;
    const end = control.get('fechaFin')?.value;

    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    return endDate >= startDate ? null : { dateRangeInvalid: true };
  }

  get fechaInicio() {
    return this.form.get('fechaInicio');
  }

  get fechaFin() {
    return this.form.get('fechaFin');
  }

  get nombreArticulo() {
    return this.form.get('nombreArticulo');
  }

  toISODate(d: Date | string): string {
  const date = new Date(d);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

  generarPrediccion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fechaInicio, fechaFin, nombreArticulo } = this.form.value;

    const artOpcion = this.listaArticulos.find(
      (p) => p.value === Number(nombreArticulo)
    );

    const articulo = new Articulo();
    articulo.idArticulo = Number(nombreArticulo);
    articulo.nombreArticulo = artOpcion ? artOpcion.viewValue : '';

    const consulta = new ConsultaPrediccionDemanda();
    consulta.articulo = articulo;
    consulta.fechaInicio = this.toISODate(fechaInicio);
    consulta.fechaFin = this.toISODate(fechaFin);

    this.isCargando = true;
    this.predicciones = [];
    this.destruirGrafico();

    this.pS.insert(consulta).subscribe({
      next: (resp: PredictionResponse) => {
        this.respuesta = resp;
        this.predicciones = resp.predictions ?? [];
        this.pS.setList(resp);

        this.isCargando = false;
        setTimeout(() => this.renderizarGrafico(), 0);
      },
      error: (err) => {
        console.error('Error al obtener predicción', err);
        this.isCargando = false;
      },
    });
  }

  private renderizarGrafico(): void {
    if (!this.predicciones.length) return;

    const canvas = document.getElementById(this.chartId) as HTMLCanvasElement | null;
    if (!canvas) return;

    this.destruirGrafico();

    const labels = this.predicciones.map((p) =>
      new Date(p.fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      })
    );

    const data = this.predicciones.map((p) => Number(p.demanda_pronosticada) || 0);
    const max = Math.max(...data, 0);
    const maxY = Math.max(Math.ceil(max * 1.2), 1);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Predicción de demanda',
            data,
            tension: 0.35,
            borderColor: '#1D4ED8',
            backgroundColor: 'rgba(29, 78, 216, 0.15)',
            pointBackgroundColor: '#1D4ED8',
            pointBorderColor: '#ffffff',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 10,
            displayColors: false,
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: {
              color: 'rgba(0,0,0,0.08)',
            },
            ticks: {
              color: '#4b5563',
              font: {
                size: 12,
              },
            },
          },
          y: {
            min: 0,
            max: maxY,
            border: { display: false },
            grid: {
              color: 'rgba(0,0,0,0.08)',
            },
            ticks: {
              color: '#6b7280',
              stepSize: Math.max(Math.round(maxY / 6), 1),
              font: {
                size: 11,
                weight: 500,
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(canvas, config);
  }

  private destruirGrafico(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  exportarPredicciones(): void {
    if (!this.predicciones.length) return;

    const encabezados = ['Fecha', 'Tipo de artículo', 'Demanda pronosticada'];

    const filas = this.predicciones.map((p) => {
      const fecha = this.datePipe.transform(p.fecha, 'dd/MM/yyyy') ?? '';
      const tipo = (p.tipo_articulo_nombre ?? '').toString().replace(/"/g, '""');
      const demanda =
        p.demanda_pronosticada?.toString().replace(/"/g, '""') ?? '';

      return `"${fecha}","${tipo}","${demanda}"`;
    });

    const csvContent = [encabezados.join(','), ...filas].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'predicciones.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}