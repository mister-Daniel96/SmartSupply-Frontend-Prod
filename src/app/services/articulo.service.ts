import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Subject } from 'rxjs';
import { Articulo } from '../models/articulo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {
url = `${base_url}/articulos`;
  listaCambio = new Subject<Articulo[]>();
  constructor(private http: HttpClient) {}

  list() {
    let token = sessionStorage.getItem('token');
    return this.http.get<Articulo[]>(this.url, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }
  insert(articulo: Articulo) {
    let token = sessionStorage.getItem('token');
    console.log(articulo)
    return this.http.post(`${this.url}`, articulo, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }

  setList(listaNueva: Articulo[]) {
    return this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
}
