import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticleStatus, Role } from '@prisma/client';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: jest.Mocked<ArticlesService>;

  const mockArticle = {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Understanding Acute Appendicitis',
    slug: 'understanding-acute-appendicitis',
    content: 'Full article content...',
    summary: 'Summary...',
    featuredImage: null,
    status: ArticleStatus.PUBLISHED,
    authorId: '11111111-1111-1111-1111-111111111111',
    subjectId: '22222222-2222-2222-2222-222222222222',
    topicId: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate create call to ArticlesService', async () => {
      service.create.mockResolvedValue(mockArticle as any);

      const dto = {
        title: 'Understanding Acute Appendicitis',
        content: 'Full article content...',
        subjectId: '22222222-2222-2222-2222-222222222222',
      };

      const result = await controller.create(dto, { id: 'user-id' });

      expect(service.create).toHaveBeenCalledWith(dto, 'user-id');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('findAll', () => {
    it('should delegate list call to ArticlesService with query and user role', async () => {
      const mockResult = { data: [mockArticle], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      service.findAll.mockResolvedValue(mockResult as any);

      const query = { page: 1, limit: 10 };
      const user = { role: Role.STUDENT };

      const result = await controller.findAll(query, user);

      expect(service.findAll).toHaveBeenCalledWith(query, Role.STUDENT);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findBySlug', () => {
    it('should delegate findBySlug to ArticlesService', async () => {
      service.findBySlug.mockResolvedValue(mockArticle as any);

      const result = await controller.findBySlug('understanding-acute-appendicitis', { role: Role.STUDENT });

      expect(service.findBySlug).toHaveBeenCalledWith('understanding-acute-appendicitis', Role.STUDENT);
      expect(result).toEqual(mockArticle);
    });
  });
});
