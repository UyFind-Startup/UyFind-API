import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PrismaService } from '../prisma.service';
import { TelegramBotService } from './telegram-bot.service';

@ApiExcludeController()
@Controller('telegram')
export class TelegramWebhookController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramBot: TelegramBotService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Body()
    body: {
      message?: { text?: string; chat?: { id: number } };
    },
    @Headers('x-telegram-bot-api-secret-token') secretToken?: string,
  ) {
    if (!this.telegramBot.verifyWebhookSecret(secretToken)) {
      throw new UnauthorizedException();
    }

    const text = body.message?.text;
    const chatId = body.message?.chat?.id;
    if (!text || chatId == null) {
      return { ok: true };
    }

    if (text.startsWith('/start')) {
      const parts = text.trim().split(/\s+/);
      const payload = parts[1];
      if (payload) {
        await this.linkChat(payload, String(chatId));
      }
    }

    return { ok: true };
  }

  private async linkChat(token: string, chatId: string): Promise<void> {
    const developer = await this.prisma.developer.findFirst({
      where: {
        telegramLinkToken: token,
        telegramLinkExpiresAt: { gt: new Date() },
      },
    });
    if (!developer) {
      return;
    }

    await this.prisma.developer.update({
      where: { id: developer.id },
      data: {
        telegramChatId: chatId,
        telegramLinkToken: null,
        telegramLinkExpiresAt: null,
      },
    });

    await this.telegramBot.sendPlainText(
      chatId,
      'Аккаунт подключён. Вы будете получать уведомления о новых заявках.',
    );
  }
}
