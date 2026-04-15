export class PredictionResponse {
  predictions!: PrediccionDia[];
}

export class PrediccionDia {
  fecha!: string;                   
  tipo_articulo_codigo!: number;
  tipo_articulo_nombre!: string;
  demanda_pronosticada!: number;
}
