import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { FilterApartmentDto } from './dto/filter-apartment.dto';

@Injectable()
export class ApartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createApartmentDto: CreateApartmentDto) {
    return this.prisma.apartment.create({
      data: createApartmentDto,
      include: {
        project: true,
        leads: true,
      },
    });
  }

  async findAll(filters?: FilterApartmentDto) {
    const where: any = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

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

    if (filters?.rooms) {
      where.rooms = filters.rooms;
    }

    return this.prisma.apartment.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        project: true,
        leads: true,
      },
    });
  }
}
