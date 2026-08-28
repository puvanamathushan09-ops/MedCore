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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MEDICAL_REVIEWER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Query() query: QueryTopicDto) {
    return this.topicsService.findAll(query);
  }

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  async findBySlug(@Param('slug') slug: string) {
    return this.topicsService.findBySlug(slug);
  }

  @Get('id/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MEDICAL_REVIEWER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    return this.topicsService.update(id, updateTopicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.topicsService.remove(id);
  }
}
