import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CustomerLoginDto {
  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @MinLength(5)
  phone: string;

  @ApiProperty({ example: 'A1B2C3D4' })
  @IsString()
  @MinLength(4)
  accessCode: string;
}
