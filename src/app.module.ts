import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DevelopersModule } from './developers/developers.module';
import { ProjectsModule } from './projects/projects.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { LeadsModule } from './leads/leads.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    DevelopersModule,
    ProjectsModule,
    ApartmentsModule,
    LeadsModule,
    AnalyticsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
