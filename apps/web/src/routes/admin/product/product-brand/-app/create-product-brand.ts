import z from 'zod';
import { productBrands } from '@/lib/db/schema/map-product';
import { protectedProcedure, ORPCError } from '@/lib/orpc';

export const createProductBrand = protectedProcedure
  .input(
    z.object({
      productTypeId: z.string(),
      name: z.string(),
      industry: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    try {
      const [created] = await context.db
        .insert(productBrands)
        .values({
          productTypeId: input.productTypeId,
          name: input.name,
          industry: input.industry,
          description: input.description,
        })
        .returning();

      return { data: created };
    } catch (error: any) {
      console.error('createProductBrand error:', error);
      if (error?.code === '23505') {
        throw new ORPCError('CONFLICT', 'Product brand already exists');
      }
      throw new ORPCError('INTERNAL', 'Failed to create product brand');
    }
  });
