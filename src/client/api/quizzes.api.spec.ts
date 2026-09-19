import { QuizzesApiClient } from './quizzes.api';
import { ApiClientError } from './api-client';

describe('QuizzesApiClient', () => {
  const mockToken = 'mock-jwt-token';
  const mockQuiz = {
    id: 'q111-222-333',
    title: 'Cardiology Basics',
    description: 'Basic cardiology quiz',
    subjectId: 'sub-111',
    topicId: 'top-111',
    isPublished: true,
    createdById: 'user-111',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'quest-1',
        question: 'What is normal heart rate?',
        explanation: '60-100 bpm is standard resting rate.',
        orderIndex: 0,
        options: [
          { id: 'opt-1', optionText: '60-100 bpm', orderIndex: 0 },
          { id: 'opt-2', optionText: '120-160 bpm', orderIndex: 1 },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getQuizzes', () => {
    it('should send GET /quizzes with token in Authorization header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([mockQuiz]),
      } as any);

      const result = await QuizzesApiClient.getQuizzes(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/quizzes',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
        }),
      );
      expect(result).toEqual([mockQuiz]);
    });
  });

  describe('getQuizById', () => {
    it('should send GET /quizzes/:id with encoded ID and token', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockQuiz),
      } as any);

      const result = await QuizzesApiClient.getQuizById(mockQuiz.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/quizzes/${mockQuiz.id}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('createQuiz', () => {
    it('should send POST /quizzes with stringified body', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockQuiz),
      } as any);

      const createInput = {
        title: 'New Quiz',
        subjectId: 'sub-111',
        questions: [
          {
            question: 'Question 1',
            options: [
              { optionText: 'Opt 1', isCorrect: true },
              { optionText: 'Opt 2', isCorrect: false },
            ],
          },
        ],
      };

      const result = await QuizzesApiClient.createQuiz(createInput, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/quizzes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createInput),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('updateQuiz', () => {
    it('should send PATCH /quizzes/:id with body', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockQuiz),
      } as any);

      const updateInput = { title: 'Updated Title' };
      const result = await QuizzesApiClient.updateQuiz(mockQuiz.id, updateInput, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/quizzes/${mockQuiz.id}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateInput),
        }),
      );
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('publishQuiz & unpublishQuiz', () => {
    it('should send PATCH /quizzes/:id/publish', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ ...mockQuiz, isPublished: true }),
      } as any);

      const result = await QuizzesApiClient.publishQuiz(mockQuiz.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/quizzes/${mockQuiz.id}/publish`,
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(result.isPublished).toBe(true);
    });

    it('should send PATCH /quizzes/:id/unpublish', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ ...mockQuiz, isPublished: false }),
      } as any);

      const result = await QuizzesApiClient.unpublishQuiz(mockQuiz.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/quizzes/${mockQuiz.id}/unpublish`,
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(result.isPublished).toBe(false);
    });
  });

  describe('deleteQuiz', () => {
    it('should send DELETE /quizzes/:id', async () => {
      const deleteMsg = { message: 'Quiz deleted' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(deleteMsg),
      } as any);

      const result = await QuizzesApiClient.deleteQuiz(mockQuiz.id, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/quizzes/${mockQuiz.id}`,
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(result).toEqual(deleteMsg);
    });
  });

  describe('submitQuiz', () => {
    it('should send POST /quizzes/:id/submit with answers payload', async () => {
      const submitResponse = {
        attemptId: 'att-111',
        score: 1,
        total: 1,
        percentage: 100,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(submitResponse),
      } as any);

      const submitInput = {
        answers: [{ questionId: 'quest-1', optionId: 'opt-1' }],
      };

      const result = await QuizzesApiClient.submitQuiz(mockQuiz.id, submitInput, mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/quizzes/${mockQuiz.id}/submit`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(submitInput),
        }),
      );
      expect(result).toEqual(submitResponse);
    });
  });

  describe('getMyAttempts', () => {
    it('should send GET /quizzes/attempts/me', async () => {
      const historyItems = [
        {
          attemptId: 'att-111',
          quizId: mockQuiz.id,
          quizTitle: mockQuiz.title,
          subject: { id: 'sub-111', name: 'Internal Medicine' },
          topic: { id: 'top-111', name: 'Cardiology' },
          score: 8,
          total: 10,
          percentage: 80,
          completedAt: new Date().toISOString(),
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(historyItems),
      } as any);

      const result = await QuizzesApiClient.getMyAttempts(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/quizzes/attempts/me',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual(historyItems);
    });
  });
});
