import { eq } from 'drizzle-orm';
import z from 'zod';
import { commodityTypes } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const deleteCommodityType = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(commodityTypes)
      .where(eq(commodityTypes.id, input.id))
      .returning();

    return { success: true };
  });
