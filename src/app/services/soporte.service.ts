import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Subject } from 'rxjs';
import { Soporte } from '../models/soporte';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const base_url = environment.base;
@Injectable({
  providedIn: 'root',
})
export class SoporteService {
  url = `${base_url}/soportes`;
  listaCambio = new Subject<Soporte[]>();
  constructor(private http: HttpClient) {}

  list() {
    let token = sessionStorage.getItem('token');
    return this.http.get<Soporte[]>(this.url, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }
  insert(soporte: Soporte) {
    let token = sessionStorage.getItem('token');
    console.log(soporte);
    return this.http.post(`${this.url}`, soporte, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }
  update(soporte: Soporte) {
    let token = sessionStorage.getItem('token');
    console.log(this.url);
    console.log(soporte);
    return this.http.put(this.url, soporte, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json'),
    });
  }
  setList(listaNueva: Soporte[]) {
    return this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
}
