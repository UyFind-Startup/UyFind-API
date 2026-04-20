import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ProjectLeadAnalytics {
  projectId: number;
  projectName: string;
  location: string;
  leadsCount: number;
  newLeads: number;
  contactedLeads: number;
  closedLeads: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getProjectsAnalytics(): Promise<ProjectLeadAnalytics[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        leads: true,
      },
    });

    return Promise.all(
      projects.map(async (project) => {
        const leadsStats = await this.prisma.lead.groupBy({
          by: ['status'],
          where: {
            projectId: project.id,
          },
          _count: {
            id: true,
          },
        });

        const stats = {
          NEW: 0,
          CONTACTED: 0,
          CLOSED: 0,
        };

        leadsStats.forEach((stat) => {
          stats[stat.status] = stat._count.id;
        });

        return {
          projectId: project.id,
          projectName: project.name,
          location: project.location,
          leadsCount: project.leads.length,
          newLeads: stats.NEW,
          contactedLeads: stats.CONTACTED,
          closedLeads: stats.CLOSED,
        };
      }),
    );
  }

  async getProjectAnalytics(
    projectId: number,
  ): Promise<ProjectLeadAnalytics | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        leads: true,
      },
    });

    if (!project) {
      return null;
    }

    const leadsStats = await this.prisma.lead.groupBy({
      by: ['status'],
      where: {
        projectId: projectId,
      },
      _count: {
        id: true,
      },
    });

    const stats = {
      NEW: 0,
      CONTACTED: 0,
      CLOSED: 0,
    };

    leadsStats.forEach((stat) => {
      stats[stat.status] = stat._count.id;
    });

    return {
      projectId: project.id,
      projectName: project.name,
      location: project.location,
      leadsCount: project.leads.length,
      newLeads: stats.NEW,
      contactedLeads: stats.CONTACTED,
      closedLeads: stats.CLOSED,
    };
  }
}
