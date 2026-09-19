import { apiRequest } from './api-client';
import type {
  ReviewerApplication,
  ApplyReviewerInput,
  RegisterAndApplyReviewerInput,
  RegisterAndApplyReviewerResponse,
  RejectApplicationInput,
  QueryApplicationsParams,
  PaginatedApplicationsResponse,
} from '../types/reviewer-application.types';

export class ReviewerApplicationsApiClient {
  /**
   * POST /reviewer-applications/register-and-apply
   * Registers a new user with STUDENT role and submits a PENDING reviewer application.
   */
  static async registerAndApply(
    data: RegisterAndApplyReviewerInput,
  ): Promise<RegisterAndApplyReviewerResponse> {
    return apiRequest<RegisterAndApplyReviewerResponse>(
      '/reviewer-applications/register-and-apply',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  /**
   * POST /reviewer-applications/apply
   * Creates a new reviewer application for the authenticated user.
   */
  static async apply(
    data: ApplyReviewerInput,
    token: string,
  ): Promise<ReviewerApplication> {
    return apiRequest<ReviewerApplication>('/reviewer-applications/apply', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * GET /reviewer-applications/me
   * Retrieves the authenticated user's latest reviewer application status.
   */
  static async getMyApplication(
    token: string,
  ): Promise<ReviewerApplication | null> {
    return apiRequest<ReviewerApplication | null>(
      '/reviewer-applications/me',
      {
        method: 'GET',
        token,
      },
    );
  }

  /**
   * GET /admin/reviewer-applications
   * Retrieves list of reviewer applications for admin review.
   */
  static async getAllApplications(
    params: QueryApplicationsParams,
    token: string,
  ): Promise<PaginatedApplicationsResponse> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = `/admin/reviewer-applications${
      queryString ? `?${queryString}` : ''
    }`;

    return apiRequest<PaginatedApplicationsResponse>(endpoint, {
      method: 'GET',
      token,
    });
  }

  /**
   * GET /admin/reviewer-applications/:id
   * Retrieves details of a specific application.
   */
  static async getApplication(
    id: string,
    token: string,
  ): Promise<ReviewerApplication> {
    return apiRequest<ReviewerApplication>(
      `/admin/reviewer-applications/${id}`,
      {
        method: 'GET',
        token,
      },
    );
  }

  /**
   * PATCH /admin/reviewer-applications/:id/approve
   * Approves a pending reviewer application.
   */
  static async approveApplication(
    id: string,
    token: string,
  ): Promise<ReviewerApplication> {
    return apiRequest<ReviewerApplication>(
      `/admin/reviewer-applications/${id}/approve`,
      {
        method: 'PATCH',
        token,
      },
    );
  }

  /**
   * PATCH /admin/reviewer-applications/:id/reject
   * Rejects a pending reviewer application.
   */
  static async rejectApplication(
    id: string,
    data: RejectApplicationInput,
    token: string,
  ): Promise<ReviewerApplication> {
    return apiRequest<ReviewerApplication>(
      `/admin/reviewer-applications/${id}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        token,
      },
    );
  }
}
