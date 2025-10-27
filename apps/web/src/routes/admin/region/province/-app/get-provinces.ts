import { asc, count, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { provinces } from '@/lib/db/schema/map_product';
import { protectedProcedure } from '@/lib/orpc';

export const getProvinces = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const offset = (page - 1) * limit;

    const baseQuery = context.db
      .select({
        id: provinces.id,
        code: provinces.code,
        name: provinces.name,
        area: provinces.area,
      })
      .from(provinces);
    console.log('Base query constructed');
    console.log('Input search term:', input.search);

    if (input.search) {
      console.log('Searching for provinces with term:', input.search);
      baseQuery.where(ilike(provinces.name, `%${input.search}%`));
    }

    return { 
      data: await baseQuery.
        orderBy(asc(provinces.name))
        // .limit(limit)
        // .offset(offset), 
      // total: await context.db
      //   .select({ count: count() })
      //   .from(provinces)
      //   .then(([{ count }]) => Number(count))
    };
  });
