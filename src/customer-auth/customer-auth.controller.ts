import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerAuthGuard } from '../common/guards/customer-auth.guard';

@ApiTags('customer-auth')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Buyer login (phone + access code)' })
  login(@Body() dto: CustomerLoginDto) {
    return this.customerAuthService.login(dto.phone, dto.accessCode);
  }

  @Post('logout')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate current session token' })
  logout(@Req() request: Request & { headers: { authorization?: string } }) {
    const auth = request.headers.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    return this.customerAuthService.logout(token);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Public QR / link verification' })
  verify(@Param('token') token: string) {
    return this.customerAuthService.verifyCustomerByToken(token);
  }
}
