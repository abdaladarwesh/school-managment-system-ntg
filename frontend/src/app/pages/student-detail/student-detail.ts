import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StudentService,
  StudentDetailResponse,
} from '../student-page/service/student-service';
import { RegulateTextPipe } from '../../core/pipes/regulate-text-pipe';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { LocalizeNamePipe } from '../../core/pipes/localize-name.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RegulateTextPipe, TranslatePipe, LocalizeNamePipe],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly translationService = inject(TranslationService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

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
    this.studentService.getStudentById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.data.set(this.applyDraftIfPresent(res, id));
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = true;
          this.loading = false;
        },
      });
  }

  generatePassword(userId: number) {
    this.studentService.generatePassword(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to generate password', err);
        },
        next: () => {
          this.notificationService.handle200('Your data has been saved successfully.');
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
    this.studentService.deleteStudent(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Failed to delete student', err);
        },
        next: () => {
          this.notificationService.handle200('Student has been deleted successfully');
          this.router.navigate(['/students']);
        },
      });
  }
}
