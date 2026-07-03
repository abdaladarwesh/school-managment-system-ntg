import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

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
  status: 'P' | 'A' | 'E' | null;
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
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  attendanceRate?: number;
  statusBadge?: string;
  recordedDays?: number;
  stats?: { present: number; absent: number; late: number; excused: number };
  historyDays?: Array<{ dayNumber: number; status: 'P' | 'A' | 'L' | 'E' | '' }>;
  originalSessions?: SessionAttendanceResponse[];
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record.html',
  styleUrls: ['./record.css'],
})
export class AttendanceComponent implements OnInit {
  private http = inject(HttpClient);

  // Filter State Variables
  searchText = '';
  selectedGradeId: number | 'all' = 'all';
  selectedClassId: number | 'all' = 'all';
  selectedYear: number | 'all' = 'all';
  selectedStatus: string = 'all';
  filterDate = new Date().toISOString().split('T')[0];

  // Dynamic Signals
  allClasses = signal<ClassResponse[]>([]);
  allGrades = signal<GradeResponse[]>([]);
  allYears = signal<number[]>([]);
  students = signal<StudentAttendance[]>([]);

  // Modal State Variables
  showMarkAttendanceModal = false;
  showEditModal = false;
  showHistoryModal = false;
  selectedStudent: StudentAttendance | null = null;
  loading = false;
  today = new Date();
  currentHistoryView: 'calendar' | 'daily' = 'calendar';

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

        // 1. Extract unique grades dynamically from the classes array
        const uniqueGradesMap = new Map<number, GradeResponse>();
        classes.forEach((c) => {
          if (c.grade && !uniqueGradesMap.has(c.grade.id)) {
            uniqueGradesMap.set(c.grade.id, c.grade);
          }
        });
        this.allGrades.set(Array.from(uniqueGradesMap.values()));

        // 2. Extract unique academic years dynamically from terms
        const yearsSet = new Set<number>();
        classes.forEach((c) => {
          c.grade?.terms?.forEach((t) => yearsSet.add(t.year));
        });
        this.allYears.set(Array.from(yearsSet));

