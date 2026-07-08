import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuditLog, PageResponse } from './audit-model';

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService {
  // In a real production app, you would move this to environment.ts
  // e.g., private apiUrl = `${environment.apiUrl}/api/v1/audit-logs`;
  private apiUrl = 'http://localhost:8080/api/v1/audit-logs';

  constructor(private http: HttpClient) {}

  /**
   * Fetches a paginated list of audit logs from the Spring Boot backend.
   * * @param page The page number (zero-based index)
   * @param size The number of records per page
   * @returns An Observable containing the Spring PageResponse
   */
  getAuditLogs(page: number = 0, size: number = 20): Observable<PageResponse<AuditLog>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http
      .get<PageResponse<AuditLog>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Centralized error handling for the HTTP requests.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('AuditLogsService Error:', errorMessage);

    // Return an observable with a user-facing error message
    return throwError(() => new Error('Failed to fetch audit logs. Please try again later.'));
  }
}
