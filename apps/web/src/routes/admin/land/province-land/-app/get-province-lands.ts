import { landTypes, provinceLands, provinces } from "@/lib/db/schema/map_product";
import { protectedProcedure } from "@/lib/orpc";
import { and, asc, eq } from "drizzle-orm";
import z from "zod";

export const getProvinceLands = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      provinceId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const offset = (page - 1) * limit;

    const baseQuery = context.db
      .select({
        id: provinceLands.id,
        provinceId: provinceLands.provinceId,
        provinceName: provinces.name,
        landTypeId: provinceLands.landTypeId,
        landTypeName: landTypes.name,
        area: provinceLands.area,
      })
      .from(provinceLands)
      .innerJoin(landTypes, eq(provinceLands.landTypeId, landTypes.id))
      .innerJoin(provinces, eq(provinceLands.provinceId, provinces.id));

    const conditions = [];
    if (input.provinceId) {
      conditions.push(eq(provinceLands.provinceId, input.provinceId));
    }
    if (input.search) {
      conditions.push(eq(provinces.name, `%${input.search}%`));
    }

    return {
      data: await baseQuery
        .where(and(...conditions))
        .orderBy(asc(provinces.name)),
    }
  })