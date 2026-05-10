import { Module } from '@nestjs/common';
import { LayoutVariantsService } from './layout-variants.service';
import { LayoutVariantsController } from './layout-variants.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { DeveloperAuthGuard } from '../common/guards/developer-auth.guard';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';
import { ApartmentsModule } from '../apartments/apartments.module';

@Module({
  imports: [AuthModule, ApartmentsModule],
  controllers: [LayoutVariantsController],
  providers: [
    LayoutVariantsService,
    PrismaService,
    DeveloperAuthGuard,
    ProjectMemberGuard,
  ],
  exports: [LayoutVariantsService],
})
export class LayoutVariantsModule {}
