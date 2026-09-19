import type { AuthUser } from './auth.types';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewerApplication {
  id: string;
  userId: string;
  professionalTitle: string;
  specialty: string;
  qualifications: string;
  institution: string;
  bio?: string | null;
  expertise?: string | null;
  status: ApplicationStatus;
  rejectionReason?: string | null;
  reviewedByAdminId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AuthUser;
  reviewedByAdmin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface ApplyReviewerInput {
  professionalTitle: string;
  specialty: string;
  qualifications: string;
  institution: string;
  bio?: string;
  expertise?: string;
}

export interface RegisterAndApplyReviewerInput extends ApplyReviewerInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterAndApplyReviewerResponse {
  message: string;
  user: AuthUser;
  application: ReviewerApplication;
}

export interface RejectApplicationInput {
  rejectionReason?: string;
}

export interface QueryApplicationsParams {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedApplicationsResponse {
  data: ReviewerApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
