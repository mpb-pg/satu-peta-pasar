import { eq } from 'drizzle-orm';
import z from 'zod';
import { productDosages } from '@/lib/db/schema/map-product';
import { ORPCError, protectedProcedure } from '@/lib/orpc';

export const updateProductDosage = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      dosage: z.number().optional(),
      unit: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, ...rest } = input;
    const updateData: Record<string, any> = {};
    if (rest.dosage !== undefined) updateData.dosage = rest.dosage;
    if (rest.unit !== undefined) updateData.unit = rest.unit;

    if (Object.keys(updateData).length === 0) {
      return { data: null };
    }

    try {
      const [updated] = await context.db
        .update(productDosages)
        .set(updateData)
        .where(eq(productDosages.id, id))
        .returning();

      return { data: updated };
    } catch (error: any) {
      console.error('updateProductDosage error:', error);
      throw new ORPCError('INTERNAL', 'Failed to update product dosage');
    }
  });
