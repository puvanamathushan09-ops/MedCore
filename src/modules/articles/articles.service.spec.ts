import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleStatus, Role } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'reviewer@medcore.com',
    firstName: 'Doc',
    lastName: 'House',
    avatarUrl: null,
  };

  const mockSubject = {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Medicine',
    slug: 'medicine',
    description: 'Internal Medicine',
    iconUrl: null,
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopic = {
    id: '33333333-3333-3333-3333-333333333333',
    subjectId: mockSubject.id,
    parentId: null,
    title: 'Cardiology',
    slug: 'cardiology',
    description: 'Heart conditions',
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticle = {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Understanding Acute Appendicitis',
    slug: 'understanding-acute-appendicitis',
    content: 'Full medical article content here...',
    summary: 'Brief summary of appendicitis.',
    featuredImageUrl: 'https://example.com/image.png',
    status: ArticleStatus.PUBLISHED,
    authorId: mockUser.id,
    subjectId: mockSubject.id,
    topicId: mockTopic.id,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
    subject: mockSubject,
    topic: mockTopic,
  };

  const mockDraftArticle = {
    ...mockArticle,
    id: '55555555-5555-5555-5555-555555555555',
    title: 'Draft Appendicitis',
    slug: 'draft-appendicitis',
    status: ArticleStatus.DRAFT,
    publishedAt: null,
  };

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
      subject: {
        findUnique: jest.fn(),
      },
      topic: {
        findUnique: jest.fn(),
      },
      article: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an article successfully with valid subject and topic', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.subject.findUnique as jest.Mock).mockResolvedValue(mockSubject);
      (prismaService.topic.findUnique as jest.Mock).mockResolvedValue(mockTopic);
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.article.create as jest.Mock).mockResolvedValue(mockArticle);

      const dto = {
        title: 'Understanding Acute Appendicitis',
        content: 'Full medical article content here...',
        summary: 'Brief summary of appendicitis.',
        featuredImageUrl: 'https://example.com/image.png',
        status: ArticleStatus.PUBLISHED,
        subjectId: mockSubject.id,
        topicId: mockTopic.id,
      };

      const result = await service.create(dto, mockUser.id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: mockSubject.id },
      });
      expect(prismaService.article.create).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should create an article successfully without subject or topic', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.article.create as jest.Mock).mockResolvedValue({
        ...mockArticle,
        subjectId: null,
        topicId: null,
        subject: null,
        topic: null,
      });

      const dto = {
        title: 'Understanding Hypertension',
        content: 'Original medical education content.',
      };

      const result = await service.create(dto, mockUser.id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });

      expect(prismaService.subject.findUnique).not.toHaveBeenCalled();
      expect(prismaService.topic.findUnique).not.toHaveBeenCalled();

      expect(prismaService.article.create).toHaveBeenCalled();

      expect(result.subjectId).toBeNull();
      expect(result.topicId).toBeNull();
    });

    it('should throw BadRequestException if author does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const dto = {
        title: 'Title',
        content: 'Content',
        subjectId: mockSubject.id,
      };

      await expect(service.create(dto, 'non-existent-author')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if subject does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.subject.findUnique as jest.Mock).mockResolvedValue(null);

      const dto = {
        title: 'Title',
        content: 'Content',
        subjectId: 'non-existent-subject',
      };

      await expect(service.create(dto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if supplied topicId does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.subject.findUnique as jest.Mock).mockResolvedValue(mockSubject);
      (prismaService.topic.findUnique as jest.Mock).mockResolvedValue(null);

      const dto = {
        title: 'Title',
        content: 'Content',
        subjectId: mockSubject.id,
        topicId: 'invalid-topic-id',
      };

      await expect(service.create(dto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should enforce status=PUBLISHED for STUDENT role', async () => {
      (prismaService.article.findMany as jest.Mock).mockResolvedValue([mockArticle]);
      (prismaService.article.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({}, Role.STUDENT);

      expect(prismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ArticleStatus.PUBLISHED }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should allow filtering by DRAFT for MEDICAL_REVIEWER role', async () => {
      (prismaService.article.findMany as jest.Mock).mockResolvedValue([mockDraftArticle]);
      (prismaService.article.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(
        { status: ArticleStatus.DRAFT },
        Role.MEDICAL_REVIEWER,
      );

      expect(prismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ArticleStatus.DRAFT }),
        }),
      );
      expect(result.data[0].status).toEqual(ArticleStatus.DRAFT);
    });

    it('should return multiple articles ordered by createdAt desc', async () => {
      const articlesList = [mockArticle, mockDraftArticle];
      (prismaService.article.findMany as jest.Mock).mockResolvedValue(articlesList);
      (prismaService.article.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll({}, Role.ADMIN);

      expect(prismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result.data).toHaveLength(2);
    });

    it('should filter by subjectId when subjectId query param is provided', async () => {
      (prismaService.article.findMany as jest.Mock).mockResolvedValue([mockArticle]);
      (prismaService.article.count as jest.Mock).mockResolvedValue(1);

      const query = { subjectId: mockSubject.id };
      await service.findAll(query, Role.ADMIN);

      expect(prismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ subjectId: mockSubject.id }),
        }),
      );
    });

    it('should filter by topicId when topicId query param is provided', async () => {
      (prismaService.article.findMany as jest.Mock).mockResolvedValue([mockArticle]);
      (prismaService.article.count as jest.Mock).mockResolvedValue(1);

      const query = { topicId: mockTopic.id };
      await service.findAll(query, Role.ADMIN);

      expect(prismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ topicId: mockTopic.id }),
        }),
      );
    });

    it('should filter by search term when non-empty search query param is provided', async () => {
      (prismaService.article.findMany as jest.Mock).mockResolvedValue([mockArticle]);
      (prismaService.article.count as jest.Mock).mockResolvedValue(1);

      const query = { search: ' appendicitis ' };
      await service.findAll(query, Role.ADMIN);

      expect(prismaService.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'appendicitis', mode: 'insensitive' } },
              { summary: { contains: 'appendicitis', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('should return published article for STUDENT', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

      const result = await service.findBySlug(mockArticle.slug, Role.STUDENT);
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when STUDENT accesses DRAFT article', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockDraftArticle);

      await expect(
        service.findBySlug(mockDraftArticle.slug, Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return DRAFT article for ADMIN role', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockDraftArticle);

      const result = await service.findBySlug(mockDraftArticle.slug, Role.ADMIN);
      expect(result).toEqual(mockDraftArticle);
    });

    it('should return DRAFT article for MEDICAL_REVIEWER role', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockDraftArticle);

      const result = await service.findBySlug(mockDraftArticle.slug, Role.MEDICAL_REVIEWER);
      expect(result).toEqual(mockDraftArticle);
    });

    it('should throw NotFoundException when slug does not exist', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findBySlug('non-existent-slug', Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return existing article by ID', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

      const result = await service.findById(mockArticle.id, Role.STUDENT);

      expect(prismaService.article.findUnique).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
        include: {
          author: { select: expect.any(Object) },
          subject: true,
          topic: true,
        },
      });
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when article ID does not exist', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findById('non-existent-id', Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when STUDENT accesses DRAFT article by ID', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockDraftArticle);

      await expect(
        service.findById(mockDraftArticle.id, Role.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return DRAFT article by ID for MEDICAL_REVIEWER role', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockDraftArticle);

      const result = await service.findById(mockDraftArticle.id, Role.MEDICAL_REVIEWER);
      expect(result).toEqual(mockDraftArticle);
    });
  });

  describe('update', () => {
    it('should update an article successfully when valid fields are supplied', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prismaService.subject.findUnique as jest.Mock).mockResolvedValue(mockSubject);
      (prismaService.article.update as jest.Mock).mockResolvedValue({
        ...mockArticle,
        title: 'Updated Appendicitis Title',
      });

      const updateDto = {
        title: 'Updated Appendicitis Title',
      };

      const result = await service.update(mockArticle.id, updateDto);

      expect(prismaService.article.findUnique).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
      });
      expect(prismaService.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockArticle.id },
          data: expect.objectContaining({
            title: 'Updated Appendicitis Title',
          }),
        }),
      );
      expect(result.title).toBe('Updated Appendicitis Title');
    });

    it('should update only supplied fields and preserve unsupplied fields', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prismaService.article.update as jest.Mock).mockResolvedValue({
        ...mockArticle,
        summary: 'Updated summary only',
      });

      const updateDto = {
        summary: 'Updated summary only',
      };

      await service.update(mockArticle.id, updateDto);

      expect(prismaService.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockArticle.id },
          data: expect.objectContaining({
            summary: 'Updated summary only',
          }),
        }),
      );
    });

    it('should set publishedAt date when status transitions from DRAFT to PUBLISHED', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockDraftArticle);
      (prismaService.article.update as jest.Mock).mockResolvedValue({
        ...mockDraftArticle,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      await service.update(mockDraftArticle.id, { status: ArticleStatus.PUBLISHED });

      expect(prismaService.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockDraftArticle.id },
          data: expect.objectContaining({
            status: ArticleStatus.PUBLISHED,
            publishedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw NotFoundException when updating an article that does not exist', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if supplied subjectId does not exist', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prismaService.subject.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(mockArticle.id, { subjectId: 'invalid-subject-id' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if supplied topicId does not exist', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prismaService.topic.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update(mockArticle.id, { topicId: 'invalid-topic-id' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should allow MEDICAL_REVIEWER to delete a DRAFT article', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(
        mockDraftArticle,
      );
      (prismaService.article.delete as jest.Mock).mockResolvedValue(
        mockDraftArticle,
      );

      const result = await service.remove(
        mockDraftArticle.id,
        Role.MEDICAL_REVIEWER,
      );

      expect(prismaService.article.findUnique).toHaveBeenCalledWith({
        where: { id: mockDraftArticle.id },
      });

      expect(prismaService.article.delete).toHaveBeenCalledWith({
        where: { id: mockDraftArticle.id },
      });

      expect(result).toEqual({
        message: 'Article deleted successfully',
      });
    });

    it('should prevent MEDICAL_REVIEWER from deleting a PUBLISHED article', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(
        mockArticle,
      );

      await expect(
        service.remove(mockArticle.id, Role.MEDICAL_REVIEWER),
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.article.delete).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to delete a PUBLISHED article', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(
        mockArticle,
      );
      (prismaService.article.delete as jest.Mock).mockResolvedValue(
        mockArticle,
      );

      const result = await service.remove(mockArticle.id, Role.ADMIN);

      expect(prismaService.article.delete).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
      });

      expect(result).toEqual({
        message: 'Article deleted successfully',
      });
    });

    it('should throw NotFoundException when deleting an article that does not exist', async () => {
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', Role.ADMIN),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.article.delete).not.toHaveBeenCalled();
    });
  });
});

