import { eq } from 'drizzle-orm';
import { regencies } from '@/lib/db/schema/map_product';
import { protectedProcedure } from '@/lib/orpc';
import { RegencySchema } from '../-domain/schema';

export const updateRegency = protectedProcedure
  .input(
    RegencySchema.pick({
      id: true, name: true, area: true, provinceId: true,
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

    const [updatedRegency] = await context.db
      .update(regencies)
      .set(updateData)
      .where(eq(regencies.id, input.id))
      .returning();

    if (!updatedRegency) {
      throw new Error('Regency not found');
    }

    return updatedRegency;
  });
