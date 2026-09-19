import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApplicationStatus } from '@prisma/client';

export class ApplyReviewerDto {
  @IsNotEmpty({ message: 'Professional title is required' })
  @IsString({ message: 'Professional title must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  professionalTitle: string;

  @IsNotEmpty({ message: 'Specialty is required' })
  @IsString({ message: 'Specialty must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  specialty: string;

  @IsNotEmpty({ message: 'Qualifications are required' })
  @IsString({ message: 'Qualifications must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  qualifications: string;

  @IsNotEmpty({ message: 'Institution is required' })
  @IsString({ message: 'Institution must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  institution: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Expertise must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  expertise?: string;
}

export class RegisterAndApplyReviewerDto extends ApplyReviewerDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName: string;

  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class RejectApplicationDto {
  @IsOptional()
  @IsString({ message: 'Rejection reason must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  rejectionReason?: string;
}

export class QueryApplicationsDto {
  @IsOptional()
  @IsEnum(ApplicationStatus, { message: 'Invalid application status' })
  status?: ApplicationStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;
}
