import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../common/services/notifications.service';
import { ExpoPushService } from '../common/services/expo-push.service';
import { AuthModule } from '../auth/auth.module';
import { DeveloperAuthGuard } from '../common/guards/developer-auth.guard';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [AuthModule, TelegramModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    PrismaService,
    NotificationsService,
    ExpoPushService,
    DeveloperAuthGuard,
  ],
})
export class LeadsModule {}
