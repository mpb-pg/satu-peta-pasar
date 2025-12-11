import { ORPCError } from '@orpc/server';
import { generateUUID } from '@/lib/db/schema';
import { provinces } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';
import { ProvinceSchema } from '../-domain/schema';

export const createProvince = protectedProcedure
  .input(ProvinceSchema.omit({ id: true }))
  .handler(async ({ input, context }) => {
    const newProvince = {
      id: generateUUID(),
      code: input.code,
      name: input.name,
      area: input.area,
    };

    try {
      const [createdProvince] = await context.db
        .insert(provinces)
        .values(newProvince)
        .returning();
      return createdProvince;
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      // Convert common unique constraint DB errors into a friendly ORPCError
      if (
        msg.toLowerCase().includes('unique') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        throw new ORPCError('CONFLICT', {
          message: 'Province code already exists',
        });
      }
      // Re-throw generic internal server error
      throw err;
    }
  });
