import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramWebhookController } from './telegram-webhook.controller';

@Module({
  controllers: [TelegramWebhookController],
  providers: [TelegramBotService, PrismaService],
  exports: [TelegramBotService],
})
export class TelegramModule {}
