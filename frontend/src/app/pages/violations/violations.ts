import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { forkJoin } from 'rxjs';
import { LocalizeNamePipe } from '../../core/pipes/localize-name.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-violations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StudentSearchComponent, TranslatePipe, LocalizeNamePipe],
  templateUrl: './violations.html',
  styleUrls: ['./violations.css'],
})
export class ViolationsComponent implements OnInit {
  private readonly violationService = inject(ViolationService);
  private readonly studentService = inject(StudentService);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  violations = signal<ViolationRecordUI[]>([]);
  studentsList = signal<StudentResponse[]>([]);
  searchText = signal('');
  selectedGrade = signal('All Grades');
  selectedClass = signal('All Classes');

  isModalOpen = signal(false);
  isSuccessModalOpen = signal(false);

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

  fetchViolations() {
    this.violationService.getViolations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: BackendViolation[]) => {
          this.violations.set(data.map((item) => this.mapBackendToFrontend(item)));
        },
        error: (err) => {
          console.error('Failed to load violations', err);
        },
      });
  }

  fetchAllStudents() {
    this.studentService.getAllStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.studentsList.set(res),
        error: () => console.error('Failed to load student list'),
      });
  }

  private mapBackendToFrontend(item: BackendViolation): ViolationRecordUI {
    const fullName =
      `${item.student?.user?.firstName || ''} ${item.student?.user?.lastName || ''}`.trim();
    const fullNameAr =
      `${item.student?.user?.firstNameInArabic || ''} ${item.student?.user?.lastNameInArabic || ''}`.trim();
    return {
      id: item.id,
      studentId: item.student?.id || 0,
      studentUserId: item.student?.user?.id || 0,
      date: item.date ? item.date.split('T')[0] : 'N/A',
      studentName: fullName || 'Unknown Student',
      studentNameAr: fullNameAr,
      class: item.student?.studentClass?.name || 'N/A',
      violation: item.violation,
      parentalSummons: item.ismeeting,
      notes: item.notes,
      nameOfViolator: item.nameOfViolator,
      applicableProcedure: item.applicableProcedure,
      referringAuthority: item.referringAuthority,
    };
  }

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
      this.notificationService.warning(
        'Please fill in all required fields and select a student.',
        'Validation Error!'
      );
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

    this.violationService.createViolation(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fetchViolations();
          this.closeModal();
          this.notificationService.handle201('Violation recorded successfully.');
        },
        error: (err) => {
          console.error('Failed to save violation', err);
        },
      });
  }

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
    const currentYearMonth = new Date().toISOString().slice(0, 7);
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
      this.notificationService.error('Student ID not found.');
      return;
    }

    this.studentService.getStudentById(record.studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.parentsResponse || res.parentsResponse.length === 0) {
            this.notificationService.error('No parents found for this student.');
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

          forkJoin(requests)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.triggerSuccessMessage();
              },
              error: (err) => {
                console.error('Failed to send notifications to parents', err);
                this.notificationService.error('Failed to send notification to one or more parents.');
              },
            });
        },
        error: (err) => {
          console.error('Failed to fetch student details', err);
          this.notificationService.error('Failed to retrieve parent information.');
        },
      });
  }

  sendNotificationToStudent(record: ViolationRecordUI) {
    if (!record.studentUserId) {
      this.notificationService.error('Student user ID not found.');
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.triggerSuccessMessage();
        },
        error: (err) => {
          console.error('Failed to send notification to student', err);
          this.notificationService.error('Failed to send notification to student.');
        },
      });
  }
}
