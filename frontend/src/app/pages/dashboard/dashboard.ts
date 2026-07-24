import { Component, computed, inject } from '@angular/core';
import { AttendanceChartComponent } from './components/attendance-chart/attendance-chart';
import { DashboardService, DASHBOARD_INITIAL } from './service/dashboard-service';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AbsenceChartComponent } from './components/absence-chart-component/absence-chart-component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AttendanceChartComponent,
    AbsenceChartComponent,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);

  private readonly _data = toSignal(
    this.dashboardService.getDashboardItem().pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.notificationService.handle401();
          this.router.navigate(['/login']);
        } else {
          this.notificationService.handleHttpStatus(err.status || 500);
        }
        return of(DASHBOARD_INITIAL);
      }),
    ),
    { initialValue: DASHBOARD_INITIAL },
  );

  readonly totalStudent = computed(() => this._data().totalStudents);
  readonly totalClasses = computed(() => this._data().totalClasses);
  readonly totalAttendance = computed(() => this._data().todayAttendance);
  readonly totalViolations = computed(() => this._data().totalViolations);
  readonly leaveRequests = computed(() => this._data().leaveRequests);
  readonly totalComplaints = computed(() => this._data().totalComplaints);

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
