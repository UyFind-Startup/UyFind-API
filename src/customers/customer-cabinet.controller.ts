import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomerAuthGuard } from '../common/guards/customer-auth.guard';
import { CustomersService } from './customers.service';

@ApiTags('customer-cabinet')
@ApiBearerAuth()
@Controller('customer-cabinet')
@UseGuards(CustomerAuthGuard)
export class CustomerCabinetController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  @ApiOperation({ summary: 'My apartment, payments, documents, progress' })
  me(@Req() request: Request & { customerId?: number }) {
    return this.customersService.getCabinetSnapshot(request.customerId!);
  }
}
