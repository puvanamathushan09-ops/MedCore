import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        studentProfile: {
          select: {
            id: true,
            medicalSchool: true,
            yearOfStudy: true,
            targetExam: true,
            specializationInterest: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account is inactive');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      studentProfile: user.studentProfile || null,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account is inactive');
    }

    const {
      firstName,
      lastName,
      avatarUrl,
      medicalSchool,
      yearOfStudy,
      targetExam,
      specializationInterest,
    } = updateProfileDto;

    // Update User fields if provided
    const userUpdateData: Record<string, any> = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (avatarUrl !== undefined) userUpdateData.avatarUrl = avatarUrl;

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // Upsert StudentProfile if any student profile fields are provided
    const hasStudentFields =
      medicalSchool !== undefined ||
      yearOfStudy !== undefined ||
      targetExam !== undefined ||
      specializationInterest !== undefined;

    if (hasStudentFields) {
      const studentData: Record<string, any> = {};
      if (medicalSchool !== undefined) studentData.medicalSchool = medicalSchool;
      if (yearOfStudy !== undefined) studentData.yearOfStudy = yearOfStudy;
      if (targetExam !== undefined) studentData.targetExam = targetExam;
      if (specializationInterest !== undefined)
        studentData.specializationInterest = specializationInterest;

      await this.prisma.studentProfile.upsert({
        where: { userId },
        update: studentData,
        create: {
          userId,
          ...studentData,
        },
      });
    }

    return this.getProfile(userId);
  }
}
