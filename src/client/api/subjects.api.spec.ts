import { SubjectsApiClient } from './subjects.api';
import { ApiClientError } from './api-client';

describe('SubjectsApiClient', () => {
  const mockToken = 'mock-jwt-bearer-token';
  const mockSubject = {
    id: 'sub-1111-2222-3333',
    title: 'Cardiology',
    slug: 'cardiology',
    description: 'Study of heart',
    iconUrl: 'https://example.com/cardio.png',
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { topics: 2, articles: 5 },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getSubjects', () => {
    it('should send GET /subjects with default query params', async () => {
      const mockResponse = {
        data: [mockSubject],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await SubjectsApiClient.getSubjects();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/subjects',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should format search and pagination params correctly', async () => {
      const mockResponse = {
        data: [mockSubject],
        meta: { total: 1, page: 2, limit: 5, totalPages: 1 },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await SubjectsApiClient.getSubjects({ search: 'cardio', page: 2, limit: 5 }, mockToken);

      const expectedUrl = 'http://localhost:3000/subjects?search=cardio&page=2&limit=5';
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

  describe('getSubjectBySlug', () => {
    it('should send GET /subjects/slug/:slug', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSubject),
      } as any);

      const result = await SubjectsApiClient.getSubjectBySlug('cardiology');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/subjects/slug/cardiology',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockSubject);
    });
  });

  describe('getSubjectById', () => {
    it('should send GET /subjects/id/:id', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockSubject),
      } as any);

      const result = await SubjectsApiClient.getSubjectById(mockSubject.id);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/subjects/id/${mockSubject.id}`,
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(mockSubject);
    });
  });

  describe('createSubject', () => {
    it('should send POST /subjects with body and Authorization header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockSubject),
      } as any);

      const input = { title: 'Cardiology', description: 'Study of heart' };
      const result = await SubjectsApiClient.createSubject(input, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/subjects',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual(mockSubject);
    });
  });

  describe('updateSubject', () => {
    it('should send PATCH /subjects/:id with body and Authorization header', async () => {
      const updated = { ...mockSubject, title: 'Updated Title' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(updated),
      } as any);

      const input = { title: 'Updated Title' };
      const result = await SubjectsApiClient.updateSubject(mockSubject.id, input, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/subjects/${mockSubject.id}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(input),
        }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteSubject', () => {
    it('should send DELETE /subjects/:id with Authorization header', async () => {
      const deleteMsg = { message: 'Subject deleted successfully' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(deleteMsg),
      } as any);

      const result = await SubjectsApiClient.deleteSubject(mockSubject.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/subjects/${mockSubject.id}`,
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
        status: 409,
        statusText: 'Conflict',
        json: jest.fn().mockResolvedValue({
          statusCode: 409,
          error: 'Subject with slug "cardiology" already exists',
        }),
      } as any);

      await expect(
        SubjectsApiClient.createSubject({ title: 'Cardiology' }, mockToken),
      ).rejects.toThrow(ApiClientError);
    });
  });
});
