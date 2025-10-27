import { eq } from 'drizzle-orm';
import { provinces } from '@/lib/db/schema/map_product';
import { protectedProcedure } from '@/lib/orpc';
import { ProvinceSchema } from '../-domain/schema';

export const updateProvince = protectedProcedure
  .input(
    ProvinceSchema.pick({
      id: true, name: true, area: true
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
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    const [updatedProvince] = await context.db
      .update(provinces)
      .set(updateData)
      .where(eq(provinces.id, input.id))
      .returning();

    if (!updatedProvince) {
      throw new Error('Province not found');
    }

    return updatedProvince;
  });
