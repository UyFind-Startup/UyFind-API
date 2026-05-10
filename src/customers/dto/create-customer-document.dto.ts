import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCustomerDocumentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  fileUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isContract?: boolean;
}
