export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  firstNameInArabic?: string;
  lastNameInArabic?: string;
  gender?: string;
  nationality?: string;
  birthDate?: string;
  religion?: string;
  nationalNumber?: number;
  phoneNumbers?: number[];
}

export interface BackendComplaint {
  complaintId: number;
  user: UserResponse | null;
  title: string;
  description: string;
  status: string;
  category: string;
  response: string | null;
  submittedAt: string;
}

export interface CreateComplaintRequest {
  userId: number;
  title: string;
  description: string;
  category: string;
}

export interface RespondToComplaintRequest {
  response: string;
}

// Flat UI model for rendering
export interface ComplaintUI {
  id: number;
  submitterName: string;
  date: string;
  title: string;
  description: string;
  status: 'Pending' | 'Replied';
  category: string;
  response: string | null;
}
