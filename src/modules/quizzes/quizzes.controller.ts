import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  create(@Body() createQuizDto: CreateQuizDto, @Req() req: any) {
    return this.quizzesService.create(createQuizDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: any) {
    const includeUnpublished =
      req.user?.role === 'MEDICAL_REVIEWER' ||
      req.user?.role === 'ADMIN';

    return this.quizzesService.findAll(includeUnpublished);
  }

  @Get('attempts/me')
  getMyAttempts(@Req() req: any) {
    return this.quizzesService.getMyAttempts(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const includeUnpublished =
      req.user?.role === 'MEDICAL_REVIEWER' ||
      req.user?.role === 'ADMIN';

    return this.quizzesService.findOne(id, includeUnpublished);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Req() req: any,
  ) {
    return this.quizzesService.update(id, updateQuizDto, req.user.id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @Req() req: any) {
    return this.quizzesService.publish(id, req.user.id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string, @Req() req: any) {
    return this.quizzesService.unpublish(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.quizzesService.remove(id, req.user.id);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Req() req: any,
  ) {
    return this.quizzesService.submit(id, submitQuizDto, req.user.id);
  }
}