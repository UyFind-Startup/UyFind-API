import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomerAuthService } from '../../customer-auth/customer-auth.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { customerId?: number }>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const customer = await this.customerAuthService.resolveCustomerByToken(
      token,
    );
    request.customerId = customer.id;
    return true;
  }
}
