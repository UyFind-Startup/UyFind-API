import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../common/services/notifications.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, PrismaService, NotificationsService],
})
export class LeadsModule {}
