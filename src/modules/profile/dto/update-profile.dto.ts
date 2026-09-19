import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'Medical school must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  medicalSchool?: string;

  @IsOptional()
  @IsInt({ message: 'Year of study must be an integer' })
  @Min(1, { message: 'Year of study must be at least 1' })
  @Max(10, { message: 'Year of study must be at most 10' })
  yearOfStudy?: number;

  @IsOptional()
  @IsString({ message: 'Target exam must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  targetExam?: string;

  @IsOptional()
  @IsString({ message: 'Specialization interest must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  specializationInterest?: string;

  @IsOptional()
  @IsString({ message: 'Professional title must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  professionalTitle?: string;

  @IsOptional()
  @IsString({ message: 'Specialty must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  specialty?: string;

  @IsOptional()
  @IsString({ message: 'Qualifications must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  qualifications?: string;

  @IsOptional()
  @IsString({ message: 'Institution must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  institution?: string;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Expertise must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  expertise?: string;
}

