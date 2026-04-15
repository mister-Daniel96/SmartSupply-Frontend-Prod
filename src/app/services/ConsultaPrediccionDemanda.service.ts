import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environment/environment';
import { PredictionResponse } from '../models/predictionResponse';
import { PredictionRequest } from '../models/predictionRequest';
import { ConsultaPrediccionDemanda } from '../models/ConsultaPrediccionDemanda';

const base_url = environment.base;

@Injectable({
  providedIn: 'root',
})
export class PrediccionesService {
  private url = `${base_url}/consultas`;

  private listaCambio = new BehaviorSubject<PredictionResponse | null>(null);

  constructor(private http: HttpClient) {}

  insert(request: ConsultaPrediccionDemanda): Observable<PredictionResponse> {
    const token = sessionStorage.getItem('token');
    console.log(request);
    return this.http.post<PredictionResponse>(this.url, request, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }
  list() {
    let token = sessionStorage.getItem('token');
    return this.http.get<ConsultaPrediccionDemanda[]>(this.url, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }
  setList(data: PredictionResponse) {
    this.listaCambio.next(data);
  }

  getList(): Observable<PredictionResponse | null> {
    return this.listaCambio.asObservable();
  }
}
