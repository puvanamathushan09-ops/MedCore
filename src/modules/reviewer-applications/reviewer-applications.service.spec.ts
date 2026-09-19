import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReviewerApplicationsService } from './reviewer-applications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplicationStatus, Role } from '@prisma/client';

describe('ReviewerApplicationsService', () => {
  let service: ReviewerApplicationsService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'student@medcore.org',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.STUDENT,
    isActive: true,
  };

  const mockAdminUser = {
    id: 'admin-uuid-1',
    email: 'admin@medcore.org',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    isActive: true,
  };

  const mockApplication = {
    id: 'app-uuid-1',
    userId: 'user-uuid-1',
    professionalTitle: 'MD',
    specialty: 'Cardiology',
    qualifications: 'MBBS, MD Cardiology',
    institution: 'Johns Hopkins Hospital',
    bio: 'Experienced cardiologist.',
    expertise: 'Heart failure and arrhythmias.',
    status: ApplicationStatus.PENDING,
    rejectionReason: null,
    reviewedByAdminId: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    reviewedByAdmin: null,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    reviewerApplication: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    reviewerProfile: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  mockPrismaService.$transaction.mockImplementation(
    async (callback: any) => callback(mockPrismaService),
  );
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewerApplicationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReviewerApplicationsService>(ReviewerApplicationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('registerAndApply', () => {
    it('creates a new STUDENT user and PENDING reviewer application in a transaction', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.reviewerApplication.create as jest.Mock).mockResolvedValue(mockApplication);

      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'newreviewer@medcore.org',
        password: 'password123',
        professionalTitle: 'Dr.',
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD',
        institution: 'Johns Hopkins Hospital',
      };

      const result = await service.registerAndApply(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newreviewer@medcore.org' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newreviewer@medcore.org',
          firstName: 'Jane',
          lastName: 'Doe',
          role: Role.STUDENT,
        }),
        select: expect.any(Object),
      });
      expect(prisma.reviewerApplication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-uuid-1',
          professionalTitle: 'Dr.',
          specialty: 'Cardiology',
          status: ApplicationStatus.PENDING,
        }),
        include: expect.any(Object),
      });

      expect(result).toHaveProperty('message');
      expect(result.user).toEqual(mockUser);
      expect(result.application).toEqual(mockApplication);
    });

    it('throws ConflictException if email is already registered', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'student@medcore.org',
        password: 'password123',
        professionalTitle: 'Dr.',
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD',
        institution: 'Johns Hopkins Hospital',
      };

      await expect(service.registerAndApply(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('apply', () => {
    it('creates a pending reviewer application for an active STUDENT user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.reviewerApplication.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.reviewerApplication.create as jest.Mock).mockResolvedValue(mockApplication);

      const dto = {
        professionalTitle: 'MD',
        specialty: 'Cardiology',
        qualifications: 'MBBS, MD Cardiology',
        institution: 'Johns Hopkins Hospital',
        bio: 'Experienced cardiologist.',
        expertise: 'Heart failure and arrhythmias.',
      };

      const result = await service.apply('user-uuid-1', dto);

      expect(prisma.reviewerApplication.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1', status: ApplicationStatus.PENDING },
      });
      expect(prisma.reviewerApplication.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-1',
          professionalTitle: 'MD',
          specialty: 'Cardiology',
          qualifications: 'MBBS, MD Cardiology',
          institution: 'Johns Hopkins Hospital',
          bio: 'Experienced cardiologist.',
          expertise: 'Heart failure and arrhythmias.',
          status: ApplicationStatus.PENDING,
        },
        include: expect.any(Object),
      });
      expect(result.status).toBe(ApplicationStatus.PENDING);
    });

    it('throws UnauthorizedException if user account is missing or inactive', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.apply('invalid-user', {
          professionalTitle: 'MD',
          specialty: 'Neuro',
          qualifications: 'MD',
          institution: 'Clinic',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException if user is already a MEDICAL_REVIEWER or ADMIN', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: Role.MEDICAL_REVIEWER,
      });

      await expect(
        service.apply('user-uuid-1', {
          professionalTitle: 'MD',
          specialty: 'Neuro',
          qualifications: 'MD',
          institution: 'Clinic',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if user already has a PENDING application', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.reviewerApplication.findFirst as jest.Mock).mockResolvedValue(mockApplication);

      await expect(
        service.apply('user-uuid-1', {
          professionalTitle: 'MD',
          specialty: 'Neuro',
          qualifications: 'MD',
          institution: 'Clinic',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyApplication', () => {
    it('returns the latest application ordered by createdAt desc', async () => {
      (prisma.reviewerApplication.findFirst as jest.Mock).mockResolvedValue(mockApplication);

      const result = await service.getMyApplication('user-uuid-1');

      expect(prisma.reviewerApplication.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
      expect(result).toBe(mockApplication);
    });
  });

  describe('approve', () => {
    it('approves PENDING application, promotes user to MEDICAL_REVIEWER, and creates ReviewerProfile', async () => {
      (prisma.reviewerApplication.findUnique as jest.Mock).mockResolvedValue(mockApplication);
      (prisma.reviewerApplication.update as jest.Mock).mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.APPROVED,
        reviewedByAdminId: 'admin-uuid-1',
        reviewedAt: new Date(),
      });

      const result = await service.approve('app-uuid-1', 'admin-uuid-1');

      expect(prisma.reviewerApplication.update).toHaveBeenCalledWith({
        where: { id: 'app-uuid-1' },
        data: expect.objectContaining({
          status: ApplicationStatus.APPROVED,
          reviewedByAdminId: 'admin-uuid-1',
        }),
        include: expect.any(Object),
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { role: Role.MEDICAL_REVIEWER },
      });

      expect(prisma.reviewerProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        update: expect.objectContaining({
          professionalTitle: 'MD',
          specialty: 'Cardiology',
        }),
        create: expect.objectContaining({
          userId: 'user-uuid-1',
          professionalTitle: 'MD',
          specialty: 'Cardiology',
        }),
      });

      expect(result.status).toBe(ApplicationStatus.APPROVED);
    });

    it('throws BadRequestException if application status is not PENDING', async () => {
      (prisma.reviewerApplication.findUnique as jest.Mock).mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.APPROVED,
      });

      await expect(service.approve('app-uuid-1', 'admin-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('rejects PENDING application with rejectionReason and keeps user role as STUDENT', async () => {
      (prisma.reviewerApplication.findUnique as jest.Mock).mockResolvedValue(mockApplication);
      (prisma.reviewerApplication.update as jest.Mock).mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.REJECTED,
        rejectionReason: 'Insufficient clinical experience.',
        reviewedByAdminId: 'admin-uuid-1',
        reviewedAt: new Date(),
      });

      const result = await service.reject(
        'app-uuid-1',
        'admin-uuid-1',
        'Insufficient clinical experience.',
      );

      expect(prisma.reviewerApplication.update).toHaveBeenCalledWith({
        where: { id: 'app-uuid-1' },
        data: expect.objectContaining({
          status: ApplicationStatus.REJECTED,
          rejectionReason: 'Insufficient clinical experience.',
          reviewedByAdminId: 'admin-uuid-1',
        }),
        include: expect.any(Object),
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(result.status).toBe(ApplicationStatus.REJECTED);
    });

    it('throws BadRequestException if application is already processed', async () => {
      (prisma.reviewerApplication.findUnique as jest.Mock).mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.REJECTED,
      });

      await expect(
        service.reject('app-uuid-1', 'admin-uuid-1', 'Reason'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
