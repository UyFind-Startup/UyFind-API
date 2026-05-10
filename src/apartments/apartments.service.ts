import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { FilterApartmentDto } from './dto/filter-apartment.dto';
import {
  APARTMENT_UNIT_LAYOUT_INCLUDE,
  ApartmentUnitWithLayout,
} from './apartment-unit.include';

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Публичный ответ квартиры: плоские URL плана/3D с учётом layout variant. */
  serializeUnit(u: ApartmentUnitWithLayout) {
    const lv = u.layoutVariant;
    const resolvedLayoutImage =
      u.layoutImageUrl ?? lv?.projectFloorLayout.imageUrl ?? null;
    const resolvedModel3d = u.model3dUrl ?? lv?.model3dUrl ?? null;
    const { layoutVariant, ...rest } = u;
    return {
      ...rest,
      layoutImageUrl: resolvedLayoutImage,
      model3dUrl: resolvedModel3d,
      layoutVariant: lv
        ? {
            id: lv.id,
            code: lv.code,
            projectFloorLayoutId: lv.projectFloorLayoutId,
            model3dUrl: lv.model3dUrl,
            projectFloorLayout: lv.projectFloorLayout,
          }
        : null,
    };
  }

  async assertProjectMember(projectId: number, developerId: number) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, developerId },
    });
    if (!member) {
      throw new ForbiddenException('No access to this project workspace');
    }
  }

  private async assertLayoutVariantInProject(
    projectId: number,
    layoutVariantId: number,
  ) {
    const v = await this.prisma.layoutVariant.findFirst({
      where: { id: layoutVariantId, projectId },
      select: { id: true },
    });
    if (!v) {
      throw new BadRequestException('layoutVariantId is not in this project');
    }
  }

  async listPublic(projectId: number, query: FilterApartmentDto) {
    await this.ensureProjectExists(projectId);
    return this.list(projectId, query);
  }

  async list(projectId: number, query: FilterApartmentDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 200, 500);
    const skip = (page - 1) * limit;

    const where: Prisma.ApartmentUnitWhereInput = { projectId };
    if (query.status) where.status = query.status;
    if (query.floor != null) where.floor = query.floor;

    const [rows, total] = await Promise.all([
      this.prisma.apartmentUnit.findMany({
        where,
        orderBy: [{ floor: 'desc' }, { sortOrder: 'asc' }, { number: 'asc' }],
        skip,
        take: limit,
        include: APARTMENT_UNIT_LAYOUT_INCLUDE,
      }),
      this.prisma.apartmentUnit.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.serializeUnit(r)),
      total,
      page,
      limit,
    };
  }

  async create(
    projectId: number,
    dto: CreateApartmentDto,
    developerId: number,
  ) {
    await this.assertProjectMember(projectId, developerId);
    if (dto.layoutVariantId != null) {
      await this.assertLayoutVariantInProject(projectId, dto.layoutVariantId);
    }
    try {
      return await this.prisma.apartmentUnit.create({
        data: {
          projectId,
          number: dto.number.trim(),
          floor: dto.floor,
          rooms: dto.rooms,
          areaSqm: dto.areaSqm,
          priceUzs: dto.priceUzs ?? null,
          status: dto.status ?? undefined,
          layoutVariantId: dto.layoutVariantId ?? null,
          layoutImageUrl: dto.layoutImageUrl?.trim() || null,
          model3dUrl: dto.model3dUrl?.trim() || null,
          crmMetadata:
            dto.crmMetadata === undefined
              ? undefined
              : (dto.crmMetadata as Prisma.InputJsonValue),
          sortOrder: dto.sortOrder ?? 0,
        },
        include: APARTMENT_UNIT_LAYOUT_INCLUDE,
      }).then((r) => this.serializeUnit(r));
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Apartment number already exists in this project',
        );
      }
      throw e;
    }
  }

  async update(
    projectId: number,
    apartmentId: number,
    dto: UpdateApartmentDto,
    developerId: number,
  ) {
    await this.assertProjectMember(projectId, developerId);
    const apt = await this.prisma.apartmentUnit.findFirst({
      where: { id: apartmentId, projectId },
    });
    if (!apt) throw new NotFoundException('Apartment not found');

    if (dto.layoutVariantId !== undefined && dto.layoutVariantId != null) {
      await this.assertLayoutVariantInProject(projectId, dto.layoutVariantId);
    }

    try {
      const updated = await this.prisma.apartmentUnit.update({
        where: { id: apartmentId },
        data: {
          ...(dto.number != null ? { number: dto.number.trim() } : {}),
          ...(dto.floor != null ? { floor: dto.floor } : {}),
          ...(dto.rooms != null ? { rooms: dto.rooms } : {}),
          ...(dto.areaSqm != null ? { areaSqm: dto.areaSqm } : {}),
          ...(dto.priceUzs !== undefined ? { priceUzs: dto.priceUzs } : {}),
          ...(dto.status != null ? { status: dto.status } : {}),
          ...(dto.layoutVariantId !== undefined
            ? { layoutVariantId: dto.layoutVariantId }
            : {}),
          ...(dto.layoutImageUrl !== undefined
            ? { layoutImageUrl: dto.layoutImageUrl }
            : {}),
          ...(dto.model3dUrl !== undefined ? { model3dUrl: dto.model3dUrl } : {}),
          ...(dto.crmMetadata !== undefined
            ? {
                crmMetadata:
                  dto.crmMetadata === null
                    ? null
                    : (dto.crmMetadata as Prisma.InputJsonValue),
              }
            : {}),
          ...(dto.sortOrder != null ? { sortOrder: dto.sortOrder } : {}),
        },
        include: APARTMENT_UNIT_LAYOUT_INCLUDE,
      });
      return this.serializeUnit(updated);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Apartment number already exists in this project',
        );
      }
      throw e;
    }
  }

  async remove(projectId: number, apartmentId: number, developerId: number) {
    await this.assertProjectMember(projectId, developerId);
    const apt = await this.prisma.apartmentUnit.findFirst({
      where: { id: apartmentId, projectId },
    });
    if (!apt) throw new NotFoundException('Apartment not found');
    await this.prisma.apartmentUnit.delete({ where: { id: apartmentId } });
    return { ok: true };
  }

  async findOneForDeveloper(
    projectId: number,
    apartmentId: number,
    developerId: number,
  ) {
    await this.assertProjectMember(projectId, developerId);
    const apt = await this.prisma.apartmentUnit.findFirst({
      where: { id: apartmentId, projectId },
      include: {
        ...APARTMENT_UNIT_LAYOUT_INCLUDE,
        customers: {
          select: {
            id: true,
            name: true,
            phone: true,
            accessCode: true,
            createdAt: true,
            payments: {
              orderBy: { paidAt: 'desc' },
              take: 30,
              select: {
                id: true,
                amountUzs: true,
                paidAt: true,
                comment: true,
                type: true,
              },
            },
          },
        },
        leads: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
    if (!apt) throw new NotFoundException('Apartment not found');

    const { customers, leads, ...core } = apt;
    return {
      ...this.serializeUnit(core as ApartmentUnitWithLayout),
      customers,
      leads,
    };
  }

  private async ensureProjectExists(projectId: number) {
    const p = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Project not found');
  }
}
