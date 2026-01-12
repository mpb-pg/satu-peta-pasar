import { ORPCError } from '@orpc/server';
import { generateUUID } from '@/lib/db/schema';
import { regencyCommodities } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';
import { RegencyCommoditySchema } from '../-domain/schema';

export const createRegencyCommodity = protectedProcedure
  .input(RegencyCommoditySchema.omit({ id: true, createdAt: true, updatedAt: true }))
  .handler(async ({ input, context }) => {
    const newRegencyCommodity = {
      id: generateUUID(),
      regencyId: input.regencyId,
      commodityTypeId: input.commodityTypeId,
      area: input.area,
      year: input.year,
    };

    try {
      const [createdRegencyCommodity] = await context.db
        .insert(regencyCommodities)
        .values(newRegencyCommodity)
        .returning();

      return createdRegencyCommodity;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes('unique') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        throw new ORPCError('CONFLICT', {
          message: 'Regency commodity entry already exists',
        });
      }
      throw new ORPCError('INTERNAL', {
        message: `Failed to create regency commodity: ${msg}`,
      });
    }
  });
