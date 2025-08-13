import { and, asc, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { provinces, regencies } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getRegencies = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      provinceId: z.uuid().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const _offset = (page - 1) * limit;

    const baseQuery = context.db
      .select({
        id: regencies.id,
        code: regencies.code,
        name: regencies.name,
        provinceId: regencies.provinceId,
        area: regencies.area,
      })
      .from(regencies)
      .innerJoin(provinces, eq(regencies.provinceId, provinces.id));

    const conditions: ReturnType<typeof ilike>[] = [];
    if (input.provinceId) {
      conditions.push(eq(regencies.provinceId, input.provinceId));
    }
    if (input.search) {
      conditions.push(ilike(regencies.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery
        .where(and(...conditions))
        .orderBy(asc(regencies.name)),
      // .limit(limit)
      // .offset(offset),
      // total: await context.db
      //   .select({ count: count() })
      //   .from(regencies)
      //   .then(([{ count }]) => Number(count))
    };
  });
