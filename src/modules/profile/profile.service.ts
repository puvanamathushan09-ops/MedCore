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
        reviewerProfile: {
          select: {
            id: true,
            professionalTitle: true,
            specialty: true,
            qualifications: true,
            institution: true,
            bio: true,
            expertise: true,
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
      reviewerProfile: user.reviewerProfile || null,
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
      professionalTitle,
      specialty,
      qualifications,
      institution,
      bio,
      expertise,
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

    // Process StudentProfile if user.role === 'STUDENT'
    if (user.role === 'STUDENT') {
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
    }

    // Process ReviewerProfile if user.role === 'MEDICAL_REVIEWER'
    if (user.role === 'MEDICAL_REVIEWER') {
      const hasReviewerFields =
        professionalTitle !== undefined ||
        specialty !== undefined ||
        qualifications !== undefined ||
        institution !== undefined ||
        bio !== undefined ||
        expertise !== undefined;

      if (hasReviewerFields) {
        const reviewerData: Record<string, any> = {};
        if (professionalTitle !== undefined) reviewerData.professionalTitle = professionalTitle;
        if (specialty !== undefined) reviewerData.specialty = specialty;
        if (qualifications !== undefined) reviewerData.qualifications = qualifications;
        if (institution !== undefined) reviewerData.institution = institution;
        if (bio !== undefined) reviewerData.bio = bio;
        if (expertise !== undefined) reviewerData.expertise = expertise;

        await this.prisma.reviewerProfile.upsert({
          where: { userId },
          update: reviewerData,
          create: {
            userId,
            ...reviewerData,
          },
        });
      }
    }

    return this.getProfile(userId);
  }
}

