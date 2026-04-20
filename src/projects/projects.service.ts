import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: createProjectDto,
      include: {
        developer: true,
        apartments: true,
      },
    });
  }

  async findAll(filters?: FilterProjectDto) {
    const where: any = {};

    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    return this.prisma.project.findMany({
      where,
      include: {
        developer: true,
        apartments: {
          where: this.buildApartmentFilter(filters),
          include: {
            leads: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        developer: true,
        apartments: {
          include: {
            leads: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  private buildApartmentFilter(filters?: FilterProjectDto) {
    const where: any = {};

    if (filters?.minPrice) {
      where.price = { gte: filters.minPrice };
    }

    if (filters?.maxPrice) {
      if (where.price) {
        where.price.lte = filters.maxPrice;
      } else {
        where.price = { lte: filters.maxPrice };
      }
    }

    if (filters?.minRooms) {
      where.rooms = { gte: filters.minRooms };
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }
}
