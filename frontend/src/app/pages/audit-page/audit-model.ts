// audit-model.ts

export interface AuditLog {
  auditId: number;
  tableName: string;
  recordId: number;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  editedUserName: string | null;
  changedFields: string | null;
  changedAt: string | null;
}

// Generic wrapper for Spring Boot paginated responses
export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
