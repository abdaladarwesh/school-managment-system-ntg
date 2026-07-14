import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendViolation, CreateViolationRequest } from './violation.models';


export interface NotificationRequest {
  title: string;
  type: string;
  priority: string;
  body: string;
  receiverId: number;
}

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

  createNotification(notification: NotificationRequest): Observable<any> {
    return this.http.post<any>('http://localhost:8080/api/v1/notifications', notification);
  }
}
