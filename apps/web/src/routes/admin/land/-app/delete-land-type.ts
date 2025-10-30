import { landTypes } from "@/lib/db/schema/map_product";
import { protectedProcedure } from "@/lib/orpc";
import { eq } from "drizzle-orm";
import z from "zod";

export const deleteLandType = protectedProcedure
  .input(
      z.object({
          id: z.uuid(),
      })
  )
  .handler(async ({ input, context }) => {
    try {
      await context.db
        .delete(landTypes)
        .where(eq(landTypes.id, input.id))
        .returning();

      return { success: true };
    } catch (err) {
      throw err;
    }
  })