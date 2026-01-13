import { and, eq, or } from 'drizzle-orm';
import z from 'zod';
import {
  commodityTypes,
  regencies,
  regencyCommodities,
} from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getRegencyCommodities = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      regencyId: z.string().optional(),
      commodityTypeId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit;
    const offset = (page - 1) * (limit ?? 0);

    const baseQuery = context.db
      .select({
        id: regencyCommodities.id,
        regencyId: regencyCommodities.regencyId,
        regencyCode: regencies.code,
        regencyName: regencies.name,
        commodityTypeId: regencyCommodities.commodityTypeId,
        commodityTypeName: commodityTypes.name,
        area: regencyCommodities.area,
        year: regencyCommodities.year,
      })
      .from(regencyCommodities)
      .innerJoin(
        commodityTypes,
        eq(regencyCommodities.commodityTypeId, commodityTypes.id)
      )
      .innerJoin(regencies, eq(regencyCommodities.regencyId, regencies.id));

    const conditions: ReturnType<typeof eq | typeof or>[] = [];
    if (input.regencyId) {
      conditions.push(eq(regencyCommodities.regencyId, input.regencyId));
    }
    if (input.commodityTypeId) {
      conditions.push(
        eq(regencyCommodities.commodityTypeId, input.commodityTypeId)
      );
    }
    if (input.search) {
      conditions.push(
        or(
          eq(regencies.name, `%${input.search}%`),
          eq(commodityTypes.name, `%${input.search}%`)
        )
      );
    }

    const query = baseQuery.where(and(...conditions)).orderBy(regencies.name);

    const finalQuery =
      limit !== undefined
        ? query.limit(limit).offset(offset)
        : query.offset(offset);

    const data = await finalQuery;

    return {
      data,
    };
  });
