import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: SubjectsService;

  const mockSubject = {
    id: 'sub-1111-2222-3333',
    title: 'Cardiology',
    slug: 'cardiology',
    description: 'Study of heart',
    iconUrl: 'https://example.com/cardio.png',
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSubjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: mockSubjectsService,
        },
      ],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
    service = module.get<SubjectsService>(SubjectsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate create call to SubjectsService', async () => {
      mockSubjectsService.create.mockResolvedValue(mockSubject);

      const dto = { title: 'Cardiology' };
      const result = await controller.create(dto);

      expect(mockSubjectsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSubject);
    });
  });

  describe('findAll', () => {
    it('should delegate findAll call to SubjectsService', async () => {
      const response = {
        data: [mockSubject],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockSubjectsService.findAll.mockResolvedValue(response);

      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(mockSubjectsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(response);
    });
  });

  describe('findBySlug', () => {
    it('should delegate findBySlug call to SubjectsService', async () => {
      mockSubjectsService.findBySlug.mockResolvedValue(mockSubject);

      const result = await controller.findBySlug('cardiology');

      expect(mockSubjectsService.findBySlug).toHaveBeenCalledWith('cardiology');
      expect(result).toEqual(mockSubject);
    });
  });

  describe('findById', () => {
    it('should delegate findById call to SubjectsService', async () => {
      mockSubjectsService.findById.mockResolvedValue(mockSubject);

      const result = await controller.findById('sub-1111-2222-3333');

      expect(mockSubjectsService.findById).toHaveBeenCalledWith('sub-1111-2222-3333');
      expect(result).toEqual(mockSubject);
    });
  });

  describe('update', () => {
    it('should delegate update call to SubjectsService', async () => {
      mockSubjectsService.update.mockResolvedValue(mockSubject);

      const dto = { title: 'Updated' };
      const result = await controller.update('sub-1111-2222-3333', dto);

      expect(mockSubjectsService.update).toHaveBeenCalledWith('sub-1111-2222-3333', dto);
      expect(result).toEqual(mockSubject);
    });
  });

  describe('remove', () => {
    it('should delegate remove call to SubjectsService', async () => {
      const deleteResponse = { message: 'Subject deleted successfully' };
      mockSubjectsService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('sub-1111-2222-3333');

      expect(mockSubjectsService.remove).toHaveBeenCalledWith('sub-1111-2222-3333');
      expect(result).toEqual(deleteResponse);
    });
  });
});
