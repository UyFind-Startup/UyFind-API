import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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
    const where: Prisma.ProjectWhereInput = {};
    const apartmentFilter = this.buildApartmentFilter(filters);

    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (apartmentFilter) {
      where.apartments = {
        some: apartmentFilter,
      };
    }

    return this.prisma.project.findMany({
      where,
      include: {
        developer: true,
        apartments: {
          where: apartmentFilter,
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

  async findFullById(id: number) {
    return this.findOne(id);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        developer: true,
        apartments: true,
      },
    });
  }

  private buildApartmentFilter(
    filters?: FilterProjectDto,
  ): Prisma.ApartmentWhereInput | undefined {
    const where: Prisma.ApartmentWhereInput = {};

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {
        ...(filters?.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters?.maxPrice ? { lte: filters.maxPrice } : {}),
      };
    }

    if (filters?.rooms) {
      where.rooms = filters.rooms;
    }

    return Object.keys(where).length > 0 ? where : undefined;
  }
}
