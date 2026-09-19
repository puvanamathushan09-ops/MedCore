import { apiRequest } from './api-client';
import type {
  Quiz,
  CreateQuizInput,
  UpdateQuizInput,
  SubmitQuizInput,
  QuizSubmitResult,
  QuizAttemptHistoryItem,
} from '../types/quiz.types';

export class QuizzesApiClient {
  /**
   * GET /quizzes
   * Retrieves quizzes.
   * STUDENT receives published quizzes only.
   * MEDICAL_REVIEWER and ADMIN receive published and unpublished quizzes.
   */
  static async getQuizzes(token: string): Promise<Quiz[]> {
    return apiRequest<Quiz[]>('/quizzes', {
      method: 'GET',
      token,
    });
  }

  /**
   * GET /quizzes/:id
   * Retrieves a single quiz by ID.
   */
  static async getQuizById(id: string, token: string): Promise<Quiz> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Quiz>(`/quizzes/${encodedId}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * POST /quizzes
   * Creates an unpublished quiz (requires MEDICAL_REVIEWER or ADMIN role).
   */
  static async createQuiz(
    data: CreateQuizInput,
    token: string,
  ): Promise<Quiz> {
    return apiRequest<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * PATCH /quizzes/:id
   * Updates an existing quiz (requires MEDICAL_REVIEWER or ADMIN role).
   */
  static async updateQuiz(
    id: string,
    data: UpdateQuizInput,
    token: string,
  ): Promise<Quiz> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Quiz>(`/quizzes/${encodedId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * PATCH /quizzes/:id/publish
   * Publishes a quiz (requires MEDICAL_REVIEWER or ADMIN role).
   */
  static async publishQuiz(id: string, token: string): Promise<Quiz> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Quiz>(`/quizzes/${encodedId}/publish`, {
      method: 'PATCH',
      token,
    });
  }

  /**
   * PATCH /quizzes/:id/unpublish
   * Unpublishes a quiz (requires MEDICAL_REVIEWER or ADMIN role).
   */
  static async unpublishQuiz(id: string, token: string): Promise<Quiz> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Quiz>(`/quizzes/${encodedId}/unpublish`, {
      method: 'PATCH',
      token,
    });
  }

  /**
   * DELETE /quizzes/:id
   * Deletes a quiz by ID (requires ADMIN role).
   */
  static async deleteQuiz(
    id: string,
    token: string,
  ): Promise<{ message: string }> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<{ message: string }>(`/quizzes/${encodedId}`, {
      method: 'DELETE',
      token,
    });
  }

  /**
   * POST /quizzes/:id/submit
   * Submits quiz answers for a student.
   */
  static async submitQuiz(
    id: string,
    data: SubmitQuizInput,
    token: string,
  ): Promise<QuizSubmitResult> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<QuizSubmitResult>(`/quizzes/${encodedId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * GET /quizzes/attempts/me
   * Retrieves current student's quiz attempt history.
   */
  static async getMyAttempts(
    token: string,
  ): Promise<QuizAttemptHistoryItem[]> {
    return apiRequest<QuizAttemptHistoryItem[]>('/quizzes/attempts/me', {
      method: 'GET',
      token,
    });
  }
}
