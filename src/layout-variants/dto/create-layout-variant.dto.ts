import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLayoutVariantDto {
  @ApiProperty({ description: 'ID записи project_floor_layouts этого проекта' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectFloorLayoutId: number;

  @ApiProperty({ required: false, example: 'A-2br' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model3dUrl?: string;
}
