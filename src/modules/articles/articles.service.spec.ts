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
    featuredImage: 'https://example.com/image.png',
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
      (prismaService.subject.findUnique as jest.Mock).mockResolvedValue(mockSubject);
      (prismaService.topic.findUnique as jest.Mock).mockResolvedValue(mockTopic);
      (prismaService.article.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.article.create as jest.Mock).mockResolvedValue(mockArticle);

      const dto = {
        title: 'Understanding Acute Appendicitis',
        content: 'Full medical article content here...',
        summary: 'Brief summary of appendicitis.',
        featuredImage: 'https://example.com/image.png',
        status: ArticleStatus.PUBLISHED,
        subjectId: mockSubject.id,
        topicId: mockTopic.id,
      };

      const result = await service.create(dto, mockUser.id);

      expect(prismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: mockSubject.id },
      });
      expect(prismaService.article.create).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should throw BadRequestException if subject does not exist', async () => {
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
  });
});
