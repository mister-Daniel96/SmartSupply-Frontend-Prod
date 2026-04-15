/* import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  BaseChartDirective,
  provideCharts,
  withDefaultRegisterables,
} from 'ng2-charts';
import { UsuarioService } from '../../../services/usuario.service';
import { SoporteService } from '../../../services/soporte.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticuloService } from '../../../services/articulo.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Articulo } from '../../../models/articulo';
import { PredictionRequest } from '../../../models/predictionRequest';
import { PrediccionesService } from '../../../services/ConsultaPrediccionDemanda.service';
import {
  PrediccionDia,
  PredictionResponse,
} from '../../../models/predictionResponse';
import { ConsultaPrediccionDemanda } from '../../../models/ConsultaPrediccionDemanda';
import { ChartConfiguration } from 'chart.js';
import { Usuario } from '../../../models/usuario';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-prediccion',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatDatepickerToggle,
    MatIconModule,
    BaseChartDirective,
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,    MatButtonModule     

  ],
  templateUrl: './prediccion.component.html',
  styleUrls: ['./prediccion.component.css'],
  providers: [provideNativeDateAdapter(), DatePipe],
})
export class PrediccionComponent implements OnInit {
  form!: FormGroup;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  usuario = new Usuario();
  id = 0;
  listaArticulos: { value: number; viewValue: string }[] = [];
  today = new Date(); 
  limiteInicio: Date = new Date();
  limiteFinal: Date = new Date();
  isCargando = false;
  respuesta!: PredictionResponse;
  predicciones: PrediccionDia[] = []; 
  lineData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Predicción de demanda',
        data: [],
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
  }; 
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        border: { display: false },
        grid: {
          color: 'rgba(0,0,0,0.1)',
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          color: '#4b5563',
          font: {
            size: 12,
            weight: 400,
          },
        },
      },
      y: {
        min: 0,
        max: 10, 
        border: { display: false },
        grid: {
          color: 'rgba(0,0,0,0.1)',
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          color: '#6b7280',
          stepSize: 1,
          font: {
            size: 11,
            weight: 500,
          },
        },
      },
    },
  };

  constructor(
    private FormBuilder: FormBuilder,
    private uS: UsuarioService,
    public route: ActivatedRoute,
    private aS: ArticuloService,
    private router: Router,
    private pS: PrediccionesService,
    private datePipe: DatePipe
  ) {}
  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.id = Number(idParam);
    });
    this.uS.listId(this.id).subscribe((data) => {
      this.usuario = data;
    });
    this.aS.list().subscribe((data: Articulo[]) => {
      this.listaArticulos = data.map((a) => ({
        value: a.idArticulo,
        viewValue: a.nombreArticulo,
      }));
    });
    this.form = this.FormBuilder.group(
      {
        fechaInicio: ['', Validators.required],
        fechaFin: ['', Validators.required],
        nombreArticulo: ['', Validators.required],
      },
      { validators: this.dateRangeValidator }
    );

    this.limiteInicio.setDate(this.today.getDate() + 1);
  }
  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('fechaInicio')?.value;
    const end = group.get('fechaFin')?.value;

    if (!start || !end) return null; 

    return end >= start ? null : { dateRangeInvalid: true };
  }

  get fechaInicio() {
    return this.form.get('fechaInicio');
  }
  get fechaFin() {
    return this.form.get('fechaFin');
  }
  loading() {
    console.log('Click en predecir');
    this.isCargando = true;

    setTimeout(() => {
      console.log('Apagando loader');
      this.isCargando = false;
    }, 5000); 
  }
  private toISODate(d: Date): string {
    const date = new Date(d);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
  generarPrediccion() {
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fechaInicio, fechaFin, nombreArticulo } = this.form.value;

    
    const artOpcion = this.listaArticulos.find(
      (p) => p.value === nombreArticulo
    );

    const articulo = new Articulo();
    articulo.idArticulo = nombreArticulo;
    articulo.nombreArticulo = artOpcion ? artOpcion.viewValue : '';

    const consulta = new ConsultaPrediccionDemanda();
    consulta.articulo = articulo;
    consulta.fechaInicio = this.toISODate(fechaInicio); 
    consulta.fechaFin = this.toISODate(fechaFin);

    this.isCargando = true;

    
    this.pS.insert(consulta).subscribe({
      next: (resp) => {
        this.respuesta = resp; 
        this.predicciones = resp.predictions; 

        this.pS.setList(resp);

        console.log('Predicciones recibidas:', this.predicciones);
        this.actualizarGrafico(); 

        this.isCargando = false;
      },
      error: (err) => {
        console.error('Error al obtener predicción', err);
        this.isCargando = false;
      },
    });
  }

  private actualizarGrafico(): void {
    if (!this.predicciones.length) return;

    const labels = this.predicciones.map((p) =>
      new Date(p.fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      })
    );

    const data = this.predicciones.map((p) => p.demanda_pronosticada);
    const max = Math.max(...data, 0);
    const maxY = Math.ceil(max * 1.2) || 1;

    this.lineData = {
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
    };

    this.lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          border: { display: false },
          grid: {
            color: 'rgba(0,0,0,0.1)',
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            color: '#4b5563',
            font: {
              size: 12,
              weight: 400,
            },
          },
        },
        y: {
          min: 0,
          max: maxY,
          border: { display: false },
          grid: {
            color: 'rgba(0,0,0,0.1)',
            drawOnChartArea: true,
            drawTicks: true,
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
    };

    this.chart?.update();
  }
  exportarPredicciones() {
    if (!this.predicciones.length) return;

    const encabezados = ['Fecha', 'Tipo de artículo', 'Demanda pronosticada'];

    const filas = this.predicciones.map((p) => {
      const fecha = this.datePipe.transform(p.fecha, 'dd/MM/yyyy') ?? '';
      const tipo = (p.tipo_articulo_nombre ?? '')
        .toString()
        .replace(/"/g, '""');
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
 */