import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewerApplicationsService } from './reviewer-applications.service';
import {
  ApplyReviewerDto,
  RegisterAndApplyReviewerDto,
  RejectApplicationDto,
  QueryApplicationsDto,
} from './dto/reviewer-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller()
export class ReviewerApplicationsController {
  constructor(
    private readonly reviewerApplicationsService: ReviewerApplicationsService,
  ) {}

  // 1. Applicant Registration & Application Endpoints
  @Post('reviewer-applications/register-and-apply')
  @HttpCode(HttpStatus.CREATED)
  async registerAndApply(
    @Body() registerDto: RegisterAndApplyReviewerDto,
  ) {
    return this.reviewerApplicationsService.registerAndApply(registerDto);
  }

  @Post('reviewer-applications/apply')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async apply(
    @CurrentUser() currentUser: { id: string },
    @Body() applyDto: ApplyReviewerDto,
  ) {
    return this.reviewerApplicationsService.apply(currentUser.id, applyDto);
  }

  @Get('reviewer-applications/me')
  @UseGuards(JwtAuthGuard)
  async getMyApplication(@CurrentUser() currentUser: { id: string }) {
    return this.reviewerApplicationsService.getMyApplication(currentUser.id);
  }

  // 2. Admin Endpoints
  @Get('admin/reviewer-applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query() query: QueryApplicationsDto) {
    return this.reviewerApplicationsService.findAll(query);
  }

  @Get('admin/reviewer-applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.reviewerApplicationsService.findOne(id);
  }

  @Patch('admin/reviewer-applications/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async approve(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.reviewerApplicationsService.approve(id, currentUser.id);
  }

  @Patch('admin/reviewer-applications/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async reject(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string },
    @Body() rejectDto: RejectApplicationDto,
  ) {
    return this.reviewerApplicationsService.reject(
      id,
      currentUser.id,
      rejectDto.rejectionReason,
    );
  }
}
