import { productBrands, provincePotentials, provinces } from "@/lib/db/schema/map_product";
import { protectedProcedure } from "@/lib/orpc";
import { and, eq, or } from "drizzle-orm";
import z from "zod";

export const getProvincePotentials = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      provinceId: z.string().optional(),
      productBrandId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const offset = (page - 1) * limit;

    const baseQuery = context.db
      .select({
        id: provincePotentials.id,
        provinceId: provincePotentials.provinceId,
        provinceCode: provinces.code,
        provinceName: provinces.name,
        productBrandName: productBrands.name,
        potential: provincePotentials.potential,
      })
      .from(provincePotentials)
      .innerJoin(provinces, eq(provincePotentials.provinceId, provinces.id))
      .innerJoin(productBrands, eq(provincePotentials.productBrandId, productBrands.id));

      const conditions = [];
      if (input.provinceId) {
        conditions.push(eq(provincePotentials.provinceId, input.provinceId));
      }
      if (input.productBrandId) {
        conditions.push(eq(provincePotentials.productBrandId, input.productBrandId));
      }
      if (input.search) {
        conditions.push(or(
          eq(provinces.name, `%${input.search}%`),
          eq(productBrands.name, `%${input.search}%`)
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