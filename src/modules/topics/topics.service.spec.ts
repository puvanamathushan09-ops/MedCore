import { Test, TestingModule } from '@nestjs/testing';
import { TopicsService } from './topics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('TopicsService', () => {
  let service: TopicsService;
  let prisma: any;

  const mockSubject = {
    id: 'sub-1111-2222-3333',
    title: 'Cardiology',
    slug: 'cardiology',
  };

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
    _count: { articles: 8, children: 2 },
  };

  const mockParentTopic = {
    id: 'top-9999-8888-7777',
    subjectId: 'sub-1111-2222-3333',
    parentId: null,
    title: 'Electrophysiology',
    slug: 'electrophysiology',
  };

  const mockDifferentSubjectParentTopic = {
    id: 'top-0000-0000-0000',
    subjectId: 'sub-different-subject',
    parentId: null,
    title: 'Neurology Topic',
    slug: 'neurology-topic',
  };

  const mockPrismaService = {
    subject: {
      findUnique: jest.fn(),
    },
    topic: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TopicsService>(TopicsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a topic successfully when subjectId is valid', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.topic.findUnique.mockResolvedValue(null);
      mockPrismaService.topic.create.mockResolvedValue(mockTopic);

      const result = await service.create({
        subjectId: mockSubject.id,
        title: 'Arrhythmias',
        description: 'Irregular heartbeats',
      });

      expect(mockPrismaService.subject.findUnique).toHaveBeenCalledWith({
        where: { id: mockSubject.id },
      });
      expect(mockPrismaService.topic.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subjectId: mockSubject.id,
          title: 'Arrhythmias',
          slug: 'arrhythmias',
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTopic);
    });

    it('should throw BadRequestException if subjectId does not exist', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          subjectId: 'invalid-subject',
          title: 'Arrhythmias',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if parentId belongs to a different subject', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.topic.findUnique.mockResolvedValue(mockDifferentSubjectParentTopic);

      await expect(
        service.create({
          subjectId: mockSubject.id,
          parentId: mockDifferentSubjectParentTopic.id,
          title: 'Arrhythmias',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if custom slug already exists', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.topic.findUnique.mockResolvedValue(mockTopic);

      await expect(
        service.create({
          subjectId: mockSubject.id,
          title: 'Arrhythmias',
          slug: 'arrhythmias',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated topics list filtered by subjectId', async () => {
      mockPrismaService.topic.findMany.mockResolvedValue([mockTopic]);
      mockPrismaService.topic.count.mockResolvedValue(1);

      const result = await service.findAll({
        subjectId: mockSubject.id,
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: [mockTopic],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('findBySlug', () => {
    it('should return topic by slug if found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(mockTopic);

      const result = await service.findBySlug('arrhythmias');
      expect(result).toEqual(mockTopic);
    });

    it('should throw NotFoundException if topic slug is not found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return topic by ID if found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(mockTopic);

      const result = await service.findById(mockTopic.id);
      expect(result).toEqual(mockTopic);
    });

    it('should throw NotFoundException if topic ID is not found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(null);

      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should prevent topic from setting parentId equal to its own ID', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(mockTopic);

      await expect(
        service.update(mockTopic.id, {
          parentId: mockTopic.id,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update topic title and slug successfully', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(mockTopic);
      const updated = { ...mockTopic, title: 'Updated Arrhythmias' };
      mockPrismaService.topic.update.mockResolvedValue(updated);

      const result = await service.update(mockTopic.id, {
        title: 'Updated Arrhythmias',
      });

      expect(result.title).toBe('Updated Arrhythmias');
    });

    it('should throw NotFoundException if updating non-existent topic', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(null);

      await expect(
        service.update('bad-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete topic if found', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(mockTopic);
      mockPrismaService.topic.delete.mockResolvedValue(mockTopic);

      const result = await service.remove(mockTopic.id);

      expect(result).toEqual({ message: 'Topic deleted successfully' });
    });

    it('should throw NotFoundException if deleting non-existent topic', async () => {
      mockPrismaService.topic.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
