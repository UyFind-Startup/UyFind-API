import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'The name of the real estate project',
    example: 'Sunset Gardens',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The location/city of the project',
    example: 'Tashkent',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'The expected delivery date of the project',
    example: '2025-12-31',
  })
  @IsNotEmpty()
  @IsString()
  deliveryDate: string;

  @ApiProperty({
    description:
      'Main image URL for the project (optional, will use placeholder if not provided)',
    example: 'https://example.com/project-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Video URL for the project (optional)',
    example: 'https://example.com/project-video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({
    description: 'The ID of the developer owning this project',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  developerId: number;
}
