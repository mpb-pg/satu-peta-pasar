import z from 'zod';
import { eq } from 'drizzle-orm';
import { productBrands } from '@/lib/db/schema/map-product';
import { protectedProcedure, ORPCError } from '@/lib/orpc';

export const updateProductBrand = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      industry: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, name, industry, description } = input;
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return { data: null };
    }

    try {
      const [updated] = await context.db
        .update(productBrands)
        .set(updateData)
        .where(eq(productBrands.id, id))
        .returning();

      return { data: updated };
    } catch (error: any) {
      console.error('updateProductBrand error:', error);
      throw new ORPCError('INTERNAL', 'Failed to update product brand');
    }
  });
