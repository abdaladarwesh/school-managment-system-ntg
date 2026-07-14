import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PermissionRequest, PermissionResponse, PermissionService } from './service/permission-service';
import { AsyncPipe } from '@angular/common';
import Swal from 'sweetalert2';
import { StudentResponse, StudentService } from '../student-page/service/student-service';
import { StudentSearchComponent } from '../../components/student-search/student-search.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, StudentSearchComponent, TranslatePipe],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css',
})
export class PermissionComponent implements OnInit {
  ngOnInit(): void {
    this.permissionService.getAllPermissions().subscribe({
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong with your request.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      },
      next: (res) => {
        this.permission.set(res);
      },
    });
    this.studentService.getAllStudents().subscribe({
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong with your request.',
          icon: 'error',
          confirmButtonText: 'Try Again',
        });
      },
      next: (res) => {
        this.students.set(res);
      },
    });
  }
  permissionService = inject(PermissionService);
  studentService = inject(StudentService);

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

  permission = signal<PermissionResponse[]>([]);

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
      const matchesSearch = item.student.user.firstName
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
      Swal.fire({
        title: 'Validation Error!',
        text: 'Please fill all required fields correctly.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    const requestData: PermissionRequest = {
      studentId: this.requestForm.value.studentId!,
      reason: this.requestForm.value.reason!,
      notes: this.requestForm.value.notes! || ""
    };

    this.permissionService.createPermission(requestData).subscribe({
      next: (res) => {
        this.permission.update(permissions => [res, ...permissions]);
        this.closePopup();
        Swal.fire({
          title: 'Success!',
          text: 'Leave permission requested successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to create request. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
