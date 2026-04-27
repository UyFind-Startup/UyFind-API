import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { AdminApiKeyGuard } from '../common/guards/admin-api-key.guard';

@ApiTags('developers')
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
  @ApiOperation({ summary: 'Create a new developer' })
  @ApiResponse({ status: 201, description: 'Developer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  create(@Body() createDeveloperDto: CreateDeveloperDto) {
    return this.developersService.create(createDeveloperDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all developers' })
  @ApiResponse({
    status: 200,
    description: 'List of all developers with their projects',
  })
  findAll() {
    return this.developersService.findAll();
  }

  @Patch(':id')
  @UseGuards(AdminApiKeyGuard)
  @ApiOperation({ summary: 'Update developer by ID (including QR code)' })
  @ApiResponse({ status: 200, description: 'Developer updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeveloperDto: UpdateDeveloperDto,
  ) {
    return this.developersService.update(id, updateDeveloperDto);
  }
}
