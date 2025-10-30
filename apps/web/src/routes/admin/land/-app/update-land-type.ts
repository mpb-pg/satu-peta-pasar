import { protectedProcedure } from "@/lib/orpc";
import { LandTypeSchema } from "../-domain/schema";
import { landTypes } from "@/lib/db/schema/map_product";
import { eq } from "drizzle-orm";

export const updateLandType = protectedProcedure
  .input(
    LandTypeSchema.pick({
      id: true, name: true
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

    const [updatedLandType] = await context.db
      .update(landTypes)
      .set(updateData)
      .where(eq(landTypes.id, input.id))
      .returning();

    if (!updatedLandType) {
      throw new Error('Land type not found');
    }
    
    return updatedLandType;
  })