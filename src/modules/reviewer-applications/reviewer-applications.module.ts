import { Module } from '@nestjs/common';
import { ReviewerApplicationsService } from './reviewer-applications.service';
import { ReviewerApplicationsController } from './reviewer-applications.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewerApplicationsController],
  providers: [ReviewerApplicationsService],
  exports: [ReviewerApplicationsService],
})
export class ReviewerApplicationsModule {}
