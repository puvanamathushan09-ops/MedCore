import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}
