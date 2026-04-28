import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '@prisma/client';
import { IsEnum, IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export const MANUAL_PAYMENT_METHODS = ['CASH', 'CARD_TRANSFER'] as const;
export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

export class CreateCheckoutDto {
  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.PRO })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({
    enum: MANUAL_PAYMENT_METHODS,
    example: 'CARD_TRANSFER',
    required: false,
    description: 'Manual payment method for MVP billing flow',
  })
  @IsOptional()
  @IsIn(MANUAL_PAYMENT_METHODS)
  paymentMethod?: ManualPaymentMethod;

  @ApiProperty({
    example: 'Оплата завтра после 15:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  projectId: number;
}
