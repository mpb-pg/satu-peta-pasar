import { protectedProcedure } from "@/lib/orpc";
import { ProvinceLandSchema } from "../-domain/schema";
import { provinceLands } from "@/lib/db/schema/map_product";
import { eq } from "drizzle-orm";

export const updateProvinceLand = protectedProcedure
  .input(
    ProvinceLandSchema.pick({
      id: true, provinceId: true, landTypeId: true, area: true,
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
      throw new Error('No valid fields to update');
    }

    const [updatedProvinceLand] = await context.db
      .update(provinceLands)
      .set(updateData)
      .where(eq(provinceLands.id, input.id))
      .returning();

      if (!updatedProvinceLand) {
        throw new Error('Province Land not found');
      }

    return updatedProvinceLand;
  });