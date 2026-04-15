import { Articulo } from './articulo';

export class ConsultaPrediccionDemanda {
  idConsulta: number|null = null;
  articulo: Articulo = new Articulo();
  fechaInicio: string = '';
  fechaFin: string = '';
  createdAt: string = '';
}
