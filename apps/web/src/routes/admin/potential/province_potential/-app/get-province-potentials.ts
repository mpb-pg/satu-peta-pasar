import { and, eq, type ilike, or } from 'drizzle-orm';
import z from 'zod';
import {
  productBrands,
  provincePotentials,
  provinces,
} from '@/lib/db/schema/map-product';
import { protectedProcedure } from '@/lib/orpc';

export const getProvincePotentials = protectedProcedure
  .input(
    z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      provinceId: z.string().optional(),
      productBrandId: z.string().optional(),
      year: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const page = input?.page ?? 1;
    const limit = input?.limit;
    const offset = (page - 1) * (limit ?? 0);

    const baseQuery = context.db
      .select({
        id: provincePotentials.id,
        provinceId: provincePotentials.provinceId,
        provinceCode: provinces.code,
        provinceName: provinces.name,
        productBrandName: productBrands.name,
        potential: provincePotentials.potential,
        year: provincePotentials.year,
        updatedAt: provincePotentials.updatedAt,
      })
      .from(provincePotentials)
      .innerJoin(provinces, eq(provincePotentials.provinceId, provinces.id))
      .innerJoin(
        productBrands,
        eq(provincePotentials.productBrandId, productBrands.id)
      );

    const conditions: ReturnType<typeof ilike | typeof or>[] = [];
    if (input.provinceId) {
      conditions.push(eq(provincePotentials.provinceId, input.provinceId));
    }
    if (input.productBrandId) {
      conditions.push(
        eq(provincePotentials.productBrandId, input.productBrandId)
      );
    }
    if (input.year) {
      conditions.push(eq(provincePotentials.year, input.year));
    }
    if (input.search) {
      conditions.push(
        or(
          eq(provinces.name, `%${input.search}%`),
          eq(productBrands.name, `%${input.search}%`)
        )
      );
    }

    const query = baseQuery.where(and(...conditions)).orderBy(provinces.name);

    const finalQuery =
      limit !== undefined
        ? query.limit(limit).offset(offset)
        : query.offset(offset);

    return {
      data: await finalQuery,
    };
  });
