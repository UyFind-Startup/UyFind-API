import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Expo push token', example: 'ExponentPushToken[xxxx]' })
  @IsNotEmpty()
  @IsString()
  expoPushToken: string;

  @ApiProperty({ required: false, description: 'Device platform name', example: 'iOS' })
  @IsOptional()
  @IsString()
  platform?: string;
}

