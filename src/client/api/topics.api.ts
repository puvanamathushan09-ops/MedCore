import { apiRequest } from './api-client';
import type {
  Topic,
  TopicListResponse,
  CreateTopicInput,
  UpdateTopicInput,
  QueryTopicParams,
} from '../types/topic.types';

export class TopicsApiClient {
  /**
   * GET /topics
   * Retrieves a paginated list of topics with optional filtering by subjectId or parentId.
   */
  static async getTopics(
    params?: QueryTopicParams,
    token?: string,
  ): Promise<TopicListResponse> {
    return apiRequest<TopicListResponse>('/topics', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
      token,
    });
  }

  /**
   * GET /topics/slug/:slug
   * Retrieves a single topic by its URL slug.
   */
  static async getTopicBySlug(
    slug: string,
    token?: string,
  ): Promise<Topic> {
    const encodedSlug = encodeURIComponent(slug);
    return apiRequest<Topic>(`/topics/slug/${encodedSlug}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * GET /topics/id/:id
   * Retrieves a single topic by its UUID ID.
   */
  static async getTopicById(
    id: string,
    token?: string,
  ): Promise<Topic> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Topic>(`/topics/id/${encodedId}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * POST /topics
   * Creates a new topic (requires MEDICAL_REVIEWER or ADMIN role token).
   */
  static async createTopic(
    data: CreateTopicInput,
    token: string,
  ): Promise<Topic> {
    return apiRequest<Topic>('/topics', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * PATCH /topics/:id
   * Updates an existing topic (requires MEDICAL_REVIEWER or ADMIN role token).
   */
  static async updateTopic(
    id: string,
    data: UpdateTopicInput,
    token: string,
  ): Promise<Topic> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Topic>(`/topics/${encodedId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * DELETE /topics/:id
   * Deletes a topic by ID (requires ADMIN role token).
   */
  static async deleteTopic(
    id: string,
    token: string,
  ): Promise<{ message: string }> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<{ message: string }>(`/topics/${encodedId}`, {
      method: 'DELETE',
      token,
    });
  }
}
