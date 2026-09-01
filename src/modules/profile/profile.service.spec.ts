import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'student@medcore.org',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
    firstName: 'Alex',
    lastName: 'Rivera',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: Role.STUDENT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    studentProfile: {
      id: 'profile-uuid-1',
      userId: 'user-uuid-1',
      medicalSchool: 'Harvard Medical School',
      yearOfStudy: 3,
      targetExam: 'USMLE Step 1',
      specializationInterest: 'Cardiology',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    studentProfile: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('retrieves authenticated profile without exposing passwordHash', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getProfile('user-uuid-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        select: expect.any(Object),
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('user-uuid-1');
      expect(result.email).toBe('student@medcore.org');
      expect(result.firstName).toBe('Alex');
      expect(result.lastName).toBe('Rivera');
      expect(result.studentProfile?.medicalSchool).toBe('Harvard Medical School');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('returns null studentProfile if no student profile record exists yet', async () => {
      const userWithoutStudentProfile = {
        ...mockUser,
        studentProfile: null,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithoutStudentProfile);

      const result = await service.getProfile('user-uuid-1');

      expect(result.studentProfile).toBeNull();
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('throws UnauthorizedException if user does not exist or is inactive', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    it('updates user details and upserts studentProfile record', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        firstName: 'Alexander',
      });
      (prisma.studentProfile.upsert as jest.Mock).mockResolvedValue({
        ...mockUser.studentProfile,
        yearOfStudy: 4,
      });

      const updateDto = {
        firstName: 'Alexander',
        yearOfStudy: 4,
        specializationInterest: 'Neurology',
      };

      const result = await service.updateProfile('user-uuid-1', updateDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { firstName: 'Alexander' },
      });

      expect(prisma.studentProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        update: {
          yearOfStudy: 4,
          specializationInterest: 'Neurology',
        },
        create: {
          userId: 'user-uuid-1',
          yearOfStudy: 4,
          specializationInterest: 'Neurology',
        },
      });

      expect(result).toBeDefined();
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('throws UnauthorizedException if attempting to update non-existent user profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateProfile('invalid-id', { firstName: 'Test' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
