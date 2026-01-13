import { eq } from 'drizzle-orm';
import { regencyCommodities } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';
import { RegencyCommoditySchema } from '../-domain/schema';

export const updateRegencyCommodity = protectedProcedure
  .input(
    RegencyCommoditySchema.pick({
      id: true,
      regencyId: true,
      commodityTypeId: true,
      area: true,
      year: true,
      updatedAt: true,
    })
      .partial()
      .required({ id: true })
  )
  .handler(async ({ input, context }) => {
    const updateData = Object.fromEntries(
      Object.entries(input).filter(
        ([key, value]) => key !== 'id' && value !== undefined
      )
    );
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const [updatedRegencyCommodity] = await context.db
      .update(regencyCommodities)
      .set(updateData)
      .where(eq(regencyCommodities.id, input.id))
      .returning();

    if (!updatedRegencyCommodity) {
      throw new Error('Regency Commodity not found');
    }

    return updatedRegencyCommodity;
  });
