import { and, eq, ilike } from 'drizzle-orm';
import z from 'zod';
import { commodityTypes } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getCommodityTypes = protectedProcedure
  .input(
    z.object({
      landTypeId: z.string().optional(),
      search: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const baseQuery = context.db
      .select({
        id: commodityTypes.id,
        name: commodityTypes.name,
        landTypeId: commodityTypes.landTypeId,
      })
      .from(commodityTypes);

    const conditions: ReturnType<typeof eq | typeof ilike>[] = [];
    [];
    if (input.landTypeId) {
      conditions.push(eq(commodityTypes.landTypeId, input.landTypeId));
    }
    if (input.search) {
      conditions.push(ilike(commodityTypes.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery
        .where(and(...conditions))
        .orderBy(commodityTypes.name),
    };
  });
