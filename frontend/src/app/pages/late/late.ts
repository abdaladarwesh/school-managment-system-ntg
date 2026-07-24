import { Component, HostListener, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { DelayService } from './service/DelayService';
import { BackendDelay, LateRecord } from './service/delay.models';
import { StudentResponse, StudentService } from '../student-page/service/student-service';
import { StudentSearchComponent } from '../../components/student-search/student-search.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { LocalizeNamePipe } from '../../core/pipes/localize-name.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-late',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StudentSearchComponent, TranslatePipe, LocalizeNamePipe, DatePipe],
  templateUrl: './late.html',
  styleUrls: ['./late.css'],
})
export class LateComponent implements OnInit {
  private readonly delayService = inject(DelayService);
  private readonly studentService = inject(StudentService);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals
  students = signal<LateRecord[]>([]);
  studentsList = signal<StudentResponse[]>([]);
  searchText = signal('');
  selectedClass = signal('All Classes');

  // UI States
  showLateArrivalModal = false;
  isEditMode = false;
  activeDropdownIndex: number | null = null;
  currentEditId: number | null = null;

  lateForm = new FormGroup({
    studentId: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    timeOfArrival: new FormControl<string>('', [Validators.required]),
    notes: new FormControl<string>(''),
  });

  selectedStudentForRecord: StudentResponse | null = null;

  ngOnInit() {
    this.fetchDelays();
    this.fetchAllStudents();
  }

  fetchDelays() {
    this.delayService.getDelays()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: BackendDelay[]) => {
          this.students.set(data.map((item) => this.mapBackendToFrontend(item)));
        },
        error: (err) => {
          console.error('Failed to fetch late arrival records', err);
        },
      });
  }

  fetchAllStudents() {
    this.studentService.getAllStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.studentsList.set(res),
        error: () => console.error('Failed to load students list'),
      });
  }

  private mapBackendToFrontend(item: BackendDelay): LateRecord {
    const arrivalDate = item.timeOfArrival ? new Date(item.timeOfArrival) : new Date();
    const hours = arrivalDate.getHours();
    const minutes = arrivalDate.getMinutes();

    const isVeryLate = hours > 8 || (hours === 8 && minutes > 30);
    const status: 'Very Late' | 'Late' = isVeryLate ? 'Very Late' : 'Late';

    return {
      id: item.id,
      studentId: item.student?.id,
      name: `${item.student?.user?.firstName || ''} ${item.student?.user?.lastName || ''}`.trim(),
      nameAr: `${item.student?.user?.firstNameInArabic || ''} ${item.student?.user?.lastNameInArabic || ''}`.trim(),
      class: item.student?.studentClass?.name || 'N/A',
      date: item.date || '',
      arrivalTime: arrivalDate,
      reason: 'Delay',
      notes: item.notes || '',
      status: status,
    };
  }

  onStudentSelected(student: StudentResponse) {
    this.selectedStudentForRecord = student;
    this.lateForm.patchValue({ studentId: student.id });
  }

  private getCurrentDateTimeLocal(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  openLateArrivalModal() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.selectedStudentForRecord = null;
    this.lateForm.reset({
      studentId: 0,
      timeOfArrival: this.getCurrentDateTimeLocal(),
      notes: '',
    });
    this.showLateArrivalModal = true;
  }

  openEditModal(record: LateRecord, index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = null;
    this.isEditMode = true;
    this.currentEditId = record.id || null;

    this.selectedStudentForRecord =
      this.studentsList().find((s) => s.id === record.studentId) || null;

    const formattedDateTime = `${record.date}T${record.arrivalTime}`;

    this.lateForm.patchValue({
      studentId: record.studentId || 0,
      timeOfArrival: formattedDateTime,
      notes: record.notes,
    });

    this.showLateArrivalModal = true;
  }

  closeLateArrivalModal() {
    this.showLateArrivalModal = false;
    this.selectedStudentForRecord = null;
  }

  saveRecord() {
    if (this.lateForm.invalid) {
      this.lateForm.markAllAsTouched();
      this.notificationService.warning(
        'Please select a student and specify the arrival date & time.',
        'Validation Error!'
      );
      return;
    }

    const val = this.lateForm.value;

    let formattedTime = val.timeOfArrival!;
    if (formattedTime && formattedTime.length === 16) {
      formattedTime += ':00';
    }

    if (this.isEditMode && this.currentEditId) {
      const updatePayload = {
        id: this.currentEditId,
        student: { id: val.studentId! },
        timeOfArrival: formattedTime,
        notes: val.notes || '',
      };

      this.delayService.updateDelay(updatePayload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.fetchDelays();
            this.closeLateArrivalModal();
            this.notificationService.handle200('Record updated successfully.');
          },
          error: (err) => console.error('Failed to update late arrival record', err),
        });
    } else {
      const createPayload = {
        studentId: val.studentId!,
        timeOfArrival: formattedTime,
        notes: val.notes || '',
      };

      this.delayService.createDelay(createPayload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.fetchDelays();
            this.closeLateArrivalModal();
            this.notificationService.handle201('Late arrival registered successfully.');
          },
          error: (err) => console.error('Failed to register late arrival', err),
        });
    }
  }

  deleteRecord(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = null;
    const record = this.students()[index];

    if (!record?.id) return;

    if (confirm(this.translationService.translate('Are you sure you want to delete this late arrival record?'))) {
      this.delayService.deleteDelay(record.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.students.update((list) => list.filter((_, i) => i !== index));
            this.notificationService.handle200('Record has been deleted.');
          },
          error: (err) => console.error('Could not delete late arrival record', err),
        });
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeDropdownIndex = null;
  }

  toggleDropdown(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
  }

  classes = computed(() => {
    const all = this.students().map((s) => s.class);
    return ['All Classes', ...new Set(all)];
  });

  get filteredStudents() {
    return this.students().filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(this.searchText().toLowerCase()) ||
        s.notes?.toLowerCase().includes(this.searchText().toLowerCase());
      const matchClass = this.selectedClass() === 'All Classes' || s.class === this.selectedClass();
      return matchSearch && matchClass;
    });
  }

  get totalRecords(): number {
    return this.students().length;
  }

  get todayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.students().filter((s) => s.date === today).length;
  }

  get classesAffectedCount(): number {
    return new Set(this.students().map((s) => s.class)).size;
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return (parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]).toUpperCase();
  }
}
