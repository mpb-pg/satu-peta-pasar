import { ORPCError } from '@orpc/server';
import { generateUUID } from '@/lib/db/schema';
import { regencies } from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';
import { RegencySchema } from '../-domain/schema';

export const createRegency = protectedProcedure
  .input(RegencySchema.omit({ id: true }))
  .handler(async ({ input, context }) => {
    const newRegency = {
      id: generateUUID(),
      code: input.code,
      name: input.name,
      provinceId: input.provinceId,
      area: input.area,
    };

    try {
      const [createdRegency] = await context.db
        .insert(regencies)
        .values(newRegency)
        .returning();
      return createdRegency;
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      // Convert common unique constraint DB errors into a friendly ORPCError
      if (
        msg.toLowerCase().includes('unique') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        throw new ORPCError('CONFLICT', {
          message: 'Regency code already exists',
        });
      }
      // Re-throw generic internal server error
      throw err;
    }
  });
