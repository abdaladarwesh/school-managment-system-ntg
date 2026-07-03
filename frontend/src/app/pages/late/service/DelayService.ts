// src/app/services/delay.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendDelay } from './delay.models';

@Injectable({
  providedIn: 'root',
})
export class DelayService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/delays';

  getDelays(): Observable<BackendDelay[]> {
    return this.http.get<BackendDelay[]>(this.apiUrl);
  }

  createDelay(payload: any): Observable<BackendDelay> {
    return this.http.put<BackendDelay>(this.apiUrl, payload);
  }

  updateDelay(payload: any): Observable<BackendDelay> {
    return this.http.put<BackendDelay>(this.apiUrl, payload);
  }

  deleteDelay(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
