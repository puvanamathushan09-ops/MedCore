import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ArticleStatus } from '@prisma/client';

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

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
  @IsOptional()
  subjectId?: string;

  @IsUUID()
  @IsOptional()
  topicId?: string;
}
