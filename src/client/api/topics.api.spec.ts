import { TopicsApiClient } from './topics.api';
import { ApiClientError } from './api-client';

describe('TopicsApiClient', () => {
  const mockToken = 'mock-jwt-bearer-token';
  const mockTopic = {
    id: 'top-1111-2222-3333',
    subjectId: 'sub-1111-2222-3333',
    parentId: null,
    title: 'Arrhythmias',
    slug: 'arrhythmias',
    description: 'Irregular heartbeats',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { articles: 5, children: 2 },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getTopics', () => {
    it('should send GET /topics with default query params', async () => {
      const mockResponse = {
        data: [mockTopic],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await TopicsApiClient.getTopics();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/topics',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should format subjectId and pagination params correctly', async () => {
      const mockResponse = {
        data: [mockTopic],
        meta: { total: 1, page: 2, limit: 5, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await TopicsApiClient.getTopics(
        { subjectId: 'sub-1111-2222-3333', page: 2, limit: 5 },
        mockToken,
      );

      const expectedUrl =
        'http://localhost:3000/topics?subjectId=sub-1111-2222-3333&page=2&limit=5';
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

  describe('getTopicBySlug', () => {
    it('should send GET /topics/slug/:slug', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockTopic),
      } as any);

      const result = await TopicsApiClient.getTopicBySlug('arrhythmias');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/topics/slug/arrhythmias',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockTopic);
    });
  });

  describe('getTopicById', () => {
    it('should send GET /topics/id/:id', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockTopic),
      } as any);

      const result = await TopicsApiClient.getTopicById(mockTopic.id);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/topics/id/${mockTopic.id}`,
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockTopic);
    });
  });

  describe('createTopic', () => {
    it('should send POST /topics with body and Authorization header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockTopic),
      } as any);

      const input = {
        subjectId: 'sub-1111-2222-3333',
        title: 'Arrhythmias',
        description: 'Irregular heartbeats',
      };
      const result = await TopicsApiClient.createTopic(input, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/topics',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual(mockTopic);
    });
  });

  describe('updateTopic', () => {
    it('should send PATCH /topics/:id with body and Authorization header', async () => {
      const updated = { ...mockTopic, title: 'Updated Title' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(updated),
      } as any);

      const input = { title: 'Updated Title' };
      const result = await TopicsApiClient.updateTopic(mockTopic.id, input, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/topics/${mockTopic.id}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(input),
        }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTopic', () => {
    it('should send DELETE /topics/:id with Authorization header', async () => {
      const deleteMsg = { message: 'Topic deleted successfully' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(deleteMsg),
      } as any);

      const result = await TopicsApiClient.deleteTopic(mockTopic.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/topics/${mockTopic.id}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual(deleteMsg);
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiClientError on HTTP error status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({
          statusCode: 400,
          error: 'Parent Topic belongs to a different subject',
        }),
      } as any);

      await expect(
        TopicsApiClient.createTopic(
          { subjectId: 'sub-1111-2222-3333', title: 'Arrhythmias' },
          mockToken,
        ),
      ).rejects.toThrow(ApiClientError);
    });
  });
});
