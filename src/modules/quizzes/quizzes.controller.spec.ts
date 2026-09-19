import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

describe('QuizzesController', () => {
  let controller: QuizzesController;

  const mockQuizzesService = {
    getMyAttempts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [
        {
          provide: QuizzesService,
          useValue: mockQuizzesService,
        },
      ],
    }).compile();

    controller = module.get<QuizzesController>(QuizzesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyAttempts', () => {
    it('should call quizzesService.getMyAttempts with req.user.id', async () => {
      const mockReq = { user: { id: 'student-123' } };
      const mockResult = [
        {
          attemptId: 'attempt-1',
          quizId: 'quiz-1',
          quizTitle: 'Cardiology',
          subject: { id: 'sub-1', name: 'Med' },
          topic: null,
          score: 5,
          total: 5,
          percentage: 100,
          completedAt: new Date(),
        },
      ];

      mockQuizzesService.getMyAttempts.mockResolvedValue(mockResult);

      const result = await controller.getMyAttempts(mockReq);

      expect(mockQuizzesService.getMyAttempts).toHaveBeenCalledWith(
        'student-123',
      );
      expect(result).toEqual(mockResult);
    });
  });
});
