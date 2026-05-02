import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get('TELEGRAM_BOT_TOKEN') || '';
  }

  /** Пустая строка и пробелы в env считаем как «секрет не задан». */
  verifyWebhookSecret(header: string | undefined): boolean {
    const expected =
      this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET')?.trim() ?? '';
    if (!expected) {
      return true;
    }
    return (header ?? '').trim() === expected;
  }

  async sendPlainText(chatId: string, text: string): Promise<void> {
    if (!this.token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set; skip send');
      return;
    }
    if (!chatId) {
      return;
    }
    try {
      const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
      if (!response.ok) {
        this.logger.warn(
          `Telegram sendMessage failed: ${response.status} ${await response.text()}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Telegram sendMessage error: ${err}`);
    }
  }
}
