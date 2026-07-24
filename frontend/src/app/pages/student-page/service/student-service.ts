import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../student-page';

export type EducationLevel = string;

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  firstNameInArabic: string;
  lastNameInArabic: string;
  gender: 'M' | 'F';
  nationality: string;
  birthDate: string;
  religion: string;
  nationalNumber: number;
  phoneNumbers: number[];
}

export interface CreateStudentRequest {
  studentUser: UserPayload;
  student: {
    governorate: string;
    academicScoreInMiddleSchool: number;
    placeOfBirth: string;
    medicalHistory: string[];
    martialParentsStatus: string;
  };
  father: {
    user: UserPayload;
    jobName: string;
    educationLevel: EducationLevel | null;
  };
  mother: {
    user: UserPayload;
    jobName: string;
    educationLevel: EducationLevel | null;
  };
  guardianType: 'FATHER' | 'MOTHER' | 'OTHER';
  guardian: {
    user: UserPayload;
    jobName: string;
    educationLevel: EducationLevel | null;
  } | null;
}

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  firstNameInArabic: string;
  lastNameInArabic: string;
  isDeleted: boolean;
  createdAt: Date;
  lastLogin: Date;
  gender: 'M' | 'F';
  nationality: string;
  birthDate: Date;
  religion: string;
  nationalNumber: number;
  phoneNumbers: number[];
}

export interface ParentResponse {
  id: number;
  user: UserResponse;
  jobName: string;
  educationLevel: string | null;
}

export interface StudentDetailResponse {
  parentsResponse: ParentResponse[];
  medicalHistories: string[];
  studentResponse: StudentResponse;
}

export interface StudentResponse {
  id: number;
  user: UserResponse;
  governorate: string;
  academicScoreInMiddleSchool: number;
  placeOfBirth: string;
  martialParentsStatus: string;
  medicalHistory: string[];
  studentClass: {
    id: number;
    grade: {
      id: number;
      name: string;
      terms: [
        {
          term: number;
          year: number;
        },
      ];
    };
    name: string;
    capacity: number;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/v1/student';
  private draftPrefix = 'student-edit-draft:';

  getAllStudents(): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(this.url);
  }

  getStudentById(id: number): Observable<StudentDetailResponse> {
    return this.http.get<StudentDetailResponse>(`${this.url}/${id}`);
  }

  getParents(): Observable<ParentResponse[]> {
    return this.http.get<ParentResponse[]>('http://localhost:8080/api/v1/parents');
  }

  toStudent(student: StudentResponse): Student {
    const firstName = student.user.firstName;
    const lastName = student.user.lastName;

    return {
      id: student.id.toString(),
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      name: `${firstName} ${lastName}`.trim(),
      nameAr:
        `${student.user.firstNameInArabic || ''} ${student.user.lastNameInArabic || ''}`.trim(),
      email: student.user.email,
      grade: student.studentClass == null ? '' : student.studentClass.grade.name,
      class: student.studentClass == null ? '' : student.studentClass.name,
      academicYear:
        student.studentClass == null ? '' : student.studentClass.grade.terms[0].year.toString(),
      gender: student.user.gender === 'M' ? 'Male' : 'Female',

      status: student.user.isDeleted ? 'Probation' : 'Active',
    };
  }

  createStudent(data: CreateStudentRequest): Observable<any> {
    return this.http.post(this.url, data);
  }

  updateStudent(id: number, data: CreateStudentRequest): Observable<StudentDetailResponse> {
    return this.http.put<StudentDetailResponse>(`${this.url}/${id}`, data);
  }

  getStudentDraft(id: number): Partial<CreateStudentRequest> | null {
    const raw = localStorage.getItem(`${this.draftPrefix}${id}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<CreateStudentRequest>;
    } catch {
      return null;
    }
  }

  saveStudentDraft(id: number, data: Partial<CreateStudentRequest>): void {
    localStorage.setItem(`${this.draftPrefix}${id}`, JSON.stringify(data));
  }

  clearStudentDraft(id: number): void {
    localStorage.removeItem(`${this.draftPrefix}${id}`);
  }

  deleteStudent(studentId: number): Observable<any> {
    return this.http.delete(`${this.url}/${studentId}`);
  }

  generatePassword(userId: number): Observable<GeneratePasswordResponse> {
    return this.http.post<GeneratePasswordResponse>(`${this.url}/generate-password/${userId}`, {});
  }
}

interface GeneratePasswordResponse {
  password: string;
}
