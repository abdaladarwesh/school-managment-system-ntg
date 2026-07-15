import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ViolationService } from './service/violation.service';
import { BackendViolation, ViolationRecordUI } from './service/violation.models';
import { StudentResponse, StudentService } from '../student-page/service/student-service';
import { StudentSearchComponent } from '../../components/student-search/student-search.component';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-violations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StudentSearchComponent, TranslatePipe],
  templateUrl: './violations.html',
  styleUrls: ['./violations.css'],
})
export class ViolationsComponent implements OnInit {
  private violationService = inject(ViolationService);
  private studentService = inject(StudentService);
  private translationService = inject(TranslationService);

  // Signals for dynamic data
  violations = signal<ViolationRecordUI[]>([]);
  studentsList = signal<StudentResponse[]>([]);
  searchText = signal('');
  selectedGrade = signal('All Grades');
  selectedClass = signal('All Classes');

  // UI States
  isModalOpen = signal(false);
  isSuccessModalOpen = signal(false);

  // Reactive Form specifically mapping your requested inputs
  violationForm = new FormGroup({
    studentId: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    violation: new FormControl<string>('', [Validators.required]),
    nameOfViolator: new FormControl<string>('', [Validators.required]),
    applicableProcedure: new FormControl<string>('', [Validators.required]),
    referringAuthority: new FormControl<string>('', [Validators.required]),
    ismeeting: new FormControl<boolean>(false),
    notes: new FormControl<string>(''),
  });

  ngOnInit(): void {
    this.fetchViolations();
    this.fetchAllStudents();
  }

  // --- API FETCH METHODS ---

  fetchViolations() {
    this.violationService.getViolations().subscribe({
      next: (data: BackendViolation[]) => {
        this.violations.set(data.map((item) => this.mapBackendToFrontend(item)));
      },
      error: (err) => {
        console.error('Failed to load violations', err);
      },
    });
  }

  fetchAllStudents() {
    this.studentService.getAllStudents().subscribe({
      next: (res) => this.studentsList.set(res),
      error: () => console.error('Failed to load student list'),
    });
  }

  private mapBackendToFrontend(item: BackendViolation): ViolationRecordUI {
    const fullName =
      `${item.student?.user?.firstName || ''} ${item.student?.user?.lastName || ''}`.trim();
    return {
      id: item.id,
      studentId: item.student?.id || 0,
      studentUserId: item.student?.user?.id || 0,
      date: item.date ? item.date.split('T')[0] : 'N/A',
      studentName: fullName || 'Unknown Student',
      class: item.student?.studentClass?.name || 'N/A',
      violation: item.violation,
      parentalSummons: item.ismeeting, // Map ismeeting -> parentalSummons UI
      notes: item.notes,
      nameOfViolator: item.nameOfViolator,
      applicableProcedure: item.applicableProcedure,
      referringAuthority: item.referringAuthority,
    };
  }

  // --- ACTIONS ---

  onStudentSelected(student: StudentResponse) {
    this.violationForm.patchValue({ studentId: student.id });
  }

  openModal() {
    this.violationForm.reset({
      studentId: 0,
      violation: '',
      nameOfViolator: '',
      applicableProcedure: '',
      referringAuthority: '',
      ismeeting: false,
      notes: '',
    });
    this.isModalOpen.set(true);
  }
 
  closeModal() {
    this.isModalOpen.set(false);
  }
 
  triggerSuccessMessage() {
    this.isSuccessModalOpen.set(true);
  }
  closeSuccessModal() {
    this.isSuccessModalOpen.set(false);
  }

