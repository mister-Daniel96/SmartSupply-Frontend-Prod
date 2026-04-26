import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JwtRequest } from '../models/jwtRequest';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private helper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  login(request: JwtRequest) {
    return this.http.post(`http://localhost:9010/authenticate`, request);
  }

  verificar(): boolean {
    return sessionStorage.getItem('token') != null;
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    return this.helper.decodeToken(token);
  }

  showRole(): string | null {
    return this.getDecodedToken()?.role ?? null;
  }

  showId(): number | null {
    const id = this.getDecodedToken()?.id;
    return id != null ? Number(id) : null;
  }
}