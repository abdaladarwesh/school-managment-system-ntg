import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PermissionRequest, PermissionResponse, PermissionService } from './service/permission-service';
import { StudentResponse, StudentService } from '../student-page/service/student-service';
import { StudentSearchComponent } from '../../components/student-search/student-search.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { LocalizeNamePipe } from '../../core/pipes/localize-name.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, StudentSearchComponent, TranslatePipe, LocalizeNamePipe],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionComponent implements OnInit {
  private readonly permissionService = inject(PermissionService);
  private readonly studentService = inject(StudentService);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  students = signal<StudentResponse[]>([]);

  showPopup = false;
  searchQuery = '';
  selectedGrade = '';
  selectedClass = '';

  requestForm = new FormGroup({
    studentId: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    reason: new FormControl<string>('', [Validators.required]),
    notes: new FormControl<string>(''),
  });

  selectedStudentForRequest: StudentResponse | null = null;
  permission = signal<PermissionResponse[]>([]);

  ngOnInit(): void {
    this.permissionService.getAllPermissions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to load permissions', err);
        },
        next: (res) => {
          this.permission.set(res);
        },
      });

    this.studentService.getAllStudents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to load students', err);
        },
        next: (res) => {
          this.students.set(res);
        },
      });
  }

  onStudentSelected(student: StudentResponse) {
    this.selectedStudentForRequest = student;
    this.requestForm.patchValue({ studentId: student.id });
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.requestForm.reset({ studentId: 0, reason: '', notes: '' });
    this.selectedStudentForRequest = null;
  }

  classes = computed(() => {
    const allNames = this.permission().map((p) => p.student.studentClass?.name);
    return [...new Set(allNames)];
  });

  grades = computed(() => {
    const allGrades = this.permission().map((p) => p.student.studentClass?.grade.name);
    return [...new Set(allGrades)];
  });

  get filteredPermission() {
    return this.permission().filter((item) => {
      const isAr = this.translationService.currentLang() === 'ar';
      const searchName = isAr && item.student.user.firstNameInArabic
        ? `${item.student.user.firstNameInArabic} ${item.student.user.lastNameInArabic || ''}`
        : `${item.student.user.firstName} ${item.student.user.lastName}`;
      const matchesSearch = searchName
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      const matchesGrade = this.selectedGrade
        ? item.student.studentClass?.grade.name === this.selectedGrade
        : true;
      const matchesClass = this.selectedClass
        ? item.student.studentClass?.name === this.selectedClass
        : true;
      return matchesSearch && matchesGrade && matchesClass;
    });
  }

  get totalRequest() {
    return this.permission().length;
  }

  saveRequest() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.notificationService.warning(
        'Please fill all required fields correctly.',
        'Validation Error!'
      );
      return;
    }

    const requestData: PermissionRequest = {
      studentId: this.requestForm.value.studentId!,
      reason: this.requestForm.value.reason!,
      notes: this.requestForm.value.notes! || ''
    };

    this.permissionService.createPermission(requestData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.permission.update(permissions => [res, ...permissions]);
          this.closePopup();
          this.notificationService.handle201('Leave permission requested successfully.');
        },
        error: (err) => {
          console.error('Failed to create permission request', err);
        },
      });
  }
}
