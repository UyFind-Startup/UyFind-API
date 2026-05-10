import { ApiProperty } from '@nestjs/swagger';
import { CustomerPaymentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCustomerPaymentDto {
  @ApiProperty({ example: 10_000_000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountUzs: number;

  @ApiProperty({ example: '2026-05-01T12:00:00.000Z' })
  @IsDateString()
  paidAt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ enum: CustomerPaymentType, required: false })
  @IsOptional()
  @IsEnum(CustomerPaymentType)
  type?: CustomerPaymentType;
}
