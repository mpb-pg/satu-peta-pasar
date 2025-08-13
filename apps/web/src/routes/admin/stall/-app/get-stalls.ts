import { and, asc, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { provinces, regencies } from '@/lib/db/schema/map-product';
import { stalls } from '@/lib/db/schema/stall';
import { protectedProcedure } from '@/lib/orpc';

export const getStalls = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      provinceId: z.string().optional(),
      regencyId: z.string().optional(),
      stallId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const _offset = (page - 1) * limit;

    const baseQuery = context.db
      .select({
        id: stalls.id,
        name: stalls.name,
        address: stalls.address,
        provinceId: stalls.provinceId,
        provinceName: provinces.name,
        regencyId: stalls.regencyId,
        regencyName: regencies.name,
        latitude: stalls.latitude,
        longitude: stalls.longitude,
        owner: stalls.owner,
        notelp: stalls.noTelp,
        criteria: stalls.criteria,
      })
      .from(stalls)
      .innerJoin(provinces, eq(stalls.provinceId, provinces.id))
      .innerJoin(regencies, eq(stalls.regencyId, regencies.id));

    const conditions: ReturnType<typeof ilike>[] = [];
    if (input.provinceId) {
      conditions.push(eq(stalls.provinceId, input.provinceId));
    }
    if (input.regencyId) {
      conditions.push(eq(stalls.regencyId, input.regencyId));
    }
    if (input.stallId) {
      conditions.push(eq(stalls.id, input.stallId));
    }
    if (input.search) {
      conditions.push(ilike(stalls.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery.where(and(...conditions)).orderBy(asc(stalls.name)),
      // .limit(limit)
      // .offset(offset),
      // total: await context.db
      //   .select({ count: count() })
      //   .from(stalls)
      //   .then(([{ count }]) => Number(count))
    };
  });
