import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { MedicalCase, MedicalCaseRequest } from './models/medical-case.model';
import { MedicalCaseService } from './services/medical-case.service';
import { StudentSearchComponent } from '../../components/student-search/student-search.component';
import { StudentResponse, StudentService } from '../student-page/service/student-service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

declare const bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('caseModalRef') caseModalRef!: ElementRef;
  private modalInstance: any;

  // --- SIGNALS STATE ---
  allCases = signal<MedicalCase[]>([]);
  students = signal<StudentResponse[]>([]);

  // Active Filter Signals
  searchQuery = signal<string>('');
  filterClass = signal<string>('');
  filterIllness = signal<string>('');
  page = signal<number>(0);
  size = signal<number>(10);

  loading = signal<boolean>(false);
  loadError = signal<string>('');
  showFilterPanel = signal<boolean>(false);

  // --- COMPUTED DROPDOWN OPTIONS ---
  // Instantly extracts unique, non-empty classes whenever allCases changes
  availableClasses = computed(() => {
    const classes = this.allCases()
      .map((c) => this.getClassName(c))
      .filter((c) => c !== '—');
    return Array.from(new Set(classes)).sort();
  });

  // Instantly extracts unique illness types whenever allCases changes
  availableIllnesses = computed(() => {
    const illnesses = this.allCases()
      .map((c) => c.illnessType?.trim())
      .filter(Boolean);
    return Array.from(new Set(illnesses)).sort();
  });

  // --- COMPUTED FILTERED CASES ---
  filteredCases = computed(() => {
    let result = this.allCases();
    const q = this.searchQuery().toLowerCase();
    const cls = this.filterClass().toLowerCase();
    const ill = this.filterIllness().toLowerCase();

    if (q) {
      result = result.filter(
        (c) =>
          this.getStudentFullName(c).toLowerCase().includes(q) ||
          (c.illnessType || '').toLowerCase().includes(q),
      );
    }
    if (cls) {
      result = result.filter((c) => this.getClassName(c).toLowerCase() === cls);
    }
    if (ill) {
      result = result.filter((c) => (c.illnessType || '').toLowerCase() === ill);
    }
    return result;
  });

  // Automatically recalculates total pages
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCases().length / this.size())));

  // Automatically slices data for the current UI page
  paginatedCases = computed(() => {
    const start = this.page() * this.size();
    return this.filteredCases().slice(start, start + this.size());
  });

  // Form state
  todayLabel = '';
  modalTitle = 'Register Medical Case';
  formCaseId: number | null = null;
  formStudentId: number | null = null;
  formIllness = '';
  formDate = '';
  formNotes = '';
  formError = '';

  constructor(
    private medicalCaseService: MedicalCaseService,
    private studentService: StudentService,
    private translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    this.todayLabel = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.loadStudents();
    this.loadCases();
  }

  ngAfterViewInit(): void {
    if (this.caseModalRef) {
      this.modalInstance = new bootstrap.Modal(this.caseModalRef.nativeElement);
    }
  }

  // ---------- Data Loading ----------
  loadStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (data) => this.students.set(data ?? []),
      error: (err) => console.error('Failed to load students', err),
    });
  }

  loadCases(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.medicalCaseService.list().subscribe({
      next: (data) => {
        // Setting the signal automatically triggers all dropdown updates!
        this.allCases.set(data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(err?.error?.message || 'Could not load medical cases.');
        this.loading.set(false);
      },
    });
  }

  // ---------- UI Actions ----------
  onStudentSearchSelected(student: StudentResponse): void {
    this.searchQuery.set(
      student ? `${student.user.firstName} ${student.user.lastName}`.trim() : '',
    );
    this.page.set(0);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value.trim());
    this.page.set(0);
  }

  toggleFilterPanel(): void {
    this.showFilterPanel.update((v) => !v);
  }

  clearFilters(): void {
    this.filterClass.set('');
    this.filterIllness.set('');
    this.searchQuery.set('');
    this.page.set(0);
  }

  prevPage(): void {
    if (this.page() > 0) this.page.update((p) => p - 1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages() - 1) this.page.update((p) => p + 1);
  }

  // ---------- Modal & Form Logic ----------
  openRegisterModal(): void {
    this.modalTitle = 'Register Medical Case';
    this.formCaseId = null;
    this.formStudentId = null;
    this.formIllness = '';
    this.formDate = new Date().toISOString().slice(0, 10);
    this.formNotes = '';
    this.formError = '';
    this.modalInstance.show();
  }

  openEditModal(record: MedicalCase): void {
    this.modalTitle = 'Edit Medical Case';
    this.formCaseId = record.id;
    this.formStudentId = record?.student?.studentResponse?.id || null;
    this.formIllness = record.illnessType || '';
    this.formDate = (record as any).date || new Date().toISOString().slice(0, 10);
    this.formNotes = (record as any).notes || '';
    this.formError = '';
    this.modalInstance.show();
  }

  submitForm(): void {
    this.formError = '';
    if (!this.formStudentId) {
      this.formError = this.translationService.translate('Please choose a student.');
      return;
    }
    if (!this.formIllness.trim()) {
      this.formError = this.translationService.translate('Please enter an illness type.');
      return;
    }

    const payload: MedicalCaseRequest = {
      studentId: this.formStudentId,
      illnessType: this.formIllness.trim(),
    };

    this.medicalCaseService.register(payload).subscribe({
      next: (newCase) => {
        // Optimistically append to signal OR reload to refresh lists immediately
        this.allCases.update((current) => [...current, newCase]);
        this.modalInstance.hide();
      },
      error: (err) => {
        this.formError = err?.error?.message ? this.translationService.translate(err.error.message) : this.translationService.translate('Could not save this medical case.');
      },
    });
  }

  deleteCase(record: MedicalCase): void {
    const confirmMsg = this.translationService.translate('Delete the medical case for') + ' ' + this.getStudentFullName(record) + '?';
    if (!confirm(confirmMsg)) return;
    this.medicalCaseService.delete(record.id).subscribe({
      next: () => {
        // Remove from signal state immediately
        this.allCases.update((current) => current.filter((c) => c.id !== record.id));
      },
      error: (err) => console.error('Failed to delete medical case', err),
    });
  }

  exportCases(): void {
    // 1. Get data to export (using currently active filter signals)
    const dataToExport = this.filteredCases();

    if (dataToExport.length === 0) {
      alert(this.translationService.translate('No records available to export.'));
      return;
    }

    // 2. Map data to clean, user-friendly JSON row objects
    const exportRows = dataToExport.map((c) => ({
      'Case ID': c.id ?? '',
      'Student Name': this.getStudentFullName(c),
      Class: this.getClassName(c),
      'Illness Type': c.illnessType || '—',
      Date: this.formatDate((c as any).date),
      'Student Phone': this.getStudentPhone(c),
      'Parent Phone': this.getParentPhone(c),
      Notes: (c as any).notes || '',
    }));

    // 3. Create a worksheet from the JSON rows
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows);

    // Optional: Auto-size column widths based on longest text per column
    const objectMaxLength: number[] = [];
    exportRows.forEach((row) => {
      Object.values(row).forEach((val, i) => {
        const length = val ? String(val).length : 0;
        objectMaxLength[i] = Math.max(objectMaxLength[i] || 10, length + 3);
      });
    });
    worksheet['!cols'] = objectMaxLength.map((w) => ({ wch: w }));

    // 4. Create a workbook and append the worksheet
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Cases');

    // 5. Generate and download the .xlsx file
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Medical_Cases_${timestamp}.xlsx`);
  }
  // ---------- Helpers ----------
  getStudentFullName(record: MedicalCase): string {
    const user = record?.student?.studentResponse?.user;
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown Student';
  }

  getClassName(record: MedicalCase): string {
    return record?.student?.studentResponse?.studentClass?.name || '—';
  }

  getStudentPhone(record: MedicalCase): string {
    const phones = record?.student?.studentResponse?.user?.phoneNumbers;
    return phones && phones.length > 0 ? String(phones[0]) : '—';
  }

  getParentPhone(record: MedicalCase): string {
    const parents = record?.student?.parentsResponse;
    if (parents && parents.length > 0) {
      for (const p of parents) {
        if (p?.user?.phoneNumbers && p.user.phoneNumbers.length > 0) {
          return String(p.user.phoneNumbers[0]);
        }
      }
    }
    return '—';
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }
}
