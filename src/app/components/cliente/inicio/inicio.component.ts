import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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

interface PrediccionCacheItem {
  idArticulo: number;
  nombreArticulo: string;
  predicciones: PrediccionDia[];
}

interface DashboardCache {
  semanaInicio: string;
  semanaFin: string;
  items: PrediccionCacheItem[];
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  providers: [DatePipe],
})
export class InicioComponent implements OnInit, OnDestroy {
  private readonly CACHE_KEY = 'smartsupply_dashboard_predicciones';
  private readonly MAX_ARTICULOS = 3;

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

  ngOnInit(): void {
    this.id = Number(this.loginService.showId()) || 0;
    console.log('ID token inicio:', this.id);

    if (this.id > 0) {
      this.cargarUsuario();
      this.cargarDashboard();
    } else {
      console.error('No se pudo obtener el id del usuario desde el token');
    }
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  private cargarUsuario(): void {
    this.usuarioService.listId(this.id).subscribe({
      next: (data: Usuario) => {
        console.log('Usuario inicio:', data);
        this.usuario = data;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
      },
    });
  }

  private cargarDashboard(): void {
    this.articuloService.list().subscribe({
      next: (articulos: Articulo[]) => {
        if (!articulos || !articulos.length) {
          this.graficosDashboard = [];
          return;
        }

        const articulosSeleccionados = articulos.slice(0, this.MAX_ARTICULOS);
        const { inicio, fin } = this.getRangoProximaSemana();

        const cargadoDesdeCache = this.intentarCargarDesdeCache(inicio, fin);

        if (!cargadoDesdeCache) {
          this.cargarPredicciones(articulosSeleccionados, inicio, fin);
        } else {
          setTimeout(() => this.renderizarGraficos(), 0);
        }
      },
      error: (err) => {
        console.error('Error al obtener artículos', err);
        this.graficosDashboard = [];
      },
    });
  }

  private cargarPredicciones(
    articulos: Articulo[],
    inicio: Date,
    fin: Date
  ): void {
    if (!articulos.length) {
      this.graficosDashboard = [];
      return;
    }

    const fechaInicioISO = this.toISODate(inicio);
    const fechaFinISO = this.toISODate(fin);

    this.rangoTexto = this.buildRangoTexto(inicio, fin);
    this.isCargando = true;
    this.graficosDashboard = [];
    this.destruirGraficos();

    const requests = articulos.map((art) => {
      const consulta = new ConsultaPrediccionDemanda();
      consulta.articulo = art;
      consulta.fechaInicio = fechaInicioISO;
      consulta.fechaFin = fechaFinISO;

      return this.prediccionesService.insert(consulta).pipe(
        catchError((error) => {
          console.error(
            `Error al obtener predicción para ${art.nombreArticulo}`,
            error
          );
          return of(null);
        })
      );
    });

    forkJoin(requests).subscribe({
      next: (responses) => {
        const cacheItems: PrediccionCacheItem[] = [];

        responses.forEach((resp, index) => {
          if (!resp) return;

          const art = articulos[index];
          const predicciones = (resp as PredictionResponse).predictions ?? [];

          if (!predicciones.length || art.idArticulo == null) return;

          this.graficosDashboard.push(
            this.crearGraficoDesdePredicciones(art, predicciones, index)
          );

          cacheItems.push({
            idArticulo: art.idArticulo,
            nombreArticulo: art.nombreArticulo,
            predicciones,
          });
        });

        if (cacheItems.length) {
          const cache: DashboardCache = {
            semanaInicio: fechaInicioISO,
            semanaFin: fechaFinISO,
            items: cacheItems,
          };

          localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        }

        this.isCargando = false;
        setTimeout(() => this.renderizarGraficos(), 0);
      },
      error: (err) => {
        console.error('Error general al cargar predicciones', err);
        this.isCargando = false;
      },
    });
  }

  private intentarCargarDesdeCache(inicio: Date, fin: Date): boolean {
    const raw = localStorage.getItem(this.CACHE_KEY);

    if (!raw) {
      return false;
    }

    let cache: DashboardCache;

    try {
      cache = JSON.parse(raw) as DashboardCache;
    } catch (error) {
      console.warn('Cache inválido, se ignora', error);
      localStorage.removeItem(this.CACHE_KEY);
      return false;
    }

    const semanaInicio = this.toISODate(inicio);
    const semanaFin = this.toISODate(fin);

    if (
      cache.semanaInicio !== semanaInicio ||
      cache.semanaFin !== semanaFin ||
      !cache.items?.length
    ) {
      return false;
    }

    this.rangoTexto = this.buildRangoTexto(inicio, fin);
    this.destruirGraficos();

    this.graficosDashboard = cache.items.map((item, index) =>
      this.crearGraficoDesdePredicciones(
        {
          idArticulo: item.idArticulo,
          nombreArticulo: item.nombreArticulo,
        } as Articulo,
        item.predicciones,
        index
      )
    );

    this.isCargando = false;
    return true;
  }

  private getRangoProximaSemana(): { inicio: Date; fin: Date } {
    const hoy = new Date();

    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() + 7);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    return { inicio, fin };
  }

  private buildRangoTexto(inicio: Date, fin: Date): string {
    const inicioTxt =
      this.datePipe.transform(inicio, 'dd MMM', undefined, 'es-PE') ?? '';
    const finTxt =
      this.datePipe.transform(fin, 'dd MMM', undefined, 'es-PE') ?? '';

    return `Predicción de la próxima semana (${inicioTxt} al ${finTxt})`;
  }

  private toISODate(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
      ) as HTMLCanvasElement | null;

      if (!canvas) return;

      const max = Math.max(...graf.values, 0);
      const maxY = Math.max(Math.ceil(max * 1.2), 1);

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: graf.labels,
          datasets: [
            {
              label: 'Demanda pronosticada',
              data: graf.values,
              fill: true,
              tension: 0.35,
              borderColor: graf.borderColor,
              backgroundColor: graf.backgroundColor,
              pointBackgroundColor: graf.borderColor,
              pointBorderColor: '#ffffff',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
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
              border: {
                display: false,
              },
              grid: {
                color: 'rgba(0,0,0,0.05)',
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                },
              },
            },
            y: {
              min: 0,
              max: maxY,
              border: {
                display: false,
              },
              grid: {
                color: 'rgba(0,0,0,0.05)',
              },
              ticks: {
                color: '#6B7280',
                stepSize: Math.max(Math.round(maxY / 5), 1),
                font: {
                  size: 11,
                  weight: 700,
                },
              },
            },
          },
        },
      };

      const chart = new Chart(canvas, config);
      this.charts.push(chart);
    });
  }

  private destruirGraficos(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }
}