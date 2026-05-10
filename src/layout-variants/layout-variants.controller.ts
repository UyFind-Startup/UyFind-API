import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DeveloperAuthGuard } from '../common/guards/developer-auth.guard';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';
import { LayoutVariantsService } from './layout-variants.service';
import { CreateLayoutVariantDto } from './dto/create-layout-variant.dto';
import { UpdateLayoutVariantDto } from './dto/update-layout-variant.dto';

@ApiTags('layout-variants')
@ApiBearerAuth()
@Controller('projects/:projectId/layout-variants')
@UseGuards(DeveloperAuthGuard, ProjectMemberGuard)
export class LayoutVariantsController {
  constructor(private readonly layoutVariantsService: LayoutVariantsService) {}

  @Get()
  @ApiOperation({ summary: 'List layout variants (templates) for project' })
  list(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() request: Request & { developerId?: number },
  ) {
    return this.layoutVariantsService.list(projectId, request.developerId!);
  }

  @Post()
  @ApiOperation({ summary: 'Create layout variant from existing floor layout' })
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateLayoutVariantDto,
    @Req() request: Request & { developerId?: number },
  ) {
    return this.layoutVariantsService.create(
      projectId,
      dto,
      request.developerId!,
    );
  }

  @Patch(':layoutVariantId')
  @ApiOperation({ summary: 'Update layout variant (code, 3D URL)' })
  update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('layoutVariantId', ParseIntPipe) layoutVariantId: number,
    @Body() dto: UpdateLayoutVariantDto,
    @Req() request: Request & { developerId?: number },
  ) {
    return this.layoutVariantsService.update(
      projectId,
      layoutVariantId,
      dto,
      request.developerId!,
    );
  }

  @Delete(':layoutVariantId')
  @ApiOperation({ summary: 'Delete layout variant (units lose link)' })
  remove(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('layoutVariantId', ParseIntPipe) layoutVariantId: number,
    @Req() request: Request & { developerId?: number },
  ) {
    return this.layoutVariantsService.remove(
      projectId,
      layoutVariantId,
      request.developerId!,
    );
  }
}
