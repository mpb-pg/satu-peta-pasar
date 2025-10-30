import { protectedProcedure } from "@/lib/orpc";
import { ProvinceLandSchema } from "../-domain/schema";
import { generateUUID } from "@/lib/db/schema";
import { provinceLands } from "@/lib/db/schema/map_product";
import { ORPCError } from "@orpc/server";

export const createProvinceLand = protectedProcedure
  .input(
    ProvinceLandSchema.omit({ id: true })
  )
  .handler(async ({ input, context }) => {
    const newProvinceLand = {
      id: generateUUID(),
      provinceId: input.provinceId,
      landTypeId: input.landTypeId,
      area: input.area,
    };

    try {
      const [createdProvinceLand] = await context.db
        .insert(provinceLands)
        .values(newProvinceLand)
        .returning();

      return createdProvinceLand;
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
        throw new ORPCError('CONFLICT', { message: 'Province land entry already exists' });
      }
      throw err;
    }
  })