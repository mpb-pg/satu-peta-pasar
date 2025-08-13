import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { regencies } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const deleteRegency = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(regencies)
      .where(eq(regencies.id, input.id))
      .returning();
    return { success: true };
  });
