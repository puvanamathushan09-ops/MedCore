import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ReviewerApplicationsModule } from './modules/reviewer-applications/reviewer-applications.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    ArticlesModule,
    SubjectsModule,
    TopicsModule,
    ProfileModule,
    ReviewerApplicationsModule,
    QuizzesModule,
  ],
})
export class AppModule {}
