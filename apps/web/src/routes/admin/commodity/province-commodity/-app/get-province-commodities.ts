import { commodityTypes, provinceCommodities, provinces } from "@/lib/db/schema/map_product";
import { protectedProcedure } from "@/lib/orpc";
import { and, eq, or } from "drizzle-orm";
import z from "zod";

export const getProvinceCommodities = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      provinceId: z.string().optional(),
      commodityTypeId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const offset = (page - 1) * limit;

    const baseQuery = context.db
      .select({
        id: provinceCommodities.id,
        provinceId: provinceCommodities.provinceId,
        provinceCode: provinces.code,
        provinceName: provinces.name,
        commodityTypeId: provinceCommodities.commodityTypeId,
        commodityTypeName: commodityTypes.name,
        area: provinceCommodities.area,
      })
      .from(provinceCommodities)
      .innerJoin(commodityTypes, eq(provinceCommodities.commodityTypeId, commodityTypes.id))
      .innerJoin(provinces, eq(provinceCommodities.provinceId, provinces.id));

      const conditions = [];
      if (input.provinceId) {
        conditions.push(eq(provinceCommodities.provinceId, input.provinceId));
      }
      if (input.commodityTypeId) {
        conditions.push(eq(provinceCommodities.commodityTypeId, input.commodityTypeId));
      }
      if (input.search) {
        conditions.push(or(
          eq(provinces.name, `%${input.search}%`),
          eq(commodityTypes.name, `%${input.search}%`)
        ));
      }

      return {
        data: await baseQuery
          .where(and(...conditions))
          .orderBy(provinces.name)
          .limit(limit)
          .offset(offset),
      }
  })