        // 3. Load attendance records now that metadata is ready
        this.loadRecords();
      },
      error: (err) => console.error('Failed to load classes', err),
    });
  }

  /**
   * Loads attendance grid records based on the selected Class ID and Date
   */
  loadRecords(): void {
    this.loading = true;

    if (this.selectedClassId === 'all') {
      if (this.allClasses().length === 0) {
        this.students.set([]);
        this.loading = false;
        return;
      }

      const requests = this.allClasses().map((cls) => this.fetchGrid(cls.id, this.filterDate));

      forkJoin(requests).subscribe({
        next: (grids) => {
          this.students.set(grids.flatMap((grid) => this.mapGridToStudents(grid)));
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load grids', err);
          this.loading = false;
        },
      });
    } else {
      this.fetchGrid(Number(this.selectedClassId), this.filterDate).subscribe({
        next: (grid) => {
          this.students.set(grid ? this.mapGridToStudents(grid) : []);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load grid', err);
          this.loading = false;
        },
      });
    }
  }

  onFilterChange(): void {
    this.loadRecords();
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedGradeId = 'all';
    this.selectedClassId = 'all';
    this.selectedYear = 'all';
    this.selectedStatus = 'all';
    this.filterDate = new Date().toISOString().split('T')[0];
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
   * Maps backend grid rows to frontend StudentAttendance objects, linking Grade and Year info
   */
  private mapGridToStudents(grid: AttendanceGridResponse | null): StudentAttendance[] {
    if (!grid) return [];

    // Match the class from our signal to get the exact Grade Name and Academic Year
    const matchedClass = this.allClasses().find((c) => c.id === grid.classId);
    const gradeName = matchedClass?.grade?.name || 'N/A';
    const gradeId = matchedClass?.grade?.id || -1;
    const academicYear = matchedClass?.grade?.terms?.[0]?.year?.toString() || 'N/A';

    return grid.rows.map((row) => {
      const statuses = row.sessions.map((s) => s.status);
      let dailyStatus: 'Present' | 'Absent' | 'Late' | 'Excused' = 'Absent';

      if (statuses.includes('P')) {
        dailyStatus = 'Present';
      } else if (statuses.length > 0 && statuses.every((s) => s === 'E')) {
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
        attendanceRate: 100,
        statusBadge: 'Good',
        recordedDays: 20,
        stats: { present: 20, absent: 0, late: 0, excused: 0 },
        historyDays: [],
      };
    });
  }

  // ==========================================
  // GETTERS & CLIENT-SIDE FILTERING
  // ==========================================

  get filteredStudents(): StudentAttendance[] {
    return this.students().filter((student) => {
      // 1. Search text filter
      const matchesSearch = student.name.toLowerCase().includes(this.searchText.toLowerCase());

      // 2. Class filter
      const matchesClass =
        this.selectedClassId === 'all' || student.classId === Number(this.selectedClassId);

      // 3. Grade filter
      let matchesGrade = true;
      if (this.selectedGradeId !== 'all') {
        matchesGrade = student.gradeId === Number(this.selectedGradeId);
      }

      // 4. Academic Year filter
      const matchesYear =
        this.selectedYear === 'all' || student.academicYear === this.selectedYear.toString();

      // 5. Status filter
      const matchesStatus =
        this.selectedStatus === 'all' ||
        student.status.toLowerCase() === this.selectedStatus.toLowerCase();

      return matchesSearch && matchesClass && matchesGrade && matchesYear && matchesStatus;
    });
  }

  get totalRecords(): number {
    return this.filteredStudents.length;
  }
  get presentCount(): number {
    return this.filteredStudents.filter((s) => s.status === 'Present').length;
  }
  get absentCount(): number {
    return this.filteredStudents.filter((s) => s.status === 'Absent').length;
  }
  get lateCount(): number {
    return this.filteredStudents.filter((s) => s.status === 'Late').length;
  }
  get excusedCount(): number {
    return this.filteredStudents.filter((s) => s.status === 'Excused').length;
  }

  get attendanceRate(): number {
    if (this.totalRecords === 0) return 0;
    return Math.round((this.presentCount / this.totalRecords) * 100);
  }

  // ==========================================
  // MODAL ACTIONS & BACKEND UPDATES
  // ==========================================

  openEditModal(student: StudentAttendance) {
    this.selectedStudent = { ...student };
    this.showEditModal = true;
  }

  openHistoryModal(student: StudentAttendance) {
    this.selectedStudent = student;
    this.currentHistoryView = 'calendar';
    this.showHistoryModal = true;
  }

  switchHistoryView(viewType: 'calendar' | 'daily') {
    this.currentHistoryView = viewType;
  }

  closeAllModals() {
    this.showMarkAttendanceModal = false;
    this.showEditModal = false;
    this.showHistoryModal = false;
    this.selectedStudent = null;
  }

  updateRecord() {
    if (!this.selectedStudent || !this.selectedStudent.originalSessions) {
      this.closeAllModals();
      return;
    }

    const newStatusBackend =
      this.selectedStudent.status === 'Present'
        ? 'P'
        : this.selectedStudent.status === 'Absent'
          ? 'A'
          : this.selectedStudent.status === 'Excused'
            ? 'E'
            : 'A';

    const entries = this.selectedStudent.originalSessions.map((session) => ({
      studentId: this.selectedStudent!.studentId,
      sessionId: session.sessionId,
      status: newStatusBackend,
    }));

    const body = {
      classId: this.selectedStudent.classId,
      date: this.selectedStudent.date,
      entries: entries,
    };

    this.loading = true;
    this.http.put('http://localhost:8080/api/v1/attendance', body).subscribe({
      next: () => {
        Swal.fire('Updated!', 'Attendance record updated successfully.', 'success');
        this.loadRecords();
        this.closeAllModals();
      },
      error: (err) => {
        console.error('Failed to update record', err);
        Swal.fire('Error', 'Failed to update attendance record.', 'error');
        this.loading = false;
        this.closeAllModals();
      },
    });
  }
  /**
   * Exports the currently filtered attendance records to an Excel (.xlsx) file.
   */
  exportReport(): void {
    const recordsToExport = this.filteredStudents;

    if (recordsToExport.length === 0) {
      Swal.fire(
        'No Data',
        'There are no records to export matching your current filters.',
        'warning',
      );
      return;
    }

    // 1. Map complex student objects into clean, flat row objects for Excel columns
    const excelData = recordsToExport.map((student) => ({
      'Student ID': student.studentId,
      'Student Name': student.name,
      Grade: student.grade,
      Class: student.class,
      'Academic Year': student.academicYear,
      Date: student.date,
      'Daily Status': student.status,
      'Attendance Rate (%)': student.attendanceRate || 0,
      'Total Present': student.stats?.present || 0,
      'Total Absent': student.stats?.absent || 0,
      'Total Late': student.stats?.late || 0,
      'Total Excused': student.stats?.excused || 0,
    }));

    // 2. Create a new worksheet from the mapped JSON array
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // 3. Optional: Auto-size columns slightly so text isn't cut off
    const columnWidths = [
      { wch: 12 }, // Student ID
      { wch: 25 }, // Student Name
      { wch: 12 }, // Grade
      { wch: 10 }, // Class
      { wch: 15 }, // Academic Year
      { wch: 12 }, // Date
      { wch: 15 }, // Daily Status
      { wch: 20 }, // Attendance Rate
      { wch: 14 }, // Total Present
      { wch: 14 }, // Total Absent
      { wch: 14 }, // Total Late
      { wch: 14 }, // Total Excused
    ];
    worksheet['!cols'] = columnWidths;

    // 4. Create a workbook and append our worksheet
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    // 5. Generate a dynamic filename based on current filter state
    const classLabel =
      this.selectedClassId === 'all' ? 'AllClasses' : `Class_${this.selectedClassId}`;
    const dateLabel = this.filterDate || new Date().toISOString().split('T')[0];
    const fileName = `Attendance_Report_${classLabel}_${dateLabel}.xlsx`;

    // 6. Trigger the browser download
    XLSX.writeFile(workbook, fileName);
  }
}
