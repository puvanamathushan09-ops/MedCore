import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database.');
    } catch (error) {
      this.logger.warn(
        `Database connection status: Unable to reach PostgreSQL at startup (${error instanceof Error ? error.message : String(error)}).`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
