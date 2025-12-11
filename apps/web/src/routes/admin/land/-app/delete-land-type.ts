import { eq } from 'drizzle-orm';
import z from 'zod';
import { landTypes } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const deleteLandType = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(landTypes)
      .where(eq(landTypes.id, input.id))
      .returning();

    return { success: true };
  });
