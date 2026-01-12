import { protectedProcedure } from "@/lib/orpc";
import { CommodityTypeSchema } from "../-domain/schema";
import { commodityTypes } from "@/lib/db/schema/map-product";
import { eq } from "drizzle-orm";

export const updateCommodityType = protectedProcedure
  .input(
    CommodityTypeSchema.pick({
      id: true,
      name: true,
      landTypeId: true,
      year: true,
    })
      .partial()
      .required({ id: true})
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

    const [updatedCommodityType] = await context.db
      .update(commodityTypes)
      .set(updateData)
      .where(eq(commodityTypes.id, input.id))
      .returning();

    if (!updateCommodityType) {
      throw new Error('Commodity type not found');
    }

    return updatedCommodityType;
  });