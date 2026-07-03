import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-late',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StudentSearchComponent],
  templateUrl: './late.html',
  styleUrls: ['./late.css'],
})
export class LateComponent implements OnInit {
  private delayService = inject(DelayService);
  private studentService = inject(StudentService);

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

  // Reactive Form updated for datetime-local
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

  // --- API DATA FETCHING ---

  fetchDelays() {
    this.delayService.getDelays().subscribe({
      next: (data: BackendDelay[]) => {
        this.students.set(data.map((item) => this.mapBackendToFrontend(item)));
      },
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch late arrival records.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      },
    });
  }

  fetchAllStudents() {
    this.studentService.getAllStudents().subscribe({
      next: (res) => this.studentsList.set(res),
      error: () => console.error('Failed to load students list'),
    });
  }

  private mapBackendToFrontend(item: BackendDelay): LateRecord {
    // Split "2026-07-03T09:00:00" into clean visual parts
    const rawTime = item.timeOfArrival || '';
    const [datePart, timeStr] = rawTime.split('T');
    const timeParts = timeStr ? timeStr.substring(0, 5) : '00:00';

    const status: 'Very Late' | 'Late' = timeParts > '08:30' ? 'Very Late' : 'Late';

    return {
      id: item.id,
      studentId: item.student?.id,
      name: `${item.student?.user?.firstName || ''} ${item.student?.user?.lastName || ''}`.trim(),
      class: item.student?.studentClass?.name || 'N/A',
      date: datePart || item.date || '',
      arrivalTime: timeParts,
      reason: 'Delay',
      notes: item.notes || '',
      status: status,
    };
  }

  // --- FORM & MODAL ACTIONS ---

  onStudentSelected(student: StudentResponse) {
    this.selectedStudentForRecord = student;
    this.lateForm.patchValue({ studentId: student.id });
  }

  // Helper to format Date for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
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

    // Format UI back to datetime-local string
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
      Swal.fire({
        title: 'Validation Error!',
        text: 'Please select a student and specify the arrival date & time.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    const val = this.lateForm.value;

    // Ensure exact backend expected string format: YYYY-MM-DDTHH:mm:ss
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

      this.delayService.updateDelay(updatePayload).subscribe({
        next: () => {
          this.fetchDelays();
          this.closeLateArrivalModal();
          Swal.fire({ title: 'Updated!', text: 'Record updated successfully.', icon: 'success' });
        },
        error: () =>
          Swal.fire({ title: 'Error!', text: 'Failed to update record.', icon: 'error' }),
      });
    } else {
      // Exact payload requested by your backend
      const createPayload = {
        studentId: val.studentId!,
        timeOfArrival: formattedTime,
        notes: val.notes || '',
      };

      this.delayService.createDelay(createPayload).subscribe({
        next: () => {
          this.fetchDelays();
          this.closeLateArrivalModal();
          Swal.fire({
            title: 'Success!',
            text: 'Late arrival registered successfully.',
            icon: 'success',
          });
        },
        error: () =>
          Swal.fire({ title: 'Error!', text: 'Failed to register arrival.', icon: 'error' }),
      });
    }
  }

  deleteRecord(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = null;
    const record = this.students()[index];

    if (!record?.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this late arrival record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.delayService.deleteDelay(record.id!).subscribe({
          next: () => {
            this.students.update((list) => list.filter((_, i) => i !== index));
            Swal.fire('Deleted!', 'Record has been deleted.', 'success');
          },
          error: () => Swal.fire('Error!', 'Could not delete record.', 'error'),
        });
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeDropdownIndex = null;
  }

  toggleDropdown(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdownIndex = this.activeDropdownIndex === index ? null : index;
  }

  // --- COMPUTED / GETTERS ---

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
