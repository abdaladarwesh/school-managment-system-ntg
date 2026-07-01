import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentService } from './service/student-service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
export type StudentStatus = 'Active' | 'Probation' | 'Suspended';

export interface Student {
  id: string;
  initials: string;
  name: string;
  email: string;
  grade: string;
  class: string;
  academicYear: string;
  gender: 'Male' | 'Female';
  status: StudentStatus;
}
type StatusFilter = 'All' | StudentStatus;
@Component({
  selector: 'app-student-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './student-page.html',
  styleUrl: './student-page.css',
})
export class StudentPage implements OnInit {
  studentService = inject(StudentService);
  router = inject(Router);

  ngOnInit(): void {
    this.studentService.getAllStudents().subscribe({
      error: (err) => {
        if (err.status === 401) {
          Swal.fire({
            title: 'Your session expired',
            text: 'Please login again to continue using the application',
            icon: 'error',
            confirmButtonText: 'Continue',
          }).then(() => this.router.navigate(['/login']));
        } else {
          Swal.fire({
            title: 'Unexpected error — please try again later',
            text: 'We are sorry, please try again later',
            icon: 'error',
            confirmButtonText: 'Try again',
          });
        }
      },
      next: (req) => {
        this.students.set(req.map((s) => this.studentService.toStudent(s)));
      },
    });
  }

  students = signal<Student[]>([]);

  // ---- Logged-in user (sidebar footer) -------------------------------------
  currentUser = {
    name: 'NTG',
    role: 'Affairs Director',
  };

  // ---- Page footer -------------------------------------------------------
  lastUpdated = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // ---- Filter state -------------------------------------------------------
  searchTerm = signal('');
  statusFilter = signal<StatusFilter>('All');
  gradeFilter = signal<string>('All Grades');
  classFilter = signal<string>('All Classes');
  yearFilter = signal<string>('All Academic Years');

  statusTabs: StatusFilter[] = ['All', 'Active', 'Probation', 'Suspended'];

  grades = computed(() => ['All Grades', ...new Set(this.students().map((s) => s.grade))]);
  classes = computed(() => ['All Classes', ...new Set(this.students().map((s) => s.class))]);
  years = computed(() => [
    'All Academic Years',
    ...new Set(this.students().map((s) => s.academicYear)),
  ]);

  // ---- Derived counts -------------------------------------------------------
  totalEnrolled = computed(() => this.students().length);
  activeCount = computed(() => this.students().filter((s) => s.status === 'Active').length);
  probationCount = computed(() => this.students().filter((s) => s.status === 'Probation').length);
  suspendedCount = computed(() => this.students().filter((s) => s.status === 'Suspended').length);

  // ---- Filtered list -------------------------------------------------------
  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const grade = this.gradeFilter();
    const cls = this.classFilter();
    const year = this.yearFilter();

    return this.students().filter((s) => {
      const matchesTerm =
        !term || s.name.toLowerCase().includes(term) || s.grade.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || s.status === status;
      const matchesGrade = grade === 'All Grades' || s.grade === grade;
      const matchesClass = cls === 'All Classes' || s.class === cls;
      const matchesYear = year === 'All Academic Years' || s.academicYear === year;
      return matchesTerm && matchesStatus && matchesGrade && matchesClass && matchesYear;
    });
  });

  resultCount = computed(() => this.filteredStudents().length);

  // ---- Pagination -------------------------------------------------------
  pageSize = 5;
  currentPage = signal(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.resultCount() / this.pageSize)));

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  pagedStudents = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredStudents().slice(start, start + this.pageSize);
  });

  // Range shown in "Showing X-Y of Z students"
  rangeStart = computed(() =>
    this.resultCount() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );
  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.resultCount()));

  // ---- UI actions -------------------------------------------------------
  setStatusFilter(status: StatusFilter) {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onGradeFilterChange(value: string) {
    this.gradeFilter.set(value);
    this.currentPage.set(1);
  }

  onClassFilterChange(value: string) {
    this.classFilter.set(value);
    this.currentPage.set(1);
  }

  onYearFilterChange(value: string) {
    this.yearFilter.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  logout() {
    // Hook up to your real auth/logout flow.
    console.log('Logout clicked');
  }

  statusBadgeClass(status: StudentStatus): string {
    switch (status) {
      case 'Active':
        return 'badge rounded-pill status-badge status-badge--active';
      case 'Probation':
        return 'badge rounded-pill status-badge status-badge--probation';
      case 'Suspended':
        return 'badge rounded-pill status-badge status-badge--suspended';
    }
  }

  exportStudents() {
    const data = this.filteredStudents();

    if (!data.length) {
      Swal.fire({
        title: 'Nothing to export',
        text: 'There are no students matching the current filters.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Shape rows into a clean, human-readable table (avoid dumping raw object keys)
    const rows = data.map((s) => ({
      'Student ID': s.id,
      Name: s.name,
      Email: s.email,
      Grade: s.grade,
      Class: s.class,
      'Academic Year': s.academicYear,
      Gender: s.gender,
      Status: s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns roughly based on content length
    const colWidths = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String((r as any)[key] ?? '').length)) + 2,
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `students-export-${timestamp}.xlsx`);
  }

  addStudent() {
    this.router.navigate(['/students/add']);
  }

  viewStudent(id: string) {
    this.router.navigate(['/students', id]);
  }
}
