import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ApartmentsService } from '../apartments/apartments.service';
import { CreateLayoutVariantDto } from './dto/create-layout-variant.dto';
import { UpdateLayoutVariantDto } from './dto/update-layout-variant.dto';

@Injectable()
export class LayoutVariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apartmentsService: ApartmentsService,
  ) {}

  async list(projectId: number, developerId: number) {
    await this.apartmentsService.assertProjectMember(projectId, developerId);
    return this.prisma.layoutVariant.findMany({
      where: { projectId },
      orderBy: { id: 'asc' },
      include: {
        projectFloorLayout: {
          select: { id: true, imageUrl: true, title: true, projectFloorId: true },
        },
        _count: { select: { apartmentUnits: true } },
      },
    });
  }

  async create(
    projectId: number,
    dto: CreateLayoutVariantDto,
    developerId: number,
  ) {
    await this.apartmentsService.assertProjectMember(projectId, developerId);
    const layout = await this.prisma.projectFloorLayout.findFirst({
      where: {
        id: dto.projectFloorLayoutId,
        floor: { projectId },
      },
      select: { id: true },
    });
    if (!layout) {
      throw new BadRequestException(
        'projectFloorLayoutId is not part of this project',
      );
    }
    try {
      return await this.prisma.layoutVariant.create({
        data: {
          projectId,
          projectFloorLayoutId: dto.projectFloorLayoutId,
          code: dto.code?.trim() || null,
          model3dUrl: dto.model3dUrl?.trim() || null,
        },
        include: {
          projectFloorLayout: {
            select: { id: true, imageUrl: true, title: true, projectFloorId: true },
          },
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Layout variant already exists for this floor layout',
        );
      }
      throw e;
    }
  }

  async update(
    projectId: number,
    layoutVariantId: number,
    dto: UpdateLayoutVariantDto,
    developerId: number,
  ) {
    await this.apartmentsService.assertProjectMember(projectId, developerId);
    const row = await this.prisma.layoutVariant.findFirst({
      where: { id: layoutVariantId, projectId },
    });
    if (!row) throw new NotFoundException('Layout variant not found');
    return this.prisma.layoutVariant.update({
      where: { id: layoutVariantId },
      data: {
        ...(dto.code !== undefined
          ? { code: dto.code === null ? null : dto.code.trim() || null }
          : {}),
        ...(dto.model3dUrl !== undefined
          ? {
              model3dUrl:
                dto.model3dUrl === null ? null : dto.model3dUrl.trim() || null,
            }
          : {}),
      },
      include: {
        projectFloorLayout: {
          select: { id: true, imageUrl: true, title: true, projectFloorId: true },
        },
      },
    });
  }

  async remove(
    projectId: number,
    layoutVariantId: number,
    developerId: number,
  ) {
    await this.apartmentsService.assertProjectMember(projectId, developerId);
    const row = await this.prisma.layoutVariant.findFirst({
      where: { id: layoutVariantId, projectId },
    });
    if (!row) throw new NotFoundException('Layout variant not found');
    await this.prisma.layoutVariant.delete({ where: { id: layoutVariantId } });
    return { ok: true };
  }
}
