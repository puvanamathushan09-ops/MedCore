import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

describe('TopicsController', () => {
  let controller: TopicsController;
  let service: TopicsService;

  const mockTopic = {
    id: 'top-1111-2222-3333',
    subjectId: 'sub-1111-2222-3333',
    parentId: null,
    title: 'Arrhythmias',
    slug: 'arrhythmias',
    description: 'Irregular heartbeats',
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopicsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [
        {
          provide: TopicsService,
          useValue: mockTopicsService,
        },
      ],
    }).compile();

    controller = module.get<TopicsController>(TopicsController);
    service = module.get<TopicsService>(TopicsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate create call to TopicsService', async () => {
      mockTopicsService.create.mockResolvedValue(mockTopic);

      const dto = { subjectId: 'sub-1111-2222-3333', title: 'Arrhythmias' };
      const result = await controller.create(dto);

      expect(mockTopicsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTopic);
    });
  });

  describe('findAll', () => {
    it('should delegate findAll call to TopicsService', async () => {
      const response = {
        data: [mockTopic],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockTopicsService.findAll.mockResolvedValue(response);

      const query = { subjectId: 'sub-1111-2222-3333', page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(mockTopicsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(response);
    });
  });

  describe('findBySlug', () => {
    it('should delegate findBySlug call to TopicsService', async () => {
      mockTopicsService.findBySlug.mockResolvedValue(mockTopic);

      const result = await controller.findBySlug('arrhythmias');

      expect(mockTopicsService.findBySlug).toHaveBeenCalledWith('arrhythmias');
      expect(result).toEqual(mockTopic);
    });
  });

  describe('findById', () => {
    it('should delegate findById call to TopicsService', async () => {
      mockTopicsService.findById.mockResolvedValue(mockTopic);

      const result = await controller.findById(mockTopic.id);

      expect(mockTopicsService.findById).toHaveBeenCalledWith(mockTopic.id);
      expect(result).toEqual(mockTopic);
    });
  });

  describe('update', () => {
    it('should delegate update call to TopicsService', async () => {
      mockTopicsService.update.mockResolvedValue(mockTopic);

      const dto = { title: 'Updated' };
      const result = await controller.update(mockTopic.id, dto);

      expect(mockTopicsService.update).toHaveBeenCalledWith(mockTopic.id, dto);
      expect(result).toEqual(mockTopic);
    });
  });

  describe('remove', () => {
    it('should delegate remove call to TopicsService', async () => {
      const deleteResponse = { message: 'Topic deleted successfully' };
      mockTopicsService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(mockTopic.id);

      expect(mockTopicsService.remove).toHaveBeenCalledWith(mockTopic.id);
      expect(result).toEqual(deleteResponse);
    });
  });
});
