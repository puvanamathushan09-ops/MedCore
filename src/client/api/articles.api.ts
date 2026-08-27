import { apiRequest } from './api-client';
import {
  Article,
  ArticleListResponse,
  CreateArticleInput,
  UpdateArticleInput,
  QueryArticleParams,
} from '../types/article.types';

export class ArticlesApiClient {
  /**
   * GET /articles
   * Retrieves a paginated list of articles with optional filtering and search.
   * Student role / unauthenticated users receive published articles only.
   */
  static async getArticles(
    params?: QueryArticleParams,
    token?: string,
  ): Promise<ArticleListResponse> {
    return apiRequest<ArticleListResponse>('/articles', {
      method: 'GET',
      params: params as Record<string, string | number | boolean | undefined | null>,
      token,
    });
  }

  /**
   * GET /articles/slug/:slug
   * Retrieves a single article by its URL slug.
   */
  static async getArticleBySlug(
    slug: string,
    token?: string,
  ): Promise<Article> {
    const encodedSlug = encodeURIComponent(slug);
    return apiRequest<Article>(`/articles/slug/${encodedSlug}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * GET /articles/id/:id
   * Retrieves a single article by its unique UUID ID.
   */
  static async getArticleById(
    id: string,
    token?: string,
  ): Promise<Article> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Article>(`/articles/id/${encodedId}`, {
      method: 'GET',
      token,
    });
  }

  /**
   * POST /articles
   * Creates a new article (requires MEDICAL_REVIEWER or ADMIN role token).
   */
  static async createArticle(
    data: CreateArticleInput,
    token: string,
  ): Promise<Article> {
    return apiRequest<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * PATCH /articles/:id
   * Partially updates an existing article (requires MEDICAL_REVIEWER or ADMIN role token).
   */
  static async updateArticle(
    id: string,
    data: UpdateArticleInput,
    token: string,
  ): Promise<Article> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<Article>(`/articles/${encodedId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  /**
   * DELETE /articles/:id
   * Deletes an article by ID (requires ADMIN role token).
   */
  static async deleteArticle(
    id: string,
    token: string,
  ): Promise<{ message: string }> {
    const encodedId = encodeURIComponent(id);
    return apiRequest<{ message: string }>(`/articles/${encodedId}`, {
      method: 'DELETE',
      token,
    });
  }
}
