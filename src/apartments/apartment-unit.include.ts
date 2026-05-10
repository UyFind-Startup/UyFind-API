import { Prisma } from '@prisma/client';

/** Единый include для подтягивания шаблона планировки (layout variant → floor layout). */
export const APARTMENT_UNIT_LAYOUT_INCLUDE = {
  layoutVariant: {
    include: {
      projectFloorLayout: {
        select: {
          id: true,
          imageUrl: true,
          title: true,
          projectFloorId: true,
        },
      },
    },
  },
} satisfies Prisma.ApartmentUnitInclude;

export type ApartmentUnitWithLayout = Prisma.ApartmentUnitGetPayload<{
  include: typeof APARTMENT_UNIT_LAYOUT_INCLUDE;
}>;
