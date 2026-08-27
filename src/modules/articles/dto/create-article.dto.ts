import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  featuredImageUrl?: string;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsOptional()
  topicId?: string;
}
