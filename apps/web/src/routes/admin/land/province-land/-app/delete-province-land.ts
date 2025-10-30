import { provinceLands } from "@/lib/db/schema/map_product";
import { protectedProcedure } from "@/lib/orpc";
import { eq } from "drizzle-orm";
import z from "zod";

export const deleteProvinceLand = protectedProcedure
  .input(
    z.object({
      id: z.uuid(),
    })
  )
  .handler(async ({ input, context }) => {
    await context.db
      .delete(provinceLands)
      .where(eq(provinceLands.id, input.id))
      .returning();
    return { success: true };
  });