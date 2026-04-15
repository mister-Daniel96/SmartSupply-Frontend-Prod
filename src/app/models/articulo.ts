import { Categoria } from './categoria';

export class Articulo {
  idArticulo: number = 0;
  codigoArticulo: string = '';
  nombreArticulo: string = '';
  colorArticulo: string = '';
  estadoArticulo: boolean = true;
  categoria: Categoria = new Categoria();
}
