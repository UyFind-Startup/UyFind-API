import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService, ProjectLeadAnalytics } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('projects')
  @ApiOperation({ summary: 'Get analytics for all projects' })
  @ApiResponse({
    status: 200,
    description: 'Analytics including lead counts by status for each project',
    isArray: true,
  })
  async getProjectsAnalytics(): Promise<ProjectLeadAnalytics[]> {
    return this.analyticsService.getProjectsAnalytics();
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get analytics for a specific project' })
  @ApiResponse({
    status: 200,
    description: 'Analytics including lead counts by status for the project',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectAnalytics(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectLeadAnalytics> {
    return this.analyticsService.getProjectAnalytics(id);
  }
}
