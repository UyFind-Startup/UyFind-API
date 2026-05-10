import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class UpdateLeadDto {
  @ApiProperty({
    description: 'The status of the lead',
    example: 'CONTACTED',
    required: false,
    enum: LeadStatus,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({
    required: false,
    description: 'Link lead to apartment (same project)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  apartmentId?: number | null;
}
