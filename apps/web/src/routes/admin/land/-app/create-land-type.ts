import { ORPCError } from '@orpc/server';
import { generateUUID } from '@/lib/db/schema';
import { landTypes } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';
import { LandTypeSchema } from '../-domain/schema';

export const createLandType = protectedProcedure
  .input(LandTypeSchema.omit({ id: true }))
  .handler(async ({ input, context }) => {
    const newLandType = {
      id: generateUUID(),
      name: input.name,
    };

    try {
      const [createdLandType] = await context.db
        .insert(landTypes)
        .values(newLandType)
        .returning();

      return createdLandType;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes('unique') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        throw new ORPCError('CONFLICT', {
          message: 'Land type name already exists',
        });
      }
      throw err;
    }
  });
