import z from 'zod';
import { productTypes } from '@/lib/db/schema/map-product';
import { ORPCError, protectedProcedure } from '@/lib/orpc';

export const createProductType = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    try {
      const [created] = await context.db
        .insert(productTypes)
        .values({ name: input.name, description: input.description })
        .returning();

      return { data: created };
    } catch (error: any) {
      console.error('createProductType error:', error);
      if (error?.code === '23505') {
        throw new ORPCError('CONFLICT', 'Product type already exists');
      }
      throw new ORPCError('INTERNAL', 'Failed to create product type');
    }
  });
