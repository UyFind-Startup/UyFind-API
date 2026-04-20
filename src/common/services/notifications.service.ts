import { Injectable } from '@nestjs/common';

export interface NotificationProvider {
  send(message: string): Promise<void>;
}

@Injectable()
export class MockNotificationProvider implements NotificationProvider {
  async send(message: string): Promise<void> {
    console.log('[NOTIFICATION]', message);
  }
}

@Injectable()
export class NotificationsService {
  private provider: NotificationProvider;

  constructor() {
    // Initialize with mock provider by default
    this.provider = new MockNotificationProvider();
  }

  setProvider(provider: NotificationProvider) {
    this.provider = provider;
  }

  async notifyNewLead(
    leadName: string,
    apartmentId: number,
    projectName: string,
  ): Promise<void> {
    const message = `New lead: ${leadName} is interested in apartment #${apartmentId} in project "${projectName}"`;
    await this.provider.send(message);
  }

  async notifyLeadStatusChange(
    leadName: string,
    newStatus: string,
    projectName: string,
  ): Promise<void> {
    const message = `Lead "${leadName}" status changed to ${newStatus} in project "${projectName}"`;
    await this.provider.send(message);
  }
}
