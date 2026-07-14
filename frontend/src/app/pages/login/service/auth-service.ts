import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


interface AuthenticationReponse{
  token: string;
  expiresAt: number;
  role:string;
}

interface AuthenticationRequest{
  email: string;
  password: string;
}

interface TokenPayload {
  sub: string;
  userId: number;
  role: string;
  iat: number;
  exp: number;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/v1/auth/login';

  authenticate(request: AuthenticationRequest): Observable<AuthenticationReponse> {
    return this.http.post<AuthenticationReponse>(this.url, request);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
  saveRole(role: string) {
    localStorage.setItem('role', role);
  }

  get token() {
    return localStorage.getItem('token');
  }

  getEmail() {
    const token = localStorage.getItem('token');

    if (!token) return null;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.sub;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }
}
