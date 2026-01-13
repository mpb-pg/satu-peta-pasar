import { eq } from 'drizzle-orm';
import z from 'zod';
import { productTypes } from '@/lib/db/schema/map-product';
import { ORPCError, protectedProcedure } from '@/lib/orpc';

export const deleteProductType = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    try {
      await context.db
        .delete(productTypes)
        .where(eq(productTypes.id, input.id));
      return { data: true };
    } catch (error: any) {
      console.error('deleteProductType error:', error);
      throw new ORPCError('INTERNAL', 'Failed to delete product type');
    }
  });
