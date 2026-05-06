import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class ProjectProgressMilestoneDto {
  @ApiProperty({ example: 'Котлован готов' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  done: boolean;

  @ApiProperty({ example: 0, description: 'Sort order (0-based)' })
  @Type(() => Number)
  @IsInt()
  sortOrder: number;
}

export class UpdateProjectProgressDto {
  @ApiProperty({ type: [ProjectProgressMilestoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectProgressMilestoneDto)
  milestones: ProjectProgressMilestoneDto[];
}