  saveViolation() {
    if (this.violationForm.invalid) {
      this.violationForm.markAllAsTouched();
      Swal.fire({
        title: this.translationService.translate('Validation Error!'),
        text: this.translationService.translate(
          'Please fill in all required fields and select a student.',
        ),
        icon: 'warning',
      });
      return;
    }

    const val = this.violationForm.value;
    const payload = {
      studentId: val.studentId!,
      violation: val.violation!,
      nameOfViolator: val.nameOfViolator!,
      applicableProcedure: val.applicableProcedure!,
      referringAuthority: val.referringAuthority!,
      ismeeting: val.ismeeting || false,
      notes: val.notes || '',
    };

    this.violationService.createViolation(payload).subscribe({
      next: () => {
        this.fetchViolations();
        this.closeModal();
        Swal.fire(
          this.translationService.translate('Success!'),
          this.translationService.translate('Violation recorded successfully.'),
          'success',
        );
      },
      error: (err) => {
        console.error('Failed to save violation', err);
      },
    });
  }

  // --- COMPUTED GETTERS ---

  classesList = computed(() => {
    const classes = this.violations()
      .map((v) => v.class)
      .filter(Boolean);
    return ['All Classes', ...new Set(classes)];
  });

  get filteredViolations() {
    return this.violations().filter((v) => {
      const matchSearch =
        v.studentName.toLowerCase().includes(this.searchText().toLowerCase()) ||
        v.violation.toLowerCase().includes(this.searchText().toLowerCase());
      const matchClass = this.selectedClass() === 'All Classes' || v.class === this.selectedClass();
      return matchSearch && matchClass;
    });
  }

  get totalCount(): number {
    return this.violations().length;
  }

  get parentalSummonsCount(): number {
    return this.violations().filter((v) => v.parentalSummons).length;
  }

  get thisMonthCount(): number {
    const currentYearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-07"
    return this.violations().filter((v) => v.date && v.date.startsWith(currentYearMonth)).length;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  sendNotificationToParent(record: ViolationRecordUI) {
    if (!record.studentId) {
      Swal.fire({
        title: this.translationService.translate('Error'),
        text: this.translationService.translate('Student ID not found.'),
        icon: 'error',
      });
      return;
    }

    this.studentService.getStudentById(record.studentId).subscribe({
      next: (res) => {
        if (!res.parentsResponse || res.parentsResponse.length === 0) {
          Swal.fire({
            title: this.translationService.translate('Error'),
            text: this.translationService.translate('No parents found for this student.'),
            icon: 'error',
          });
          return;
        }

        const requests = res.parentsResponse.map((parent) => {
          return this.violationService.createNotification({
            title: 'Parent Summoning notification',
            body: record.violation,
            priority: 'HIGH',
            type: 'PARENT_SUMMON',
            receiverId: parent.user.id,
          });
        });

        forkJoin(requests).subscribe({
          next: () => {
            this.triggerSuccessMessage();
          },
          error: (err) => {
            console.error('Failed to send notifications to parents', err);
            Swal.fire({
              title: this.translationService.translate('Error'),
              text: this.translationService.translate('Failed to send notification to one or more parents.'),
              icon: 'error',
            });
          },
        });
      },
      error: (err) => {
        console.error('Failed to fetch student details', err);
        Swal.fire({
          title: this.translationService.translate('Error'),
          text: this.translationService.translate('Failed to retrieve parent information.'),
          icon: 'error',
        });
      },
    });
  }

  sendNotificationToStudent(record: ViolationRecordUI) {
    if (!record.studentUserId) {
      Swal.fire({
        title: this.translationService.translate('Error'),
        text: this.translationService.translate('Student user ID not found.'),
        icon: 'error',
      });
      return;
    }

    this.violationService
      .createNotification({
        title: 'Disciplinary Violation Notification',
        body: record.violation,
        priority: 'HIGH',
        type: 'STUDENT_VIOLATION',
        receiverId: record.studentUserId,
      })
      .subscribe({
        next: () => {
          this.triggerSuccessMessage();
        },
        error: (err) => {
          console.error('Failed to send notification to student', err);
          Swal.fire({
            title: this.translationService.translate('Error'),
            text: this.translationService.translate('Failed to send notification to student.'),
            icon: 'error',
          });
        },
      });
  }
}
