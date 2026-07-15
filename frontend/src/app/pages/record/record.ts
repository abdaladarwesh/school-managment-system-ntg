import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

// ==========================================
// API RESPONSE INTERFACES
// ==========================================

interface TermResponse {
  term: number;
  year: number;
}

interface GradeResponse {
  id: number;
  name: string;
  terms: TermResponse[];
}

interface ClassResponse {
  id: number;
  name: string;
  capacity: number;
  grade: GradeResponse;
}

interface SessionAttendanceResponse {
  sessionId: number;
  periodNumber: number;
  courseName: string;
  startAt: string;
  endAt: string;
  status: 'P' | 'A' | 'E' | 'L' | null;
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
  sessions: SessionAttendanceResponse[];
  rows: StudentAttendanceRowResponse[];
}

interface StudentHistoryDay {
  date: string; // e.g., "2026-06-01"
  status: 'P' | 'A' | 'L' | 'E' | '';
}

interface StudentHistoryResponse {
  attendanceRate: number;
  recordedDays: number;
  stats: { present: number; absent: number; late: number; excused: number };
  historyDays: StudentHistoryDay[];
}

interface CalendarCell {
  dayNumber: number | null;
  dateString: string;
  status: 'P' | 'A' | 'L' | 'E' | '';
}

// ==========================================
// FRONTEND MODEL INTERFACE
// ==========================================

interface StudentAttendance {
  studentId: number;
  name: string;
  initials: string;
  grade: string;
  gradeId: number;
  class: string;
  classId: number;
  academicYear: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Not Marked';
  attendanceRate?: number;
  statusBadge?: string;
  recordedDays?: number;
  stats?: { present: number; absent: number; late: number; excused: number };
  historyDays?: Array<{
    dayNumber: number;
    dateString: string;
    status: 'P' | 'A' | 'L' | 'E' | '';
  }>;
  calendarGrid?: CalendarCell[];
  originalSessions?: SessionAttendanceResponse[];
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './record.html',
  styleUrls: ['./record.css'],
})
export class AttendanceComponent implements OnInit {
  private http = inject(HttpClient);
  private translationService = inject(TranslationService);

  // ==========================================
  // FILTER STATE (signals)
  // ==========================================
  searchText = signal('');
  selectedGradeId = signal<number | 'all'>('all');
  selectedClassId = signal<number | 'all'>('all');
  selectedYear = signal<number | 'all'>('all');
  selectedStatus = signal<string>('all');
  filterDate = signal(new Date().toISOString().split('T')[0]);

  // ==========================================
  // DATA STATE (signals)
  // ==========================================
  allClasses = signal<ClassResponse[]>([]);
  allGrades = signal<GradeResponse[]>([]);
  allYears = signal<number[]>([]);
  students = signal<StudentAttendance[]>([]);

  // ==========================================
  // MODAL / UI STATE (signals)
  // ==========================================
  selectedStudent = signal<StudentAttendance | null>(null);
  showMarkAttendanceModal = signal(false);
  showEditModal = signal(false);
  showHistoryModal = signal(false);
  loading = signal(false);
  currentHistoryView = signal<'calendar' | 'daily'>('calendar');
  today = new Date(); // static per render, no need for a signal

