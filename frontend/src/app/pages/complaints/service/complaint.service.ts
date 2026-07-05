import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BackendComplaint,
  CreateComplaintRequest,
  RespondToComplaintRequest,
} from './complaint.models';

@Injectable({
  providedIn: 'root',
})
export class ComplaintService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/complaints';

  getComplaints(): Observable<BackendComplaint[]> {
    return this.http.get<BackendComplaint[]>(this.apiUrl);
  }

  createComplaint(payload: CreateComplaintRequest): Observable<BackendComplaint> {
    return this.http.post<BackendComplaint>(this.apiUrl, payload);
  }

  respondToComplaint(
    id: number,
    payload: RespondToComplaintRequest
  ): Observable<BackendComplaint> {
    return this.http.patch<BackendComplaint>(`${this.apiUrl}/${id}/respond`, payload);
  }
}
