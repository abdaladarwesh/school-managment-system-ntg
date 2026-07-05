import { StudentDetailResponse } from '../../student-page/service/student-service';

export interface MedicalCase {
  id: number;
  student: StudentDetailResponse;
  illnessType: string;
  date: Date;
}

export interface MedicalCaseRequest {
  studentId: number;
  illnessType: string;
}
