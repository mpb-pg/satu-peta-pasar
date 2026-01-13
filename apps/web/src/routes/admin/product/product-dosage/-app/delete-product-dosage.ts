import { eq } from 'drizzle-orm';
import z from 'zod';
import { productDosages } from '@/lib/db/schema/map-product';
import { ORPCError, protectedProcedure } from '@/lib/orpc';

export const deleteProductDosage = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    try {
      await context.db
        .delete(productDosages)
        .where(eq(productDosages.id, input.id));
      return { data: true };
    } catch (error: any) {
      console.error('deleteProductDosage error:', error);
      throw new ORPCError('INTERNAL', 'Failed to delete product dosage');
    }
  });
