import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEDICAL_REVIEWER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query() query: QueryArticleDto,
    @CurrentUser() user?: { role?: Role },
  ) {
    return this.articlesService.findAll(query, user?.role);
  }

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: { role?: Role },
  ) {
    return this.articlesService.findBySlug(slug, user?.role);
  }

  @Get('id/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: { role?: Role },
  ) {
    return this.articlesService.findById(id, user?.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEDICAL_REVIEWER, Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEDICAL_REVIEWER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role },
  ) {
    return this.articlesService.remove(id, user.role);
  }
}
