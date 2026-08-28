import { apiRequest } from './api-client';
import type {
  Subject,
  SubjectListResponse,
  CreateSubjectInput,
  UpdateSubjectInput,
  QuerySubjectParams,
} from '../types/subject.types';

export class SubjectsApiClient {
  /**
   * GET /subjects
   * Retrieves a paginated list of subjects sorted by orderIndex.
   */
  static async getSubjects(
    params?: QuerySubjectParams,
    token?: string,
  ): Promise<SubjectListResponse> {
    return apiRequest<SubjectListResponse>('/subjects', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
      token,
    });
  }

  /**
   * GET /subjects/slug/:slug
   * Retrieves a single subject by its URL slug.
   */
  static async getSubjectBySlug(
    slug: string,
    token?: string,
  ): Promise<Subject> {
    const encodedSlug = encodeURIComponent(slug);
    return apiRequest<Subject>(`/subjects/slug/${encodedSlug}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * GET /subjects/id/:id
   * Retrieves a single subject by its UUID ID.
   */
  static async getSubjectById(
    id: string,
    token?: string,
  ): Promise<Subject> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Subject>(`/subjects/id/${encodedId}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * POST /subjects
   * Creates a new subject (requires MEDICAL_REVIEWER or ADMIN role token).
   */
  static async createSubject(
    data: CreateSubjectInput,
    token: string,
  ): Promise<Subject> {
    return apiRequest<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * PATCH /subjects/:id
   * Updates an existing subject (requires MEDICAL_REVIEWER or ADMIN role token).
   */
  static async updateSubject(
    id: string,
    data: UpdateSubjectInput,
    token: string,
  ): Promise<Subject> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Subject>(`/subjects/${encodedId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * DELETE /subjects/:id
   * Deletes a subject by ID (requires ADMIN role token).
   */
  static async deleteSubject(
    id: string,
    token: string,
  ): Promise<{ message: string }> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<{ message: string }>(`/subjects/${encodedId}`, {
      method: 'DELETE',
      token,
    });
  }
}
