import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let prisma: any;

  const mockSubject = {
    id: 'sub-1111-2222-3333',
    title: 'Cardiology',
    slug: 'cardiology',
    description: 'Study of the heart and blood vessels',
    iconUrl: 'https://example.com/cardio.png',
    orderIndex: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { topics: 5, articles: 12 },
  };

  const mockPrismaService = {
    subject: {
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
        SubjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should generate an automatic slug from title and create a subject', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);
      mockPrismaService.subject.create.mockResolvedValue(mockSubject);

      const result = await service.create({
        title: 'Cardiology',
        description: 'Study of the heart and blood vessels',
      });

      expect(mockPrismaService.subject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Cardiology',
          slug: 'cardiology',
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockSubject);
    });

    it('should throw ConflictException if custom slug already exists', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);

      await expect(
        service.create({
          title: 'Cardiology',
          slug: 'cardiology',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated subjects list with metadata', async () => {
      mockPrismaService.subject.findMany.mockResolvedValue([mockSubject]);
      mockPrismaService.subject.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10, search: 'cardio' });

      expect(result).toEqual({
        data: [mockSubject],
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
    it('should return a subject by slug if found', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);

      const result = await service.findBySlug('cardiology');

      expect(result).toEqual(mockSubject);
    });

    it('should throw NotFoundException if subject slug does not exist', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a subject by ID if found', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);

      const result = await service.findById('sub-1111-2222-3333');

      expect(result).toEqual(mockSubject);
    });

    it('should throw NotFoundException if subject ID does not exist', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update subject details successfully', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      const updatedSubject = { ...mockSubject, title: 'Cardiology & Vascular' };
      mockPrismaService.subject.update.mockResolvedValue(updatedSubject);

      const result = await service.update('sub-1111-2222-3333', {
        title: 'Cardiology & Vascular',
      });

      expect(result.title).toBe('Cardiology & Vascular');
    });

    it('should throw NotFoundException if updating non-existent subject', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(
        service.update('bad-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete subject if found', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(mockSubject);
      mockPrismaService.subject.delete.mockResolvedValue(mockSubject);

      const result = await service.remove('sub-1111-2222-3333');

      expect(result).toEqual({ message: 'Subject deleted successfully' });
    });

    it('should throw NotFoundException if deleting non-existent subject', async () => {
      mockPrismaService.subject.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
