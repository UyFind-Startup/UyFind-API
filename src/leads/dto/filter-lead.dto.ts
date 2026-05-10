import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FilterLeadDto {
  @ApiProperty({
    description: 'Filter by project ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @ApiProperty({
    description: 'Filter by lead status',
    required: false,
    enum: LeadStatus,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
