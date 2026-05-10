import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthGuard } from '../common/guards/customer-auth.guard';

@Module({
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, PrismaService, CustomerAuthGuard],
  exports: [CustomerAuthService, CustomerAuthGuard],
})
export class CustomerAuthModule {}
