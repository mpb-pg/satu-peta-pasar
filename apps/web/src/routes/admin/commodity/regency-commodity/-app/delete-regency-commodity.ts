import { eq } from 'drizzle-orm';
import z from 'zod';
import { regencyCommodities } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const deleteRegencyCommodity = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(regencyCommodities)
      .where(eq(regencyCommodities.id, input.id))
      .returning();
    return { success: true };
  });
