import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StudentResponse } from '../../student-page/service/student-service';
import { Observable } from 'rxjs';

export interface PermissionResponse{
  id: number;
  student: StudentResponse;
  reason: string
  notes : string | null;
  date: Date
}

export interface PermissionRequest{
  studentId: number;
  reason: string
  notes : string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private http = inject(HttpClient);
  private readonly url = "http://localhost:8080/api/v1/permissions";

  getAllPermissions(): Observable<PermissionResponse[]>{
    return this.http.get<PermissionResponse[]>(this.url);
  }

  createPermission(request : PermissionRequest): Observable<PermissionResponse>{
    return this.http.put<PermissionResponse>(this.url, request);
  }
  
}
