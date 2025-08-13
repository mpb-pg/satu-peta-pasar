import { and, ilike } from 'drizzle-orm';
import z from 'zod';
import { landTypes } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getLandTypes = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const baseQuery = context.db
      .select({
        id: landTypes.id,
        name: landTypes.name,
      })
      .from(landTypes);

    const conditions: ReturnType<typeof ilike>[] = [];
    if (input.search) {
      conditions.push(ilike(landTypes.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery.where(and(...conditions)).orderBy(landTypes.name),
    };
  });
