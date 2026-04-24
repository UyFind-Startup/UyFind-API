import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with optional filtering' })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum apartment price in project',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum apartment price in project',
    type: Number,
  })
  @ApiQuery({
    name: 'rooms',
    required: false,
    description: 'Exact number of rooms in apartments',
    type: Number,
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Project location/city',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all projects with developer and apartments',
  })
  findAll(@Query() filters: FilterProjectDto) {
    return this.projectsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Project details with developer and apartments',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/full')
  @ApiOperation({ summary: 'Get full project details with apartments' })
  @ApiParam({ name: 'id', description: 'Project ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Project full details with apartments',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findFull(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findFullById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID', type: Number })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }
}
