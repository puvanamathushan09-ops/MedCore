import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesService } from './quizzes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('QuizzesService', () => {
  let service: QuizzesService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    quiz: {
      findUnique: jest.fn(),
    },
    quizAttempt: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizzesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuizzesService>(QuizzesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyAttempts', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMyAttempts('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getMyAttempts('non-existent-id')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw ForbiddenException if user is not a STUDENT', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'admin-id',
        role: 'ADMIN',
      });

      await expect(service.getMyAttempts('admin-id')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.getMyAttempts('admin-id')).rejects.toThrow(
        'Only students can view quiz attempts',
      );
    });

    it('should return mapped quiz attempts when user is STUDENT', async () => {
      const studentId = 'student-uuid';
      const now = new Date();

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: studentId,
        role: 'STUDENT',
      });

      const mockAttempts = [
        {
          id: 'attempt-1',
          score: 8,
          total: 10,
          completedAt: now,
          quiz: {
            id: 'quiz-1',
            title: 'Cardiology Basics',
            subject: {
              id: 'subject-1',
              title: 'Internal Medicine',
            },
            topic: {
              id: 'topic-1',
              title: 'ECG Analysis',
            },
          },
        },
        {
          id: 'attempt-2',
          score: 3,
          total: 4,
          completedAt: new Date(now.getTime() - 10000),
          quiz: {
            id: 'quiz-2',
            title: 'General Surgery',
            subject: {
              id: 'subject-2',
              title: 'Surgery',
            },
            topic: null,
          },
        },
      ];

      mockPrismaService.quizAttempt.findMany.mockResolvedValue(mockAttempts);

      const result = await service.getMyAttempts(studentId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: studentId },
        select: { id: true, role: true },
      });

      expect(mockPrismaService.quizAttempt.findMany).toHaveBeenCalledWith({
        where: { studentId },
        orderBy: { completedAt: 'desc' },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              subject: {
                select: {
                  id: true,
                  title: true,
                },
              },
              topic: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual([
        {
          attemptId: 'attempt-1',
          quizId: 'quiz-1',
          quizTitle: 'Cardiology Basics',
          subject: {
            id: 'subject-1',
            name: 'Internal Medicine',
          },
          topic: {
            id: 'topic-1',
            name: 'ECG Analysis',
          },
          score: 8,
          total: 10,
          percentage: 80,
          completedAt: now,
        },
        {
          attemptId: 'attempt-2',
          quizId: 'quiz-2',
          quizTitle: 'General Surgery',
          subject: {
            id: 'subject-2',
            name: 'Surgery',
          },
          topic: null,
          score: 3,
          total: 4,
          percentage: 75,
          completedAt: new Date(now.getTime() - 10000),
        },
      ]);
    });
  });

  describe('submit', () => {
    it('should calculate score and return per-answer correctness results', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'student-1',
        role: 'STUDENT',
      });

      mockPrismaService.quiz = {
        findUnique: jest.fn().mockResolvedValue({
          id: 'quiz-1',
          isPublished: true,
          questions: [
            {
              id: 'q-1',
              options: [
                { id: 'opt-1', isCorrect: true },
                { id: 'opt-2', isCorrect: false },
              ],
            },
            {
              id: 'q-2',
              options: [
                { id: 'opt-3', isCorrect: false },
                { id: 'opt-4', isCorrect: true },
              ],
            },
          ],
        }),
      };

      mockPrismaService.quizAttempt.create = jest.fn().mockResolvedValue({
        id: 'attempt-123',
      });

      const dto = {
        answers: [
          { questionId: 'q-1', optionId: 'opt-1' }, // Correct
          { questionId: 'q-2', optionId: 'opt-3' }, // Wrong
        ],
      };

      const result = await service.submit('quiz-1', dto, 'student-1');

      expect(result).toEqual({
        attemptId: 'attempt-123',
        score: 1,
        total: 2,
        percentage: 50,
        results: [
          { questionId: 'q-1', selectedOptionId: 'opt-1', isCorrect: true },
          { questionId: 'q-2', selectedOptionId: 'opt-3', isCorrect: false },
        ],
      });
    });
  });
});
