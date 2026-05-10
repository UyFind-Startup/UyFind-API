import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLayoutVariantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model3dUrl?: string | null;
}
