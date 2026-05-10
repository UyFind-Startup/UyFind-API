import { ApiProperty } from '@nestjs/swagger';
import { ConstructionStageKey } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ConstructionStagePatchDto {
  @ApiProperty({ enum: ConstructionStageKey })
  @IsEnum(ConstructionStageKey)
  stageKey: ConstructionStageKey;

  @ApiProperty()
  @IsBoolean()
  done: boolean;
}

export class UpdateBuildingProgressDto {
  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  percentComplete?: number;

  @ApiProperty({ type: [ConstructionStagePatchDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConstructionStagePatchDto)
  stages?: ConstructionStagePatchDto[];
}
