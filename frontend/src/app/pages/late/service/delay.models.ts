// src/app/models/delay.models.ts

export interface BackendDelay {
  id: number;
  student: {
    id: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email?: string;
      firstNameInArabic?: string;
      lastNameInArabic?: string;
    };
    studentClass: {
      id: number;
      name: string;
    };
  };
  timeOfArrival: string; // e.g., "2026-07-03T09:00:00"
  notes: string;
  date: string; // e.g., "2026-07-03"
}

export interface LateRecord {
  id?: number; // Added to track backend ID
  studentId?: number; // Added to send updates back to API
  name: string;
  class: string;
  date: string;
  arrivalTime: string;
  reason: string;
  notes: string;
  status: 'Very Late' | 'Late';
}
