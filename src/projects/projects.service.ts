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
    const { imageUrls, ...projectData } = createProjectDto;
    return this.prisma.project.create({
      data: {
        ...projectData,
        media: imageUrls?.length
          ? {
              create: imageUrls.map((imageUrl, index) => ({
                imageUrl,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        developer: true,
        apartments: true,
        media: true,
        reviews: true,
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

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        developer: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        apartments: {
          where: apartmentFilter,
          include: {
            leads: true,
          },
        },
      },
    });

    const filteredByPerM2 = projects.filter((project) => {
      if (!filters?.pricePerM2Min && !filters?.pricePerM2Max) return true;
      return project.apartments.some((apartment) => {
        if (!apartment.area) return false;
        const perM2 = apartment.price / apartment.area;
        if (filters.pricePerM2Min && perM2 < filters.pricePerM2Min)
          return false;
        if (filters.pricePerM2Max && perM2 > filters.pricePerM2Max)
          return false;
        return true;
      });
    });

    return filteredByPerM2.map((project) => {
      const reviewsCount = project.reviews.length;
      const avgRating = reviewsCount
        ? Number(
            (
              project.reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviewsCount
            ).toFixed(1),
          )
        : null;
      return {
        ...project,
        reviewsCount,
        avgRating,
      };
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
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const reviewsCount = project.reviews.length;
    const avgRating = reviewsCount
      ? Number(
          (
            project.reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewsCount
          ).toFixed(1),
        )
      : null;

    return {
      ...project,
      reviewsCount,
      avgRating,
    };
  }

  async findFullById(id: number) {
    return this.findOne(id);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);
    const { imageUrls, ...projectData } = updateProjectDto;

    return this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        media: imageUrls
          ? {
              deleteMany: {},
              create: imageUrls.map((imageUrl, index) => ({
                imageUrl,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        developer: true,
        apartments: true,
        media: true,
        reviews: true,
      },
    });
  }

  async addReview(projectId: number, rating: number, comment?: string) {
    await this.findOne(projectId);
    return this.prisma.projectReview.create({
      data: {
        projectId,
        rating,
        comment,
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
