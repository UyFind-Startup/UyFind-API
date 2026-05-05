import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ExpoPushService {
  private readonly expo = new Expo();
  private readonly logger = new Logger(ExpoPushService.name);

  constructor(private prisma: PrismaService) {}

  async notifyDeveloperNewLead(params: {
    developerId: number;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    const devices = await this.prisma.developerDevice.findMany({
      where: { developerId: params.developerId },
      select: { expoPushToken: true },
    });
    const tokens = devices
      .map((d) => d.expoPushToken)
      .filter((t) => Expo.isExpoPushToken(t));

    if (!tokens.length) return { ok: true, sent: 0 };

    const messages: ExpoPushMessage[] = tokens.map((to) => ({
      to,
      sound: undefined,
      title: params.title,
      body: params.body,
      data: params.data,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    let sent = 0;
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        sent += tickets.length;
      } catch (e) {
        this.logger.warn(`Push send failed: ${String(e)}`);
      }
    }

    return { ok: true, sent };
  }
}

