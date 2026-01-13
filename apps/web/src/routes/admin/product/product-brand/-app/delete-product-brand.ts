import z from 'zod';
import { eq } from 'drizzle-orm';
import { productBrands } from '@/lib/db/schema/map-product';
import { protectedProcedure, ORPCError } from '@/lib/orpc';

export const deleteProductBrand = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    try {
      await context.db.delete(productBrands).where(eq(productBrands.id, input.id));
      return { data: true };
    } catch (error: any) {
      console.error('deleteProductBrand error:', error);
      throw new ORPCError('INTERNAL', 'Failed to delete product brand');
    }
  });
