import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma.service';
import { normalizePhone } from '../common/utils/phone';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 60; // 60 days

@Injectable()
export class CustomerAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(phoneRaw: string, accessCodeRaw: string) {
    const phone = normalizePhone(phoneRaw);
    const accessCode = String(accessCodeRaw ?? '').trim().toUpperCase();
    if (!phone || !accessCode) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { accessCode },
    });
    if (!customer || normalizePhone(customer.phone) !== phone) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSessionResponse(customer.id);
  }

  private async createSessionResponse(customerId: number) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await this.prisma.customerSession.create({
      data: { customerId, token, expiresAt },
    });
    return { token, expiresAt };
  }

  async resolveCustomerByToken(token: string) {
    const session = await this.prisma.customerSession.findUnique({
      where: { token },
      include: { customer: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }
    return session.customer;
  }

  async logout(token: string) {
    await this.prisma.customerSession.deleteMany({ where: { token } });
    return { ok: true };
  }

  async verifyCustomerByToken(token: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { verificationToken: token },
      select: {
        id: true,
        name: true,
        project: { select: { name: true } },
      },
    });
    if (!customer) {
      return { valid: false as const };
    }
    return {
      valid: true as const,
      projectName: customer.project.name,
      buyerName: customer.name,
    };
  }
}
