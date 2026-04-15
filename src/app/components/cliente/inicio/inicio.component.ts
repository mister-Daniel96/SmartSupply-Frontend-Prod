/* import { Component, OnInit } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { ArticuloService } from '../../../services/articulo.service';
import { PrediccionesService } from '../../../services/ConsultaPrediccionDemanda.service';

import { Articulo } from '../../../models/articulo';
import { ConsultaPrediccionDemanda } from '../../../models/ConsultaPrediccionDemanda';
import {
  PredictionResponse,
  PrediccionDia,
} from '../../../models/predictionResponse';
import { Usuario } from '../../../models/usuario';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';

interface GraficoArticulo {
  idArticulo: number;
  nombreArticulo: string;
  data: ChartConfiguration<'line'>['data'];
  options: ChartConfiguration<'line'>['options'];
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
  imports: [
    CommonModule,
    NgForOf,
    NgIf,
    BaseChartDirective
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  providers: [DatePipe],
})
export class InicioComponent implements OnInit {
  private readonly CACHE_KEY = 'smartsupply_dashboard_predicciones';
  usuario = new Usuario();
  id = 0;
  graficosDashboard: GraficoArticulo[] = [];
  isCargando = false;
  rangoTexto = ''; 
  constructor(
    private aS: ArticuloService,
    private pS: PrediccionesService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private uS:UsuarioService
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
      if (!data || !data.length) {
        return;
      }

      const articulosSeleccionados = data.slice(0, 3);

      const { inicio, fin } = this.getRangoProximaSemana();

      const cargadoDeCache = this.intentarCargarDesdeCache(inicio, fin);
      if (!cargadoDeCache) {
        this.cargarDashboardPredicciones(articulosSeleccionados, inicio, fin);
      }
    });
  }

  private getRangoProximaSemana(): { inicio: Date; fin: Date } {
    const hoy = new Date();

    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() + 7); 

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6); 

    return { inicio, fin };
  }

  private toISODate(d: Date): string {
    const date = new Date(d);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  
  private intentarCargarDesdeCache(inicio: Date, fin: Date): boolean {
    const raw = localStorage.getItem(this.CACHE_KEY);
    if (!raw) return false;

    let cache: DashboardCache;
    try {
      cache = JSON.parse(raw) as DashboardCache;
    } catch (e) {
      console.warn('Cache inválido, se ignora', e);
      return false;
    }

    const semanaInicio = this.toISODate(inicio);
    const semanaFin = this.toISODate(fin);

    if (cache.semanaInicio !== semanaInicio || cache.semanaFin !== semanaFin) {
      return false;
    }

    if (!cache.items || !cache.items.length) return false;

    const inicioTxt = this.datePipe.transform(inicio, 'dd-MMM', 'es-PE') ?? '';
    const finTxt = this.datePipe.transform(fin, 'dd-MMM', 'es-PE') ?? '';
    this.rangoTexto = `Demanda pronosticada para la próxima semana (${inicioTxt} al ${finTxt})`;

    this.graficosDashboard = cache.items.map((item, index) => {
      const art = new Articulo();
      art.idArticulo = item.idArticulo;
      art.nombreArticulo = item.nombreArticulo;
      return this.crearGraficoDesdePredicciones(art, item.predicciones, index);
    });

    this.isCargando = false;
    return true;
  }

  private cargarDashboardPredicciones(
    articulos: Articulo[],
    inicio: Date,
    fin: Date
  ): void {
    if (!articulos.length) return;

    const fechaInicioISO = this.toISODate(inicio);
    const fechaFinISO = this.toISODate(fin);

    const inicioTxt = this.datePipe.transform(inicio, 'dd-MMM', 'es-PE') ?? '';
    const finTxt = this.datePipe.transform(fin, 'dd-MMM', 'es-PE') ?? '';
    this.rangoTexto = `Demanda pronosticada para la próxima semana (${inicioTxt} al ${finTxt})`;

    this.isCargando = true;
    this.graficosDashboard = [];

    let pendientes = articulos.length;
    const cacheItems: PrediccionCacheItem[] = [];

    articulos.slice(0, 3).forEach((art, index) => {
      const consulta = new ConsultaPrediccionDemanda();
      consulta.articulo = art;
      consulta.fechaInicio = fechaInicioISO;
      consulta.fechaFin = fechaFinISO;

      this.pS.insert(consulta).subscribe({
        next: (resp: PredictionResponse) => {
          const predicciones = resp.predictions || [];

          if (predicciones.length) {
            this.graficosDashboard.push(
              this.crearGraficoDesdePredicciones(art, predicciones, index)
            );

            cacheItems.push({
              idArticulo: art.idArticulo!,
              nombreArticulo: art.nombreArticulo,
              predicciones,
            });
          }

          pendientes--;
          if (pendientes === 0) {
            this.isCargando = false;

            if (cacheItems.length) {
              const cache: DashboardCache = {
                semanaInicio: fechaInicioISO,
                semanaFin: fechaFinISO,
                items: cacheItems,
              };
              localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
            }
          }
        },
        error: (err) => {
          console.error(
            'Error al obtener predicción para',
            art.nombreArticulo,
            err
          );
          pendientes--;
          if (pendientes === 0) {
            this.isCargando = false;
          }
        },
      });
    });
  }

  private crearGraficoDesdePredicciones(
    articulo: Articulo,
    predicciones: PrediccionDia[],
    index: number
  ): GraficoArticulo {
    const palette = [
      { border: '#1D4ED8', background: 'rgba(29, 78, 216, 0.15)' }, 
      { border: '#16A34A', background: 'rgba(22, 163, 74, 0.15)' }, 
      { border: '#F97316', background: 'rgba(249, 115, 22, 0.15)' }, 
    ];

    const colors = palette[index % palette.length];

    const labels = predicciones.map((p) =>
      new Date(p.fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      })
    );

    const data = predicciones.map((p) => p.demanda_pronosticada);
    const max = Math.max(...data, 0);
    const maxY = Math.ceil(max * 1.2) || 1;

    const chartData: ChartConfiguration<'line'>['data'] = {
      labels,
      datasets: [
        {
          label: 'Demanda pronosticada',
          data,
          tension: 0.35,
          borderColor: colors.border,
          backgroundColor: colors.background,
          pointBackgroundColor: colors.border,
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        },
      ],
    };

    const chartOptions: ChartConfiguration<'line'>['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          border: { display: false },
          grid: {
            color: 'rgba(0,0,0,0.05)',
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            color: '#4b5563',
            font: {
              size: 12,
              weight: 'normal',
            },
          },
        },
        y: {
          min: 0,
          max: maxY,
          border: { display: false },
          grid: {
            color: 'rgba(0,0,0,0.05)',
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            color: '#6b7280',
            stepSize: Math.max(Math.round(maxY / 6), 1),
            font: {
              size: 11,
              weight: 'bold',
            },
          },
        },
      },
    };

    return {
      idArticulo: articulo.idArticulo!,
      nombreArticulo: articulo.nombreArticulo,
      data: chartData,
      options: chartOptions,
    };
  }
}
 */