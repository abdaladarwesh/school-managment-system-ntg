import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

// ─── API shapes (mirror the backend DTOs) ────────────────────────────────────

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
  status: 'P' | 'A' | 'E' | null; // null = not yet recorded
}

interface StudentAttendanceRowResponse {
  studentId: number;
  fullName: string;
  initials: string;
  className: string;
  sessions: SessionAttendanceResponse[];
}

interface AttendanceGridResponse {
  classId: number;
  className: string;
  date: string;
  studentCount: number;
  sessions: SessionAttendanceResponse[]; // column headers
  rows: StudentAttendanceRowResponse[];
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  // ── State ─────────────────────────────────────────────────────────────────
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

  /** Column headers — derived from the top-level sessions in the grid response */
  sessions = computed(() => this.grid()?.sessions ?? []);

  /** Student rows with mutable local attendance map  */
  rows = computed(() => this.grid()?.rows ?? []);

  /** 1. ALLOW NULL IN THE SIGNAL TYPE */
  localStatus = signal<Record<string, Record<string, 'P' | 'A' | 'E' | null>>>({});

  loading = signal(false);
  saving = signal(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadClasses();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  loadClasses(): void {
    this.http.get<ClassResponse[]>('http://localhost:8080/api/v1/attendance/classes').subscribe({
      error: (err) => {
        console.log(err);
        this.handleError(err);
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
    const dateStr = this.selectedDate.toISOString().split('T')[0]; // yyyy-MM-dd
    const params = new HttpParams().set('classId', classId.toString()).set('date', dateStr);

    this.http
      .get<AttendanceGridResponse>('http://localhost:8080/api/v1/attendance/grid', {
        params,
      })
      .subscribe({
        error: (err) => {
          this.loading.set(false);
          this.handleError(err);
          console.log(err);
        },
        next: (gridData) => {
          this.grid.set(gridData);

          /** 2. REMOVED THE DEFAULT 'P' FALLBACK HERE */
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

  // ── Attendance interaction ─────────────────────────────────────────────────

  /** 3. RETURN TYPE UPDATED TO INCLUDE NULL AND DEFAULTED TO NULL */
  getStatus(studentId: number, sessionId: number): 'P' | 'A' | 'E' | null {
    return this.localStatus()[studentId]?.[sessionId] ?? null;
  }

  setStatus(studentId: number, sessionId: number, status: 'P' | 'A' | 'E'): void {
    const current = { ...this.localStatus() };
    current[studentId] = { ...(current[studentId] ?? {}), [sessionId]: status };
    this.localStatus.set(current);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  /** 4. UPDATED DAY STATUS TO CORRECTLY IGNORE UNRECORDED NULL ENTRIES FROM COUNTS */
  private dayStatus(studentId: number): 'P' | 'A' | 'E' | null {
    const statuses = Object.values(this.localStatus()[studentId] ?? {});
    if (statuses.length === 0) return null;
    if (statuses.includes('P')) return 'P';
    if (statuses.includes(null)) return null; // Do not count student if any session is still unrecorded
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

  // ── Save ──────────────────────────────────────────────────────────────────
  saveAttendance(): void {
    const cls = this.selectedClass();
    const gridData = this.grid();
    if (!cls || !gridData) return;

    const statusMap = this.localStatus();
    const entries: { studentId: number; sessionId: number; status: 'P' | 'A' | 'E' | null }[] = [];

    for (const row of gridData.rows) {
      for (const sess of row.sessions) {
        /** 5. FALLBACK CHANGED TO NULL INSTEAD OF 'P' TO SEND TRUE STATE TO BACKEND */
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
    this.http.put<AttendanceGridResponse>('http://localhost:8080/api/v1/attendance', body).subscribe({
      error: (err) => {
        this.saving.set(false);
        console.log(err);
        this.handleError(err);
      },
      next: (updated) => {
        this.saving.set(false);
        this.grid.set(updated);
        Swal.fire({
          title: this.translationService.translate('Saved!'),
          text: this.translationService.translate('Attendance has been saved successfully.'),
          icon: 'success',
          confirmButtonText: this.translationService.translate('OK'),
        });
      },
    });
  }

  // ── Error helper ──────────────────────────────────────────────────────────
  private handleError(err: { status: number }): void {
    if (err.status === 401) {
      Swal.fire({
        title: this.translationService.translate('Session Expired'),
        text: this.translationService.translate('Please login again.'),
        icon: 'error',
        confirmButtonText: this.translationService.translate('Login'),
      }).then(() => this.router.navigate(['/login']));
    } else {
      Swal.fire({
        title: this.translationService.translate('Something went wrong'),
        text: this.translationService.translate('Please try again later.'),
        icon: 'error',
        confirmButtonText: this.translationService.translate('OK'),
      });
    }
  }
}
