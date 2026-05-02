import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma.service';
import { TelegramBotService } from './telegram-bot.service';

/** Полное тело Update от Telegram (поля не перечисляем — только нужное). */
type TelegramUpdate = {
  message?: { text?: string; chat?: { id: number } };
};

@ApiExcludeController()
@Controller('telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramBot: TelegramBotService,
  ) {}

  @Post('webhook')
  @SkipThrottle()
  @HttpCode(200)
  async webhook(
    @Body() body: TelegramUpdate,
    @Headers('x-telegram-bot-api-secret-token') secretToken?: string,
  ) {
    if (!this.telegramBot.verifyWebhookSecret(secretToken)) {
      this.logger.warn(
        'Webhook rejected: invalid or missing X-Telegram-Bot-Api-Secret-Token (check TELEGRAM_WEBHOOK_SECRET vs setWebhook secret_token)',
      );
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
      } else {
        this.logger.debug('Webhook /start without payload (open bot without link token)');
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
      this.logger.warn(
        `Telegram link: no developer for token (wrong DB, expired link, or token overwritten by new link). chatId=${chatId}`,
      );
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

    this.logger.log(
      `Telegram linked: developerId=${developer.id} chatId=${chatId}`,
    );

    await this.telegramBot.sendPlainText(
      chatId,
      'Аккаунт подключён. Вы будете получать уведомления о новых заявках.',
    );
  }
}
