import { eq } from 'drizzle-orm';
import z from 'zod';
import { provinceLands } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const deleteProvinceLand = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(provinceLands)
      .where(eq(provinceLands.id, input.id))
      .returning();
    return { success: true };
  });
