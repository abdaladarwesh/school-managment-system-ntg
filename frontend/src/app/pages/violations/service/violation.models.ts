import { StudentResponse } from '../../student-page/service/student-service';

export interface CreateViolationRequest {
  studentId: number;
  violation: string;
  nameOfViolator: string;
  applicableProcedure: string;
  referringAuthority: string;
  ismeeting: boolean;
  notes: string;
}

export interface BackendViolation {
  id: number;
  student: StudentResponse;
  violation: string;
  nameOfViolator: string;
  applicableProcedure: string;
  referringAuthority: string;
  ismeeting: boolean;
  notes: string;
  date: string;
}

// Flat interface for easy HTML table rendering
export interface ViolationRecordUI {
  id: number;
  date: string;
  studentName: string;
  class: string;
  violation: string;
  parentalSummons: boolean; // mapped from `ismeeting`
  notes?: string;
  nameOfViolator?: string;
  applicableProcedure?: string;
  referringAuthority?: string;
}
