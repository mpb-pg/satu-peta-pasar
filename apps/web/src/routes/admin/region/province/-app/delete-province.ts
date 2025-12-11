import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { provinces } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const deleteProvince = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(provinces)
      .where(eq(provinces.id, input.id))
      .returning();
    return { success: true };
  });
