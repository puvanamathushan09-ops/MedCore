import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTopicDto {
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
