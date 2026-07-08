import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StudentService,
  StudentDetailResponse,
  ParentResponse,
} from '../student-page/service/student-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-detail',
  imports: [CommonModule],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);

  data = signal<StudentDetailResponse | null>(null);
  loading = true;
  error = false;
  id = signal(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.id.set(id);
    this.studentService.getStudentById(id).subscribe({
      next: (res) => {
        this.data.set(this.applyDraftIfPresent(res, id));
        this.loading = false;
        console.log(res);
      },
      error: (err) => {
        console.log(err);

        this.error = true;
        this.loading = false;
      },
    });
  }

  generatePassword(userId: number) {
    this.studentService.generatePassword(userId).subscribe({
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
      next: (res) => {
        // Standard SweetAlert2 Success Example
        Swal.fire({
          title: 'done',
          text:
            'Your data has been saved successfully.',
          icon: 'success',
        });
      },
    });
  }

  goBack() {
    this.router.navigate(['/students']);
  }

  editStudent() {
    if (!this.id()) return;
    this.router.navigate(['/students', this.id(), 'edit']);
  }

  private applyDraftIfPresent(data: StudentDetailResponse, id: number): StudentDetailResponse {
    const draft = this.studentService.getStudentDraft(id);
    if (!draft) return data;

    const studentResponse: any = {
      ...data.studentResponse,
      user: {
        ...data.studentResponse.user,
        ...(draft.studentUser ?? {}),
      },
      governorate: draft.student?.governorate ?? data.studentResponse.governorate,
      academicScoreInMiddleSchool:
        draft.student?.academicScoreInMiddleSchool ??
        data.studentResponse.academicScoreInMiddleSchool,
      placeOfBirth: draft.student?.placeOfBirth ?? data.studentResponse.placeOfBirth,
      martialParentsStatus:
        draft.student?.martialParentsStatus ?? data.studentResponse.martialParentsStatus,
    };

    const medicalHistories = draft.student?.medicalHistory ?? data.medicalHistories;
    const parentsResponse: any = data.parentsResponse.map((parent) => {
      if (parent.user.gender === 'M' && draft.father) {
        return {
          ...parent,
          user: { ...parent.user, ...(draft.father.user ?? {}) },
          jobName: draft.father.jobName ?? parent.jobName,
        };
      }
      if (parent.user.gender === 'F' && draft.mother) {
        return {
          ...parent,
          user: { ...parent.user, ...(draft.mother.user ?? {}) },
          jobName: draft.mother.jobName ?? parent.jobName,
        };
      }
      return parent;
    });

    return {
      ...data,
      medicalHistories,
      parentsResponse,
      studentResponse,
    };
  }

  getGenderLabel(gender: 'M' | 'F'): string {
    return gender === 'M' ? 'Male' : 'Female';
  }

  formatDate(date: string | Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDateTime(date: string | Date | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  deleteStudent() {
    this.studentService.deleteStudent(this.id()).subscribe({
      error: () => {
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonText: 'Close',
        });
      },
      next: () => {
        Swal.fire({
          title: 'Done',
          text: 'Student has been deleted successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
        }).then(() => {
          this.router.navigate(['/students']);
        });

      },
    });
  }
}
