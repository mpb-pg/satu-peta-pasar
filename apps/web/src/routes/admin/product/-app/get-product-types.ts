import { and, ilike } from 'drizzle-orm';
import z from 'zod';
import { productTypes } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getProductTypes = protectedProcedure
  .input(
    z.object({
      search: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const baseQuery = context.db
      .select({
        id: productTypes.id,
        name: productTypes.name,
        description: productTypes.description,
      })
      .from(productTypes);

    const conditions: ReturnType<typeof ilike>[] = [];
    if (input.search) {
      conditions.push(ilike(productTypes.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery
        .where(and(...conditions))
        .orderBy(productTypes.name),
    };
  });