  // ==========================================
  // DERIVED STATE (computed)
  // ==========================================
  filteredStudents = computed(() => {
    const search = this.searchText().toLowerCase();
    const classId = this.selectedClassId();
    const gradeId = this.selectedGradeId();
    const year = this.selectedYear();
    const status = this.selectedStatus();

    return this.students().filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(search);
      const matchesClass = classId === 'all' || student.classId === Number(classId);
      const matchesGrade = gradeId === 'all' || student.gradeId === Number(gradeId);
      const matchesYear = year === 'all' || student.academicYear === year.toString();
      const matchesStatus =
        status === 'all' || student.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesClass && matchesGrade && matchesYear && matchesStatus;
    });
  });

  totalRecords = computed(() => this.filteredStudents().length);

  presentCount = computed(
    () => this.filteredStudents().filter((s) => s.status === 'Present').length,
  );
  absentCount = computed(() => this.filteredStudents().filter((s) => s.status === 'Absent').length);
  lateCount = computed(() => this.filteredStudents().filter((s) => s.status === 'Late').length);
  excusedCount = computed(
    () => this.filteredStudents().filter((s) => s.status === 'Excused').length,
  );
  notMarkedCount = computed(
    () => this.filteredStudents().filter((s) => s.status === 'Not Marked').length,
  );

  attendanceRate = computed(() => {
    const evaluatedRecords = this.filteredStudents().filter(
      (s) => s.status !== 'Not Marked',
    ).length;
    if (evaluatedRecords === 0) return 0;
    return Math.round((this.presentCount() / evaluatedRecords) * 100);
  });

  ngOnInit(): void {
    this.loadClasses();
  }

  /**
   * Fetches classes and dynamically extracts unique Grades and Academic Years
   */
  loadClasses(): void {
    this.http.get<ClassResponse[]>('http://localhost:8080/api/v1/classes').subscribe({
      next: (classes) => {
        this.allClasses.set(classes);

        const uniqueGradesMap = new Map<number, GradeResponse>();
        classes.forEach((c) => {
          if (c.grade && !uniqueGradesMap.has(c.grade.id)) {
            uniqueGradesMap.set(c.grade.id, c.grade);
          }
        });
        this.allGrades.set(Array.from(uniqueGradesMap.values()));

        const yearsSet = new Set<number>();
        classes.forEach((c) => {
          c.grade?.terms?.forEach((t) => yearsSet.add(t.year));
        });
        this.allYears.set(Array.from(yearsSet));

        this.loadRecords();
      },
      error: (err) => console.error('Failed to load classes', err),
    });
  }

  /**
   * Loads attendance grid records based on the selected Class ID and Date
   */
  loadRecords(): void {
    this.loading.set(true);
    const classId = this.selectedClassId();
    const date = this.filterDate();

    if (classId === 'all') {
      if (this.allClasses().length === 0) {
        this.students.set([]);
        this.loading.set(false);
        return;
      }

      const requests = this.allClasses().map((cls) => this.fetchGrid(cls.id, date));

      forkJoin(requests).subscribe({
        next: (grids) => {
          this.students.set(grids.flatMap((grid) => this.mapGridToStudents(grid)));
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load grids', err);
          this.loading.set(false);
        },
      });
    } else {
      this.fetchGrid(Number(classId), date).subscribe({
        next: (grid) => {
          this.students.set(grid ? this.mapGridToStudents(grid) : []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load grid', err);
          this.loading.set(false);
        },
      });
    }
  }

  onFilterChange(): void {
    this.loadRecords();
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectedGradeId.set('all');
    this.selectedClassId.set('all');
    this.selectedYear.set('all');
    this.selectedStatus.set('all');
    this.filterDate.set(new Date().toISOString().split('T')[0]);
    this.onFilterChange();
  }

  private fetchGrid(classId: number, date: string): Observable<AttendanceGridResponse | null> {
    const params = new HttpParams().set('classId', classId.toString()).set('date', date);
    return this.http
      .get<AttendanceGridResponse>('http://localhost:8080/api/v1/attendance/grid', { params })
      .pipe(
        catchError((err) => {
          console.error(`Error fetching grid for class ${classId}`, err);
          return of(null);
        }),
      );
  }

  /**
   * Maps backend grid rows to frontend StudentAttendance objects, cleanly checking for missing data
   */
  private mapGridToStudents(grid: AttendanceGridResponse | null): StudentAttendance[] {
    if (!grid) return [];

    const matchedClass = this.allClasses().find((c) => c.id === grid.classId);
    const gradeName = matchedClass?.grade?.name || 'N/A';
    const gradeId = matchedClass?.grade?.id || -1;
    const academicYear = matchedClass?.grade?.terms?.[0]?.year?.toString() || 'N/A';

    return grid.rows.map((row) => {
      const statuses = row.sessions.map((s) => s.status);
      let dailyStatus: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Not Marked' = 'Not Marked';

      if (statuses.length === 0 || statuses.every((s) => s === null)) {
        dailyStatus = 'Not Marked';
      } else if (statuses.includes('P')) {
        dailyStatus = 'Present';
      } else if (statuses.includes('L')) {
        dailyStatus = 'Late';
      } else if (statuses.every((s) => s === 'E')) {
        dailyStatus = 'Excused';
      } else {
        dailyStatus = 'Absent';
      }

      return {
        studentId: row.studentId,
        name: row.fullName,
        initials: row.initials,
        grade: gradeName,
        gradeId: gradeId,
        class: grid.className,
        classId: grid.classId,
        academicYear: academicYear,
        date: grid.date,
        status: dailyStatus,
        originalSessions: row.sessions,
        attendanceRate: 0,
        statusBadge: 'N/A',
        recordedDays: 0,
        stats: { present: 0, absent: 0, late: 0, excused: 0 },
        historyDays: [],
      };
    });
  }

  // ==========================================
  // MODAL ACTIONS & BACKEND UPDATES
  // ==========================================

  openEditModal(student: StudentAttendance) {
    this.selectedStudent.set({ ...student });
    this.showEditModal.set(true);
  }

  /**
   * Opens history view and fetches overall historical data values for the specific student
   */
  openHistoryModal(student: StudentAttendance) {
    this.selectedStudent.set({ ...student });
    this.currentHistoryView.set('calendar');
    this.showHistoryModal.set(true);

    // 1. Generate empty grid immediately (for instant UI feedback)
    const targetDate = new Date(student.date);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const grid: CalendarCell[] = Array.from({ length: firstDayIndex }, () => ({
      dayNumber: null,
      dateString: '',
      status: '',
    }));

    for (let d = 1; d <= daysInMonth; d++) {
      grid.push({
        dayNumber: d,
        dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        status: '',
      });
    }

    this.selectedStudent.update((s) => (s ? { ...s, calendarGrid: grid } : null));

    // 2. Fetch and merge data
    this.http
      .get<StudentHistoryResponse>(
        `http://localhost:8080/api/v1/attendance/student/${this.selectedStudent()?.studentId}/history`,
        {
          params: new HttpParams().set('date', student.date),
        },
      )
      .subscribe((historyData) => {
        this.selectedStudent.update((s) => {
          if (!s) return null;

          const historyMap = new Map(historyData.historyDays.map((d) => [d.date, d.status]));

          return {
            ...s,
            attendanceRate: historyData.attendanceRate,
            recordedDays: historyData.recordedDays,
            stats: historyData.stats,
            historyDays: historyData.historyDays.map((d) => ({
              dayNumber: new Date(d.date).getDate(),
              dateString: d.date,
              status: d.status,
            })),
            calendarGrid: s.calendarGrid!.map((cell) => ({
              ...cell,
              status: cell.dateString ? ((historyMap.get(cell.dateString) || '') as any) : '',
            })),
          };
        });
      });
  }

  switchHistoryView(viewType: 'calendar' | 'daily') {
    this.currentHistoryView.set(viewType);
  }

  setSelectedStatus(status: StudentAttendance['status']): void {
    this.selectedStudent.update((s) => (s ? { ...s, status } : null));
  }

  closeAllModals() {
    this.showMarkAttendanceModal.set(false);
    this.showEditModal.set(false);
    this.showHistoryModal.set(false);
    this.selectedStudent.set(null); // FIX: was `this.selectedStudent = null`, which clobbered the signal itself
  }

  updateRecord() {
    const student = this.selectedStudent(); // FIX: was reading `.status`/`.originalSessions` off the signal fn, not its value
    if (!student || !student.originalSessions) {
      this.closeAllModals();
      return;
    }

    let newStatusBackend: 'P' | 'A' | 'E' | 'L' = 'A';
    if (student.status === 'Present') newStatusBackend = 'P';
    else if (student.status === 'Absent') newStatusBackend = 'A';
    else if (student.status === 'Excused') newStatusBackend = 'E';
    else if (student.status === 'Late') newStatusBackend = 'L';



    const entries = student.originalSessions.map((session) => ({
      studentId: student.studentId,
      sessionId: session.sessionId,
      status: newStatusBackend,
    }));

    const body = {
      classId: student.classId,
      date: student.date,
      entries: entries,
    };

    console.log(body);

    this.loading.set(true);
    this.http.put('http://localhost:8080/api/v1/attendance', body).subscribe({
      next: () => {
        Swal.fire(
          this.translationService.translate('Updated!'),
          this.translationService.translate('Attendance record updated successfully.'),
          'success'
        );
        this.loadRecords();
        this.closeAllModals();
      },
      error: (err) => {
        console.error('Failed to update record', err);
        this.loading.set(false);
        this.closeAllModals();
      },
    });
  }

  /**
   * Dynamic Excel Export handler
   */
  exportReport(): void {
    const recordsToExport = this.filteredStudents();

    if (recordsToExport.length === 0) {
      Swal.fire(
        this.translationService.translate('Error'),
        this.translationService.translate('No students match the current filters.'),
        'warning',
      );
      return;
    }

    const excelData = recordsToExport.map((student) => ({
      'Student ID': student.studentId,
      'Student Name': student.name,
      Grade: student.grade,
      Class: student.class,
      'Academic Year': student.academicYear,
      Date: student.date,
      'Daily Status': student.status,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
    ];

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    const classId = this.selectedClassId();
    const classLabel = classId === 'all' ? 'AllClasses' : `Class_${classId}`;
    const fileName = `Attendance_Report_${classLabel}_${this.filterDate()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Helper utility inside the template to cleanly format target dates contextually
   */
  getReadableMonthYear(): string {
    const date = this.filterDate();
    if (!date) return 'Selected Month';
    const parsed = new Date(date);
    return parsed.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
}
