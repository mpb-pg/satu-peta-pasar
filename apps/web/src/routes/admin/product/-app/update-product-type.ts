import { eq } from 'drizzle-orm';
import z from 'zod';
import { productTypes } from '@/lib/db/schema/map-product';
import { ORPCError, protectedProcedure } from '@/lib/orpc';

export const updateProductType = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const { id, name, description } = input;
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return { data: null };
    }

    try {
      const [updated] = await context.db
        .update(productTypes)
        .set(updateData)
        .where(eq(productTypes.id, id))
        .returning();

      return { data: updated };
    } catch (error: any) {
      console.error('updateProductType error:', error);
      throw new ORPCError('INTERNAL', 'Failed to update product type');
    }
  });
