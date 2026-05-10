import { ApiProperty } from '@nestjs/swagger';
import { ApartmentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FilterApartmentDto {
  @ApiProperty({ required: false, enum: ApartmentStatus })
  @IsOptional()
  @IsEnum(ApartmentStatus)
  status?: ApartmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
