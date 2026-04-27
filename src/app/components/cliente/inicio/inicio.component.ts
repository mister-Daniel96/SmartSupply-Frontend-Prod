

import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewChecked,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

import { ArticuloService } from '../../../services/articulo.service';
import { PrediccionesService } from '../../../services/ConsultaPrediccionDemanda.service';
import { UsuarioService } from '../../../services/usuario.service';
import { LoginService } from '../../../services/login.service';

import { Articulo } from '../../../models/articulo';
import { ConsultaPrediccionDemanda } from '../../../models/ConsultaPrediccionDemanda';
import {
  PredictionResponse,
  PrediccionDia,
} from '../../../models/predictionResponse';
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

interface GraficoArticulo {
  idArticulo: number;
  nombreArticulo: string;
  chartId: string;
  labels: string[];
  values: number[];
  borderColor: string;
  backgroundColor: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  providers: [DatePipe],
})
export class InicioComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  private articuloService = inject(ArticuloService);
  private prediccionesService = inject(PrediccionesService);
  private usuarioService = inject(UsuarioService);
  private loginService = inject(LoginService);
  private datePipe = inject(DatePipe);

  usuario: Usuario = new Usuario();
  id = 0;

  graficosDashboard: GraficoArticulo[] = [];
  isCargando = false;
  rangoTexto = '';

  private charts: Chart[] = [];
  private yaRenderizado = false;

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;

    if (this.id > 0) {
      this.cargarUsuario();
      this.cargarDashboard();
    }
  }

  ngAfterViewChecked(): void {
    if (!this.yaRenderizado && this.graficosDashboard.length) {
      this.yaRenderizado = true;
      setTimeout(() => this.renderizarGraficos(), 50);
    }
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  private cargarUsuario(): void {
    this.usuarioService.listId(this.id).subscribe({
      next: (data) => (this.usuario = data),
    });
  }

  private cargarDashboard(): void {
    this.articuloService.list().subscribe((articulos) => {
      if (!articulos?.length) return;

      const seleccionados = articulos.slice(0, 3);
      const { inicio, fin } = this.getRangoProximaSemana();

      this.cargarPredicciones(seleccionados, inicio, fin);
    });
  }

  private cargarPredicciones(
    articulos: Articulo[],
    inicio: Date,
    fin: Date
  ): void {
    const fechaInicioISO = this.toISODate(inicio);
    const fechaFinISO = this.toISODate(fin);

    this.rangoTexto = this.buildRangoTexto(inicio, fin);
    this.isCargando = true;
    this.graficosDashboard = [];
    this.destruirGraficos();
    this.yaRenderizado = false;

    const requests = articulos.map((art) => {
      const consulta = new ConsultaPrediccionDemanda();
      consulta.articulo = art;
      consulta.fechaInicio = fechaInicioISO;
      consulta.fechaFin = fechaFinISO;

      return this.prediccionesService.insert(consulta).pipe(
        catchError(() => of(null))
      );
    });

    forkJoin(requests).subscribe((responses) => {
      responses.forEach((resp, index) => {
        if (!resp) return;

        const art = articulos[index];
        const preds = (resp as PredictionResponse).predictions ?? [];

        if (!preds.length) return;

        this.graficosDashboard.push(
          this.crearGraficoDesdePredicciones(art, preds, index)
        );
      });

      this.isCargando = false;
    });
  }

  private buildRangoTexto(inicio: Date, fin: Date): string {
    const i = this.datePipe.transform(inicio, 'dd MMM') ?? '';
    const f = this.datePipe.transform(fin, 'dd MMM') ?? '';
    return `Predicción de la próxima semana (${i} al ${f})`;
  }

  private toISODate(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private getRangoProximaSemana() {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() + 7);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    return { inicio, fin };
  }

  private crearGraficoDesdePredicciones(
    articulo: Articulo,
    predicciones: PrediccionDia[],
    index: number
  ): GraficoArticulo {
    const palette = [
      { border: '#2563EB', background: 'rgba(37, 99, 235, 0.16)' },
      { border: '#16A34A', background: 'rgba(22, 163, 74, 0.16)' },
      { border: '#EA580C', background: 'rgba(234, 88, 12, 0.16)' },
    ];

    const colors = palette[index % palette.length];

    const labels = predicciones.map((p) =>
      new Date(p.fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      })
    );

    const values = predicciones.map((p) => Number(p.demanda_pronosticada) || 0);

    return {
      idArticulo: articulo.idArticulo ?? 0,
      nombreArticulo: articulo.nombreArticulo,
      chartId: `chart-articulo-${articulo.idArticulo ?? index}`,
      labels,
      values,
      borderColor: colors.border,
      backgroundColor: colors.background,
    };
  }

  private renderizarGraficos(): void {
    this.destruirGraficos();

    this.graficosDashboard.forEach((graf) => {
      const canvas = document.getElementById(
        graf.chartId
      ) as HTMLCanvasElement;

      if (!canvas) return;

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: graf.labels,
          datasets: [
            {
              data: graf.values,
              borderColor: graf.borderColor,
              backgroundColor: graf.backgroundColor,
              fill: true,
              tension: 0.35,
            },
          ],
        },
      };

      this.charts.push(new Chart(canvas, config));
    });
  }

  private destruirGraficos(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }
}