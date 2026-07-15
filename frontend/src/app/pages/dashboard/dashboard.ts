import { Component, computed, inject } from '@angular/core';
import { AttendanceChartComponent } from './components/attendance-chart/attendance-chart';
import { DashboardService } from './service/dashboard-service';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { DASHBOARD_INITIAL } from './service/dashboard-service';
import { ViolationChartComponent } from './components/violation-chart/violation-chart';
import { AbsenceChartComponent } from './components/absence-chart-component/absence-chart-component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    AttendanceChartComponent,
    AttendanceChartComponent,
    AbsenceChartComponent,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  // ── Single source of truth: the raw signal from the service ───────────────
  private readonly _data = toSignal(
    this.dashboardService.getDashboardItem().pipe(
      catchError((err) => {
        if (err.status === 401) {
          Swal.fire({
            title: this.translationService.translate('Your session expired'),
            text: this.translationService.translate('Please login again to continue using the application'),
            icon: 'error',
            confirmButtonText: this.translationService.translate('Continue'),
          }).then(() => this.router.navigate(['/login']));
        } else {
          Swal.fire({
            title: this.translationService.translate('Unexpected error — please try again later'),
            text: this.translationService.translate('We are sorry, please try again later'),
            icon: 'error',
            confirmButtonText: this.translationService.translate('Try again'),
          });
        }
        return of(DASHBOARD_INITIAL);
      }),
    ),
    { initialValue: DASHBOARD_INITIAL },
  );

  // ── Stat-card signals (computed from the single data signal) ──────────────
  readonly totalStudent = computed(() => this._data().totalStudents);
  readonly totalClasses = computed(() => this._data().totalClasses);
  readonly totalAttendance = computed(() => this._data().todayAttendance);
  readonly totalViolations = computed(() => this._data().totalViolations);
  readonly leaveRequests = computed(() => this._data().leaveRequests);
  readonly totalComplaints = computed(() => this._data().totalComplaints);

  // ── Chart signals ─────────────────────────────────────────────────────────
  readonly attendanceWeeklyLabels = computed(() => this._data().attendanceWeeklyLabels);
  readonly attendanceWeeklyData = computed(() => this._data().attendanceWeeklyData);

  readonly violationMonthLabels = computed(() => this._data().violationMonthLabels);
  readonly violationMonthData = computed(() => this._data().violationMonthData);

  readonly absenceClassLabels = computed(() => this._data().absenceClassLabels);
  readonly absenceClassData = computed(() => this._data().absenceClassData);
  readonly absenceChartData = computed(() =>
    this.absenceClassLabels().map((label, index) => ({
      name: label,
      value: this.absenceClassData()[index] ?? 0,
      color: label === 'Grade 10' || label === 'Grade 12' ? '#5b9bd5' : '#8f0f0f',
    })),
  );

  readonly complaintCategoryLabels = computed(() => this._data().complaintCategoryLabels);
  readonly complaintCategoryData = computed(() => this._data().complaintCategoryData);
}
