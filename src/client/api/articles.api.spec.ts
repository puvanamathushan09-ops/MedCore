import { ArticlesApiClient } from './articles.api';
import { ApiClientError } from './api-client';
import { ArticleStatus } from '../types/article.types';

describe('ArticlesApiClient', () => {
  const mockToken = 'mock-jwt-bearer-token';
  const mockArticle = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Understanding Appendicitis',
    slug: 'understanding-appendicitis',
    content: 'Full article body...',
    summary: 'Overview of appendicitis',
    featuredImageUrl: 'https://example.com/image.png',
    status: 'PUBLISHED' as ArticleStatus,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: '11111111-1111-1111-1111-111111111111',
    subjectId: '22222222-2222-2222-2222-222222222222',
    topicId: '33333333-3333-3333-3333-333333333333',
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getArticles', () => {
    it('should send GET /articles with default query params and no token', async () => {
      const mockResponse = {
        data: [mockArticle],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await ArticlesApiClient.getArticles();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/articles',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should format query parameters and attach Authorization header when token provided', async () => {
      const mockResponse = {
        data: [mockArticle],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const queryParams = {
        subjectId: '22222222-2222-2222-2222-222222222222',
        status: 'DRAFT' as ArticleStatus,
        search: 'appendicitis',
        page: 2,
        limit: 5,
      };

      await ArticlesApiClient.getArticles(queryParams, mockToken);

      const expectedUrl =
        'http://localhost:3000/articles?subjectId=22222222-2222-2222-2222-222222222222&status=DRAFT&search=appendicitis&page=2&limit=5';

      expect(global.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
    });
  });

  describe('getArticleBySlug', () => {
    it('should send GET /articles/slug/:slug', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockArticle),
      } as any);

      const result = await ArticlesApiClient.getArticleBySlug('understanding-appendicitis');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/articles/slug/understanding-appendicitis',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockArticle);
    });
  });

  describe('getArticleById', () => {
    it('should send GET /articles/id/:id', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockArticle),
      } as any);

      const result = await ArticlesApiClient.getArticleById(mockArticle.id);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/articles/id/${mockArticle.id}`,
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockArticle);
    });
  });

  describe('createArticle', () => {
    it('should send POST /articles with body and Authorization header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockArticle),
      } as any);

      const createInput = {
        title: mockArticle.title,
        content: mockArticle.content,
        subjectId: mockArticle.subjectId,
      };

      const result = await ArticlesApiClient.createArticle(createInput, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/articles',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createInput),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual(mockArticle);
    });
  });

  describe('updateArticle', () => {
    it('should send PATCH /articles/:id with partial payload and Authorization header', async () => {
      const updatedArticle = { ...mockArticle, title: 'Updated Title' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(updatedArticle),
      } as any);

      const updateInput = { title: 'Updated Title' };

      const result = await ArticlesApiClient.updateArticle(
        mockArticle.id,
        updateInput,
        mockToken,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/articles/${mockArticle.id}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateInput),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual(updatedArticle);
    });
  });

  describe('deleteArticle', () => {
    it('should send DELETE /articles/:id with Authorization header', async () => {
      const deleteMessage = { message: 'Article deleted successfully' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(deleteMessage),
      } as any);

      const result = await ArticlesApiClient.deleteArticle(mockArticle.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/articles/${mockArticle.id}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual(deleteMessage);
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiClientError with formatted error messages on HTTP 400', async () => {
      const backendError = {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/articles',
        error: {
          message: ['title must be longer than 0 characters', 'subjectId must be a UUID'],
          error: 'Bad Request',
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(backendError),
      } as any);

      await expect(
        ArticlesApiClient.createArticle({ title: '', content: 'x', subjectId: 'bad' }, mockToken),
      ).rejects.toThrow(ApiClientError);

      try {
        await ArticlesApiClient.createArticle(
          { title: '', content: 'x', subjectId: 'bad' },
          mockToken,
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiClientError);
        expect(err.statusCode).toBe(400);
        expect(err.errors).toEqual([
          'title must be longer than 0 characters',
          'subjectId must be a UUID',
        ]);
      }
    });

    it('should handle network connection failure cleanly without leaking stack traces', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(ArticlesApiClient.getArticles()).rejects.toThrow(ApiClientError);

      try {
        await ArticlesApiClient.getArticles();
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiClientError);
        expect(err.statusCode).toBe(0);
        expect(err.message).toBe('Network error: Unable to communicate with MedCore API');
      }
    });
  });
});
