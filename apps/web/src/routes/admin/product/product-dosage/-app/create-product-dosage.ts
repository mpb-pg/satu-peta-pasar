import z from 'zod';
import { productDosages } from '@/lib/db/schema/map-product';
import { ORPCError, protectedProcedure } from '@/lib/orpc';

export const createProductDosage = protectedProcedure
  .input(
    z.object({
      commodityTypeId: z.string(),
      productBrandId: z.string(),
      dosage: z.number(),
      unit: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    try {
      const [created] = await context.db
        .insert(productDosages)
        .values({
          commodityTypeId: input.commodityTypeId,
          productBrandId: input.productBrandId,
          dosage: input.dosage,
          unit: input.unit,
        })
        .returning();

      return { data: created };
    } catch (error: any) {
      console.error('createProductDosage error:', error);
      if (error?.code === '23505') {
        throw new ORPCError('CONFLICT', 'Product dosage already exists');
      }
      throw new ORPCError('INTERNAL', 'Failed to create product dosage');
    }
  });
