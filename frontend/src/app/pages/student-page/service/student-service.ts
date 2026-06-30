import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../student-page';

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
  };
  mother: {
    user: UserPayload;
    jobName: string;
  };
  guardianType: 'FATHER' | 'MOTHER' | 'OTHER';
  guardian: {
    user: UserPayload;
    jobName: string;
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
}

interface StudentResponse {
  id: number;
  user: UserResponse;
  governorate: string;
  academicScoreInMiddleSchool: number;
  placeOfBirth: string;
  studentClass: {
    id: number;
    grade: {
      id: number;
      name: string;
      terms: [
        {
          term: number;
          year: number;
        }
      ]
    };
    name: string;
    capacity: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/v1/student';

  getAllStudents(): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(this.url);
  }

  toStudent(student: StudentResponse): Student {
    const firstName = student.user.firstName;
    const lastName = student.user.lastName;
    console.log(student);
    

    return {
      id: student.id.toString(),
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      name: `${firstName} ${lastName}`,
      email: student.user.email,
      grade: student.studentClass == null ? "" : student.studentClass.grade.name,
      class: student.studentClass == null ? "" : student.studentClass.name,
      academicYear: student.studentClass == null ? "" : student.studentClass.grade.terms[0].year.toString(), 
      gender: student.user.gender === 'M' ? 'Male' : 'Female',

      status: student.user.isDeleted ? 'Probation' : "Active",
    };
  }

  createStudent(data: CreateStudentRequest): Observable<any> {
    return this.http.post(this.url, data);
  }
}
