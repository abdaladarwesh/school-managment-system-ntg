import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { LocalizeNamePipe } from '../../core/pipes/localize-name.pipe';
import { NotificationService } from '../../core/services/notification.service';

interface ClassResponse {
  id: number;
  name: string;
  displayName: string;
  studentCount: number;
}

interface SessionAttendanceResponse {
  sessionId: number;
  periodNumber: number;
  courseName: string;
  startAt: string;
  endAt: string;
  status: 'P' | 'A' | 'E' | null;
}

interface StudentAttendanceRowResponse {
  studentId: number;
  fullName: string;
  fullNameAr?: string;
  initials: string;
  className: string;
  sessions: SessionAttendanceResponse[];
}

interface AttendanceGridResponse {
  classId: number;
  className: string;
  date: string;
  studentCount: number;
  sessions: SessionAttendanceResponse[];
  rows: StudentAttendanceRowResponse[];
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LocalizeNamePipe],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly today = new Date();
  readonly currentDate = this.today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  private readonly selectedDate = this.today;

  allClasses = signal<ClassResponse[]>([]);
  selectedClass = signal<ClassResponse | null>(null);

  grid = signal<AttendanceGridResponse | null>(null);

  sessions = computed(() => this.grid()?.sessions ?? []);
  rows = computed(() => this.grid()?.rows ?? []);
  localStatus = signal<Record<string, Record<string, 'P' | 'A' | 'E' | null>>>({});

  loading = signal(false);
  saving = signal(false);

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.http.get<ClassResponse[]>('http://localhost:8080/api/v1/attendance/classes')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to load classes', err);
        },
        next: (classes) => {
          this.allClasses.set(classes);
          if (classes.length > 0) {
            this.onClassChange(classes[0]);
          }
        },
      });
  }

  onClassChange(cls: ClassResponse): void {
    this.selectedClass.set(cls);
    this.loadGrid(cls.id);
  }

  loadGrid(classId: number): void {
    this.loading.set(true);
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    const params = new HttpParams().set('classId', classId.toString()).set('date', dateStr);

    this.http
      .get<AttendanceGridResponse>('http://localhost:8080/api/v1/attendance/grid', { params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to load grid', err);
          this.loading.set(false);
        },
        next: (gridData) => {
          this.grid.set(gridData);

          const statusMap: Record<string, Record<string, 'P' | 'A' | 'E' | null>> = {};
          for (const row of gridData.rows) {
            statusMap[row.studentId] = {};
            for (const sess of row.sessions) {
              statusMap[row.studentId][sess.sessionId] = sess.status;
            }
          }
          this.localStatus.set(statusMap);
          this.loading.set(false);
        },
      });
  }

  getStatus(studentId: number, sessionId: number): 'P' | 'A' | 'E' | null {
    return this.localStatus()[studentId]?.[sessionId] ?? null;
  }

  setStatus(studentId: number, sessionId: number, status: 'P' | 'A' | 'E'): void {
    const current = { ...this.localStatus() };
    current[studentId] = { ...(current[studentId] ?? {}), [sessionId]: status };
    this.localStatus.set(current);
  }

  private dayStatus(studentId: number): 'P' | 'A' | 'E' | null {
    const statuses = Object.values(this.localStatus()[studentId] ?? {});
    if (statuses.length === 0) return null;
    if (statuses.includes('P')) return 'P';
    if (statuses.includes(null)) return null;
    if (statuses.every((s) => s === 'E')) return 'E';
    return 'A';
  }

  presentCount = computed(() => {
    let count = 0;
    for (const row of this.rows()) {
      if (this.dayStatus(row.studentId) === 'P') count++;
    }
    return count;
  });

  absentCount = computed(() => {
    let count = 0;
    for (const row of this.rows()) {
      if (this.dayStatus(row.studentId) === 'A') count++;
    }
    return count;
  });

  permissionCount = computed(() => {
    let count = 0;
    for (const row of this.rows()) {
      if (this.dayStatus(row.studentId) === 'E') count++;
    }
    return count;
  });

  saveAttendance(): void {
    const cls = this.selectedClass();
    const gridData = this.grid();
    if (!cls || !gridData) return;

    const statusMap = this.localStatus();
    const entries: { studentId: number; sessionId: number; status: 'P' | 'A' | 'E' | null }[] = [];

    for (const row of gridData.rows) {
      for (const sess of row.sessions) {
        entries.push({
          studentId: row.studentId,
          sessionId: sess.sessionId,
          status: statusMap[row.studentId]?.[sess.sessionId] ?? null,
        });
      }
    }

    const body = {
      classId: cls.id,
      date: this.selectedDate.toISOString().split('T')[0],
      entries,
    };

    this.saving.set(true);
    this.http.put<AttendanceGridResponse>('http://localhost:8080/api/v1/attendance', body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to save attendance', err);
          this.saving.set(false);
        },
        next: (updated) => {
          this.saving.set(false);
          this.grid.set(updated);
          this.notificationService.handle200('Attendance has been saved successfully.');
        },
      });
  }
}
