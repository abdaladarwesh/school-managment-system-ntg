import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  StudentService,
  CreateStudentRequest,
  UserPayload,
  StudentDetailResponse,
  ParentResponse,
} from '../student-page/service/student-service';
import { ParentSearchComponent } from '../../components/parent-search/parent-search.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ParentSearchComponent],
  templateUrl: './add-student.html',
  styleUrl: './add-student.css',
})
export class AddStudent implements OnInit {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private editStudentId: number | null = null;
  isEditMode = false;

  // --- Parent Search State ---
  fatherMode = signal<'new' | 'existing'>('new');
  motherMode = signal<'new' | 'existing'>('new');
  guardianMode = signal<'new' | 'existing'>('new');

  selectedFather = signal<ParentResponse | null>(null);
  selectedMother = signal<ParentResponse | null>(null);
  selectedGuardian = signal<ParentResponse | null>(null);

  allParents = signal<ParentResponse[]>([]);
  // ---------------------------

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
      nationalNumber: new FormControl('', [
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
      ]),
      phoneNumbers: new FormArray<FormControl>([
        new FormControl('', [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)]),
      ]),
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
        nationalNumber: new FormControl('', [
          Validators.required,
          Validators.minLength(14),
          Validators.maxLength(14),
        ]),
        phoneNumbers: new FormArray<FormControl>([
          new FormControl('', [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)]),
        ]),
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
        nationalNumber: new FormControl('', [
          Validators.required,
          Validators.minLength(14),
          Validators.maxLength(14),
        ]),
        phoneNumbers: new FormArray<FormControl>([
          new FormControl('', [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)]),
        ]),
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
  years = Array.from({ length: 70 }, (_, i) => 2026 - i);

  genders = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
  ];

  religions = ['Muslim', 'Christianity', 'Other'];
  maritalStatuses = ['MARRIED', 'DIVORCED'];
  guardianTypes = ['FATHER', 'MOTHER', 'OTHER'];

  governorates = [
    'Cairo',
    'Alexandria',
    'Giza',
    'Qalyubia',
    'Sharqia',
    'Gharbia',
    'Monufia',
    'Beheira',
    'Kafr El Sheikh',
    'Dakahlia',
    'Damietta',
    'Port Said',
    'Ismailia',
    'Suez',
    'North Sinai',
    'South Sinai',
    'Beni Suef',
    'Fayoum',
    'Minya',
    'Asyut',
    'Sohag',
    'Qena',
    'Luxor',
    'Aswan',
    'Red Sea',
    'New Valley',
    'Matrouh',
  ];

  nationalities = [
    'Egyptian',
    'American',
    'British',
    'French',
    'German',
    'Saudi',
    'Emirati',
    'Kuwaiti',
    'Jordanian',
    'Palestinian',
    'Iraqi',
    'Syrian',
    'Lebanese',
    'Libyan',
    'Sudanese',
    'Moroccan',
    'Tunisian',
    'Algerian',
    'Turkish',
    'Indian',
    'Pakistani',
    'Filipino',
    'Other',
  ];

  get studentUser() {
    return this.form.get('studentUser') as FormGroup;
  }
  get student() {
    return this.form.get('student') as FormGroup;
  }
  get father() {
    return this.form.get('father') as FormGroup;
  }
  get mother() {
    return this.form.get('mother') as FormGroup;
  }
  get guardian() {
    return this.form.get('guardian') as FormGroup;
  }
  get guardianType() {
    return this.form.get('guardianType') as FormControl;
  }
  get fatherJobName() {
    return this.father.get('jobName') as FormControl;
  }
  get motherJobName() {
    return this.mother.get('jobName') as FormControl;
  }
  get guardianJobName() {
    return this.guardian.get('jobName') as FormControl;
  }

  get studentPhoneNumbers() {
    return this.studentUser.get('phoneNumbers') as FormArray;
  }
  get fatherPhoneNumbers() {
    return (this.father.get('user') as FormGroup).get('phoneNumbers') as FormArray;
  }
  get motherPhoneNumbers() {
    return (this.mother.get('user') as FormGroup).get('phoneNumbers') as FormArray;
  }
  get guardianPhoneNumbers() {
    return (this.guardian.get('user') as FormGroup).get('phoneNumbers') as FormArray;
  }

  get showGuardian(): boolean {
    return this.guardianType.value === 'OTHER';
  }

  ngOnInit(): void {
    // --- Fetch parents for the search component ---
    // Make sure 'getParents()' or the equivalent method exists in your StudentService
    if ((this.studentService as any).getParents) {
      (this.studentService as any).getParents().subscribe({
        next: (res: ParentResponse[]) => this.allParents.set(res),
        error: (err: any) => console.error('Failed to fetch parents:', err),
      });
    }

    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    if (idParam) {
      this.isEditMode = true;
      this.editStudentId = idParam;
      this.loadEditData(idParam);
    }

    this.form.get('guardianType')?.valueChanges.subscribe((type) => {
      this.toggleGuardianValidators(type);
    });
    this.toggleGuardianValidators(this.guardianType.value);
  }

  // --- Parent Selection Handlers ---
  setMode(type: 'father' | 'mother' | 'guardian', mode: 'new' | 'existing') {
    if (type === 'father') this.fatherMode.set(mode);
    if (type === 'mother') this.motherMode.set(mode);
    if (type === 'guardian') this.guardianMode.set(mode);
  }

  onParentSelected(parent: ParentResponse, type: 'father' | 'mother' | 'guardian') {
    if (type === 'father') {
      console.log(parent);
      this.selectedFather.set(parent);
      // Remove the 4th argument so it uses the normalized 'user' fallbacks
      this.patchParentGroup(this.father, parent.user as any, parent.jobName || '');
    } else if (type === 'mother') {
      console.log(parent);
      this.selectedMother.set(parent);
      this.patchParentGroup(this.mother, parent.user as any, parent.jobName || '');
    } else if (type === 'guardian') {
      this.selectedGuardian.set(parent);
      this.patchParentGroup(this.guardian, parent.user as any, parent.jobName || '');
    }
  } // ---------------------------------

  private loadEditData(id: number) {
    this.studentService.getStudentById(id).subscribe({
      next: (data) => this.patchFormFromDetail(data, id),
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'Could not load the student data for editing.',
          icon: 'error',
          confirmButtonText: 'Back',
        }).then(() => this.router.navigate(['/students', id]));
      },
    });
  }

  private patchFormFromDetail(data: StudentDetailResponse, id: number) {
    const student = data.studentResponse;
    const studentUser = student.user;
    const father = data.parentsResponse.find((parent) => parent.user.gender === 'M');
    const mother = data.parentsResponse.find((parent) => parent.user.gender === 'F');
    const draft = this.studentService.getStudentDraft(id);
    const draftAny = draft as any;
    const merged = draft ? this.mergeDraftIntoDetail(data, draft) : null;

    this.studentUser.patchValue({
      firstName: merged?.studentUser?.firstName ?? studentUser.firstName,
      lastName: merged?.studentUser?.lastName ?? studentUser.lastName,
      email: merged?.studentUser?.email ?? studentUser.email,
      address: merged?.studentUser?.address ?? studentUser.address,
      firstNameInArabic: merged?.studentUser?.firstNameInArabic ?? studentUser.firstNameInArabic,
      lastNameInArabic: merged?.studentUser?.lastNameInArabic ?? studentUser.lastNameInArabic,
      gender: merged?.studentUser?.gender ?? studentUser.gender,
      religion: merged?.studentUser?.religion ?? studentUser.religion,

      nationality: merged?.studentUser?.nationality ?? studentUser.nationality,
      birthDay: draftAny?.studentUser?.birthDay ?? this.extractDay(studentUser.birthDate),
      birthMonth: draftAny?.studentUser?.birthMonth ?? this.extractMonth(studentUser.birthDate),
      birthYear: draftAny?.studentUser?.birthYear ?? this.extractYear(studentUser.birthDate),
      nationalNumber: merged?.studentUser?.nationalNumber ?? String(studentUser.nationalNumber),
    });

    this.replacePhoneNumbers(
      this.studentPhoneNumbers,
      merged?.studentUser?.phoneNumbers ??
        studentUser.phoneNumbers.map((phone) => this.normalizePhone(phone)),
    );

    this.student.patchValue({
      governorate: merged?.student?.governorate ?? student.governorate,
      academicScoreInMiddleSchool:
        merged?.student?.academicScoreInMiddleSchool ?? String(student.academicScoreInMiddleSchool),
      placeOfBirth: merged?.student?.placeOfBirth ?? student.placeOfBirth,
      medicalHistoryText: Array.isArray(draftAny?.student?.medicalHistory)
        ? draftAny.student.medicalHistory.join(', ')
        : data.medicalHistories.join(', '),
      martialParentsStatus: merged?.student?.martialParentsStatus ?? student.martialParentsStatus,
    });

    if (father) {
      this.patchParentGroup(
        this.father,
        father.user,
        father.jobName,
        draftAny?.father ?? merged?.father,
      );
    }
    if (mother) {
      this.patchParentGroup(
        this.mother,
        mother.user,
        mother.jobName,
        draftAny?.mother ?? merged?.mother,
      );
    }

    const guardian = draftAny?.guardian ?? merged?.guardian;
    if (guardian?.user?.firstName || guardian?.jobName) {
      this.guardianType.setValue('OTHER');
      this.patchParentGroup(this.guardian, guardian.user as any, guardian.jobName || '', guardian);
      this.toggleGuardianValidators('OTHER');
    } else if (merged?.guardianType) {
      this.guardianType.setValue(merged.guardianType);
      this.toggleGuardianValidators(merged.guardianType);
    } else if (data.parentsResponse.length > 0) {
      this.guardianType.setValue(data.parentsResponse[0].user.gender === 'M' ? 'FATHER' : 'MOTHER');
      this.toggleGuardianValidators(this.guardianType.value);
    }
  }

  private mergeDraftIntoDetail(
    data: StudentDetailResponse,
    draft: Partial<CreateStudentRequest>,
  ): Partial<CreateStudentRequest> {
    const draftAny = draft as any;
    return {
      studentUser: {
        ...this.buildDetailUserPayload(data.studentResponse.user),
        ...(draftAny.studentUser ?? {}),
      } as UserPayload,
      student: {
        governorate: data.studentResponse.governorate,
        academicScoreInMiddleSchool: data.studentResponse.academicScoreInMiddleSchool,
        placeOfBirth: data.studentResponse.placeOfBirth,
        medicalHistory: data.medicalHistories,
        martialParentsStatus: data.studentResponse.martialParentsStatus,
        ...(draftAny.student ?? {}),
      },
      father: {
        user: data.parentsResponse.find((parent) => parent.user.gender === 'M')
          ? this.buildDetailUserPayload(
              data.parentsResponse.find((parent) => parent.user.gender === 'M')!.user,
            )
          : (undefined as any),
        jobName: data.parentsResponse.find((parent) => parent.user.gender === 'M')?.jobName || '',
        ...(draftAny.father ?? {}),
      },
      mother: {
        user: data.parentsResponse.find((parent) => parent.user.gender === 'F')
          ? this.buildDetailUserPayload(
              data.parentsResponse.find((parent) => parent.user.gender === 'F')!.user,
            )
          : (undefined as any),
        jobName: data.parentsResponse.find((parent) => parent.user.gender === 'F')?.jobName || '',
        ...(draftAny.mother ?? {}),
      },
      guardianType: draftAny.guardianType,
      guardian: draftAny.guardian ?? null,
    };
  }

  private buildDetailUserPayload(
    user: StudentDetailResponse['studentResponse']['user'],
  ): UserPayload {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      address: user.address,
      firstNameInArabic: user.firstNameInArabic,
      lastNameInArabic: user.lastNameInArabic,
      gender: user.gender,
      nationality: user.nationality,
      birthDate: this.formatBirthDate(user.birthDate),
      religion: user.religion,
      nationalNumber: user.nationalNumber,
      phoneNumbers: user.phoneNumbers,
    };
  }

  private patchParentGroup(
    group: FormGroup,
    user: StudentDetailResponse['studentResponse']['user'],
    jobName: string,
    draft?: any,
  ) {
    console.log(user);
    const userGroup = group.get('user') as FormGroup;
    userGroup.patchValue({
      firstName: draft?.user?.firstName ?? user.firstName,
      lastName: draft?.user?.lastName ?? user.lastName,
      email: draft?.user?.email ?? user.email,
      address: draft?.user?.address ?? user.address,
      firstNameInArabic: draft?.user?.firstNameInArabic ?? user.firstNameInArabic,
      lastNameInArabic: draft?.user?.lastNameInArabic ?? user.lastNameInArabic,
      gender: draft?.user?.gender ?? user.gender,
      religion: draft?.user?.religion || this.matchOption(user.religion, this.religions) || '',
      nationality: draft?.user?.nationality ?? user.nationality,
      birthDay: draft?.user?.birthDay ?? this.extractDay(user.birthDate),
      birthMonth: draft?.user?.birthMonth ?? this.extractMonth(user.birthDate),
      birthYear: draft?.user?.birthYear ?? this.extractYear(user.birthDate),
      nationalNumber: draft?.user?.nationalNumber ?? String(user.nationalNumber),
    });
    this.replacePhoneNumbers(
      userGroup.get('phoneNumbers') as FormArray,
      draft?.user?.phoneNumbers ?? user.phoneNumbers.map((phone) => this.normalizePhone(phone)),
    );
    group.get('jobName')?.setValue(draft?.jobName ?? jobName);
  }

  private replacePhoneNumbers(array: FormArray, values: number[] | string[]) {
    while (array.length) {
      array.removeAt(0);
    }
    const nextValues = values.length ? values : [''];
    nextValues.forEach((value) => {
      array.push(
        new FormControl(value, [Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)]),
      );
    });
  }

  private extractDay(date: string | Date): string {
    return String(new Date(date).getDate());
  }
  private extractMonth(date: string | Date): string {
    return String(new Date(date).getMonth() + 1);
  }
  private extractYear(date: string | Date): string {
    return String(new Date(date).getFullYear());
  }

  private formatBirthDate(date: string | Date): string {
    const dt = new Date(date);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toggleGuardianValidators(type: string | null) {
    const guardianUser = this.guardian.get('user') as FormGroup;
    if (type === 'OTHER') {
      Object.keys(guardianUser.controls).forEach((key) => {
        const control = guardianUser.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach((c) => {
            c.setValidators([Validators.required, Validators.pattern(/^0(10|11|12|15)\d{8}$/)]);
            c.updateValueAndValidity();
          });
          return;
        }
        if (key === 'birthDate') return;
        if (key === 'email') control?.setValidators([Validators.required, Validators.email]);
        else if (key === 'nationalNumber')
          control?.setValidators([
            Validators.required,
            Validators.minLength(14),
            Validators.maxLength(14),
          ]);
        else control?.setValidators(Validators.required);
        control?.updateValueAndValidity();
      });
      this.guardian.get('jobName')?.setValidators(Validators.required);
      this.guardian.get('jobName')?.updateValueAndValidity();
    } else {
      Object.keys(guardianUser.controls).forEach((key) => {
        const control = guardianUser.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach((c) => {
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
      const validators =
        type === 'guardian' && this.guardianType.value !== 'OTHER'
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
      case 'student':
        return this.studentPhoneNumbers;
      case 'father':
        return this.fatherPhoneNumbers;
      case 'mother':
        return this.motherPhoneNumbers;
      case 'guardian':
        return this.guardianPhoneNumbers;
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
    const phoneNumbers = (userGroup.get('phoneNumbers') as FormArray).controls
      .map((c) => {
        const raw = c.value || '';
        return parseInt(raw, 10);
      })
      .filter((n) => !isNaN(n));

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
      ? medicalText
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
      : [];

    const payload: CreateStudentRequest = {
      studentUser: this.buildUserPayload(this.studentUser),
      student: {
        governorate: this.student.get('governorate')?.value || '',
        academicScoreInMiddleSchool: parseInt(
          this.student.get('academicScoreInMiddleSchool')?.value || '0',
          10,
        ),
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

    if (this.isEditMode && this.editStudentId) {
      this.studentService.updateStudent(this.editStudentId, payload).subscribe({
        next: () => {
          this.studentService.clearStudentDraft(this.editStudentId!);
          Swal.fire({
            title: 'Updated!',
            text: 'Student information has been updated successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['/students', this.editStudentId]);
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
      return;
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
    if (this.isEditMode && this.editStudentId) {
      this.router.navigate(['/students', this.editStudentId]);
      return;
    }
    this.router.navigate(['/students']);
  }

  controlInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && control.touched);
  }

  getError(control: AbstractControl | null, errorKey: string): boolean {
    return !!(control && control.hasError(errorKey) && control.touched);
  }

  private normalizePhone(phone: number | string): string {
    if (!phone) return ''; // Safeguard against null/undefined

    let s = String(phone);

    // Handle numbers saved with the '20' country code (e.g., 201200000002 -> 12 digits)
    if (s.length === 12 && s.startsWith('20')) {
      s = '0' + s.slice(2);
    }
    // Handle numbers saved as integers that lost their leading zero (e.g., 1200000002 -> 10 digits)
    else if (s.length === 10 && /^(10|11|12|15)/.test(s)) {
      s = '0' + s;
    }

    return s;
  }

  // Add this helper method to your class
  private matchOption(dbValue: string, options: string[]): string {
    if (!dbValue) return '';
    // Find a match ignoring case, e.g., "ISLAM" matches "Islam"
    const match = options.find((opt) => opt.toLowerCase() === dbValue.toLowerCase());
    return match || dbValue;
  }
}
