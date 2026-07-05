import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalCase, MedicalCaseRequest } from '../models/medical-case.model';

const API_BASE = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class MedicalCaseService {
  constructor(private http: HttpClient) {}

  list(): Observable<MedicalCase[]> {
    return this.http.get<MedicalCase[]>(`${API_BASE}/medical-record`);
  }

  register(payload: MedicalCaseRequest): Observable<MedicalCase> {
    return this.http.post<MedicalCase>(`${API_BASE}/medical-record`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/medical-record/${id}`);
  }
}
