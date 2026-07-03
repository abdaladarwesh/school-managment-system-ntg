import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendViolation, CreateViolationRequest } from './violation.models';

@Injectable({
  providedIn: 'root',
})
export class ViolationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/violations';

  getViolations(): Observable<BackendViolation[]> {
    return this.http.get<BackendViolation[]>(this.apiUrl);
  }

  createViolation(payload: CreateViolationRequest): Observable<BackendViolation> {
    return this.http.post<BackendViolation>(this.apiUrl, payload);
  }
}
