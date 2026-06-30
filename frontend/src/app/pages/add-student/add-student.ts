import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService, CreateStudentRequest, UserPayload } from '../student-page/service/student-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-student',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-student.html',
  styleUrl: './add-student.css',
})
export class AddStudent implements OnInit {
  private studentService = inject(StudentService);
  private router = inject(Router);

  form = new FormGroup({
    studentUser: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      address: new FormControl('', Validators.required),
      firstNameInArabic: new FormControl('', Validators.required),
      lastNameInArabic: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      nationality: new FormControl('', Validators.required),
      birthDate: new FormControl(''),
      religion: new FormControl('', Validators.required),
      nationalNumber: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
      phoneNumbers: new FormArray<FormControl>([new FormControl('', [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)])]),
      birthDay: new FormControl('', Validators.required),
      birthMonth: new FormControl('', Validators.required),
      birthYear: new FormControl('', Validators.required),
    }),
    student: new FormGroup({
      governorate: new FormControl('', Validators.required),
      academicScoreInMiddleSchool: new FormControl('', Validators.required),
      placeOfBirth: new FormControl('', Validators.required),
      medicalHistoryText: new FormControl(''),
      martialParentsStatus: new FormControl('', Validators.required),
    }),
    father: new FormGroup({
      user: new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        address: new FormControl('', Validators.required),
        firstNameInArabic: new FormControl('', Validators.required),
        lastNameInArabic: new FormControl('', Validators.required),
        gender: new FormControl('M', Validators.required),
        nationality: new FormControl('', Validators.required),
        birthDate: new FormControl(''),
        religion: new FormControl('', Validators.required),
        nationalNumber: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
        phoneNumbers: new FormArray<FormControl>([new FormControl('', [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)])]),
        birthDay: new FormControl('', Validators.required),
        birthMonth: new FormControl('', Validators.required),
        birthYear: new FormControl('', Validators.required),
      }),
      jobName: new FormControl('', Validators.required),
    }),
    mother: new FormGroup({
      user: new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        address: new FormControl('', Validators.required),
        firstNameInArabic: new FormControl('', Validators.required),
        lastNameInArabic: new FormControl('', Validators.required),
        gender: new FormControl('F', Validators.required),
        nationality: new FormControl('', Validators.required),
        birthDate: new FormControl(''),
        religion: new FormControl('', Validators.required),
        nationalNumber: new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
        phoneNumbers: new FormArray<FormControl>([new FormControl('', [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)])]),
        birthDay: new FormControl('', Validators.required),
        birthMonth: new FormControl('', Validators.required),
        birthYear: new FormControl('', Validators.required),
      }),
      jobName: new FormControl('', Validators.required),
    }),
    guardianType: new FormControl('FATHER', Validators.required),
    guardian: new FormGroup({
      user: new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl(''),
        address: new FormControl(''),
        firstNameInArabic: new FormControl(''),
        lastNameInArabic: new FormControl(''),
        gender: new FormControl(''),
        nationality: new FormControl(''),
        birthDate: new FormControl(''),
        religion: new FormControl(''),
        nationalNumber: new FormControl(''),
        phoneNumbers: new FormArray<FormControl>([new FormControl('')]),
        birthDay: new FormControl(''),
        birthMonth: new FormControl(''),
        birthYear: new FormControl(''),
      }),
      jobName: new FormControl(''),
    }),
  });

  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 26 }, (_, i) => 2026 - i);

  genders = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
  ];

  religions = ['Islam', 'Christianity', 'Other'];
  maritalStatuses = ['MARRIED', 'DIVORCED'];
  guardianTypes = ['FATHER', 'MOTHER', 'OTHER'];

  governorates = [
    'Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Sharqia', 'Gharbia',
    'Monufia', 'Beheira', 'Kafr El Sheikh', 'Dakahlia', 'Damietta',
    'Port Said', 'Ismailia', 'Suez', 'North Sinai', 'South Sinai',
    'Beni Suef', 'Fayoum', 'Minya', 'Asyut', 'Sohag', 'Qena',
    'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matrouh',
  ];

  nationalities = [
    'Egyptian', 'American', 'British', 'French', 'German', 'Saudi',
    'Emirati', 'Kuwaiti', 'Jordanian', 'Palestinian', 'Iraqi', 'Syrian',
    'Lebanese', 'Libyan', 'Sudanese', 'Moroccan', 'Tunisian', 'Algerian',
    'Turkish', 'Indian', 'Pakistani', 'Filipino', 'Other',
  ];

  get studentUser() { return this.form.get('studentUser') as FormGroup; }
  get student() { return this.form.get('student') as FormGroup; }
  get father() { return this.form.get('father') as FormGroup; }
  get mother() { return this.form.get('mother') as FormGroup; }
  get guardian() { return this.form.get('guardian') as FormGroup; }
  get guardianType() { return this.form.get('guardianType') as FormControl; }
  get fatherJobName() { return this.father.get('jobName') as FormControl; }
  get motherJobName() { return this.mother.get('jobName') as FormControl; }
  get guardianJobName() { return this.guardian.get('jobName') as FormControl; }

  get studentPhoneNumbers() { return this.studentUser.get('phoneNumbers') as FormArray; }
  get fatherPhoneNumbers() { return (this.father.get('user') as FormGroup).get('phoneNumbers') as FormArray; }
  get motherPhoneNumbers() { return (this.mother.get('user') as FormGroup).get('phoneNumbers') as FormArray; }
  get guardianPhoneNumbers() { return (this.guardian.get('user') as FormGroup).get('phoneNumbers') as FormArray; }

  get showGuardian(): boolean {
    return this.guardianType.value === 'OTHER';
  }

  ngOnInit(): void {
    this.form.get('guardianType')?.valueChanges.subscribe((type) => {
      this.toggleGuardianValidators(type);
    });
    this.toggleGuardianValidators(this.guardianType.value);
  }

  private toggleGuardianValidators(type: string | null) {
    const guardianUser = this.guardian.get('user') as FormGroup;
    const phoneArray = this.guardianPhoneNumbers;
    if (type === 'OTHER') {
      Object.keys(guardianUser.controls).forEach(key => {
        const control = guardianUser.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach(c => {
            c.setValidators([Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)]);
            c.updateValueAndValidity();
          });
          return;
        }
        if (key === 'birthDate') return;
        if (key === 'email') control?.setValidators([Validators.required, Validators.email]);
        else if (key === 'nationalNumber') control?.setValidators([Validators.required, Validators.minLength(14), Validators.maxLength(14)]);
        else control?.setValidators(Validators.required);
        control?.updateValueAndValidity();
      });
      this.guardian.get('jobName')?.setValidators(Validators.required);
      this.guardian.get('jobName')?.updateValueAndValidity();
    } else {
      Object.keys(guardianUser.controls).forEach(key => {
        const control = guardianUser.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach(c => {
            c.clearValidators();
            c.updateValueAndValidity();
          });
          return;
        }
        control?.clearValidators();
        control?.updateValueAndValidity();
      });
      this.guardian.get('jobName')?.clearValidators();
      this.guardian.get('jobName')?.updateValueAndValidity();
    }
  }

  addPhoneNumber(type: 'student' | 'father' | 'mother' | 'guardian') {
    const arr = this.getPhoneArray(type);
    if (arr.length < 3) {
      const validators = type === 'guardian' && this.guardianType.value !== 'OTHER'
        ? []
        : [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)];
      arr.push(new FormControl('', validators));
    }
  }

  removePhoneNumber(type: 'student' | 'father' | 'mother' | 'guardian', index: number) {
    const arr = this.getPhoneArray(type);
    if (arr.length > 1) {
      arr.removeAt(index);
    }
  }

  private getPhoneArray(type: 'student' | 'father' | 'mother' | 'guardian'): FormArray {
    switch (type) {
      case 'student': return this.studentPhoneNumbers;
      case 'father': return this.fatherPhoneNumbers;
      case 'mother': return this.motherPhoneNumbers;
      case 'guardian': return this.guardianPhoneNumbers;
    }
  }

  formatPhoneInput(event: Event, control: AbstractControl) {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.slice(0, 11);
    control.setValue(raw, { emitEvent: false });
    input.value = raw;
  }

  getPhoneDisplay(control: AbstractControl): string {
    const raw = control.value || '';
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return raw.slice(0, 3) + ' ' + raw.slice(3);
    return raw.slice(0, 3) + ' ' + raw.slice(3, 7) + ' ' + raw.slice(7);
  }

  private buildDate(userGroup: FormGroup): string {
    const day = userGroup.get('birthDay')?.value;
    const month = userGroup.get('birthMonth')?.value;
    const year = userGroup.get('birthYear')?.value;
    if (!day || !month || !year) return '';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private buildUserPayload(userGroup: FormGroup): UserPayload {
    const phoneNumbers = (userGroup.get('phoneNumbers') as FormArray).controls.map(c => {
      const raw = c.value || '';
      return parseInt(raw, 10);
    }).filter(n => !isNaN(n));

    return {
      firstName: userGroup.get('firstName')?.value || '',
      lastName: userGroup.get('lastName')?.value || '',
      email: userGroup.get('email')?.value || '',
      address: userGroup.get('address')?.value || '',
      firstNameInArabic: userGroup.get('firstNameInArabic')?.value || '',
      lastNameInArabic: userGroup.get('lastNameInArabic')?.value || '',
      gender: userGroup.get('gender')?.value || 'M',
      nationality: userGroup.get('nationality')?.value || '',
      birthDate: this.buildDate(userGroup),
      religion: userGroup.get('religion')?.value || '',
      nationalNumber: parseInt(userGroup.get('nationalNumber')?.value || '0', 10),
      phoneNumbers,
    };
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    const medicalText = this.form.get('student.medicalHistoryText')?.value || '';
    const medicalHistory = medicalText
      ? medicalText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    const payload: CreateStudentRequest = {
      studentUser: this.buildUserPayload(this.studentUser),
      student: {
        governorate: this.student.get('governorate')?.value || '',
        academicScoreInMiddleSchool: parseInt(this.student.get('academicScoreInMiddleSchool')?.value || '0', 10),
        placeOfBirth: this.student.get('placeOfBirth')?.value || '',
        medicalHistory,
        martialParentsStatus: this.student.get('martialParentsStatus')?.value || '',
      },
      father: {
        user: this.buildUserPayload(this.father.get('user') as FormGroup),
        jobName: this.father.get('jobName')?.value || '',
      },
      mother: {
        user: this.buildUserPayload(this.mother.get('user') as FormGroup),
        jobName: this.mother.get('jobName')?.value || '',
      },
      guardianType: this.guardianType.value as 'FATHER' | 'MOTHER' | 'OTHER',
      guardian: null,
    };

    if (this.guardianType.value === 'OTHER') {
      payload.guardian = {
        user: this.buildUserPayload(this.guardian.get('user') as FormGroup),
        jobName: this.guardian.get('jobName')?.value || '',
      };
    }

    this.studentService.createStudent(payload).subscribe({
      next: () => {
        Swal.fire({
          title: 'Done!',
          text: 'Student has been registered successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigate(['/students']);
        });
      },
      error: (err) => {
        if (err.status === 401) {
          Swal.fire({
            title: 'Session Expired',
            text: 'Please login again.',
            icon: 'error',
            confirmButtonText: 'Login',
          }).then(() => this.router.navigate(['/login']));
        } else {
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Something went wrong. Please try again.',
            icon: 'error',
            confirmButtonText: 'Try Again',
          });
        }
      },
    });
  }

  cancel() {
    this.router.navigate(['/students']);
  }

  controlInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && control.touched);
  }

  getError(control: AbstractControl | null, errorKey: string): boolean {
    return !!(control && control.hasError(errorKey) && control.touched);
  }
}
