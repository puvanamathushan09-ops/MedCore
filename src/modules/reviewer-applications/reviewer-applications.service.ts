import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplicationStatus, Role } from '@prisma/client';
import {
  ApplyReviewerDto,
  RegisterAndApplyReviewerDto,
  QueryApplicationsDto,
} from './dto/reviewer-application.dto';

@Injectable()
export class ReviewerApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAndApply(dto: RegisterAndApplyReviewerDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          role: Role.STUDENT,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      const application = await tx.reviewerApplication.create({
        data: {
          userId: user.id,
          professionalTitle: dto.professionalTitle,
          specialty: dto.specialty,
          qualifications: dto.qualifications,
          institution: dto.institution,
          bio: dto.bio || null,
          expertise: dto.expertise || null,
          status: ApplicationStatus.PENDING,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      return {
        message: 'Account created and reviewer application submitted for Admin verification',
        user,
        application,
      };
    });
  }

  async apply(userId: string, dto: ApplyReviewerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is invalid or inactive');
    }

    if (user.role === Role.MEDICAL_REVIEWER || user.role === Role.ADMIN) {
      throw new BadRequestException('User already has medical reviewer or admin privileges');
    }

    // Safeguard: Check for existing PENDING application
    const existingPending = await this.prisma.reviewerApplication.findFirst({
      where: {
        userId,
        status: ApplicationStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new ConflictException('You already have a pending reviewer application');
    }

    return this.prisma.reviewerApplication.create({
      data: {
        userId,
        professionalTitle: dto.professionalTitle,
        specialty: dto.specialty,
        qualifications: dto.qualifications,
        institution: dto.institution,
        bio: dto.bio || null,
        expertise: dto.expertise || null,
        status: ApplicationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async getMyApplication(userId: string) {
    const application = await this.prisma.reviewerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        reviewedByAdmin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return application || null;
  }

  async findAll(query: QueryApplicationsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where = query.status ? { status: query.status } : {};

    const [total, data] = await Promise.all([
      this.prisma.reviewerApplication.count({ where }),
      this.prisma.reviewerApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          reviewedByAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.reviewerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        reviewedByAdmin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Reviewer application with ID '${id}' not found`);
    }

    return application;
  }

  async approve(id: string, adminId: string) {
    const application = await this.findOne(id);

    // Safeguard 1: Application State Protection
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been processed');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update application status
      const updatedApplication = await tx.reviewerApplication.update({
        where: { id },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedByAdminId: adminId,
          reviewedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          reviewedByAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Safeguard 2: Applicant Role Protection
      if (application.user.role === Role.STUDENT) {
        await tx.user.update({
          where: { id: application.userId },
          data: { role: Role.MEDICAL_REVIEWER },
        });
      }

      // 3. Upsert ReviewerProfile
      await tx.reviewerProfile.upsert({
        where: { userId: application.userId },
        update: {
          professionalTitle: application.professionalTitle,
          specialty: application.specialty,
          qualifications: application.qualifications,
          institution: application.institution,
          bio: application.bio,
          expertise: application.expertise,
        },
        create: {
          userId: application.userId,
          professionalTitle: application.professionalTitle,
          specialty: application.specialty,
          qualifications: application.qualifications,
          institution: application.institution,
          bio: application.bio,
          expertise: application.expertise,
        },
      });

      return updatedApplication;
    });
  }

  async reject(id: string, adminId: string, rejectionReason?: string) {
    const application = await this.findOne(id);

    // Safeguard 1: Application State Protection
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been processed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.reviewerApplication.update({
        where: { id },
        data: {
          status: ApplicationStatus.REJECTED,
          rejectionReason: rejectionReason?.trim() || null,
          reviewedByAdminId: adminId,
          reviewedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          reviewedByAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return updatedApplication;
    });
  }
}
