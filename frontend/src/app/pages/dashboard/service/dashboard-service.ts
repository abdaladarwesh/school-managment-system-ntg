import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

// ── Interfaces ──────────────────────────────────────────────────────────────

/** Full dashboard payload returned by GET /api/v1/dashboard/ */
export interface DashboardResponse {
  // stat cards
  totalStudents:   number;
  totalClasses:    number;
  todayAttendance: number;
  totalViolations: number;
  leaveRequests:   number;
  totalComplaints: number;

  // Attendance line chart (last 8 weeks)
  attendanceWeeklyLabels: string[];
  attendanceWeeklyData:   number[];

  // Violations per month (last 6 months)
  violationMonthLabels: string[];
  violationMonthData:   number[];

  // Avg absence per grade (bar chart)
  absenceClassLabels: string[];
  absenceClassData:   number[];

  // Complaints by category (doughnut chart)
  complaintCategoryLabels: string[];
  complaintCategoryData:   number[];
}

/** Fallback / initial value while the HTTP call is in-flight */
export const DASHBOARD_INITIAL: DashboardResponse = {
  totalStudents:   0,
  totalClasses:    0,
  todayAttendance: 0,
  totalViolations: 0,
  leaveRequests:   0,
  totalComplaints: 0,
  attendanceWeeklyLabels:  [],
  attendanceWeeklyData:    [],
  violationMonthLabels:    [],
  violationMonthData:      [],
  absenceClassLabels:      [],
  absenceClassData:        [],
  complaintCategoryLabels: [],
  complaintCategoryData:   [],
};

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/v1/dashboard/';

  /** Raw observable — use when you need to handle errors imperatively. */
  getDashboardItem(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.url);
  }

  /**
   * Returns an Angular Signal backed by the dashboard HTTP call.
   * The signal starts with {@link DASHBOARD_INITIAL} and updates
   * automatically once the response arrives.
   * Must be called inside an injection context (constructor / field initializer).
   */
  getDashboardSignal(): Signal<DashboardResponse> {
    return toSignal(this.getDashboardItem(), {
      initialValue: DASHBOARD_INITIAL,
    });
  }
}
