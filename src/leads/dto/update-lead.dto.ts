import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
}

export class UpdateLeadDto {
  @ApiProperty({
    description: 'The status of the lead',
    example: 'CONTACTED',
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
