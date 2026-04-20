import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../common/services/notifications.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: createLeadDto,
      include: {
        apartment: {
          include: {
            project: true,
          },
        },
        project: true,
      },
    });

    // Send notification about new lead
    await this.notificationsService.notifyNewLead(
      lead.name,
      lead.apartmentId,
      lead.project.name,
    );

    return lead;
  }

  async findAll(filters?: FilterLeadDto) {
    const where: any = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.lead.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        apartment: {
          include: {
            project: true,
          },
        },
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        apartment: {
          include: {
            project: true,
          },
        },
        project: true,
      },
    });
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    const lead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        apartment: {
          include: {
            project: true,
          },
        },
        project: true,
      },
    });

    // Send notification about status change
    if (updateLeadDto.status) {
      await this.notificationsService.notifyLeadStatusChange(
        lead.name,
        updateLeadDto.status,
        lead.project.name,
      );
    }

    return lead;
  }
}
