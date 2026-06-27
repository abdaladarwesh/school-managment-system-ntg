import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';


interface AuthenticationReponse{
  token: string;
  expiresAt: number;
  role:string;
}

interface AuthenticationRequest{
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly url = "http://localhost:8080/api/v1/auth/login";

  authenticate(request : AuthenticationRequest): Observable<AuthenticationReponse>{
    return this.http.post<AuthenticationReponse>("", request);
  }

}
