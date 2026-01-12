import { protectedProcedure } from "@/lib/orpc";
import { CommodityTypeSchema } from "../-domain/schema";
import { generateUUID } from "@/lib/db/schema";
import { commodityTypes } from "@/lib/db/schema/map-product";
import { ORPCError } from "@orpc/client";

export const createCommodityType = protectedProcedure
  .input(CommodityTypeSchema.omit({id: true }))
  .handler(async ({ input, context }) => {
    const newCommodityType = {
      id: generateUUID(),
      name: input.name,
      landTypeId: input.landTypeId,
      year: input.year as string,
    };

    try {
      const [createdCommodityType] = await context.db
        .insert(commodityTypes)
        .values(newCommodityType)
        .returning();

      return createdCommodityType;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes('unique') ||
        msg.toLowerCase().includes('duplicate')
      ) {
        throw new ORPCError('CONFLICT', {
          message: 'Commodity type name already exists',
        });
      }
      throw err;
    }
  });