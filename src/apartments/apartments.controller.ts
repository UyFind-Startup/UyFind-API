import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { FilterApartmentDto } from './dto/filter-apartment.dto';

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new apartment' })
  @ApiResponse({ status: 201, description: 'Apartment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  create(@Body() createApartmentDto: CreateApartmentDto) {
    return this.apartmentsService.create(createApartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all apartments with optional filtering' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'Filter by project ID',
    type: Number,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum apartment price',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum apartment price',
    type: Number,
  })
  @ApiQuery({
    name: 'rooms',
    required: false,
    description: 'Number of rooms in apartment',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all apartments with project and leads',
  })
  findAll(@Query() filters: FilterApartmentDto) {
    return this.apartmentsService.findAll(filters);
  }
}
