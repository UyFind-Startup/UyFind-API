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

export class UpdateCustomerPaymentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountUzs?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string | null;

  @ApiProperty({ enum: CustomerPaymentType, required: false })
  @IsOptional()
  @IsEnum(CustomerPaymentType)
  type?: CustomerPaymentType;
}
